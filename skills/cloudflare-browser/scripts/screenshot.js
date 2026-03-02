#!/usr/bin/env node
/**
 * Browser Screenshot via local headless Chrome
 * Usage: node screenshot.js <url> [output.png]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('./cdp-client');

const url = process.argv[2];
const output = process.argv[3] || 'screenshot.png';

if (!url) {
  console.error('Usage: node screenshot.js <url> [output.png]');
  process.exit(1);
}

async function main() {
  console.log(`Capturing screenshot of ${url}`);

  let client;
  try {
    client = await createClient({ timeout: 60000 });

    await client.setViewport(1280, 800, 2, false);
    await client.navigate(url, 5000);

    const buffer = await client.screenshot('png');
    const outputPath = path.resolve(output);
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Saved to ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

main();
