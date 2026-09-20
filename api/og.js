/**
 * BranZar - Open Graph Dynamic Generator
 * يولّد صور مصغّرة لكل متجر عند المشاركة على واتساب/فيسبوك/تويتر
 */

export default async function handler(req, res) {
  const storeId = String(req.query.store || '').trim();
  const projectId = 'bazarena-725e4';

  // ============ 1. جلب بيانات المتجر من Firestore REST API ============
  let store = null;
  if (storeId) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${encodeURIComponent(storeId)}`;
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        const doc = await r.json();
        store = parseFirestoreFields(doc.fields || {});
        console.log('✅ Store fetched:', store.name);
      } else {
        console.warn('⚠️ Firestore returned', r.status, 'for store:', storeId);
      }
    } catch (e) {
      console.error('❌ Firestore error:', e.message);
    }
  }

  // ============ 2. جلب HTML الأساسي ============
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers.host;
  const baseUrl = `${proto}://${host}`;

  let html = '';
  try {
    const htmlRes = await fetch(`${baseUrl}/index.html`, {
      headers: { 'User-Agent': 'BranZar-OG-Internal', 'Cache-Control': 'no-cache' }
    });
    if (htmlRes.ok) {
      html = await htmlRes.text();
    } else {
      const rootRes = await fetch(`${baseUrl}/`, {
        headers: { 'User-Agent': 'BranZar-OG-Internal' }
      });
      html = await rootRes.text();
    }
  } catch (e) {
    console.error('❌ HTML fetch error:', e.message);
    html = '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head><body></body></html>';
  }

  // ============ 3. بناء OG Tags ديناميكية ============
  const storeName = store?.name ? `${store.name} | BranZar` : 'BranZar | بران زار';
  const storeDesc = store?.description
    ? String(store.description).slice(0, 160)
    : (store?.category
        ? `تسوّق من ${store.name} - ${store.category} على BranZar`
        : 'اكتشف أفضل المتاجر والبراندات السودانية في مكان واحد.');
  const storeImage = store?.logo_url || store?.cover_url
    || 'https://i.ibb.co/gL5sNf9C/file-00000000b5e881f6a653c6d272e68de7.png';
  const pageUrl = `${baseUrl}/?store=${encodeURIComponent(storeId)}`;

  const newOgBlock = `<!-- OG_START -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="BranZar - بران زار">
<meta property="og:title" content="${esc(storeName)}">
<meta property="og:description" content="${esc(storeDesc)}">
<meta property="og:image" content="${esc(storeImage)}">
<meta property="og:image:secure_url" content="${esc(storeImage)}">
<meta property="og:image:width" content="600">
<meta property="og:image:height" content="600">
<meta property="og:image:alt" content="${esc(store?.name || 'BranZar')}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:locale" content="ar_AR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(storeName)}">
<meta name="twitter:description" content="${esc(storeDesc)}">
<meta name="twitter:image" content="${esc(storeImage)}">
<!-- OG_END -->`;

  // استبدال البلوك القديم
  const ogRegex = /<!-- OG_START -->[\s\S]*?<!-- OG_END -->/;
  if (ogRegex.test(html)) {
    html = html.replace(ogRegex, newOgBlock);
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `${newOgBlock}</head>`);
  }

  // ============ 4. إرسال الاستجابة ============
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.setHeader('X-OG-Generated', store ? 'store' : 'default');
  res.status(200).send(html);
}

/* ============ أدوات مساعدة ============ */

function parseFirestoreFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = parseFirestoreValue(v);
  }
  return out;
}

function parseFirestoreValue(v) {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return parseFirestoreFields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(parseFirestoreValue);
  return null;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
