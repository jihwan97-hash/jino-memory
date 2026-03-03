#!/usr/bin/env node
/**
 * tmux-claudecode: 세션 생성 스크립트
 * Usage: node create-session.js <session-name> <project-dir> "<task>"
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SOCKET = `${process.env.TMPDIR || '/tmp'}/openclaw-tmux-sockets/openclaw.sock`;
const SESSIONS_FILE = path.join(os.homedir(), 'clawd/warm-memory/tmux-sessions.json');

function tmux(...args) {
  const result = spawnSync('tmux', ['-S', SOCKET, ...args], {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (result.status !== 0 && result.stderr) {
    console.error(`tmux error: ${result.stderr.trim()}`);
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [,, sessionName, projectDir, task] = process.argv;

  if (!sessionName || !projectDir || !task) {
    console.error('Usage: create-session.js <session-name> <project-dir> "<task>"');
    process.exit(1);
  }

  const resolvedDir = projectDir.replace('~', os.homedir());

  if (!fs.existsSync(resolvedDir)) {
    console.error(`Project directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  console.log(`Creating session: ${sessionName}`);
  console.log(`Project: ${resolvedDir}`);
  console.log(`Task: ${task}`);

  // 기존 세션 제거
  tmux('kill-session', '-t', sessionName);

  // 새 세션 생성
  tmux('new', '-d', '-s', sessionName, '-c', resolvedDir);
  tmux('resize-window', '-t', sessionName, '-x', '300', '-y', '80');

  // Claude Code 시작
  tmux('send-keys', '-t', sessionName, 'claude --dangerously-skip-permissions', 'Enter');

  // 초기화 대기
  console.log('Waiting for Claude Code to initialize...');
  await sleep(4000);

  // 태스크 전송
  tmux('send-keys', '-t', sessionName, '-l', task);
  tmux('send-keys', '-t', sessionName, 'Enter');

  console.log('Task sent!');

  // 세션 추적 파일 업데이트
  let sessions = { sessions: {} };
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    } catch (e) {}
  }

  sessions.sessions[sessionName] = {
    project: projectDir,
    task,
    status: 'running',
    startedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));

  console.log(`Session tracking saved to ${SESSIONS_FILE}`);
  console.log(`\nCheck status: node check-session.js ${sessionName}`);
}

main().catch(console.error);
