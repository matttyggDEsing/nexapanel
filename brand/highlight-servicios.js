const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const C = {
  bg: '#060A0E',
  bg2: '#0B1117',
  bg3: '#111820',
  bg4: '#161F2A',
  em: '#10B981',
  em2: '#059669',
  em3: '#34D399',
  em4: '#6EE7B7',
  txt: '#F0F4F8',
  txt2: '#8A9BB0',
  txt3: '#5E7085',
};

const F = {
  display: 'Syne',
  body: 'DM Sans',
  mono: 'DM Mono',
};

const FONT_DIR = path.join(__dirname, 'fonts');
const fontFiles = fs.readdirSync(FONT_DIR)
  .filter(f => /\.(ttf|otf|woff2?)$/i.test(f))
  .map(f => path.join(FONT_DIR, f));

const OUT_DIR = path.join(__dirname, 'posts', 'highlights');
fs.mkdirSync(OUT_DIR, { recursive: true });

function escXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const services = [
  { icon: 'WEB', name: 'Desarrollo Web', desc: 'Apps modernas, React, Next.js, escalables' },
  { icon: 'MOV', name: 'Apps Móviles', desc: 'iOS, Android, React Native, Flutter' },
  { icon: 'API', name: 'APIs y Backend', desc: 'Node.js, Python, microservicios' },
  { icon: 'SAAS', name: 'SaaS', desc: 'Software como servicio, multi-tenant' },
  { icon: 'AUT', name: 'Automatizaciones', desc: 'IA, workflows, procesos inteligentes' },
  { icon: 'CLOUD', name: 'Cloud & DevOps', desc: 'AWS, Docker, CI/CD, escalabilidad' },
];

function generateServicesStory() {
  const W = 1080, H = 1920;
  
  const servicesHtml = services.map((s, i) => {
    const y = 280 + (i * 155);
    return `
    <g transform="translate(80, ${y})">
      <rect x="0" y="0" width="920" height="135" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
      <rect x="0" y="0" width="4" height="135" rx="2" fill="${C.em}"/>
      <rect x="25" y="20" width="60" height="60" rx="8" fill="${C.em}" opacity="0.12"/>
      <text x="55" y="58" font-family="${F.mono}, monospace" font-weight="500" font-size="14" fill="${C.em3}" text-anchor="middle">${escXml(s.icon)}</text>
      <text x="110" y="45" font-family="${F.display}, sans-serif" font-weight="700" font-size="20" fill="${C.txt}">${escXml(s.name)}</text>
      <text x="110" y="78" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">${escXml(s.desc)}</text>
    </g>`;
  }).join('');
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="20%" r="70%">
      <stop offset="0%" stop-color="${C.bg3}"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
  <ellipse cx="540" cy="500" rx="500" ry="400" fill="url(#glow)"/>
  
  <!-- Subtle grid -->
  <g opacity="0.02">
    ${Array.from({length: 14}, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
    ${Array.from({length: 24}, (_, i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
  </g>
  
  <!-- Top bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="${C.em}" opacity="0.6"/>
  
  <!-- Header -->
  <text x="540" y="150" font-family="${F.display}, sans-serif" font-weight="800" font-size="48" fill="${C.txt}" text-anchor="middle" letter-spacing="-0.02em">NUESTROS SERVICIOS</text>
  <rect x="420" y="180" width="240" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>
  
  <text x="540" y="230" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}" text-anchor="middle">Soluciones completas para tu negocio</text>
  
  <!-- Services list -->
  ${servicesHtml}
  
  <!-- CTA -->
  <g transform="translate(80, 1250)">
    <rect x="0" y="0" width="920" height="70" rx="35" fill="${C.em}" opacity="0.15" stroke="${C.em}" stroke-width="2"/>
    <text x="460" y="44" font-family="${F.display}, sans-serif" font-weight="700" font-size="18" fill="${C.em3}" text-anchor="middle" letter-spacing="2">¿NECESITAS ALGO MÁS? HABLANOS</text>
  </g>
  
  <!-- Bottom -->
  <text x="540" y="1850" font-family="${F.mono}, monospace" font-weight="400" font-size="12" fill="${C.txt3}" text-anchor="middle" opacity="0.5">NEXA — TECNOLOGÍA QUE TRASCIENDE</text>
</svg>`;
}

function renderPng(svgContent, filename, scale = 2) {
  const dims = svgContent.match(/width="(\d+)" height="(\d+)"/);
  const w = dims ? parseInt(dims[1]) : 1080;
  const h = dims ? parseInt(dims[2]) : 1920;

  const svgPath = path.join(OUT_DIR, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);

  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: w * scale },
    font: { fontFiles },
  });

  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const pngPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(pngPath, png);
  
  const sizeKB = Math.round(fs.statSync(pngPath).size / 1024);
  return { filename, width: w * scale, height: h * scale, sizeKB };
}

console.log('\n▸ Generating Services highlight story...');
const svg = generateServicesStory();
const result = renderPng(svg, 'story-servicios.png', 2);
console.log(`  ${result.filename} — ${result.width}x${result.height}px — ${result.sizeKB}KB`);
console.log('\n✓ Done!');
