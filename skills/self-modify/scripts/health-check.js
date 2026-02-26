#!/usr/bin/env node
/**
 * Health Check: Daily diagnostic for memory systems, git sync, and skill health.
 *
 * Outputs a structured JSON report for the agent to analyze and act on.
 * Called by brain-memory cron (daily) and self-reflect cron (weekly).
 *
 * Usage:
 *   node health-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/root/clawd';
const WARM_DIR = path.join(WORKSPACE, 'warm-memory');
const DAILY_DIR = path.join(WORKSPACE, 'brain-memory', 'daily');
const REFLECTIONS_DIR = path.join(WORKSPACE, 'brain-memory', 'reflections');
const MEMORY_FILE = path.join(WORKSPACE, 'MEMORY.md');
const CHANGELOG_FILE = path.join(WORKSPACE, '.modification-history', 'changelog.jsonl');
const GIT_DIR = path.join(WORKSPACE, 'jino-memory');

const CRITICAL_SKILLS = [
  'google-calendar/scripts/calendar.js',
  'gmail/scripts/gmail.js',
  'self-modify/scripts/modify.js',
  'brain-memory/scripts/brain-memory-system.js',
  'web-researcher/scripts/study-session.js',
];

function daysSince(filepath) {
  try {
    const stat = fs.statSync(filepath);
    return Math.floor((Date.now() - stat.mtimeMs) / 86400000);
  } catch { return -1; }
}

function countLines(filepath, pattern) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    if (!pattern) return content.split('\n').filter(Boolean).length;
    return content.split('\n').filter(l => pattern.test(l)).length;
  } catch { return 0; }
}

function countFilesInLastDays(dir, days, suffix = '.md') {
  try {
    if (!fs.existsSync(dir)) return 0;
    const cutoff = Date.now() - days * 86400000;
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(suffix))
      .filter(f => {
        try { return fs.statSync(path.join(dir, f)).mtimeMs > cutoff; }
        catch { return false; }
      }).length;
  } catch { return 0; }
}

function getChangelogMetrics() {
  try {
    if (!fs.existsSync(CHANGELOG_FILE)) return { total: 0, last7d: 0, last30d: 0 };
    const now = Date.now();
    const entries = fs.readFileSync(CHANGELOG_FILE, 'utf8')
      .split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
    const last7d = entries.filter(e => (now - new Date(e.ts).getTime()) < 7 * 86400000).length;
    const last30d = entries.filter(e => (now - new Date(e.ts).getTime()) < 30 * 86400000).length;
    return { total: entries.length, last7d, last30d };
  } catch { return { total: 0, last7d: 0, last30d: 0 }; }
}

function getGitStatus() {
  try {
    if (!fs.existsSync(GIT_DIR)) return { available: false };
    const uncommitted = execSync('git status --porcelain 2>/dev/null | wc -l', { cwd: GIT_DIR, encoding: 'utf8' }).trim();
    let lastPush = 'unknown';
    try {
      lastPush = execSync('git log -1 --format=%cd --date=relative 2>/dev/null', { cwd: GIT_DIR, encoding: 'utf8' }).trim();
    } catch { /* ignore */ }
    return { available: true, uncommitted: parseInt(uncommitted) || 0, lastCommit: lastPush };
  } catch { return { available: false }; }
}

function checkSkills() {
  const results = [];
  for (const skill of CRITICAL_SKILLS) {
    const fullPath = path.join(WORKSPACE, 'skills', skill);
    const exists = fs.existsSync(fullPath);
    if (!exists) results.push({ skill, status: 'MISSING' });
  }
  return results;
}

function main() {
  const issues = [];
  const metrics = {};

  // Auto-fix: create missing critical directories
  for (const dir of [DAILY_DIR, REFLECTIONS_DIR, WARM_DIR]) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        issues.push({ severity: 'info', component: 'auto-fix', message: `Created missing directory: ${dir}` });
      } catch (err) {
        issues.push({ severity: 'error', component: 'auto-fix', message: `Failed to create ${dir}: ${err.message}` });
      }
    }
  }

  // Memory pipeline checks
  const lessonsExists = fs.existsSync(path.join(WARM_DIR, 'lessons.md'));
  const todoExists = fs.existsSync(path.join(WARM_DIR, 'todo.md'));
  const lessonsEntries = lessonsExists ? countLines(path.join(WARM_DIR, 'lessons.md'), /^- \[/) : 0;
  const memoryAge = daysSince(MEMORY_FILE);
  const dailiesLast7d = countFilesInLastDays(DAILY_DIR, 7);
  const reflectionsLast8d = countFilesInLastDays(REFLECTIONS_DIR, 8);

  metrics.lessonsExists = lessonsExists;
  metrics.lessonsEntries = lessonsEntries;
  metrics.todoExists = todoExists;
  metrics.memoryAgeDays = memoryAge;
  metrics.dailySummariesLast7d = dailiesLast7d;
  metrics.reflectionsLast8d = reflectionsLast8d;

  if (!lessonsExists) issues.push({ severity: 'warning', component: 'lessons', message: 'warm-memory/lessons.md missing' });
  if (!todoExists) issues.push({ severity: 'warning', component: 'todo', message: 'warm-memory/todo.md missing' });
  if (memoryAge > 60) issues.push({ severity: 'warning', component: 'memory', message: `MEMORY.md not updated in ${memoryAge} days` });
  if (dailiesLast7d < 3) issues.push({ severity: 'warning', component: 'brain-memory', message: `Only ${dailiesLast7d} daily summaries in last 7 days` });
  if (reflectionsLast8d === 0) issues.push({ severity: 'warning', component: 'reflections', message: 'No reflections in last 8 days' });

  // Modification metrics
  const changelog = getChangelogMetrics();
  metrics.modificationsTotal = changelog.total;
  metrics.modificationsLast7d = changelog.last7d;
  metrics.modificationsLast30d = changelog.last30d;

  // Git sync
  const git = getGitStatus();
  metrics.gitAvailable = git.available;
  if (git.available) {
    metrics.gitUncommitted = git.uncommitted;
    metrics.gitLastCommit = git.lastCommit;
    if (git.uncommitted > 10) issues.push({ severity: 'warning', component: 'git', message: `${git.uncommitted} uncommitted files` });
  } else {
    issues.push({ severity: 'error', component: 'git', message: 'jino-memory repo not available' });
  }

  // Skill health
  const missingSkills = checkSkills();
  metrics.missingSkills = missingSkills.length;
  for (const s of missingSkills) {
    issues.push({ severity: 'error', component: 'skills', message: `${s.skill} is ${s.status}` });
  }

  // Determine overall status
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');
  const status = hasErrors ? 'critical' : hasWarnings ? 'degraded' : 'healthy';

  const report = { timestamp: new Date().toISOString(), status, issues, metrics };
  console.log(JSON.stringify(report, null, 2));
}

main();
