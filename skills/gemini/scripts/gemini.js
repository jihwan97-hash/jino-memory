#!/usr/bin/env node
/**
 * Gemini Generative AI Skill
 *
 * Usage: node gemini.js <subcommand> [options]
 * Subcommands: generate, summarize
 *
 * Uses GOOGLE_AI_API_KEY (same key as embeddings).
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/MODEL:generateContent
 */

import { readFileSync } from 'node:fs';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const CREDS_FILE = '/root/.google-ai.env';

function loadApiKey() {
  let key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    try {
      const content = readFileSync(CREDS_FILE, 'utf-8');
      for (const line of content.split('\n')) {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (v && !process.env[k]) process.env[k] = v;
        }
      }
      key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    } catch {}
  }
  if (!key) throw new Error('Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY');
  return key;
}

async function geminiGenerate(opts) {
  if (!opts.prompt) throw new Error('--prompt is required');
  const apiKey = loadApiKey();
  const model = opts.model || DEFAULT_MODEL;
  const maxTokens = parseInt(opts['max-tokens'] || '2048', 10);

  const url = `${GEMINI_API}/models/${model}:generateContent?key=${apiKey}`;
  const parts = [];

  // If --file is provided, read file content and prepend to prompt
  if (opts.file) {
    const fileContent = readFileSync(opts.file, 'utf-8');
    parts.push({ text: fileContent });
  }

  parts.push({ text: opts.prompt });

  const body = {
    contents: [{ parts }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: parseFloat(opts.temperature || '0.7'),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  console.log(JSON.stringify({
    command: 'generate',
    model,
    text,
    usage: data.usageMetadata || null,
  }, null, 2));
}

async function geminiSummarize(opts) {
  if (!opts.file && !opts.text) throw new Error('--file or --text is required');
  const content = opts.file ? readFileSync(opts.file, 'utf-8') : opts.text;
  opts.prompt = `Summarize the following content concisely:\n\n${content}`;
  opts.temperature = opts.temperature || '0.3';
  return geminiGenerate(opts);
}

// ─── CLI Entry Point ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  switch (subcommand) {
    case 'generate':
      return await geminiGenerate(opts);
    case 'summarize':
      return await geminiSummarize(opts);
    default:
      console.error(
        'Usage: node gemini.js <generate|summarize> [options]\n\n' +
          'Subcommands:\n' +
          '  generate --prompt "text" [--model gemini-2.5-flash] [--max-tokens 2048] [--temperature 0.7] [--file path]\n' +
          '  summarize --file path [--model gemini-2.5-flash] [--max-tokens 2048]\n' +
          '  summarize --text "content to summarize"\n\n' +
          'Examples:\n' +
          '  node gemini.js generate --prompt "Explain quantum computing in Korean"\n' +
          '  node gemini.js generate --prompt "Analyze this document" --file /tmp/doc.md\n' +
          '  node gemini.js summarize --file /root/clawd/warm-memory/inbox.md'
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
