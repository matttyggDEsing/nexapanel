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

function generateContactStory() {
  const W = 1080, H = 1920;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${C.bg3}"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
  <ellipse cx="540" cy="700" rx="500" ry="400" fill="url(#glow)"/>
  
  <!-- Subtle grid -->
  <g opacity="0.02">
    ${Array.from({length: 14}, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
    ${Array.from({length: 24}, (_, i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
  </g>
  
  <!-- Top bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="${C.em}" opacity="0.6"/>
  
  <!-- Header -->
  <text x="540" y="180" font-family="${F.display}, sans-serif" font-weight="800" font-size="56" fill="${C.txt}" text-anchor="middle" letter-spacing="-0.02em">CONTACTANOS</text>
  <rect x="440" y="210" width="200" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>
  
  <!-- Email card -->
  <g transform="translate(80, 280)">
    <rect x="0" y="0" width="920" height="100" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.2" stroke-width="1"/>
    <rect x="0" y="0" width="4" height="100" rx="2" fill="${C.em}"/>
    <text x="30" y="35" font-family="${F.mono}, monospace" font-weight="400" font-size="13" fill="${C.txt3}" letter-spacing="1">EMAIL</text>
    <text x="30" y="65" font-family="${F.body}, sans-serif" font-weight="500" font-size="20" fill="${C.txt}">info.nexapanel@gmail.com</text>
  </g>
  
  <!-- WhatsApp cards -->
  <g transform="translate(80, 410)">
    <rect x="0" y="0" width="440" height="100" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.2" stroke-width="1"/>
    <rect x="0" y="0" width="4" height="100" rx="2" fill="${C.em}"/>
    <text x="30" y="35" font-family="${F.mono}, monospace" font-weight="400" font-size="13" fill="${C.txt3}" letter-spacing="1">WHATSAPP</text>
    <text x="30" y="65" font-family="${F.body}, sans-serif" font-weight="500" font-size="18" fill="${C.txt}">+54 343 458 6930</text>
  </g>
  
  <g transform="translate(540, 410)">
    <rect x="0" y="0" width="460" height="100" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.2" stroke-width="1"/>
    <rect x="0" y="0" width="4" height="100" rx="2" fill="${C.em}"/>
    <text x="30" y="35" font-family="${F.mono}, monospace" font-weight="400" font-size="13" fill="${C.txt3}" letter-spacing="1">WHATSAPP</text>
    <text x="30" y="65" font-family="${F.body}, sans-serif" font-weight="500" font-size="18" fill="${C.txt}">+54 343 508 5737</text>
  </g>
  
  <!-- Social section title -->
  <text x="540" y="580" font-family="${F.display}, sans-serif" font-weight="700" font-size="18" fill="${C.txt3}" text-anchor="middle" letter-spacing="3">REDES SOCIALES</text>
  
  <!-- Instagram -->
  <g transform="translate(80, 620)">
    <rect x="0" y="0" width="920" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
    <circle cx="50" cy="40" r="20" fill="${C.em}" opacity="0.15"/>
    <text x="50" y="46" font-family="${F.body}, sans-serif" font-weight="700" font-size="18" fill="${C.em}" text-anchor="middle">IG</text>
    <text x="90" y="46" font-family="${F.body}, sans-serif" font-weight="500" font-size="18" fill="${C.txt}">@nexa.estudios</text>
  </g>
  
  <!-- X/Twitter -->
  <g transform="translate(80, 720)">
    <rect x="0" y="0" width="920" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
    <circle cx="50" cy="40" r="20" fill="${C.em}" opacity="0.15"/>
    <text x="50" y="46" font-family="${F.body}, sans-serif" font-weight="700" font-size="18" fill="${C.em}" text-anchor="middle">X</text>
    <text x="90" y="46" font-family="${F.body}, sans-serif" font-weight="500" font-size="18" fill="${C.txt}">@nexastudiosar</text>
  </g>
  
  <!-- LinkedIn -->
  <g transform="translate(80, 820)">
    <rect x="0" y="0" width="920" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
    <circle cx="50" cy="40" r="20" fill="${C.em}" opacity="0.15"/>
    <text x="50" y="46" font-family="${F.body}, sans-serif" font-weight="700" font-size="16" fill="${C.em}" text-anchor="middle">in</text>
    <text x="90" y="46" font-family="${F.body}, sans-serif" font-weight="500" font-size="16" fill="${C.txt}">linkedin.com/in/nexaestudios</text>
  </g>
  
  <!-- CTA Button -->
  <g transform="translate(80, 960)">
    <rect x="0" y="0" width="920" height="70" rx="35" fill="${C.em}" opacity="0.15" stroke="${C.em}" stroke-width="2"/>
    <text x="460" y="44" font-family="${F.display}, sans-serif" font-weight="700" font-size="20" fill="${C.em3}" text-anchor="middle" letter-spacing="2">ENVIANOS UN DM</text>
  </g>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="1100" r="40" fill="none" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  <circle cx="980" cy="1100" r="40" fill="none" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  
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

console.log('\n▸ Generating Contact highlight story...');
const svg = generateContactStory();
const result = renderPng(svg, 'story-contacto.png', 2);
console.log(`  ${result.filename} — ${result.width}x${result.height}px — ${result.sizeKB}KB`);
console.log('\n✓ Done!');
