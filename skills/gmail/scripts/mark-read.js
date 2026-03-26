#!/usr/bin/env node
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
};

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

function resolveAccount(accountName) {
  if (accountName && ACCOUNTS[accountName]) return ACCOUNTS[accountName];
  for (const key of ['work', 'personal']) {
    const acct = ACCOUNTS[key];
    loadCredsFromFile(acct.credsFile);
    if (process.env[acct.refreshTokenEnv]) return acct;
  }
  throw new Error('No Gmail account configured. Set appropriate env vars');
}

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
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function gmailFetch(path, token, method = 'GET', body = null) {
  const url = path.startsWith('http') ? path : `${GMAIL_API}${path}`;
  const opts = { method, headers: { Authorization: `Bearer ${token}` } };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  if (!opts.id) throw new Error('--id is required');
  const account = resolveAccount(opts.account);
  const dry = opts.dry === 'true' || opts.dry === '1' || opts.dry === undefined; // default dry-run

  const token = await getAccessToken(account);

  // Read current labels for verification
  const detail = await gmailFetch(`/messages/${opts.id}?format=metadata&metadataHeaders=LabelIds`, token);
  const labels = detail.labelIds || [];

  console.log(JSON.stringify({ command: 'mark-read-dry' , account: account.label, id: opts.id, labelsBefore: labels }, null, 2));

  if (dry) {
    console.log('Dry-run enabled. No changes made. To apply, run with --dry false and confirm.');
    return;
  }

  // Apply modify to remove UNREAD
  const res = await gmailFetch(`/messages/${opts.id}/modify`, token, 'POST', { removeLabelIds: ['UNREAD'] });
  console.log(JSON.stringify({ command: 'mark-read', account: account.label, id: opts.id, labelsAfter: res.labelIds }, null, 2));
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
