const https = require('https');
const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        file.close();
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  const css = await new Promise((resolve, reject) => {
    const url = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  const urlRegex = /url\(([^)]+)\)/g;
  const nameRegex = /font-family:\s*'([^']+)'/;
  const weightRegex = /font-weight:\s*(\d+)/;

  const blocks = css.split('@font-face');
  let count = 0;
  for (const block of blocks) {
    if (!block.includes('src:')) continue;
    let m;
    urlRegex.lastIndex = 0;
    const urlMatch = urlRegex.exec(block);
    nameRegex.lastIndex = 0;
    const nameMatch = nameRegex.exec(block);
    weightRegex.lastIndex = 0;
    const weightMatch = weightRegex.exec(block);
    if (urlMatch && nameMatch) {
      const fontUrl = urlMatch[1].replace(/['"]/g, '');
      const fontName = nameMatch[1].replace(/\s+/g, '-');
      const weight = weightMatch ? weightMatch[1] : '400';
      const ext = path.extname(fontUrl) || '.ttf';
      const dest = path.join(fontDir, fontName + '-' + weight + ext);
      console.log('Downloading', fontName + '-' + weight);
      await download(fontUrl, dest);
      count++;
    }
  }
  console.log('Downloaded', count, 'fonts');
}
main().catch(console.error);
