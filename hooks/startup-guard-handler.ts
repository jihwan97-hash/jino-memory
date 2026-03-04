import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const CONFIG_PATH = path.join(process.env.HOME || "/root", ".openclaw/openclaw.json");
const CLAWD_DIR = "/root/clawd";

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

  // ── 2. 설정 점검 & 자동 복원 ──────────────────────────────

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

  // Check: memory-lancedb 비활성화 유지 (의도적으로 제거한 것)
  if (cfg?.plugins?.slots?.memory === "memory-lancedb") {
    delete cfg.plugins.slots.memory;
    if (cfg?.plugins?.entries?.["memory-lancedb"]) {
      delete cfg.plugins.entries["memory-lancedb"];
    }
    configChanged = true;
    checks.push({ name: "memory-lancedb", ok: false, fixed: true, detail: "의도적 비활성화 복원" });
  } else {
    checks.push({ name: "memory-lancedb disabled", ok: true });
  }

  // Check: workspace 쓰기 가능
  try {
    const workspaceDir = cfg?.agents?.main?.workspace?.dir ?? CLAWD_DIR;
    const testFile = path.join(workspaceDir, ".startup-guard-test");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    checks.push({ name: "workspace write", ok: true });
  } catch {
    checks.push({ name: "workspace write", ok: false, detail: "쓰기 권한 없음" });
  }

  // Check: Scrapling pip 설치 여부
  try {
    execSync("python3 -c \"import scrapling\"", { stdio: "pipe" });
    checks.push({ name: "scrapling", ok: true });
  } catch {
    try {
      execSync("pip install \"scrapling[ai]\" -q", { stdio: "pipe" });
      checks.push({ name: "scrapling", ok: false, fixed: true, detail: "pip install 완료" });
    } catch (err) {
      checks.push({ name: "scrapling", ok: false, detail: "설치 실패 — 수동 확인 필요" });
    }
  }

  // Check: .learnings/ 디렉토리 존재
  const learningsDir = path.join(CLAWD_DIR, ".learnings/observations");
  if (!fs.existsSync(learningsDir)) {
    fs.mkdirSync(learningsDir, { recursive: true });
    checks.push({ name: ".learnings/", ok: false, fixed: true, detail: "디렉토리 생성" });
  } else {
    checks.push({ name: ".learnings/", ok: true });
  }

  // Check: failure-memory SKILL.md 존재
  const failureMemorySkill = path.join(CLAWD_DIR, "skills/failure-memory/SKILL.md");
  if (!fs.existsSync(failureMemorySkill)) {
    checks.push({ name: "failure-memory skill", ok: false, detail: "SKILL.md 없음 — git pull 필요" });
  } else {
    checks.push({ name: "failure-memory skill", ok: true });
  }

  // Check: memory retrieval protocol 존재
  const retrievalProtocol = path.join(CLAWD_DIR, "system/protocols/retrieval_v1.md");
  if (!fs.existsSync(retrievalProtocol)) {
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
  const allGood = failed.length === 0;

  if (!allGood || fixed.length > 0) {
    const lines: string[] = ["🛡️ *Startup Guard 보고*"];
    
    if (fixed.length > 0) {
      lines.push("\n✅ *자동 복원:*");
      for (const c of fixed) lines.push(`  • ${c.name}: ${c.detail}`);
    }
    
    if (!allGood) {
      lines.push("\n❌ *수동 확인 필요:*");
      for (const c of failed) lines.push(`  • ${c.name}${c.detail ? `: ${c.detail}` : ""}`);
    }

    event.messages.push(lines.join("\n"));
  }
  // 모두 정상이면 조용히 통과
};

export default handler;
