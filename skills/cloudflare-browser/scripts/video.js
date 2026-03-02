#!/usr/bin/env node
/**
 * Browser Video Capture via local headless Chrome
 * Usage: node video.js "url1,url2,url3" [output.mp4] [--fps 10] [--scroll]
 *
 * Captures frames while browsing multiple URLs and creates an MP4 video.
 * Requires: ffmpeg installed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('./cdp-client');

// Parse args
const args = process.argv.slice(2);
const urlArg = args.find(a => !a.startsWith('--'));
const output = args.find((a, i) => i > 0 && !a.startsWith('--')) || 'output.mp4';
const fps = args.includes('--fps') ? parseInt(args[args.indexOf('--fps') + 1]) : 10;
const doScroll = args.includes('--scroll');

if (!urlArg) {
  console.error('Usage: node video.js "url1,url2,url3" [output.mp4] [--fps 10] [--scroll]');
  process.exit(1);
}

const urls = urlArg.split(',').map(u => u.trim());
const framesDir = `/tmp/cf-video-frames-${Date.now()}`;
fs.mkdirSync(framesDir, { recursive: true });

async function main() {
  console.log(`Creating video from ${urls.length} URL(s)`);
  console.log(`Output: ${output}, FPS: ${fps}, Scroll: ${doScroll}\n`);

  let client;
  let frameNum = 0;

  async function captureFrames(count, delayMs = 100) {
    for (let i = 0; i < count; i++) {
      const buffer = await client.screenshot('png');
      const filename = `frame_${String(frameNum).padStart(5, '0')}.png`;
      fs.writeFileSync(path.join(framesDir, filename), buffer);
      frameNum++;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  try {
    client = await createClient({ timeout: 60000 });

    await client.setViewport(1280, 720, 1, false);

    for (const url of urls) {
      console.log(`→ ${url}`);
      await client.navigate(url, 4000);

      await captureFrames(15);

      if (doScroll) {
        await client.scroll(300);
        await captureFrames(10);
        await client.scroll(300);
        await captureFrames(10);
      }
    }

    client.close();
    client = null;
    console.log(`\n✓ Captured ${frameNum} frames`);

    // Stitch with ffmpeg
    console.log('Encoding video...');
    const outputPath = path.resolve(output);
    execSync(
      `ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 "${outputPath}"`,
      { stdio: 'pipe' }
    );

    fs.rmSync(framesDir, { recursive: true });

    const stats = fs.statSync(outputPath);
    console.log(`✓ Video saved to ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.close();
  }
}

main();
