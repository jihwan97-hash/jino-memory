#!/usr/bin/env node
/**
 * CDP Client Library - Local Headless Chrome
 *
 * Connects to a local Chromium via Chrome DevTools Protocol.
 * Requires Chromium running with --remote-debugging-port=9222.
 *
 * Usage:
 *   const { createClient } = require('./cdp-client');
 *   const client = await createClient();
 *   await client.navigate('https://example.com');
 *   const screenshot = await client.screenshot();
 *   client.close();
 */

const WebSocket = require('ws');
const http = require('http');

const CDP_PORT = 9222;

// Create a new Chrome tab and return its WebSocket debugger URL
function createTab() {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: CDP_PORT, path: '/json/new', method: 'PUT' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Failed to parse tab info: ' + data)); }
      });
    });
    req.on('error', (e) => reject(new Error('Cannot connect to Chrome on port ' + CDP_PORT + ': ' + e.message)));
    req.end();
  });
}

// Close a Chrome tab by ID
function closeTab(tabId) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port: CDP_PORT, path: '/json/close/' + tabId, method: 'PUT' }, () => resolve());
    req.on('error', () => resolve());
    req.end();
  });
}

function createClient(options = {}) {
  const timeout = options.timeout || 60000;

  return new Promise(async (resolve, reject) => {
    let tab;
    try {
      tab = await createTab();
    } catch (err) {
      return reject(err);
    }

    const wsUrl = tab.webSocketDebuggerUrl;
    if (!wsUrl) {
      return reject(new Error('No webSocketDebuggerUrl in tab info'));
    }

    const ws = new WebSocket(wsUrl);
    let messageId = 1;
    const pending = new Map();

    function send(method, params = {}) {
      return new Promise((res, rej) => {
        const id = messageId++;
        const timer = setTimeout(() => {
          pending.delete(id);
          rej(new Error(`Timeout: ${method}`));
        }, timeout);
        pending.set(id, { resolve: res, reject: rej, timeout: timer });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject, timeout: timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    });

    ws.on('error', reject);

    ws.on('open', async () => {
      try {
        // Enable required CDP domains
        await send('Page.enable');
        await send('Runtime.enable');

        const client = {
          ws,
          tabId: tab.id,
          send,

          async navigate(url, waitMs = 3000) {
            await send('Page.navigate', { url });
            await new Promise(r => setTimeout(r, waitMs));
          },

          async screenshot(format = 'png') {
            const { data } = await send('Page.captureScreenshot', { format });
            return Buffer.from(data, 'base64');
          },

          async setViewport(width = 1280, height = 800, scale = 1, mobile = false) {
            await send('Emulation.setDeviceMetricsOverride', {
              width, height, deviceScaleFactor: scale, mobile
            });
          },

          async evaluate(expression) {
            return send('Runtime.evaluate', { expression });
          },

          async scroll(y = 300) {
            await send('Runtime.evaluate', { expression: `window.scrollBy(0, ${y})` });
            await new Promise(r => setTimeout(r, 300));
          },

          async click(selector) {
            await send('Runtime.evaluate', {
              expression: `document.querySelector('${selector}')?.click()`
            });
          },

          async type(selector, text) {
            await send('Runtime.evaluate', {
              expression: `(() => {
                const el = document.querySelector('${selector}');
                if (el) { el.value = '${text}'; el.dispatchEvent(new Event('input')); }
              })()`
            });
          },

          async getHTML() {
            const result = await send('Runtime.evaluate', {
              expression: 'document.documentElement.outerHTML'
            });
            return result.result?.value;
          },

          async getText() {
            const result = await send('Runtime.evaluate', {
              expression: 'document.body.innerText'
            });
            return result.result?.value;
          },

          close() {
            ws.close();
            closeTab(tab.id);
          }
        };

        resolve(client);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = { createClient };

// CLI mode
if (require.main === module) {
  console.log('CDP Client Library - import with: const { createClient } = require("./cdp-client")');
}
