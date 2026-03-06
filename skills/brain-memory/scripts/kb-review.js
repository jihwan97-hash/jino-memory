#!/usr/bin/env node
/**
 * KB Review System - Knowledge Base Learning Loop
 *
 * Reads knowledge-base items and prepares them for AI review/learning.
 * No AI calls — the cron-configured model handles insight extraction and updates.
 *
 * Usage:
 *   node kb-review.js              # Review new/unreviewed short-term items
 *   node kb-review.js --promote    # Also output tier promotion candidates
 *   node kb-review.js --all        # Re-review all items (ignore state)
 *
 * Output goes to stdout for the cron AI to process.
 */

const fs = require('fs');
const path = require('path');

const KB_BASE = '/Users/astin/.jinobot/clawd/warm-memory/knowledge-base';
const INDEX_FILE = path.join(KB_BASE, 'index.json');
const STATE_FILE = '/Users/astin/.jinobot/clawd/warm-memory/kb-review-state.json';

// Days before tier promotion
const SHORT_TO_MID_DAYS = 7;
const MID_TO_LONG_DAYS = 30;

const args = process.argv.slice(2);
const PROMOTE_MODE = args.includes('--promote');
const ALL_MODE = args.includes('--all');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return { reviewedIds: [], lastReviewAt: null };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch (e) {
    console.error('[KB-REVIEW] Cannot load index.json:', e.message);
    process.exit(1);
  }
}

function readKBFile(relPath) {
  const fullPath = path.join(KB_BASE, relPath);
  try {
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

function daysSince(dateStr) {
  const saved = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - saved) / (1000 * 60 * 60 * 24));
}

function getEntryDate(entry) {
  return entry.savedAt || entry.date || null;
}

function getAllEntries(index) {
  const entries = index.entries || [];
  // Also check tag_index entries
  return entries;
}

function main() {
  const state = loadState();
  const index = loadIndex();
  const entries = getAllEntries(index);

  const reviewedSet = new Set(ALL_MODE ? [] : (state.reviewedIds || []));

  const toReview = [];
  const toPromote = [];

  for (const entry of entries) {
    const dateStr = getEntryDate(entry);
    const age = dateStr ? daysSince(dateStr) : null;

    // Tier promotion candidates
    if (PROMOTE_MODE || ALL_MODE) {
      if (entry.tier === 'short-term' && age !== null && age >= SHORT_TO_MID_DAYS) {
        toPromote.push({ ...entry, age, promoteTo: 'mid-term' });
      } else if (entry.tier === 'mid-term' && age !== null && age >= MID_TO_LONG_DAYS) {
        toPromote.push({ ...entry, age, promoteTo: 'long-term' });
      }
    }

    // Items to review (unreviewed short-term items)
    if (!reviewedSet.has(entry.id) && entry.tier === 'short-term') {
      toReview.push({ ...entry, age });
    }
  }

  // Build output
  const lines = [];
  lines.push('# KB Review Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // --- New items to review ---
  if (toReview.length === 0) {
    lines.push('## New Items: 없음 (모두 검토 완료)');
  } else {
    lines.push(`## New Items (${toReview.length}개 미검토)`);
    lines.push('');
    lines.push('아래 항목들을 읽고 핵심 인사이트를 MEMORY.md에 반영하라.');
    lines.push('형식: "## 지식베이스 인사이트" 섹션에 bullet 형태로 추가.');
    lines.push('이미 MEMORY.md에 있는 내용은 중복 추가 금지.');
    lines.push('');

    // Limit to 5 items per run to avoid context overflow
    const batch = toReview.slice(0, 5);
    const skipped = toReview.length - batch.length;

    for (const entry of batch) {
      lines.push(`### [${entry.tier}] ${entry.title}`);
      lines.push(`- ID: ${entry.id}`);
      lines.push(`- 저장일: ${getEntryDate(entry) || '알 수 없음'} (${entry.age !== null ? entry.age + '일 전' : '날짜 불명'})`);
      lines.push(`- 태그: ${(entry.tags || []).join(', ')}`);
      lines.push(`- 요약: ${entry.summary || '요약 없음'}`);
      lines.push('');

      if (entry.file) {
        const content = readKBFile(entry.file);
        if (content) {
          // Limit content to avoid context explosion
          const truncated = content.length > 2000 ? content.slice(0, 2000) + '\n...(이하 생략)' : content;
          lines.push('**내용:**');
          lines.push('```');
          lines.push(truncated);
          lines.push('```');
          lines.push('');
        }
      }
    }

    if (skipped > 0) {
      lines.push(`> ⚠️ ${skipped}개 추가 항목은 다음 실행 시 처리됨`);
      lines.push('');
    }
  }

  // --- Tier promotion candidates ---
  if (toPromote.length > 0) {
    lines.push('---');
    lines.push(`## 티어 승격 대상 (${toPromote.length}개)`);
    lines.push('');
    lines.push('아래 항목들은 기간이 지나 승격 검토가 필요하다.');
    lines.push('가치 있는 항목은 파일을 이동하고 index.json의 tier 필드를 업데이트하라.');
    lines.push('');

    for (const entry of toPromote) {
      lines.push(`- **${entry.title}** (${entry.id})`);
      lines.push(`  - 현재: ${entry.tier} → 승격: ${entry.promoteTo}`);
      lines.push(`  - 저장: ${getEntryDate(entry)} (${entry.age}일 전)`);
      lines.push(`  - 파일: ${entry.file}`);
      lines.push('');
    }

    lines.push('');
    lines.push('**승격 방법:**');
    lines.push('1. 파일을 `short-term/` → `mid-term/` 또는 `mid-term/` → `long-term/` 으로 이동');
    lines.push('2. index.json에서 해당 entry의 `tier` 필드 업데이트');
    lines.push('3. `lastUpdated` 타임스탬프 갱신');
  }

  // --- Instruction to mark as reviewed ---
  if (toReview.length > 0) {
    const batch = toReview.slice(0, 5);
    lines.push('---');
    lines.push('## 완료 후 처리');
    lines.push('');
    lines.push('위 항목들을 처리한 후, `.kb-review-state.json`의 `reviewedIds` 배열에 아래 ID들을 추가하라:');
    lines.push('```json');
    lines.push(JSON.stringify(batch.map(e => e.id), null, 2));
    lines.push('```');
    lines.push('`lastReviewAt`을 현재 ISO 시간으로 업데이트.');
  }

  console.log(lines.join('\n'));
}

main();
