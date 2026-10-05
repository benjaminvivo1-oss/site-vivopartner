import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
const [subs, out] = process.argv.slice(2);
const FPS = 30;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/video.html?subs=' + subs);
await p.evaluate(() => document.fonts.ready);
const dur = await p.evaluate(() => window.DUR);
const ff = spawn('ffmpeg', ['-loglevel','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
  '-f','lavfi','-t',String(dur),'-i','anullsrc=r=48000:cl=stereo',
  '-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-tune','animation','-c:a','aac','-shortest','-movflags','+faststart', out], { stdio: ['pipe','inherit','inherit'] });
for (let f = 0; f < dur * FPS; f++) {
  await p.evaluate((t) => seek(t), f / FPS);
  const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
