const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'pngs');
const fontDir = path.join(__dirname, 'fonts');

const fontFiles = fs.readdirSync(fontDir)
  .filter(f => /\.(ttf|otf|woff2?)$/i.test(f))
  .map(f => path.join(fontDir, f));

const inputs = [
  { file: 'firma-matias.svg',     scale: 2 },
  { file: 'firma-aramis.svg',     scale: 2 },
  { file: 'firma-generica.svg',   scale: 2 },
  { file: 'banner-linkedin.svg',  scale: 2 },
  { file: 'banner-twitter.svg',   scale: 2 },
  { file: 'banner-web.svg',       scale: 2 },
  { file: 'isotipo-core.svg',     scale: 4 },
  { file: 'logotipo-core.svg',    scale: 2 },
];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const item of inputs) {
  const svgPath = path.join(srcDir, item.file);
  const svg = fs.readFileSync(svgPath, 'utf8');

  const parsed = parseSvgDimensions(svg);
  const w = Math.round(parsed.width * item.scale);
  const h = Math.round(parsed.height * item.scale);

  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: w },
    background: 'transparent',
    font: { fontFiles: fontFiles },
  });
  const inst = r.render();
  const png = Buffer.from(inst.asPng());

  const outName = item.file.replace('.svg', '.png');
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, png);

  console.log(`${outName}  ${w}x${h}px  (${png.length} bytes)`);
}

console.log('Done');

function parseSvgDimensions(svg) {
  const wm = svg.match(/width="([\d.]+)mm"/i);
  const hm = svg.match(/height="([\d.]+)mm"/i);
  if (wm && hm) {
    return { width: parseFloat(wm[1]) * 3.7795, height: parseFloat(hm[1]) * 3.7795 };
  }
  const wp = svg.match(/width="([\d.]+)"/i);
  const hp = svg.match(/height="([\d.]+)"/i);
  if (wp && hp) {
    return { width: parseFloat(wp[1]), height: parseFloat(hp[1]) };
  }
  const vw = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/i);
  if (vw) {
    return { width: parseFloat(vw[1]), height: parseFloat(vw[2]) };
  }
  return { width: 100, height: 100 };
}
