/* global document, innerWidth, sessionStorage, localStorage, navigator */
import process from 'node:process';
import console from 'node:console';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = (process.env.SMOKE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
const output = resolve(process.env.SMOKE_OUTPUT || 'qa-artifacts');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
  timezoneId: 'Asia/Bangkok',
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
const findings = [];
page.on('pageerror', (error) => errors.push(error.message));
const forecast = {
  daily: {
    time: ['2026-10-21', '2026-10-22', '2026-10-23'],
    weather_code: [61, 97, 2],
    temperature_2m_max: [32, 30, 33],
    temperature_2m_min: [25, 24, 26],
    precipitation_probability_max: [65, 85, 30],
    precipitation_sum: [3, 14, 1],
  },
  current: { temperature_2m: 30, weather_code: 61 },
};
await context.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
await context.route('https://geocoding-api.open-meteo.com/**', (route) =>
  route.fulfill({
    json: {
      results: [{ name: 'Chiang Mai', country: 'Thailand', latitude: 18.8, longitude: 98.98 }],
    },
  }),
);
function assert(value, message) {
  if (!value) throw Error(message);
}
async function capture(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true });
}
async function noOverflow(label) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    `Horizontal overflow: ${label}`,
  );
}
try {
  await page.goto(base);
  await page.getByRole('heading', { name: 'เมื่อใจมีคำถาม ให้ดวงดาวช่วยนำทาง' }).waitFor();
  for (const width of [360, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await noOverflow(`home ${width}`);
    if (width !== 360) await capture(`home-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
  assert(
    await page.getByRole('switch', { name: 'ลดการเคลื่อนไหว' }).isChecked(),
    'OS reduced-motion default',
  );
  await page.getByRole('switch', { name: 'ใช้ไพ่กลับหัว' }).uncheck();
  await page.keyboard.press('Escape');
  assert(
    await page
      .getByRole('button', { name: 'ตั้งค่า', exact: true })
      .evaluate((e) => e === document.activeElement),
    'Sheet focus restoration',
  );
  await page.reload();
  await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
  assert(
    !(await page.getByRole('switch', { name: 'ใช้ไพ่กลับหัว' }).isChecked()),
    'Settings persistence',
  );
  await page.getByRole('switch', { name: 'ใช้ไพ่กลับหัว' }).check();
  await page.keyboard.press('Escape');
  await page.goto(`${base}/cards`);
  await page.getByRole('heading', { name: 'ทุกใบมีเรื่องราวของตัวเอง' }).waitFor();
  assert((await page.locator('.library-item').count()) === 78, '78-card library');
  const clips = await page.locator('.library-item .tarot-front').evaluateAll((elements) =>
    elements.flatMap((element) => {
      const caption = element.querySelector('.card-caption');
      return caption &&
        caption.getBoundingClientRect().bottom > element.getBoundingClientRect().bottom + 1
        ? [caption.textContent]
        : [];
    }),
  );
  findings.push({ cardCaptionOverflow: clips });
  await page
    .getByRole('textbox', { name: 'ค้นหาชื่อไพ่ ไทย / English / คำสำคัญ' })
    .fill('The Moon');
  assert((await page.locator('.library-item').count()) === 1, 'English search');
  await page.locator('.library-item').click();
  await page.getByRole('heading', { name: 'ดวงจันทร์', exact: true }).waitFor();
  await page.waitForFunction(() => document.title.includes('ดวงจันทร์'));
  await noOverflow('card detail');
  await capture('card-detail-390');
  for (const [topic, spread] of [
    ['love', 'connection'],
    ['exam', 'study'],
    ['general', 'timeline'],
    ['weather', 'three-skies'],
    ['love', 'relationship'],
  ]) {
    await page.goto(`${base}/read/${topic}/${spread}`);
    await page.getByRole('heading', { name: 'เว้นที่ให้เรื่องราวของคุณ' }).waitFor();
    if (topic === 'love') {
      await page.getByLabel('วันนี้มีอะไรอยู่ในใจคุณ').fill('อยากดูแลความสัมพันธ์ให้ดีขึ้น');
      await page.getByRole('button', { name: 'กำลังคุย', exact: true }).click();
    }
    if (topic === 'exam') await page.getByLabel('อีกกี่วันถึงวันสอบ').fill('2');
    if (topic === 'weather') {
      await page
        .getByRole('textbox', { name: 'ค้นหาจังหวัดหรือเมือง', exact: true })
        .fill('เชียงใหม่');
      await page.getByRole('button', { name: 'ค้นหา', exact: true }).click();
      await page.getByRole('button', { name: 'Chiang Mai · Thailand' }).click();
    }
    await page.getByRole('button', { name: 'ไปต่อ', exact: true }).click();
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'ข้ามขั้นตอนนี้' }).click();
    await page.getByRole('heading', { name: 'เลือกไพ่ที่ใจเรียกหา' }).waitFor();
    await noOverflow(`${topic} pick`);
    if (topic === 'love' && spread === 'connection') {
      await capture('pick-390');
      await page.getByRole('button', { name: 'ใบ 1', exact: true }).focus();
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');
      }
    } else await page.getByRole('button', { name: 'สุ่มให้เลย' }).click();
    await page.getByRole('button', { name: 'เปิดทั้งหมด', exact: true }).click();
    await page.getByRole('button', { name: 'อ่านเรื่องราวจากไพ่' }).click();
    await page.getByRole('heading', { name: 'ภาพรวมจากไพ่ของคุณ' }).waitFor();
    if (topic === 'weather') await page.getByText('พกร่มเลย').first().waitFor();
    const original = await page.locator('.overview').textContent();
    const tips = await page.locator('.tips-panel').textContent();
    const selected = await page.evaluate(
      ({ topic, spread }) =>
        JSON.parse(sessionStorage.getItem(`starlit:flow:${topic}:${spread}`)).selected,
      { topic, spread },
    );
    await page.reload();
    await page.getByRole('heading', { name: 'ภาพรวมจากไพ่ของคุณ' }).waitFor();
    assert(
      JSON.stringify(selected) ===
        JSON.stringify(
          await page.evaluate(
            ({ topic, spread }) =>
              JSON.parse(sessionStorage.getItem(`starlit:flow:${topic}:${spread}`)).selected,
            { topic, spread },
          ),
        ),
      'Refresh changed cards',
    );
    for (const width of [360, 390, 1440]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      await noOverflow(`${topic} ${width}`);
      if (width === 390 || width === 1440) await capture(`${topic}-${spread}-${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const code = await page.evaluate(
      () => JSON.parse(localStorage.getItem('starlit:history'))[0].id,
    );
    await page.goto(`${base}/r/${code}`);
    await page.getByRole('heading', { name: 'ภาพรวมจากไพ่ของคุณ' }).waitFor();
    assert(original === (await page.locator('.overview').textContent()), 'Shared overview differs');
    assert(
      tips === (await page.locator('.tips-panel').textContent()),
      'Shared practical tips differ',
    );
    assert(
      (await page.getByText('อยากดูแลความสัมพันธ์ให้ดีขึ้น').count()) === 0,
      'Question leaked to share',
    );
    if (topic === 'weather') {
      assert((await page.getByText('พกร่มเลย').count()) === 0, 'Shared forecast was not opt-in');
      await page.getByRole('button', { name: 'ดูพยากรณ์ล่าสุด' }).click();
      await page.getByText('พกร่มเลย').first().waitFor();
    }
    if (topic === 'weather' || spread === 'relationship') {
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'บันทึกเป็นรูป', exact: true }).click();
      const download = await pending;
      const path = resolve(output, `${topic}-${spread}-export.png`);
      await download.saveAs(path);
      const png = readFileSync(path);
      assert(png.readUInt32BE(16) === 1080 && png.readUInt32BE(20) === 1350, 'PNG dimensions');
    }
  }
  await page.goto(`${base}/history`);
  await page.getByRole('heading', { name: 'เรื่องราวที่ผ่านมา' }).waitFor();
  assert((await page.locator('.history-item').count()) === 5, 'History save count');
  await page.locator('.history-item .icon-button').first().click();
  assert((await page.locator('.history-item').count()) === 4, 'History deletion');
  await page.goto(`${base}/daily`);
  await page.getByRole('button', { name: 'แตะเพื่อเปิดไพ่' }).click();
  await page.getByRole('heading', { name: 'ภาพรวมจากไพ่ของคุณ' }).waitFor();
  const daily = await page.locator('.meaning-card h2').textContent();
  await page.reload();
  await page.getByRole('button', { name: 'แตะเพื่อเปิดไพ่' }).click();
  assert(daily === (await page.locator('.meaning-card h2').textContent()), 'Daily stability');
  await page.goto(`${base}/read/general/one`);
  await page.getByLabel('วันนี้มีอะไรอยู่ในใจคุณ').fill('อยากทำร้ายตัวเอง');
  await page.getByRole('button', { name: 'ไปต่อ', exact: true }).click();
  await page.getByRole('heading', { name: 'คุณไม่จำเป็นต้องอยู่กับความรู้สึกนี้ลำพัง' }).waitFor();
  assert((await page.locator('.tarot-card').count()) === 0, 'Crisis reading was not bypassed');
  await page.goto(`${base}/r/garbage`);
  await page
    .getByText('ลิงก์นี้ไม่สมบูรณ์หรือเป็นเวอร์ชันที่ยังไม่รองรับ ลองขอลิงก์ใหม่จากผู้ส่งนะ')
    .waitFor();
  await page.goto(`${base}/missing-page`);
  await page.getByText('หน้านี้อาจหลงไปในหมู่ดาว แต่คุณเริ่มต้นใหม่ได้เสมอ').waitFor();
  assert(errors.length === 0, `Console exceptions: ${errors.join(', ')}`);
  const fallback = await context.newPage();
  fallback.on('pageerror', (error) => errors.push(error.message));
  await fallback.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { get: () => undefined, configurable: true });
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'geolocation', { get: () => undefined, configurable: true });
    document.execCommand = () => false;
  });
  await fallback.route('https://api.open-meteo.com/**', (route) => route.abort());
  await fallback.goto(`${base}/read/weather/sky`);
  await fallback.getByRole('button', { name: 'ใช้ตำแหน่งปัจจุบัน', exact: true }).click();
  await fallback.getByText('ใช้ตำแหน่งไม่ได้ ลองค้นหาสถานที่แทน').waitFor();
  await fallback.getByRole('button', { name: 'ไปต่อ', exact: true }).click();
  for (let i = 0; i < 2; i++)
    await fallback.getByRole('button', { name: 'ข้ามขั้นตอนนี้' }).click();
  await fallback.getByRole('button', { name: 'สุ่มให้เลย' }).click();
  await fallback.getByRole('button', { name: 'เปิดทั้งหมด', exact: true }).click();
  await fallback.getByRole('button', { name: 'อ่านเรื่องราวจากไพ่' }).click();
  await fallback.getByText('เชื่อมต่อพยากรณ์ไม่ได้ ตอนนี้แสดงเฉพาะความหมายจากไพ่').waitFor();
  await fallback.getByRole('button', { name: 'คัดลอกลิงก์', exact: true }).click();
  await fallback.getByRole('dialog').waitFor();
  assert(
    (await fallback.getByRole('textbox').inputValue()).includes('/r/'),
    'Manual clipboard fallback',
  );
  await fallback.keyboard.press('Escape');
  await fallback.getByRole('button', { name: 'แชร์', exact: true }).click();
  await fallback.getByRole('dialog').waitFor();
  assert(
    (await fallback.getByRole('textbox').inputValue()).includes('เพื่อความบันเทิง'),
    'Web Share text fallback',
  );
  await fallback.keyboard.press('Escape');
  await fallback.screenshot({ path: resolve(output, 'offline-card-only-390.png'), fullPage: true });
  await fallback.close();
  await page.goto(base);
  await page.getByRole('heading', { name: 'เมื่อใจมีคำถาม ให้ดวงดาวช่วยนำทาง' }).waitFor();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    document.body.style.zoom = '2';
  });
  await noOverflow('200% zoom at 1440');
  await capture('zoom-200-1440');
  assert(errors.length === 0, 'Uncaught exception in fallback checks');
  const result = {
    status: 'passed',
    target: base,
    viewports: [360, 390, 1440],
    tests: [
      'home',
      'settings/focus',
      'library/search/detail',
      'all four flows',
      'five-card spread',
      'keyboard',
      'refresh',
      'shared text parity',
      'private question',
      'forecast opt-in',
      'PNG 1080x1350',
      'history deletion',
      'daily stability',
      'crisis',
      'invalid link',
      '404',
      'offline/card-only',
      'location fallback',
      'manual clipboard',
      'Web Share fallback',
      '200% zoom',
    ],
    findings,
    errors,
  };
  writeFileSync(resolve(output, 'qa-report.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
