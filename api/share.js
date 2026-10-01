// api/share.js
export default async function handler(req, res) {
  const url = window.location.origin + '/api/share?store=' + encodeURIComponent(storeId);
  // بيانات افتراضية
  let title = 'BranZar | بران زار - أكبر سوق إلكتروني';
  let description = 'اكتشف أفضل المتاجر والبراندات السودانية والعالمية في مكان واحد. تسوق الآن🛒🛍️';
  let image = 'https://i.ibb.co/fG8PmHV2/file-0000000072408210b10e441c56a8683e.png';
  
  if (store) {
    try {
      // جلب بيانات المتجر من Firebase REST API
      const projectId = 'bazarena-725e4';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${store}`;
      const response = await fetch(firestoreUrl);
      const data = await response.json();
      
      if (data.fields) {
        title = (data.fields.name?.stringValue || 'متجر') + ' | BranZar';
        description = data.fields.description?.stringValue || description;
        image = data.fields.cover_url?.stringValue || data.fields.logo_url?.stringValue || image;
      }
    } catch(e) { /* استخدم الافتراضي */ }
  }
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta property="og:type" content="website">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:url" content="https://branzar.vercel.app/?store=${store}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${image}">
      <meta http-equiv="refresh" content="0; url=https://branzar.vercel.app/?store=${store}">
    </head>
    <body></body>
    </html>
  `);
}
