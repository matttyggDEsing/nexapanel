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
  orange: '#E85D04',
  orange2: '#F97316',
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

function generateProjectStory(project) {
  const W = 1080, H = 1920;
  
  const improvementsHtml = project.improvements.map((imp, i) => {
    const y = 520 + (i * 65);
    return `
    <g transform="translate(80, ${y})">
      <circle cx="12" cy="12" r="6" fill="${C.em}" opacity="0.8"/>
      <text x="30" y="17" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">${escXml(imp)}</text>
    </g>`;
  }).join('');
  
  const techHtml = project.tech.map((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 80 + (col * 470);
    const y = 1020 + (row * 70);
    return `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="0" width="440" height="55" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.2" stroke-width="1"/>
      <text x="220" y="35" font-family="${F.mono}, monospace" font-weight="400" font-size="14" fill="${C.em3}" text-anchor="middle">${escXml(t)}</text>
    </g>`;
  }).join('');
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="20%" r="70%">
      <stop offset="0%" stop-color="${C.bg3}"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="${C.orange}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${C.orange}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
  <ellipse cx="540" cy="400" rx="500" ry="400" fill="url(#glow)"/>
  
  <!-- Subtle grid -->
  <g opacity="0.02">
    ${Array.from({length: 14}, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="${H}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
    ${Array.from({length: 24}, (_, i) => `<line x1="0" y1="${i * 80}" x2="${W}" y2="${i * 80}" stroke="${C.txt}" stroke-width="0.5"/>`).join('')}
  </g>
  
  <!-- Top bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="${C.orange}" opacity="0.8"/>
  
  <!-- Project badge -->
  <rect x="80" y="80" width="120" height="32" rx="16" fill="${C.orange}" opacity="0.15"/>
  <text x="140" y="102" font-family="${F.mono}, monospace" font-weight="500" font-size="12" fill="${C.orange2}" text-anchor="middle" letter-spacing="1">PROYECTO</text>
  
  <!-- Client name -->
  <text x="80" y="170" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" letter-spacing="-0.02em">${escXml(project.client)}</text>
  <text x="80" y="210" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}">${escXml(project.subtitle)}</text>
  
  <!-- Divider -->
  <rect x="80" y="240" width="100" height="3" rx="1.5" fill="${C.orange}" opacity="0.6"/>
  
  <!-- Description -->
  <text x="80" y="290" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}">${escXml(project.description)}</text>
  
  <!-- Problem section -->
  <text x="80" y="370" font-family="${F.display}, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">EL PROBLEMA</text>
  <text x="80" y="400" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt3}">${escXml(project.problem)}</text>
  
  <!-- Improvements -->
  <text x="80" y="480" font-family="${F.display}, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">MEJORAS IMPLEMENTADAS</text>
  ${improvementsHtml}
  
  <!-- Tech stack -->
  <text x="80" y="980" font-family="${F.display}, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">TECNOLOGÍAS</text>
  ${techHtml}
  
  <!-- Results -->
  <g transform="translate(80, 1250)">
    <rect x="0" y="0" width="920" height="100" rx="12" fill="${C.bg2}" stroke="${C.orange}" stroke-opacity="0.2" stroke-width="1"/>
    <text x="460" y="35" font-family="${F.display}, sans-serif" font-weight="700" font-size="18" fill="${C.orange2}" text-anchor="middle">RESULTADO</text>
    <text x="460" y="65" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}" text-anchor="middle">${escXml(project.result)}</text>
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

// CAySI Project Data
const caysiProject = {
  client: 'CAySI SA',
  subtitle: 'Control, Automatización y Sistemas Informáticos',
  description: 'Modernización completa del sitio web corporativo con estética industrial SCADA.',
  problem: 'Sitio original en PHP sin responsive, tipografías genéricas, sin animaciones y tiempo de carga de 5.5s.',
  improvements: [
    'Diseño responsive completo (desktop, tablet, mobile)',
    'Identidad de marca con paleta de 22 colores',
    'Animaciones fluidas con Framer Motion',
    'Tiempo de carga reducido de 5.5s a 3.0s',
    'Estética industrial SCADA con HUD en tiempo real',
    'Código modular con componentes reutilizables',
    'Galería interactiva con lightbox',
    'Accesibilidad mejorada (ARIA, teclado)',
    'Formulario con validación en tiempo real',
  ],
  tech: [
    'React 19',
    'Vite',
    'Framer Motion',
    'Netlify CI/CD',
    'Responsive Design',
    'SCADA Aesthetic',
  ],
  result: 'Sitio moderno, rápido y profesional que refleja la identidad técnica de la empresa.',
};

console.log('\n▸ Generating CAySI project story...');
const svg = generateProjectStory(caysiProject);
const result = renderPng(svg, 'story-proyecto-caysi.png', 2);
console.log(`  ${result.filename} — ${result.width}x${result.height}px — ${result.sizeKB}KB`);
console.log('\n✓ Done!');
