#!/usr/bin/env node
/**
 * build-index.js
 * ---------------
 * experiments/ 폴더에 있는 모든 실험용 HTML 파일을 스캔해서
 * 메인 index.html 을 자동으로 생성합니다.
 *
 * 각 실험 HTML 에서 아래 정보를 자동으로 읽어옵니다.
 *   - 제목   : <title> 태그
 *   - 설명   : <meta name="description" content="...">
 *   - 이모지 : <meta name="experiment:emoji" content="🌈">   (선택)
 *   - 분류   : <meta name="experiment:category" content="화학"> (선택)
 *   - 정렬   : <meta name="experiment:order" content="10">    (선택, 숫자가 작을수록 앞)
 *
 * 즉, 실험 HTML 파일 하나만 experiments/ 에 올리면
 * 이 스크립트가 index.html 의 실험 목록을 자동으로 갱신합니다.
 *
 * 외부 라이브러리 없이 순수 Node.js 로 동작합니다. (npm install 불필요)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPERIMENTS_DIR = path.join(ROOT, 'experiments');
const OUTPUT_FILE = path.join(ROOT, 'index.html');

/** HTML 특수문자를 안전하게 이스케이프 (XSS/깨짐 방지) */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** HTML 문자열에서 특정 태그/메타 값을 추출 */
function extractMeta(html, filename) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );
  const emojiMatch = html.match(
    /<meta[^>]+name=["']experiment:emoji["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );
  const categoryMatch = html.match(
    /<meta[^>]+name=["']experiment:category["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );
  const orderMatch = html.match(
    /<meta[^>]+name=["']experiment:order["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i
  );

  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.html?$/i, '');
  const description = descMatch ? descMatch[1].trim() : '';
  const emoji = emojiMatch ? emojiMatch[1].trim() : '🔬';
  const category = categoryMatch ? categoryMatch[1].trim() : '';
  const order = orderMatch ? Number(orderMatch[1].trim()) : Number.POSITIVE_INFINITY;

  return { title, description, emoji, category, order, filename };
}

/** experiments/ 폴더를 스캔해서 실험 목록 배열을 반환 */
function collectExperiments() {
  if (!fs.existsSync(EXPERIMENTS_DIR)) {
    console.warn(`experiments/ 폴더가 없습니다: ${EXPERIMENTS_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(EXPERIMENTS_DIR)
    .filter((f) => /\.html?$/i.test(f) && !f.startsWith('.'));

  const experiments = files.map((filename) => {
    const html = fs.readFileSync(path.join(EXPERIMENTS_DIR, filename), 'utf8');
    return extractMeta(html, filename);
  });

  // order(오름차순) → 없으면 제목(가나다순)으로 정렬
  experiments.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, 'ko');
  });

  return experiments;
}

/** 실험 하나를 카드 HTML로 변환 */
function renderCard(exp) {
  const category = exp.category
    ? `<span class="card-category">${escapeHtml(exp.category)}</span>`
    : '';
  const description = exp.description
    ? `<p class="card-desc">${escapeHtml(exp.description)}</p>`
    : '';

  return `      <a class="card" href="experiments/${encodeURIComponent(exp.filename)}">
        <div class="card-emoji" aria-hidden="true">${escapeHtml(exp.emoji)}</div>
        <div class="card-body">
          <h2 class="card-title">${escapeHtml(exp.title)}</h2>
          ${category}
          ${description}
        </div>
        <span class="card-arrow" aria-hidden="true">→</span>
      </a>`;
}

/** 전체 index.html 문자열 생성 */
function renderIndex(experiments) {
  const now = new Date().toISOString().slice(0, 10);
  const count = experiments.length;

  const cards =
    count > 0
      ? experiments.map(renderCard).join('\n')
      : `      <p class="empty">아직 등록된 실험이 없습니다. <code>experiments/</code> 폴더에 HTML 파일을 추가해 보세요!</p>`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>과학 실험실 🔬</title>
  <meta name="description" content="여러 과학 실험을 모아둔 실험실 인덱스 페이지입니다." />
  <!-- ⚠️ 이 파일은 scripts/build-index.js 가 자동 생성합니다. 직접 수정하지 마세요. -->
  <style>
    :root {
      --bg: #0f172a;
      --bg-soft: #1e293b;
      --card: #1e293b;
      --card-hover: #334155;
      --text: #f1f5f9;
      --text-dim: #94a3b8;
      --accent: #38bdf8;
      --border: #334155;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --bg-soft: #ffffff;
        --card: #ffffff;
        --card-hover: #f1f5f9;
        --text: #0f172a;
        --text-dim: #64748b;
        --accent: #0284c7;
        --border: #e2e8f0;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo",
        "Noto Sans KR", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    header {
      text-align: center;
      padding: 4rem 1.5rem 2rem;
      background: linear-gradient(180deg, var(--bg-soft), var(--bg));
      border-bottom: 1px solid var(--border);
    }
    header h1 { margin: 0 0 0.5rem; font-size: 2.5rem; }
    header p { margin: 0; color: var(--text-dim); font-size: 1.1rem; }
    .count {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.25rem 0.9rem;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
    }
    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.4rem;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-decoration: none;
      color: inherit;
      transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }
    .card:hover {
      transform: translateY(-3px);
      background: var(--card-hover);
      border-color: var(--accent);
    }
    .card-emoji { font-size: 2.4rem; line-height: 1; flex-shrink: 0; }
    .card-body { flex: 1; min-width: 0; }
    .card-title { margin: 0 0 0.2rem; font-size: 1.15rem; }
    .card-category {
      display: inline-block;
      font-size: 0.72rem;
      padding: 0.1rem 0.55rem;
      border-radius: 999px;
      background: var(--bg);
      color: var(--accent);
      border: 1px solid var(--border);
      margin-bottom: 0.35rem;
    }
    .card-desc { margin: 0.2rem 0 0; color: var(--text-dim); font-size: 0.92rem; }
    .card-arrow { color: var(--accent); font-size: 1.3rem; flex-shrink: 0; }
    .empty { text-align: center; color: var(--text-dim); padding: 3rem 0; }
    .empty code {
      background: var(--bg-soft);
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
    }
    footer {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.82rem;
      padding: 2rem 1.5rem 3rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>과학 실험실 🔬</h1>
    <p>흥미로운 과학 실험을 모아 놓은 공간입니다. 아래에서 실험을 선택해 보세요!</p>
    <span class="count">실험 ${count}개</span>
  </header>
  <main>
    <div class="grid">
${cards}
    </div>
  </main>
  <footer>
    자동 생성된 페이지 · 마지막 업데이트 ${now}
  </footer>
</body>
</html>
`;
}

function main() {
  const experiments = collectExperiments();
  const html = renderIndex(experiments);
  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log(`✅ index.html 생성 완료 — 실험 ${experiments.length}개`);
  experiments.forEach((e) => console.log(`   • ${e.emoji} ${e.title}  (${e.filename})`));
}

main();
