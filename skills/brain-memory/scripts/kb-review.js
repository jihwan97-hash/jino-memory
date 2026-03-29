#!/usr/bin/env node
/**
 * KB Review Script - Knowledge Base Tier Review & Promotion
 *
 * Reads ClawVault daily files (facts, decisions, goals, inbox) and identifies:
 * 1. New Items: high-importance entries not yet reviewed
 * 2. Tier promotion candidates: frequently referenced or high-confidence entries
 *
 * Usage:
 *   node kb-review.js              # Dry run: show report only
 *   node kb-review.js --promote    # Also update tier promotions
 *
 * Output goes to stdout for the agent to process.
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = process.env.CLAWVAULT_PATH || path.join(process.env.HOME, '.jinobot/clawd/jino-memory');
const STATE_FILE = path.join(process.env.HOME, '.jinobot/clawd/warm-memory/kb-review-state.json');
const PROMOTE = process.argv.includes('--promote');
const DAYS_BACK = parseInt(process.env.DAYS_BACK || '3', 10);

// Noise patterns to skip (tool errors, raw tool output, etc.)
const NOISE_PATTERNS = [
  /^\s*\{.*"status":\s*"error"/,
  /^node:internal\/modules/,
  /^Error: Cannot find module/,
  /^Error: Not a ClawVault/,
  /^\s*\{.*"tool":/,
  /^will permanently disable this error/,
  /^Read more about this behavior/,
  /^\s*\{.*"entries":\s*\[/,
  /^AGENTS\.md\s+HEARTBEAT/,
  /^HOT-MEMORY\.md\s+IDENTITY/,
];

function isNoise(content) {
  for (const p of NOISE_PATTERNS) {
    if (p.test(content)) return true;
  }
  return content.trim().length < 15;
}

// Tier definitions
const TIERS = {
  hot: { minConfidence: 0.92, minImportance: 0.92, label: '🔥 HOT' },
  warm: { minConfidence: 0.85, minImportance: 0.85, label: '♨️ WARM' },
  cool: { minConfidence: 0.70, minImportance: 0.70, label: '❄️ COOL' },
};

// Categories to review
const CATEGORIES = ['facts', 'decisions', 'goals', 'inbox'];

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return {
        reviewedIds: Array.isArray(s.reviewedIds) ? s.reviewedIds : [],
        lastReviewAt: s.lastReviewAt || null,
      };
    }
  } catch { /* ignore */ }
  return { reviewedIds: [], lastReviewAt: null };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`[KB-REVIEW] Could not save state: ${err.message}`);
  }
}

function getDateStrings(daysBack) {
  const dates = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function parseLine(line, date, category) {
  // Format: - [type|c=0.xx|i=0.xx] HH:MM [session] role: content
  const match = line.match(/^\s*-\s+\[([^\]]+)\]\s+(\d{2}:\d{2})\s+\[([^\]]+)\]\s+(\w+):\s+(.+)$/);
  if (!match) return null;

  const [, meta, time, session, role, content] = match;

  // Parse meta fields
  const metaParts = meta.split('|');
  const type = metaParts[0];
  const confidence = parseFloat((meta.match(/c=([\d.]+)/) || ['', '0'])[1]);
  const importance = parseFloat((meta.match(/i=([\d.]+)/) || ['', '0'])[1]);

  // Generate stable ID from content
  const id = `${category}-${date}-${time}-${Buffer.from(content.slice(0, 50)).toString('base64').replace(/[^a-z0-9]/gi, '').slice(0, 12)}`;

  return { id, type, date, time, session, role, content: content.trim(), confidence, importance, category };
}

function determineTier(entry) {
  if (entry.confidence >= TIERS.hot.minConfidence && entry.importance >= TIERS.hot.minImportance) return 'hot';
  if (entry.confidence >= TIERS.warm.minConfidence && entry.importance >= TIERS.warm.minImportance) return 'warm';
  if (entry.confidence >= TIERS.cool.minConfidence && entry.importance >= TIERS.cool.minImportance) return 'cool';
  return null;
}

function truncate(str, maxLen = 120) {
  if (!str) return '';
  // Strip ClawVault markup [[...]] 
  str = str.replace(/\[\[([^\]]+)\]\]/g, '$1');
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

function main() {
  const state = loadState();
  const reviewedSet = new Set(state.reviewedIds);
  const dates = getDateStrings(DAYS_BACK);

  const newItems = [];
  const promotionCandidates = [];
  let totalScanned = 0;

  for (const category of CATEGORIES) {
    const catDir = path.join(VAULT_PATH, category);
    if (!fs.existsSync(catDir)) continue;

    for (const date of dates) {
      const filePath = path.join(catDir, `${date}.md`);
      if (!fs.existsSync(filePath)) continue;

      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      for (const line of lines) {
        if (!line.trim().startsWith('-')) continue;
        const entry = parseLine(line, date, category);
        if (!entry) continue;

        totalScanned++;
        if (isNoise(entry.content)) continue;
        const tier = determineTier(entry);

        if (!reviewedSet.has(entry.id)) {
          newItems.push({ ...entry, tier });
        }

        if (tier === 'hot' || tier === 'warm') {
          promotionCandidates.push({ ...entry, tier });
        }
      }
    }
  }

  // Sort new items by importance desc
  newItems.sort((a, b) => b.importance - a.importance);
  promotionCandidates.sort((a, b) => b.importance - a.importance);

  // --- Report ---
  console.log(`# KB Review Report — ${new Date().toISOString().slice(0, 10)}`);
  console.log(`\nScanned: ${totalScanned} entries across ${CATEGORIES.join(', ')} (last ${DAYS_BACK} days)`);
  console.log(`Last review: ${state.lastReviewAt || 'never'}`);
  console.log(`Previously reviewed: ${state.reviewedIds.length} entries`);

  console.log(`\n## New Items (${newItems.length})`);
  if (newItems.length === 0) {
    console.log('No new items.');
  } else {
    for (const item of newItems.slice(0, 20)) {
      const tierLabel = item.tier ? ` [${TIERS[item.tier]?.label || item.tier}]` : '';
      console.log(`- [${item.category}/${item.date}]${tierLabel} c=${item.confidence.toFixed(2)} i=${item.importance.toFixed(2)}: ${truncate(item.content)}`);
    }
    if (newItems.length > 20) {
      console.log(`  … and ${newItems.length - 20} more`);
    }
  }

  console.log(`\n## Tier Promotion Candidates (${promotionCandidates.length})`);
  if (promotionCandidates.length === 0) {
    console.log('No promotion candidates.');
  } else {
    for (const item of promotionCandidates.slice(0, 10)) {
      console.log(`- ${TIERS[item.tier]?.label} [${item.category}/${item.date}] c=${item.confidence.toFixed(2)} i=${item.importance.toFixed(2)}: ${truncate(item.content)}`);
    }
  }

  // --- State Update ---
  const newIds = newItems.map(i => i.id);
  const updatedState = {
    reviewedIds: [...new Set([...state.reviewedIds, ...newIds])].slice(-500), // keep last 500
    lastReviewAt: new Date().toISOString(),
  };

  if (PROMOTE) {
    saveState(updatedState);
    console.log(`\n## State Updated`);
    console.log(`Marked ${newIds.length} new items as reviewed. Total: ${updatedState.reviewedIds.length}`);
  } else {
    console.log(`\n## Dry Run`);
    console.log(`Would mark ${newIds.length} new items as reviewed. Run with --promote to apply.`);
  }
}

main();
