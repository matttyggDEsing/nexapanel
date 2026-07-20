const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const C = {
  bg: '#060A0E',
  bg2: '#0B1117',
  bg3: '#111820',
  em: '#10B981',
  em2: '#059669',
  em3: '#34D399',
  txt: '#F0F4F8',
  txt2: '#8A9BB0',
};

const F = {
  display: 'Syne',
  body: 'DM Sans',
};

const OUT_DIR = path.join(__dirname, 'posts', 'highlights');
fs.mkdirSync(OUT_DIR, { recursive: true });

function escXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Icon paths for highlights
const icons = {
  proyectos: `<g transform="translate(540, 440)">
    <rect x="-60" y="-50" width="120" height="100" rx="8" fill="none" stroke="${C.em}" stroke-width="3"/>
    <rect x="-45" y="-35" width="90" height="70" rx="4" fill="none" stroke="${C.em3}" stroke-width="2"/>
    <line x1="-30" y1="-15" x2="30" y2="-15" stroke="${C.em}" stroke-width="2"/>
    <line x1="-30" y1="0" x2="20" y2="0" stroke="${C.em3}" stroke-width="2"/>
    <line x1="-30" y1="15" x2="25" y2="15" stroke="${C.em}" stroke-width="2"/>
    <circle cx="45" cy="-35" r="12" fill="${C.em}" opacity="0.8"/>
    <text x="45" y="-30" font-family="${F.body}, sans-serif" font-weight="700" font-size="14" fill="${C.bg}" text-anchor="middle">+</text>
  </g>`,
  
  servicios: `<g transform="translate(540, 440)">
    <circle cx="0" cy="0" r="55" fill="none" stroke="${C.em}" stroke-width="3"/>
    <circle cx="0" cy="0" r="40" fill="none" stroke="${C.em3}" stroke-width="2"/>
    <path d="M -20 -20 L 20 -20 L 20 20 L -20 20 Z" fill="none" stroke="${C.em}" stroke-width="2"/>
    <path d="M -12 -12 L 12 -12 L 12 12 L -12 12 Z" fill="none" stroke="${C.em3}" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="6" fill="${C.em}"/>
  </g>`,
  
  equipo: `<g transform="translate(540, 440)">
    <circle cx="-25" cy="-20" r="18" fill="none" stroke="${C.em}" stroke-width="2.5"/>
    <circle cx="25" cy="-20" r="18" fill="none" stroke="${C.em3}" stroke-width="2.5"/>
    <circle cx="0" cy="15" r="18" fill="none" stroke="${C.em}" stroke-width="2.5"/>
    <path d="M -40 10 Q -25 -5 -10 10" fill="none" stroke="${C.em3}" stroke-width="1.5"/>
    <path d="M 10 10 Q 25 -5 40 10" fill="none" stroke="${C.em}" stroke-width="1.5"/>
  </g>`,
  
  contacto: `<g transform="translate(540, 440)">
    <rect x="-50" y="-35" width="100" height="70" rx="6" fill="none" stroke="${C.em}" stroke-width="3"/>
    <path d="M -50 -35 L 0 10 L 50 -35" fill="none" stroke="${C.em3}" stroke-width="2"/>
    <circle cx="0" cy="0" r="8" fill="${C.em}" opacity="0.6"/>
  </g>`
};

function generateHighlight(type, label) {
  const W = 1080, H = 1080;
  const icon = icons[type];
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.bg3}"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
  
  <!-- Glow effect -->
  <ellipse cx="540" cy="440" rx="300" ry="300" fill="url(#glow)"/>
  
  <!-- Subtle grid -->
  <g opacity="0.03">
    ${Array.from({length: 14}, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
    ${Array.from({length: 14}, (_, i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
  </g>
  
  <!-- Icon -->
  ${icon}
  
  <!-- Label -->
  <text x="540" y="580" font-family="${F.display}, sans-serif" font-weight="700" font-size="32" fill="${C.txt}" text-anchor="middle" letter-spacing="4">${escXml(label.toUpperCase())}</text>
  
  <!-- Decorative corners -->
  <line x1="100" y1="100" x2="180" y2="100" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1.5"/>
  <line x1="100" y1="100" x2="100" y2="180" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1.5"/>
  <line x1="980" y1="980" x2="900" y2="980" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1.5"/>
  <line x1="980" y1="980" x2="980" y2="900" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1.5"/>
</svg>`;
}

function renderPng(svgContent, filename, scale = 2) {
  const dims = svgContent.match(/width="(\d+)" height="(\d+)"/);
  const w = dims ? parseInt(dims[1]) : 1080;
  const h = dims ? parseInt(dims[2]) : 1080;

  const svgPath = path.join(OUT_DIR, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);

  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: w * scale },
    font: {
      fontFiles: [
        path.join(__dirname, 'fonts', 'Syne-Bold.ttf'),
        path.join(__dirname, 'fonts', 'DMSans-Regular.ttf'),
      ],
      loadSystemFonts: false,
    },
  });

  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const pngPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(pngPath, png);
  
  const sizeKB = Math.round(fs.statSync(pngPath).size / 1024);
  return { filename, width: w * scale, height: h * scale, sizeKB };
}

console.log('\n╔══════════════════════════════════════╗');
console.log('║  NEXA Instagram Highlight Generator   ║');
console.log('╚══════════════════════════════════════╝\n');

const highlights = [
  { type: 'proyectos', label: 'Proyectos' },
  { type: 'servicios', label: 'Servicios' },
  { type: 'equipo', label: 'Equipo' },
  { type: 'contacto', label: 'Contacto' },
];

highlights.forEach((h, i) => {
  console.log(`▸ Generating highlight ${i + 1}/4: ${h.label}...`);
  const svg = generateHighlight(h.type, h.label);
  const result = renderPng(svg, `highlight-${h.type}.png`, 2);
  console.log(`  ${result.filename} — ${result.width}x${result.height}px — ${result.sizeKB}KB`);
});

console.log('\n✓ Done! Files in: ' + OUT_DIR);
