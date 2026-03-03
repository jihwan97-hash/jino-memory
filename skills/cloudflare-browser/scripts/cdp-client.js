#!/usr/bin/env node
/**
 * Browser Client Library - Playwright Chromium (on-demand)
 *
 * Launches Chromium when needed, closes after use.
 * No persistent browser process — saves ~400MB RAM when idle.
 *
 * Usage:
 *   const { createClient } = require('./cdp-client');
 *   const client = await createClient();
 *   await client.navigate('https://example.com');
 *   const screenshot = await client.screenshot();
 *   client.close();
 */

const { chromium } = require('playwright');

async function createClient(options = {}) {
  const timeout = options.timeout || 60000;

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer'
    ]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  const client = {
    async navigate(url, waitMs = 3000) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      if (waitMs > 0) await page.waitForTimeout(waitMs);
    },

    async screenshot(format = 'png') {
      return await page.screenshot({ type: format });
    },

    async setViewport(width = 1280, height = 800, scale = 1, mobile = false) {
      await page.setViewportSize({ width, height });
    },

    async evaluate(expression) {
      return await page.evaluate(expression);
    },

    async scroll(y = 300) {
      await page.evaluate((scrollY) => window.scrollBy(0, scrollY), y);
      await page.waitForTimeout(300);
    },

    async click(selector) {
      try { await page.click(selector, { timeout: 5000 }); } catch {}
    },

    async type(selector, text) {
      try { await page.fill(selector, text, { timeout: 5000 }); } catch {}
    },

    async getHTML() {
      return await page.content();
    },

    async getText() {
      return await page.evaluate(() => document.body.innerText);
    },

    close() {
      page.close().catch(() => {});
      browser.close().catch(() => {});
    }
  };

  return client;
}

module.exports = { createClient };

// CLI mode
if (require.main === module) {
  console.log('Browser Client Library (Playwright) - import with: const { createClient } = require("./cdp-client")');
}
