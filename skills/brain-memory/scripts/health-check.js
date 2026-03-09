#!/usr/bin/env node
/**
 * health-check.js — brain-memory 시스템 상태 점검
 * 실행: node health-check.js
 * 출력: 각 항목 OK/WARN/FAIL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/Users/astin/.jinobot/clawd';
const JINO_MEMORY = path.join(WORKSPACE, 'jino-memory');
const BRAIN_MEMORY = path.join(WORKSPACE, 'brain-memory');
const WARM_MEMORY = path.join(WORKSPACE, 'warm-memory');

let issues = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.log(`  ⚠️  WARN: ${label}`);
      issues.push(label);
    } else {
      console.log(`  ✅ OK: ${label}${result && result !== true ? ' — ' + result : ''}`);
    }
  } catch (e) {
    console.log(`  ❌ FAIL: ${label} — ${e.message}`);
    issues.push(label);
  }
}

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

console.log(`\n🔍 Brain-Memory Health Check — ${today}\n`);

// 1. Daily 파일 확인
check('Today daily file exists', () => {
  const p = path.join(JINO_MEMORY, 'daily', `${today}.md`);
  if (!fs.existsSync(p)) return false;
  const size = fs.statSync(p).size;
  return `${size}B`;
});

// 2. HOT-MEMORY 크기
check('HOT-MEMORY.md size < 500 tokens (~2500 chars)', () => {
  const p = path.join(WORKSPACE, 'HOT-MEMORY.md');
  if (!fs.existsSync(p)) return false;
  const size = fs.statSync(p).size;
  if (size > 2500) return false;
  return `${size}B`;
});

// 3. 필수 파일 존재
for (const f of ['warm-memory/lessons.md', 'warm-memory/todo.md', 'MEMORY.md', 'SOUL.md', 'USER.md']) {
  check(`${f} exists`, () => fs.existsSync(path.join(WORKSPACE, f)));
}

// 4. brain-memory daily 백업
check('brain-memory/daily recent file', () => {
  const dir = path.join(BRAIN_MEMORY, 'daily');
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  if (!files.length) return false;
  return files[files.length - 1];
});

// 5. jino-memory git 상태
check('jino-memory git uncommitted < 10', () => {
  const out = execSync('git status --porcelain 2>/dev/null | wc -l', { cwd: JINO_MEMORY }).toString().trim();
  const count = parseInt(out);
  if (count >= 10) return false;
  return `${count} uncommitted`;
});

// 6. knowledge-base 존재
check('knowledge-base/short-term exists', () => {
  const p = path.join(WARM_MEMORY, 'knowledge-base', 'short-term');
  return fs.existsSync(p);
});

// 결과 요약
console.log('\n' + '─'.repeat(40));
if (issues.length === 0) {
  console.log('✅ All checks passed\n');
} else {
  console.log(`⚠️  ${issues.length} issue(s): ${issues.join(', ')}\n`);
}

process.exit(issues.length > 0 ? 1 : 0);
