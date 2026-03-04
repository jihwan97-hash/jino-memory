import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const CONFIG_PATH = path.join(process.env.HOME || "/root", ".openclaw/openclaw.json");
const CLAWD_DIR = "/root/clawd";
const HOME = process.env.HOME || "/root";

interface Check {
  name: string;
  ok: boolean;
  fixed?: boolean;
  detail?: string;
}

const handler = async (event: any) => {
  if (event.type !== "gateway" || event.action !== "startup") return;

  const checks: Check[] = [];
  let configChanged = false;

  // ── 1. openclaw.json 읽기 ─────────────────────────────────
  let cfg: any;
  try {
    cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (err) {
    event.messages.push("🛡️ startup-guard: openclaw.json 읽기 실패 — 수동 확인 필요");
    return;
  }

  // ══════════════════════════════════════════════════════════
  // ── 기존 시스템 점검 ────────────────────────────────────
  // ══════════════════════════════════════════════════════════

  // Check: 크론 잡 7개 모두 존재
  try {
    const cronPath = path.join(HOME, ".openclaw/cron/jobs.json");
    const cronData = JSON.parse(fs.readFileSync(cronPath, "utf8"));
    const jobs: any[] = cronData.jobs ?? [];
    const expected = ["auto-study", "brain-memory", "email-summary", "email-summary-evening", "portfolio-research", "self-reflect", "morning-briefing"];
    const names = jobs.map((j: any) => j.name || j.id);
    const missing = expected.filter(e => !names.includes(e));
    if (missing.length > 0) {
      checks.push({ name: "cron jobs", ok: false, detail: `누락: ${missing.join(", ")}` });
    } else {
      checks.push({ name: "cron jobs (7개)", ok: true });
    }
  } catch {
    checks.push({ name: "cron jobs", ok: false, detail: "jobs.json 읽기 실패" });
  }

  // Check: Gmail 토큰 파일 3개 존재
  const gmailTokenFiles = [
    { name: "work (astin)", file: `${HOME}/.google-gmail.env` },
    { name: "personal", file: `${HOME}/.google-gmail-personal.env` },
    { name: "jihwan", file: `${HOME}/.google-gmail-jihwan.env` },
  ];
  for (const t of gmailTokenFiles) {
    if (fs.existsSync(t.file)) {
      checks.push({ name: `gmail:${t.name}`, ok: true });
    } else {
      checks.push({ name: `gmail:${t.name}`, ok: false, detail: `${t.file} 없음 — 재인증 필요` });
    }
  }

  // Check: Google Calendar 인증
  try {
    execSync("node /root/clawd/skills/google-calendar/scripts/calendar.js list --days 0", { stdio: "pipe", timeout: 8000 });
    checks.push({ name: "google-calendar auth", ok: true });
  } catch {
    checks.push({ name: "google-calendar auth", ok: false, detail: "캘린더 인증 실패 — 재인증 필요" });
  }

  // Check: warm-memory 핵심 파일 존재
  const warmMemoryFiles = ["inbox.md", "calendar.md", "inbox-personal.md"];
  for (const f of warmMemoryFiles) {
    const fp = path.join(CLAWD_DIR, "warm-memory", f);
    if (!fs.existsSync(fp)) {
      checks.push({ name: `warm-memory/${f}`, ok: false, detail: "파일 없음" });
    }
  }
  // 모두 있으면 한 줄로
  const warmOk = warmMemoryFiles.every(f => fs.existsSync(path.join(CLAWD_DIR, "warm-memory", f)));
  if (warmOk) checks.push({ name: "warm-memory 핵심 파일", ok: true });

  // Check: jino-memory git uncommitted
  try {
    const result = execSync("cd /root/clawd/jino-memory && git status --porcelain", { encoding: "utf8" });
    const count = result.trim().split("\n").filter(Boolean).length;
    if (count >= 10) {
      checks.push({ name: "jino-memory git", ok: false, detail: `uncommitted ${count}개 — 커밋 필요` });
    } else {
      checks.push({ name: "jino-memory git", ok: true });
    }
  } catch {
    checks.push({ name: "jino-memory git", ok: false, detail: "git status 실패" });
  }

  // Check: MEMORY.md 존재
  if (!fs.existsSync(path.join(CLAWD_DIR, "MEMORY.md"))) {
    checks.push({ name: "MEMORY.md", ok: false, detail: "파일 없음" });
  } else {
    checks.push({ name: "MEMORY.md", ok: true });
  }

  // ══════════════════════════════════════════════════════════
  // ── 오늘 설치한 시스템 점검 ─────────────────────────────
  // ══════════════════════════════════════════════════════════

  // Check: telegram streaming = block
  const streaming = cfg?.channels?.telegram?.streaming;
  if (streaming !== "block") {
    cfg.channels = cfg.channels ?? {};
    cfg.channels.telegram = cfg.channels.telegram ?? {};
    cfg.channels.telegram.streaming = "block";
    configChanged = true;
    checks.push({ name: "telegram.streaming", ok: false, fixed: true, detail: `${streaming} → block` });
  } else {
    checks.push({ name: "telegram.streaming", ok: true });
  }

  // Check: memory-lancedb 비활성화 유지
  if (cfg?.plugins?.slots?.memory === "memory-lancedb") {
    delete cfg.plugins.slots.memory;
    if (cfg?.plugins?.entries?.["memory-lancedb"]) delete cfg.plugins.entries["memory-lancedb"];
    configChanged = true;
    checks.push({ name: "memory-lancedb", ok: false, fixed: true, detail: "의도적 비활성화 복원" });
  } else {
    checks.push({ name: "memory-lancedb disabled", ok: true });
  }

  // Check: workspace 쓰기 가능
  try {
    const testFile = path.join(CLAWD_DIR, ".startup-guard-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    checks.push({ name: "workspace write", ok: true });
  } catch {
    checks.push({ name: "workspace write", ok: false, detail: "쓰기 권한 없음" });
  }

  // Check: Scrapling pip 설치
  try {
    execSync("python3 -c \"import scrapling\"", { stdio: "pipe" });
    checks.push({ name: "scrapling", ok: true });
  } catch {
    try {
      execSync("pip install \"scrapling[ai]\" -q", { stdio: "pipe" });
      checks.push({ name: "scrapling", ok: false, fixed: true, detail: "pip install 완료" });
    } catch {
      checks.push({ name: "scrapling", ok: false, detail: "설치 실패 — 수동 확인 필요" });
    }
  }

  // Check: .learnings/ 디렉토리
  const learningsDir = path.join(CLAWD_DIR, ".learnings/observations");
  if (!fs.existsSync(learningsDir)) {
    fs.mkdirSync(learningsDir, { recursive: true });
    checks.push({ name: ".learnings/", ok: false, fixed: true, detail: "디렉토리 생성" });
  } else {
    checks.push({ name: ".learnings/", ok: true });
  }

  // Check: failure-memory SKILL.md
  if (!fs.existsSync(path.join(CLAWD_DIR, "skills/failure-memory/SKILL.md"))) {
    checks.push({ name: "failure-memory skill", ok: false, detail: "SKILL.md 없음 — git pull 필요" });
  } else {
    checks.push({ name: "failure-memory skill", ok: true });
  }

  // Check: retrieval protocol
  if (!fs.existsSync(path.join(CLAWD_DIR, "system/protocols/retrieval_v1.md"))) {
    checks.push({ name: "retrieval protocol", ok: false, detail: "retrieval_v1.md 없음 — git pull 필요" });
  } else {
    checks.push({ name: "retrieval protocol", ok: true });
  }

  // ── 3. 변경사항 저장 ──────────────────────────────────────
  if (configChanged) {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
    } catch (err) {
      checks.push({ name: "config save", ok: false, detail: String(err) });
    }
  }

  // ── 4. 결과 보고 ──────────────────────────────────────────
  const failed = checks.filter(c => !c.ok && !c.fixed);
  const fixed = checks.filter(c => c.fixed);

  if (failed.length > 0 || fixed.length > 0) {
    const lines: string[] = ["🛡️ *Startup Guard 보고*"];

    if (fixed.length > 0) {
      lines.push("\n✅ *자동 복원:*");
      for (const c of fixed) lines.push(`  • ${c.name}: ${c.detail}`);
    }

    if (failed.length > 0) {
      lines.push("\n❌ *수동 확인 필요:*");
      for (const c of failed) lines.push(`  • ${c.name}${c.detail ? `: ${c.detail}` : ""}`);
    }

    event.messages.push(lines.join("\n"));
  }
};

export default handler;
