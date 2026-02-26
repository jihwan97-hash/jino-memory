#!/usr/bin/env node
/**
 * Gmail Skill - Full email access via Gmail API v1
 *
 * Usage: node gmail.js <subcommand> [options]
 * Subcommands: list, read, search, send, reply, trash, delete, modify, labels, mark-read, mark-unread
 *
 * Multi-account support:
 *   --account work     → astin@hashed.com (read-only)
 *   --account personal → gkswlghks118@gmail.com (read-only)
 *   --account jihwan   → jihwan260213@gmail.com (full access: send, delete, modify)
 *   Default: tries work first, falls back to personal, then jihwan
 */

import { readFileSync } from 'node:fs';

const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const ACCOUNTS = {
  work: {
    label: 'astin@hashed.com',
    refreshTokenEnv: 'GOOGLE_GMAIL_REFRESH_TOKEN',
    credsFile: '/root/.google-gmail.env',
  },
  personal: {
    label: 'gkswlghks118@gmail.com',
    refreshTokenEnv: 'GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN',
    credsFile: '/root/.google-gmail-personal.env',
  },
  jihwan: {
    label: 'jihwan260213@gmail.com',
    refreshTokenEnv: 'GOOGLE_GMAIL_JIHWAN_REFRESH_TOKEN',
    credsFile: '/root/.google-gmail-jihwan.env',
  },
};

// Load credentials from file if env vars are missing
function loadCredsFromFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (val && !process.env[key]) process.env[key] = val;
      }
    }
  } catch {}
}

// Resolve which account to use
function resolveAccount(accountName) {
  if (accountName && ACCOUNTS[accountName]) {
    return ACCOUNTS[accountName];
  }
  // Auto-detect: try work first, then personal, then jihwan
  for (const key of ['work', 'personal', 'jihwan']) {
    const acct = ACCOUNTS[key];
    loadCredsFromFile(acct.credsFile);
    if (process.env[acct.refreshTokenEnv]) return acct;
  }
  throw new Error('No Gmail account configured. Set GOOGLE_GMAIL_REFRESH_TOKEN (work), GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN (personal), or GOOGLE_GMAIL_JIHWAN_REFRESH_TOKEN (jihwan)');
}

// ─── Token Management ───────────────────────────────────────────────

async function getAccessToken(account) {
  loadCredsFromFile(account.credsFile);

  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
  const refreshToken = process.env[account.refreshTokenEnv];

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_GMAIL_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_GMAIL_CLIENT_SECRET');
    if (!refreshToken) missing.push(account.refreshTokenEnv);
    throw new Error(`Missing env vars for ${account.label}: ${missing.join(', ')}`);
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed for ${account.label} (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

let cachedToken = null;
let cachedAccount = null;

async function getToken(account) {
  if (!cachedToken || cachedAccount !== account) {
    cachedToken = await getAccessToken(account);
    cachedAccount = account;
  }
  return cachedToken;
}

async function gmailFetch(path, account, options = {}) {
  const token = await getToken(account);
  const url = path.startsWith('http') ? path : `${GMAIL_API}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error (${res.status} ${res.statusText}): ${text}`);
  }

  if (res.status === 204) return { success: true };
  return res.json();
}

// ─── Helpers ────────────────────────────────────────────────────────

function decodeBase64Url(str) {
  if (!str) return '';
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function encodeBase64Url(str) {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getHeader(headers, name) {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

function extractTextBody(payload) {
  if (!payload) return '';

  // Simple body
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart: recurse into parts
  if (payload.parts) {
    // Prefer text/plain over text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Fallback: try nested multipart
    for (const part of payload.parts) {
      const text = extractTextBody(part);
      if (text) return text;
    }
  }

  return '';
}

function buildRawMessage({ to, cc, subject, body, inReplyTo, references }) {
  const lines = [];
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  lines.push(`Subject: ${subject}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/plain; charset=UTF-8');
  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
    lines.push(`References: ${references || inReplyTo}`);
  }
  lines.push('');
  lines.push(body);
  return encodeBase64Url(lines.join('\r\n'));
}

// ─── Read Subcommands ───────────────────────────────────────────────

async function listMessages(opts, account) {
  const hours = parseInt(opts.hours || '24', 10);
  const maxResults = parseInt(opts.max || '20', 10);
  const afterEpoch = Math.floor((Date.now() - hours * 3600 * 1000) / 1000);
  const query = `after:${afterEpoch}`;

  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });

  const data = await gmailFetch(`/messages?${params}`, account);
  const messages = data.messages || [];

  if (messages.length === 0) {
    console.log(JSON.stringify({ command: 'list', account: account.label, hours, count: 0, messages: [] }, null, 2));
    return;
  }

  // Fetch metadata for each message
  const results = [];
  for (const msg of messages) {
    const detail = await gmailFetch(`/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, account);
    const headers = detail.payload?.headers || [];
    results.push({
      id: detail.id,
      threadId: detail.threadId,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: detail.snippet || '',
      labelIds: detail.labelIds || [],
      isUnread: (detail.labelIds || []).includes('UNREAD'),
    });
  }

  console.log(
    JSON.stringify(
      {
        command: 'list',
        account: account.label,
        hours,
        count: results.length,
        messages: results,
      },
      null,
      2
    )
  );
}

async function readMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  const detail = await gmailFetch(`/messages/${opts.id}?format=full`, account);
  const headers = detail.payload?.headers || [];
  const body = extractTextBody(detail.payload);

  console.log(
    JSON.stringify(
      {
        command: 'read',
        account: account.label,
        id: detail.id,
        threadId: detail.threadId,
        from: getHeader(headers, 'From'),
        to: getHeader(headers, 'To'),
        subject: getHeader(headers, 'Subject'),
        date: getHeader(headers, 'Date'),
        labelIds: detail.labelIds || [],
        body: body.slice(0, 5000), // Limit body to 5000 chars
        bodyTruncated: body.length > 5000,
      },
      null,
      2
    )
  );
}

async function searchMessages(opts, account) {
  if (!opts.query) throw new Error('--query is required');
  const maxResults = parseInt(opts.max || '10', 10);

  const params = new URLSearchParams({
    q: opts.query,
    maxResults: String(maxResults),
  });

  const data = await gmailFetch(`/messages?${params}`, account);
  const messages = data.messages || [];

  if (messages.length === 0) {
    console.log(JSON.stringify({ command: 'search', account: account.label, query: opts.query, count: 0, messages: [] }, null, 2));
    return;
  }

  const results = [];
  for (const msg of messages) {
    const detail = await gmailFetch(`/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, account);
    const headers = detail.payload?.headers || [];
    results.push({
      id: detail.id,
      threadId: detail.threadId,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: detail.snippet || '',
    });
  }

  console.log(
    JSON.stringify(
      {
        command: 'search',
        account: account.label,
        query: opts.query,
        count: results.length,
        messages: results,
      },
      null,
      2
    )
  );
}

// ─── Write Subcommands (require full-access scope) ──────────────────

async function sendMessage(opts, account) {
  if (!opts.to) throw new Error('--to is required');
  if (!opts.subject) throw new Error('--subject is required');
  if (!opts.body) throw new Error('--body is required');

  const raw = buildRawMessage({
    to: opts.to,
    cc: opts.cc || null,
    subject: opts.subject,
    body: opts.body,
  });

  const data = await gmailFetch('/messages/send', account, {
    method: 'POST',
    body: JSON.stringify({ raw }),
  });

  console.log(JSON.stringify({
    command: 'send',
    account: account.label,
    success: true,
    id: data.id,
    threadId: data.threadId,
  }, null, 2));
}

async function replyMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required (message to reply to)');
  if (!opts.body) throw new Error('--body is required');

  // Fetch original message to get threading headers
  const original = await gmailFetch(
    `/messages/${opts.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=To`,
    account
  );
  const headers = original.payload?.headers || [];
  const messageId = getHeader(headers, 'Message-ID');
  const origSubject = getHeader(headers, 'Subject');
  const origFrom = getHeader(headers, 'From');

  const replyTo = opts.to || origFrom;
  const subject = origSubject.startsWith('Re:') ? origSubject : `Re: ${origSubject}`;

  const raw = buildRawMessage({
    to: replyTo,
    subject,
    body: opts.body,
    inReplyTo: messageId,
    references: messageId,
  });

  const data = await gmailFetch('/messages/send', account, {
    method: 'POST',
    body: JSON.stringify({ raw, threadId: original.threadId }),
  });

  console.log(JSON.stringify({
    command: 'reply',
    account: account.label,
    success: true,
    id: data.id,
    threadId: data.threadId,
    replyToId: opts.id,
  }, null, 2));
}

async function trashMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  const data = await gmailFetch(`/messages/${opts.id}/trash`, account, {
    method: 'POST',
  });

  console.log(JSON.stringify({
    command: 'trash',
    account: account.label,
    success: true,
    id: data.id,
  }, null, 2));
}

async function untrashMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  const data = await gmailFetch(`/messages/${opts.id}/untrash`, account, {
    method: 'POST',
  });

  console.log(JSON.stringify({
    command: 'untrash',
    account: account.label,
    success: true,
    id: data.id,
  }, null, 2));
}

async function deleteMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  await gmailFetch(`/messages/${opts.id}`, account, {
    method: 'DELETE',
  });

  console.log(JSON.stringify({
    command: 'delete',
    account: account.label,
    success: true,
    deletedId: opts.id,
  }, null, 2));
}

async function modifyMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  const body = {};
  if (opts['add-labels']) body.addLabelIds = opts['add-labels'].split(',');
  if (opts['remove-labels']) body.removeLabelIds = opts['remove-labels'].split(',');

  if (!body.addLabelIds && !body.removeLabelIds) {
    throw new Error('Use --add-labels and/or --remove-labels (comma-separated label IDs, e.g. STARRED,IMPORTANT)');
  }

  const data = await gmailFetch(`/messages/${opts.id}/modify`, account, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  console.log(JSON.stringify({
    command: 'modify',
    account: account.label,
    success: true,
    id: data.id,
    labelIds: data.labelIds,
  }, null, 2));
}

async function listLabels(opts, account) {
  const data = await gmailFetch('/labels', account);

  console.log(JSON.stringify({
    command: 'labels',
    account: account.label,
    labels: (data.labels || []).map(l => ({
      id: l.id,
      name: l.name,
      type: l.type,
    })),
  }, null, 2));
}

async function markRead(opts, account) {
  if (!opts.id) throw new Error('--id is required');
  opts['remove-labels'] = 'UNREAD';
  return modifyMessage(opts, account);
}

async function markUnread(opts, account) {
  if (!opts.id) throw new Error('--id is required');
  opts['add-labels'] = 'UNREAD';
  return modifyMessage(opts, account);
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

  const account = resolveAccount(opts.account);

  switch (subcommand) {
    case 'list':
      return await listMessages(opts, account);
    case 'read':
      return await readMessage(opts, account);
    case 'search':
      return await searchMessages(opts, account);
    case 'send':
      return await sendMessage(opts, account);
    case 'reply':
      return await replyMessage(opts, account);
    case 'trash':
      return await trashMessage(opts, account);
    case 'untrash':
      return await untrashMessage(opts, account);
    case 'delete':
      return await deleteMessage(opts, account);
    case 'modify':
      return await modifyMessage(opts, account);
    case 'labels':
      return await listLabels(opts, account);
    case 'mark-read':
      return await markRead(opts, account);
    case 'mark-unread':
      return await markUnread(opts, account);
    default:
      console.error(
        'Usage: node gmail.js <subcommand> [options]\n\n' +
          'Read subcommands:\n' +
          '  list [--hours N] [--max N] [--account work|personal|jihwan]  List recent messages\n' +
          '  read --id MSG_ID [--account ...]                             Read full message body\n' +
          '  search --query "text" [--max N] [--account ...]              Search emails\n\n' +
          'Write subcommands (require full-access scope):\n' +
          '  send --to "email" --subject "subj" --body "text" [--cc "email"] [--account jihwan]\n' +
          '  reply --id MSG_ID --body "text" [--to "email"] [--account jihwan]\n' +
          '  trash --id MSG_ID [--account jihwan]                         Move to trash\n' +
          '  untrash --id MSG_ID [--account jihwan]                       Restore from trash\n' +
          '  delete --id MSG_ID [--account jihwan]                        Permanently delete (!)\n' +
          '  modify --id MSG_ID --add-labels "L1,L2" --remove-labels "L3" [--account jihwan]\n' +
          '  labels [--account jihwan]                                    List all labels\n' +
          '  mark-read --id MSG_ID [--account jihwan]                     Mark as read\n' +
          '  mark-unread --id MSG_ID [--account jihwan]                   Mark as unread\n\n' +
          'Accounts:\n' +
          '  --account work      astin@hashed.com (read-only)\n' +
          '  --account personal  gkswlghks118@gmail.com (read-only)\n' +
          '  --account jihwan    jihwan260213@gmail.com (full access)\n' +
          '  (default: auto-detect first available)\n\n' +
          'Examples:\n' +
          '  node gmail.js list --hours 48 --account work\n' +
          '  node gmail.js send --to "someone@example.com" --subject "Hello" --body "Hi there" --account jihwan\n' +
          '  node gmail.js reply --id 18e1a2b3c4d5e6f7 --body "Thanks!" --account jihwan\n' +
          '  node gmail.js trash --id 18e1a2b3c4d5e6f7 --account jihwan\n' +
          '  node gmail.js mark-read --id 18e1a2b3c4d5e6f7 --account jihwan'
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
