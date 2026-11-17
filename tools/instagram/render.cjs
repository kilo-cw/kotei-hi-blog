// Instagram カルーセル画像（1080x1350）を生成する。
// 使い方: node tools/instagram/render.cjs docs/instagram/posts/01-kotei-hi.json
// 出力:   docs/instagram/images/<ファイル名>/01.png ...
// 文字があふれたり重なったりしたスライドがあるとエラーで止まる。
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const FONT_DIR = path.join(ROOT, 'node_modules/@fontsource/zen-maru-gothic');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const br = (s) => esc(s).replace(/\n/g, '<br>');

const CSS = `
:root { --bg:#fbfaf7; --ink:#23241f; --muted:#6b6c63; --green:#2f7d5b; --mint:#e3f0e8; --beige:#f1ead9; --line:#d9e6dd; }
* { box-sizing:border-box; margin:0; padding:0; }
html, body { width:1080px; height:1350px; overflow:hidden; }
body { background:var(--bg); color:var(--ink); font-family:'Zen Maru Gothic', sans-serif; font-weight:500; }
.slide { position:relative; width:1080px; height:1350px; padding:84px 88px 0; display:flex; flex-direction:column; }
.top { display:flex; justify-content:space-between; align-items:center; font-size:28px; color:var(--muted); height:44px; flex:none; }
.brand { font-weight:700; color:var(--green); }
.page { letter-spacing:.05em; }
.main { flex:1; display:flex; flex-direction:column; justify-content:center; min-height:0; padding:24px 0 40px; }
.foot { flex:none; height:150px; display:flex; align-items:center; justify-content:space-between; border-top:3px solid var(--line); font-size:30px; color:var(--muted); }
.foot .save { display:flex; align-items:center; gap:14px; }
.foot svg { width:34px; height:34px; }
h2 { font-size:68px; font-weight:900; line-height:1.3; color:var(--ink); }
h2 .hl { color:var(--green); }
.bar { width:120px; height:10px; border-radius:5px; background:var(--green); margin:30px 0 44px; flex:none; }
.lead { font-size:42px; line-height:1.6; font-weight:700; }
p.txt { font-size:38px; line-height:1.65; }
.list { display:flex; flex-direction:column; gap:22px; }
.item { display:flex; align-items:center; gap:28px; background:#fff; border:3px solid var(--line); border-radius:28px; padding:26px 34px; }
.num { flex:none; width:72px; height:72px; border-radius:50%; background:var(--green); color:#fff; font-size:38px; font-weight:900; display:flex; align-items:center; justify-content:center; }
.item .t { font-size:38px; line-height:1.45; font-weight:700; flex:1; }
.item .t small { display:block; font-size:28px; color:var(--muted); font-weight:500; margin-top:4px; }
.compact .list { gap:16px; }
.compact .item { padding:16px 30px; border-radius:24px; }
.compact .num { width:60px; height:60px; font-size:32px; }
.compact .bar { margin:24px 0 32px; }
.tag { flex:none; font-size:26px; font-weight:700; color:var(--green); background:var(--mint); border-radius:999px; padding:8px 20px; }
.chips { display:flex; flex-wrap:wrap; gap:18px; margin:36px 0; }
.chip { font-size:36px; font-weight:700; background:#fff; border:3px solid var(--line); border-radius:999px; padding:14px 34px; }
.box { margin-top:48px; background:var(--green); color:#fff; border-radius:32px; padding:40px 44px; font-size:42px; font-weight:900; line-height:1.5; }
.note { margin-top:48px; background:var(--beige); border-radius:28px; padding:30px 38px; font-size:32px; line-height:1.6; }
.note b { color:var(--green); }
.compare { display:flex; gap:24px; margin:10px 0 0; }
.compare > div { flex:1; background:#fff; border:3px solid var(--line); border-radius:28px; padding:34px 30px; text-align:center; }
.compare .k { font-size:34px; font-weight:900; color:var(--green); margin-bottom:10px; }
.compare .v { font-size:32px; line-height:1.55; }
/* cover */
.cover .main { justify-content:center; padding:0; }
.kicker { display:inline-block; align-self:flex-start; font-size:34px; font-weight:700; color:var(--green); background:var(--mint); border-radius:999px; padding:12px 32px; margin-bottom:44px; }
.cover h1 { font-size:104px; font-weight:900; line-height:1.28; }
.cover h1 .hl { color:var(--green); }
.cover .sub { font-size:44px; font-weight:700; color:var(--muted); margin-top:44px; }
.cover .deco { position:absolute; right:-140px; top:-140px; width:520px; height:520px; border-radius:50%; background:var(--mint); z-index:-1; }
.cover .deco2 { position:absolute; left:-90px; bottom:120px; width:260px; height:260px; border-radius:50%; background:var(--beige); z-index:-1; }
/* end */
.end .main { justify-content:center; align-items:center; text-align:center; padding:0; }
.end h2 { font-size:80px; }
.end .arrow { font-size:40px; font-weight:700; color:#fff; background:var(--green); border-radius:999px; padding:22px 52px; margin-top:56px; }
.end .handle { font-size:44px; font-weight:900; color:var(--green); margin-top:80px; }
.end .name { font-size:36px; color:var(--muted); margin-top:14px; }
`;

const BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="#2f7d5b" stroke-width="2.4" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

function hl(s) { // 【】で囲んだ部分をグリーンにする
  return br(s).replace(/【(.+?)】/g, '<span class="hl">$1</span>');
}

function body(s) {
  switch (s.type) {
    case 'cover':
      return `<div class="deco"></div><div class="deco2"></div>
        <span class="kicker">${esc(s.kicker)}</span><h1>${hl(s.title)}</h1><p class="sub">${br(s.sub)}</p>`;
    case 'end':
      return `<h2>${hl(s.title)}</h2><div class="arrow">${esc(s.cta)}</div>
        <div class="handle">@maitsuki_uku</div><div class="name">毎月ちょっと浮く。｜いつき</div>`;
    default: {
      let h = `<h2>${hl(s.title)}</h2><div class="bar"></div>`;
      if (s.lead) h += `<p class="lead">${br(s.lead)}</p>`;
      if (s.chips) h += `<div class="chips">${s.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>`;
      if (s.compare) h += `<div class="compare">${s.compare.map((c) => `<div><div class="k">${esc(c.k)}</div><div class="v">${br(c.v)}</div></div>`).join('')}</div>`;
      if (s.items) h += `<div class="list">${s.items.map((it, i) => `<div class="item"><span class="num">${i + 1}</span><span class="t">${br(it.t)}${it.s ? `<small>${br(it.s)}</small>` : ''}</span>${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ''}</div>`).join('')}</div>`;
      if (s.box) h += `<div class="box">${br(s.box)}</div>`;
      if (s.note) h += `<div class="note">${hl(s.note).replace(/<span class="hl">(.+?)<\/span>/g, '<b>$1</b>')}</div>`;
      return h;
    }
  }
}

function html(s, i, n) {
  const cls = (s.type === 'cover' ? 'cover' : s.type === 'end' ? 'end' : '') + (s.compact ? ' compact' : '');
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${FONT_DIR}/500.css"><link rel="stylesheet" href="file://${FONT_DIR}/700.css"><link rel="stylesheet" href="file://${FONT_DIR}/900.css">
<style>${CSS}</style></head><body><div class="slide ${cls}">
<div class="top"><span class="brand">毎月ちょっと浮く。</span><span class="page">${i + 1} / ${n}</span></div>
<div class="main">${body(s)}</div>
<div class="foot"><span class="save">${BOOKMARK}保存して見直しの時に使ってね</span><span>@maitsuki_uku</span></div>
</div></body></html>`;
}

// 文字あふれ・重なりの検査
const CHECK = () => {
  const problems = [];
  const main = document.querySelector('.main');
  const foot = document.querySelector('.foot').getBoundingClientRect();
  if (main.scrollHeight > main.clientHeight + 1) problems.push('本文が枠からあふれています');
  const els = [...document.querySelectorAll('.main h1, .main h2, .main p, .kicker, .bar, .chips, .compare, .list, .item, .box, .note, .arrow, .handle, .name')];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.bottom > foot.top + 1) problems.push(`フッターに重なっています: ${el.className || el.tagName}`);
    if (r.right > 1080 - 40 || r.left < 40) problems.push(`左右にはみ出しています: ${el.className || el.tagName}`);
  }
  // 兄弟要素同士の重なり
  const blocks = [...main.children].filter((e) => !e.className.startsWith('deco'));
  for (let a = 0; a < blocks.length; a++) for (let b = a + 1; b < blocks.length; b++) {
    const r1 = blocks[a].getBoundingClientRect(), r2 = blocks[b].getBoundingClientRect();
    if (r1.bottom > r2.top + 1 && r2.bottom > r1.top + 1 && r1.right > r2.left && r2.right > r1.left)
      problems.push(`要素が重なっています: ${blocks[a].className || blocks[a].tagName} / ${blocks[b].className || blocks[b].tagName}`);
  }
  // 1行に収まるべき要素の改行チェック
  for (const el of document.querySelectorAll('.tag, .chip, .kicker, .arrow, .foot span')) {
    const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
    if (el.getBoundingClientRect().height > lh * 1.6 + 60) problems.push(`1行に収まっていません: ${el.textContent}`);
  }
  return problems;
};

(async () => {
  const file = process.argv[2];
  if (!file) { console.error('使い方: node tools/instagram/render.cjs <post.json>'); process.exit(1); }
  const post = JSON.parse(fs.readFileSync(file, 'utf8'));
  const outDir = path.join(ROOT, 'docs/instagram/images', path.basename(file, '.json'));
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ig-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  let failed = false;
  for (const [i, s] of post.slides.entries()) {
    const f = path.join(tmp, `${i}.html`);
    fs.writeFileSync(f, html(s, i, post.slides.length));
    await page.goto('file://' + f);
    await page.evaluate(() => document.fonts.ready);
    const problems = await page.evaluate(CHECK);
    const out = path.join(outDir, String(i + 1).padStart(2, '0') + '.png');
    await page.screenshot({ path: out });
    if (problems.length) { failed = true; console.error(`✗ ${out}\n  - ${problems.join('\n  - ')}`); }
    else console.log(`✓ ${out}`);
  }
  await browser.close();
  if (failed) process.exit(2);
})();
