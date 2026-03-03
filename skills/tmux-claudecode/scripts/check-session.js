#!/usr/bin/env node
/**
 * tmux-claudecode: 세션 상태 확인 스크립트
 * Usage: node check-session.js <session-name>
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SOCKET = `${process.env.TMPDIR || '/tmp'}/openclaw-tmux-sockets/openclaw.sock`;
const SESSIONS_FILE = path.join(os.homedir(), 'clawd/warm-memory/tmux-sessions.json');

function tmux(...args) {
  return spawnSync('tmux', ['-S', SOCKET, ...args], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
}

function detectStatus(output) {
  const lines = output.split('\n').filter(Boolean);
  const lastLines = lines.slice(-10).join('\n');

  if (/Committed and pushed|✓|All done|Task complete/i.test(lastLines)) return 'completed';
  if (/rate limit|RateLimitError|API Error/i.test(lastLines)) return 'error';
  if (/❯|➜|\$\s*$/.test(lastLines)) return 'ready';
  if (/\[|\]|…|tool|running/i.test(lastLines)) return 'thinking';
  return 'unknown';
}

async function main() {
  const [,, sessionName] = process.argv;

  if (!sessionName) {
    // 모든 세션 나열
    if (fs.existsSync(SESSIONS_FILE)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      console.log('Active sessions:');
      for (const [name, info] of Object.entries(sessions.sessions)) {
        console.log(`  ${name}: [${info.status}] ${info.task?.slice(0, 60)}`);
      }
    } else {
      console.log('No sessions found');
    }
    return;
  }

  // 세션 캡처
  const result = tmux('capture-pane', '-p', '-J', '-t', `${sessionName}:0.0`, '-S', '-100');

  if (result.status !== 0) {
    console.log(`Session '${sessionName}' not found or not running`);
    return;
  }

  const output = result.stdout;
  const status = detectStatus(output);

  console.log(`Session: ${sessionName}`);
  console.log(`Status: ${status}`);
  console.log('\n--- Last 20 lines ---');
  const lines = output.split('\n').filter(Boolean);
  console.log(lines.slice(-20).join('\n'));

  // 세션 추적 업데이트
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      if (sessions.sessions[sessionName]) {
        if (status === 'completed') {
          sessions.sessions[sessionName].status = 'completed';
          sessions.sessions[sessionName].completedAt = new Date().toISOString();
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
          console.log('\n✅ Task completed!');
        }
      }
    } catch (e) {}
  }
}

main().catch(console.error);
