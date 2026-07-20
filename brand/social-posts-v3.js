const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const content = require('./social-content');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRAND_DIR = __dirname;
const FONT_DIR = path.join(BRAND_DIR, 'fonts');
const LOGO_PATH = path.join(BRAND_DIR, 'src', 'logotipo-core.svg');
const ISOTIPO_PATH = path.join(BRAND_DIR, 'src', 'isotipo-core.svg');
const OUT_DIR = path.join(BRAND_DIR, 'posts');

const C = content.colors;
const F = content.fonts;

// Validate fonts exist
const fontFiles = fs.readdirSync(FONT_DIR)
  .filter(f => /\.(ttf|otf|woff2?)$/i.test(f))
  .map(f => path.join(FONT_DIR, f));

if (fontFiles.length === 0) {
  console.error('ERROR: No font files found in', FONT_DIR);
  console.error('Expected: Syne-*.ttf, DM-Sans-*.ttf, DM-Mono-*.ttf');
  process.exit(1);
}

// Load real logo SVGs
const logotipoSvg = fs.readFileSync(LOGO_PATH, 'utf8');
const isotipoSvg = fs.readFileSync(ISOTIPO_PATH, 'utf8');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SVG PRIMITIVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function gridPattern(w, h, opacity = 0.025, spacing = 60) {
  const cols = Math.ceil(w / spacing);
  const rows = Math.ceil(h / spacing);
  const lines = [];
  for (let i = 0; i <= cols; i++) lines.push(`<line x1="${i * spacing}" y1="0" x2="${i * spacing}" y2="${h}"/>`);
  for (let i = 0; i <= rows; i++) lines.push(`<line x1="0" y1="${i * spacing}" x2="${w}" y2="${i * spacing}"/>`);
  return `<g opacity="${opacity}" stroke="${C.em}" stroke-width="0.5" fill="none">${lines.join('')}</g>`;
}

function glowOrb(cx, cy, r, color = C.em, opacity = 0.05, id = 'g') {
  return `<defs><filter id="${id}"><feGaussianBlur stdDeviation="${r / 8}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" filter="url(#${id})"/>`;
}

function topoLines(yStart, yEnd, count = 3, opacity = 0.04) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const y = yStart + i * 40;
    const amp = 30 + i * 10;
    paths.push(`<path d="M0,${y} Q270,${y - amp} 540,${y + amp * 0.6} T1080,${y - amp * 0.3}"/>`);
  }
  for (let i = 0; i < 2; i++) {
    const y = yEnd - i * 40;
    paths.push(`<path d="M0,${y} Q300,${y - 25} 600,${y + 20} T1080,${y - 15}"/>`);
  }
  return `<g opacity="${opacity}" stroke="${C.em3}" stroke-width="0.8" fill="none">${paths.join('')}</g>`;
}

function badge(text, x = 60, y = 60) {
  const w = text.length * 10.5 + 36;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="32" rx="16" fill="${C.em}" opacity="0.12"/>
    <text x="${x + w / 2}" y="${y + 21}" font-family="${F.display}, sans-serif" font-weight="700" font-size="11" fill="${C.em3}" text-anchor="middle" letter-spacing="0.12em">${text}</text>
  </g>`;
}

function logotipo(x, y, scale = 0.6) {
  return `<g transform="translate(${x}, ${y}) scale(${scale})">${extractLogoPolygons()}</g>`;
}

function extractLogoPolygons() {
  // Extract polygon data from the real logo SVG
  const polygons = [];
  const gradDef = `<defs><linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${C.em3}"/><stop offset="100%" stop-color="${C.em}"/></linearGradient></defs>`;
  
  const polyData = [
    { points: '-20,-30 -5,-35 -5,20 -20,25', fill: 'url(#logoGrad)' },
    { points: '-20,-30 -5,-35 -20,-15 -35,-10', fill: C.em3 },
    { points: '-20,25 -5,20 -20,40 -35,35', fill: C.em2 },
    { points: '-5,-35 10,-15 10,20 -5,20', fill: C.em },
    { points: '10,-15 25,-20 25,25 10,20', fill: C.em2 },
    { points: '10,-15 25,-20 10,0 -5,5', fill: C.em3 },
    { points: '10,20 25,25 10,45 -5,40', fill: C.em2 },
  ];

  return gradDef + polyData.map(p => `<polygon points="${p.points}" fill="${p.fill}" opacity="0.85"/>`).join('');
}

function bottomBar(h, w = 1080) {
  // Isotipo viewBox: -40 -40 80 90 → at scale 0.38 → 30x34px (visible, not dominant)
  const logoScale = 0.38;
  const logoW = 80 * logoScale;  // 30px
  const logoH = 90 * logoScale;  // 34px
  return `<g>
    <rect x="0" y="${h - 72}" width="${w}" height="72" fill="${C.bg2}" opacity="0.85"/>
    <line x1="0" y1="${h - 72}" x2="${w}" y2="${h - 72}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <g transform="translate(60, ${h - 48})">
      ${logotipo(0, -logoH / 2, logoScale)}
      <text x="${logoW + 10}" y="6" font-family="${F.display}, sans-serif" font-weight="800" font-size="15" fill="${C.txt}" letter-spacing="2">NEXA</text>
      <text x="${logoW + 75}" y="6" font-family="${F.body}, sans-serif" font-weight="400" font-size="12" fill="${C.txt3}" letter-spacing="0.5">Tecnología que trasciende</text>
    </g>
    <text x="${w - 60}" y="${h - 42}" font-family="${F.body}, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="end" letter-spacing="0.5">${content.brand.domain}</text>
  </g>`;
}

function pageShell(w, h) {
  return `<rect width="${w}" height="${h}" fill="${C.bg}"/>`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CODE BLOCK RENDERER (reusable across formats)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function codeBlock(x, y, w, h, codeData, opts = {}) {
  const { fontSize = 13, lineH = 22, showLineNumbers = true, showTrafficLights = true } = opts;
  const lines = codeData.lines;
  const headerH = 40;

  const colored = (text, colorKey) => {
    const colorMap = { em3: C.em3, em4: C.em4, em: C.em, txt: C.txt, txt2: C.txt2 };
    return `<tspan fill="${colorMap[colorKey] || C.txt}">${escXml(text)}</tspan>`;
  };

  const lineElements = lines.map((line, i) => {
    const ly = y + headerH + 24 + i * lineH;
    if (ly > y + h - 10) return '';
    const numEl = showLineNumbers ? `<text x="${x + 20}" y="${ly}" font-family="${F.mono}, monospace" font-size="${fontSize - 1}" fill="${C.txt3}" opacity="0.3">${String(i + 1).padStart(2)}</text>` : '';
    const indent = x + 44 + line.indent * 16;
    let content = '';
    if (line.comment) {
      content = `<text x="${indent}" y="${ly}" font-family="${F.mono}, monospace" font-size="${fontSize}" fill="${C.txt3}">${escXml(line.comment)}</text>`;
    } else {
      const tspans = line.tokens.map(t => colored(t.t, t.c)).join('');
      content = `<text x="${indent}" y="${ly}" font-family="${F.mono}, monospace" font-size="${fontSize}">${tspans}</text>`;
    }
    return numEl + content;
  }).join('');

  const trafficLights = showTrafficLights ? `
    <circle cx="${x + 20}" cy="${y + 20}" r="5" fill="#FF5F56"/>
    <circle cx="${x + 38}" cy="${y + 20}" r="5" fill="#FFBD2E"/>
    <circle cx="${x + 56}" cy="${y + 20}" r="5" fill="#27C93F"/>
  ` : '';

  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="14" fill="${C.bg3}"/>
    <rect x="${x}" y="${y + headerH - 4}" width="${w}" height="4" fill="${C.bg3}"/>
    ${trafficLights}
    <text x="${x + 80}" y="${y + 24}" font-family="${F.mono}, monospace" font-size="11" fill="${C.txt3}" letter-spacing="0.3">${escXml(codeData.file)}</text>
    ${lineElements}
  </g>`;
}

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST GENERATORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function post_TechAuthority_Feed() {
  const d = content.posts[0];
  const W = 1080, H = 1080;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H)}
  ${glowOrb(180, 280, 220, C.em, 0.05)}
  ${glowOrb(900, 800, 180, C.em3, 0.03, 'g2')}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.35)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])}</text>
  <text x="60" y="210" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.title[1])}</text>
  <text x="60" y="260" font-family="${F.body}, sans-serif" font-weight="400" font-size="17" fill="${C.txt2}" letter-spacing="0.01em">${escXml(d.subtitle)}</text>

  ${codeBlock(60, 290, 960, 540, d.code, { fontSize: 13, lineH: 21 })}

  ${bottomBar(H)}
</svg>`;
}

function post_TechAuthority_Story() {
  const d = content.posts[0];
  const W = 1080, H = 1920;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 380, 300, C.em, 0.05)}
  ${badge(d.label, 60, 100)}
  ${logotipo(W - 80, 95, 0.35)}

  <text x="60" y="240" font-family="${F.display}, sans-serif" font-weight="800" font-size="54" fill="${C.txt}" letter-spacing="-0.02em">Cómo diseñamos</text>
  <text x="60" y="318" font-family="${F.display}, sans-serif" font-weight="800" font-size="54" fill="${C.em3}" letter-spacing="-0.02em">la arquitectura</text>
  <text x="60" y="378" font-family="${F.body}, sans-serif" font-weight="400" font-size="18" fill="${C.txt2}">Sistemas modulares que escalan.</text>

  ${codeBlock(60, 420, 960, 800, d.code, { fontSize: 14, lineH: 25 })}

  <text x="540" y="1380" font-family="${F.display}, sans-serif" font-weight="800" font-size="40" fill="${C.txt}" text-anchor="middle" letter-spacing="-0.01em">Modular. Escalable.</text>
  <text x="540" y="1440" font-family="${F.display}, sans-serif" font-weight="800" font-size="40" fill="${C.em3}" text-anchor="middle" letter-spacing="-0.01em">Maintainable.</text>

  <rect x="60" y="1500" width="960" height="2" rx="1" fill="${C.em}" opacity="0.25"/>

  ${bottomBar(H, W)}
</svg>`;
}

function post_TechAuthority_X() {
  const d = content.posts[0];
  const W = 1600, H = 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.02)}
  ${glowOrb(250, 400, 200, C.em, 0.04)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.3)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.txt}" letter-spacing="-0.02em">Arquitectura de software</text>
  <text x="60" y="200" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.em3}" letter-spacing="-0.02em">que escala.</text>

  ${codeBlock(60, 240, 720, 520, d.code, { fontSize: 12, lineH: 20 })}

  <g transform="translate(830, 260)">
    <text x="0" y="0" font-family="${F.body}, sans-serif" font-size="13" fill="${C.txt3}" letter-spacing="0.05em">${escXml(d.code.sidebar.label)}</text>
    ${d.code.sidebar.items.map((item, i) => `
      <g transform="translate(0, ${28 + i * 34})">
        <rect x="0" y="0" width="6" height="6" rx="2" fill="${C.em}" opacity="0.6"/>
        <text x="18" y="6" font-family="${F.body}, sans-serif" font-size="13" fill="${C.txt2}">${escXml(item)}</text>
      </g>
    `).join('')}
  </g>

  <text x="830" y="530" font-family="${F.body}, sans-serif" font-size="14" fill="${C.txt3}" letter-spacing="0.5">${content.brand.domain}</text>
  <text x="${W - 60}" y="${H - 30}" font-family="${F.display}, sans-serif" font-weight="700" font-size="13" fill="${C.txt3}" text-anchor="end" letter-spacing="1">NEXA</text>
</svg>`;
}

function post_Services_Feed() {
  const d = content.posts[1];
  const W = 1080, H = 1080;
  const servicesPerCard = d.services.slice(0, 5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.02)}
  ${glowOrb(880, 180, 220, C.em, 0.04)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.35)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="48" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])}</text>
  <text x="60" y="208" font-family="${F.display}, sans-serif" font-weight="800" font-size="48" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.title[1])}</text>

  ${servicesPerCard.map((s, i) => {
    const y = 260 + i * 135;
    return `<g>
      <rect x="60" y="${y}" width="960" height="115" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${y}" width="3" height="115" rx="1.5" fill="${C.em}" opacity="0.5"/>
      <text x="100" y="${y + 45}" font-family="${F.display}, sans-serif" font-weight="800" font-size="22" fill="${C.em}" opacity="0.2">${String(i + 1).padStart(2, '0')}</text>
      <text x="148" y="${y + 42}" font-family="${F.display}, sans-serif" font-weight="700" font-size="19" fill="${C.txt}">${escXml(s.title)}</text>
      <text x="148" y="${y + 72}" font-family="${F.body}, sans-serif" font-weight="400" font-size="14" fill="${C.txt2}">${escXml(s.desc)}</text>
    </g>`;
  }).join('')}

  ${bottomBar(H)}
</svg>`;
}

function post_Services_Carousel() {
  const d = content.posts[1];
  const W = 1080, H = 1080;
  const slides = [];

  // Slide 1 — Cover (logo centered: x = 540 - (80*1.4)/2, y = 360 - (90*1.4)/2)
  const coverLogoScale = 1.4;
  const coverLogoX = 540 - (80 * coverLogoScale) / 2;  // 540 - 56 = 484
  const coverLogoY = 360 - (90 * coverLogoScale) / 2;  // 360 - 63 = 297
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 400, 350, C.em, 0.06)}
  ${logotipo(coverLogoX, coverLogoY, coverLogoScale)}
  <text x="540" y="640" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.txt}" text-anchor="middle" letter-spacing="-0.02em">${escXml(d.carousel.coverTitle)}</text>
  <text x="540" y="710" font-family="${F.body}, sans-serif" font-weight="400" font-size="19" fill="${C.txt2}" text-anchor="middle">${escXml(d.carousel.coverSubtitle)}</text>
  <text x="540" y="860" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt3}" text-anchor="middle">Deslizá para ver nuestros servicios →</text>
  ${bottomBar(H, W)}
</svg>`);

  // Slide 2 — Services + Stack (tighter layout to fit in 1080px)
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}

  <text x="60" y="85" font-family="${F.display}, sans-serif" font-weight="800" font-size="32" fill="${C.txt}" letter-spacing="-0.01em">Nuestros servicios</text>
  <rect x="60" y="100" width="70" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  ${d.services.map((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 60 + col * 500;
    const y = 125 + row * 155;
    return `<g>
      <rect x="${x}" y="${y}" width="460" height="135" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
      <text x="${x + 24}" y="${y + 40}" font-family="${F.display}, sans-serif" font-weight="700" font-size="19" fill="${C.em3}">${escXml(s.title)}</text>
      <text x="${x + 24}" y="${y + 68}" font-family="${F.body}, sans-serif" font-weight="400" font-size="14" fill="${C.txt2}">${escXml(s.desc.split('.')[0])}.</text>
    </g>`;
  }).join('')}

  <text x="60" y="620" font-family="${F.display}, sans-serif" font-weight="800" font-size="32" fill="${C.txt}" letter-spacing="-0.01em">Stack tecnológico</text>
  <rect x="60" y="635" width="70" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <g transform="translate(60, 660)">
    ${d.stack.map((t, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      return `<rect x="${col * 200}" y="${row * 42}" width="180" height="32" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
      <text x="${col * 200 + 90}" y="${row * 42 + 21}" font-family="${F.body}, sans-serif" font-size="12" fill="${C.em3}" text-anchor="middle" letter-spacing="0.3">${escXml(t)}</text>`;
    }).join('')}
  </g>

  ${bottomBar(H, W)}
</svg>`);

  // Slide 3 — CTA (logo centered between CTA button and bottom bar)
  const ctaLogoScale = 0.85;
  const ctaLogoX = 540 - (80 * ctaLogoScale) / 2;  // 540 - 34 = 506
  const ctaLogoY = 660 - (90 * ctaLogoScale) / 2;  // centered vertically in available space
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 420, 380, C.em, 0.06)}

  <text x="540" y="350" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" text-anchor="middle" letter-spacing="-0.02em">${escXml(d.carousel.ctaTitle)}</text>
  <text x="540" y="420" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.em3}" text-anchor="middle" letter-spacing="-0.02em">${escXml(d.carousel.ctaAccent)}</text>

  <rect x="370" y="500" width="340" height="56" rx="28" fill="${C.em}"/>
  <text x="540" y="535" font-family="${F.display}, sans-serif" font-weight="700" font-size="16" fill="${C.bg}" text-anchor="middle" letter-spacing="0.15em">${escXml(d.carousel.ctaButton)}</text>

  <text x="540" y="620" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}" text-anchor="middle">${content.brand.domain}</text>

  ${logotipo(ctaLogoX, ctaLogoY, ctaLogoScale)}
  ${bottomBar(H, W)}
</svg>`);

  return slides;
}

function post_Services_Story() {
  const d = content.posts[1];
  const W = 1080, H = 1920;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 350, 280, C.em, 0.04)}
  ${badge(d.label, 60, 100)}
  ${logotipo(W - 80, 95, 0.35)}

  <text x="60" y="240" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])}</text>
  <text x="60" y="318" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.title[1])}</text>

  ${d.services.map((s, i) => {
    const y = 380 + i * 165;
    return `<g>
      <rect x="60" y="${y}" width="960" height="140" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
      <rect x="60" y="${y}" width="3" height="140" rx="1.5" fill="${C.em}" opacity="0.5"/>
      <text x="100" y="${y + 50}" font-family="${F.display}, sans-serif" font-weight="800" font-size="26" fill="${C.em}" opacity="0.2">${String(i + 1).padStart(2, '0')}</text>
      <text x="150" y="${y + 48}" font-family="${F.display}, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">${escXml(s.title)}</text>
      <text x="150" y="${y + 82}" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">${escXml(s.desc)}</text>
    </g>`;
  }).join('')}

  ${bottomBar(H, W)}
</svg>`;
}

function post_Education_Feed() {
  const d = content.posts[2];
  const W = 1080, H = 1080;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 400, 280, C.em, 0.03)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.35)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])}</text>
  <text x="60" y="200" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.title[1])}</text>
  <text x="60" y="238" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt3}">Swipe para ver cada una →</text>

  ${d.tips.map((t, i) => {
    const y = 270 + i * 145;
    return `<g>
      <rect x="60" y="${y}" width="960" height="125" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
      <rect x="60" y="${y}" width="3" height="125" rx="1.5" fill="${C.em}" opacity="0.5"/>
      <text x="100" y="${y + 50}" font-family="${F.display}, sans-serif" font-weight="800" font-size="26" fill="${C.em}" opacity="0.18">${t.num}</text>
      <text x="155" y="${y + 44}" font-family="${F.display}, sans-serif" font-weight="700" font-size="18" fill="${C.txt}">${escXml(t.title)}</text>
      <text x="155" y="${y + 76}" font-family="${F.body}, sans-serif" font-weight="400" font-size="14" fill="${C.txt2}">${escXml(t.desc)}</text>
    </g>`;
  }).join('')}

  ${bottomBar(H)}
</svg>`;
}

function post_Education_Story() {
  const d = content.posts[2];
  const W = 1080, H = 1920;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${glowOrb(540, 350, 250, C.em, 0.04)}
  ${badge(d.label, 60, 100)}
  ${logotipo(W - 80, 95, 0.35)}

  <text x="60" y="240" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.txt}" letter-spacing="-0.02em">5 prácticas que</text>
  <text x="60" y="318" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.em3}" letter-spacing="-0.02em">todo dev debería</text>
  <text x="60" y="396" font-family="${F.display}, sans-serif" font-weight="800" font-size="50" fill="${C.em3}" letter-spacing="-0.02em">seguir</text>

  ${d.tips.map((t, i) => {
    const y = 450 + i * 175;
    return `<g>
      <rect x="60" y="${y}" width="960" height="148" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
      <rect x="60" y="${y}" width="3" height="148" rx="1.5" fill="${C.em}" opacity="0.5"/>
      <text x="100" y="${y + 55}" font-family="${F.display}, sans-serif" font-weight="800" font-size="30" fill="${C.em}" opacity="0.18">${t.num}</text>
      <text x="160" y="${y + 50}" font-family="${F.display}, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">${escXml(t.title)}</text>
      <text x="160" y="${y + 85}" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}">${escXml(t.desc)}</text>
    </g>`;
  }).join('')}

  ${bottomBar(H, W)}
</svg>`;
}

function post_BrandStory_Feed() {
  const d = content.posts[3];
  const W = 1080, H = 1080;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${topoLines(180, 680)}
  ${glowOrb(540, 480, 320, C.em, 0.04)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.35)}

  <text x="540" y="190" font-family="${F.display}, sans-serif" font-weight="800" font-size="72" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="260" font-family="${F.display}, sans-serif" font-weight="800" font-size="44" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.headline[0])}</text>
  <text x="60" y="330" font-family="${F.display}, sans-serif" font-weight="800" font-size="44" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.headline[1])}</text>
  <text x="60" y="415" font-family="${F.display}, sans-serif" font-weight="800" font-size="44" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.headlineAccent[0])}</text>
  <text x="60" y="485" font-family="${F.display}, sans-serif" font-weight="800" font-size="44" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.headlineAccent[1])}</text>

  <rect x="60" y="520" width="90" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="565" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}" letter-spacing="0.01em">${escXml(d.description)}</text>

  <g transform="translate(60, 610)">
    ${d.stats.map((s, i) => `
      <g transform="translate(${i * 250}, 0)">
        <rect x="0" y="0" width="230" height="85" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="115" y="38" font-family="${F.display}, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">${escXml(s.value)}</text>
        <text x="115" y="62" font-family="${F.body}, sans-serif" font-weight="400" font-size="12" fill="${C.txt3}" text-anchor="middle">${escXml(s.label)}</text>
      </g>
    `).join('')}
  </g>

  ${bottomBar(H)}
</svg>`;
}

function post_BrandStory_Story() {
  const d = content.posts[3];
  const W = 1080, H = 1920;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${topoLines(280, 1200)}
  ${glowOrb(540, 650, 400, C.em, 0.04)}
  ${badge(d.label, 60, 100)}
  ${logotipo(W - 80, 95, 0.35)}

  <text x="540" y="280" font-family="${F.display}, sans-serif" font-weight="800" font-size="80" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="370" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.headline[0])}</text>
  <text x="60" y="450" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.headline[1])}</text>
  <text x="60" y="550" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.headlineAccent[0])}</text>
  <text x="60" y="630" font-family="${F.display}, sans-serif" font-weight="800" font-size="52" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.headlineAccent[1])}</text>

  <rect x="60" y="670" width="100" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="730" font-family="${F.body}, sans-serif" font-weight="400" font-size="18" fill="${C.txt2}">${escXml(d.description)}</text>

  <g transform="translate(60, 800)">
    ${d.stats.map((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return `<g transform="translate(${col * 480}, ${row * 120})">
        <rect x="0" y="0" width="440" height="100" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="220" y="42" font-family="${F.display}, sans-serif" font-weight="800" font-size="34" fill="${C.em3}" text-anchor="middle">${escXml(s.value)}</text>
        <text x="220" y="70" font-family="${F.body}, sans-serif" font-weight="400" font-size="14" fill="${C.txt3}" text-anchor="middle">${escXml(s.label)}</text>
      </g>`;
    }).join('')}
  </g>

  ${bottomBar(H, W)}
</svg>`;
}

function post_BrandStory_X() {
  const d = content.posts[3];
  const W = 1600, H = 900;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${topoLines(180, 580)}
  ${glowOrb(800, 450, 320, C.em, 0.04)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.3)}

  <text x="540" y="180" font-family="${F.display}, sans-serif" font-weight="800" font-size="68" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="260" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.headline[0])} ${escXml(d.headline[1])}</text>
  <text x="60" y="330" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.headlineAccent[0])} ${escXml(d.headlineAccent[1])}</text>

  <rect x="60" y="365" width="90" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="415" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}">${escXml(d.description)}</text>

  <g transform="translate(60, 465)">
    ${d.stats.map((s, i) => `
      <g transform="translate(${i * 260}, 0)">
        <rect x="0" y="0" width="240" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="120" y="35" font-family="${F.display}, sans-serif" font-weight="800" font-size="26" fill="${C.em3}" text-anchor="middle">${escXml(s.value)}</text>
        <text x="120" y="58" font-family="${F.body}, sans-serif" font-weight="400" font-size="12" fill="${C.txt3}" text-anchor="middle">${escXml(s.label)}</text>
      </g>
    `).join('')}
  </g>

  <text x="60" y="650" font-family="${F.body}, sans-serif" font-weight="400" font-size="14" fill="${C.txt3}" letter-spacing="0.5">${content.brand.domain}</text>
  <text x="${W - 60}" y="${H - 30}" font-family="${F.display}, sans-serif" font-weight="700" font-size="13" fill="${C.txt3}" text-anchor="end" letter-spacing="1">NEXA</text>
</svg>`;
}

function post_SocialProof_Feed() {
  const d = content.posts[4];
  const W = 1080, H = 1080;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.02)}
  ${glowOrb(200, 180, 180, C.em, 0.04)}
  ${glowOrb(880, 800, 220, C.em3, 0.03, 'g2')}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.35)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="48" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])}</text>
  <text x="60" y="208" font-family="${F.display}, sans-serif" font-weight="800" font-size="48" fill="${C.em3}" letter-spacing="-0.02em">${escXml(d.title[1])}</text>

  <text x="540" y="380" font-family="${F.display}, sans-serif" font-weight="800" font-size="120" fill="${C.em}" opacity="0.08" text-anchor="middle" letter-spacing="-0.03em">${escXml(d.bigStat.value)}</text>
  <text x="540" y="430" font-family="${F.body}, sans-serif" font-weight="400" font-size="17" fill="${C.txt2}" text-anchor="middle">${escXml(d.bigStat.label)}</text>

  <g transform="translate(60, 470)">
    ${d.metrics.map((m, i) => `
      <g transform="translate(${i * 250}, 0)">
        <rect x="0" y="0" width="230" height="85" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="115" y="38" font-family="${F.display}, sans-serif" font-weight="800" font-size="26" fill="${C.em3}" text-anchor="middle">${escXml(m.value)}</text>
        <text x="115" y="62" font-family="${F.body}, sans-serif" font-weight="400" font-size="11" fill="${C.txt3}" text-anchor="middle">${escXml(m.label)}</text>
      </g>
    `).join('')}
  </g>

  <g transform="translate(60, 590)">
    <rect x="0" y="0" width="960" height="120" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.08" stroke-width="1"/>
    <rect x="0" y="0" width="3" height="120" rx="1.5" fill="${C.em}" opacity="0.5"/>
    <text x="36" y="35" font-family="${F.display}, sans-serif" font-weight="700" font-size="15" fill="${C.txt}">${escXml(d.testimonial.quote)}</text>
    <text x="36" y="60" font-family="${F.body}, sans-serif" font-weight="400" font-size="13" fill="${C.txt2}">${escXml(d.testimonial.author)}</text>
    <g transform="translate(36, 78)">
      ${Array.from({ length: d.testimonial.rating }, (_, i) => `<text x="${i * 20}" y="0" font-size="16" fill="${C.em3}">★</text>`).join('')}
    </g>
  </g>

  ${bottomBar(H)}
</svg>`;
}

function post_SocialProof_X() {
  const d = content.posts[4];
  const W = 1600, H = 900;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.02)}
  ${glowOrb(300, 300, 200, C.em, 0.04)}
  ${glowOrb(1300, 700, 250, C.em3, 0.03, 'g2')}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.3)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="42" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])} ${escXml(d.title[1])}</text>

  <text x="400" y="400" font-family="${F.display}, sans-serif" font-weight="800" font-size="130" fill="${C.em}" opacity="0.08" text-anchor="middle" letter-spacing="-0.03em">${escXml(d.bigStat.value)}</text>
  <text x="400" y="450" font-family="${F.body}, sans-serif" font-weight="400" font-size="16" fill="${C.txt2}" text-anchor="middle">${escXml(d.bigStat.label)}</text>

  ${d.metrics.map((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 830 + col * 350;
    const y = 260 + row * 140;
    return `<g>
      <rect x="${x}" y="${y}" width="310" height="110" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${x + 155}" y="${y + 45}" font-family="${F.display}, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">${escXml(m.value)}</text>
      <text x="${x + 155}" y="${y + 72}" font-family="${F.body}, sans-serif" font-weight="400" font-size="12" fill="${C.txt3}" text-anchor="middle">${escXml(m.label)}</text>
    </g>`;
  }).join('')}

  <text x="60" y="620" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">Desarrollo de software profesional. Web, móvil, APIs, SaaS.</text>
  <text x="60" y="660" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">Soluciones escalables para empresas que quieren crecer.</text>

  <text x="60" y="730" font-family="${F.display}, sans-serif" font-weight="700" font-size="16" fill="${C.em3}" letter-spacing="0.5">${content.brand.domain}</text>

  <text x="${W - 60}" y="${H - 30}" font-family="${F.display}, sans-serif" font-weight="700" font-size="13" fill="${C.txt3}" text-anchor="end" letter-spacing="1">NEXA</text>
</svg>`;
}

function post_SocialProof_LinkedIn() {
  const d = content.posts[4];
  const W = 1200, H = 627;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.02)}
  ${glowOrb(250, 300, 200, C.em, 0.04)}
  ${badge(d.label)}
  ${logotipo(W - 80, 52, 0.3)}

  <text x="60" y="140" font-family="${F.display}, sans-serif" font-weight="800" font-size="40" fill="${C.txt}" letter-spacing="-0.02em">${escXml(d.title[0])} ${escXml(d.title[1])}</text>

  <g transform="translate(60, 185)">
    ${d.metrics.map((m, i) => `
      <g transform="translate(${i * 270}, 0)">
        <rect x="0" y="0" width="250" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="125" y="35" font-family="${F.display}, sans-serif" font-weight="800" font-size="26" fill="${C.em3}" text-anchor="middle">${escXml(m.value)}</text>
        <text x="125" y="58" font-family="${F.body}, sans-serif" font-weight="400" font-size="12" fill="${C.txt3}" text-anchor="middle">${escXml(m.label)}</text>
      </g>
    `).join('')}
  </g>

  <rect x="60" y="315" width="1080" height="2" rx="1" fill="${C.em}" opacity="0.15"/>

  <text x="60" y="365" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">Desarrollo de software profesional. Web, móvil, APIs, SaaS.</text>
  <text x="60" y="395" font-family="${F.body}, sans-serif" font-weight="400" font-size="15" fill="${C.txt2}">Soluciones escalables para empresas que quieren crecer.</text>

  <text x="60" y="465" font-family="${F.display}, sans-serif" font-weight="700" font-size="16" fill="${C.em3}" letter-spacing="0.5">${content.brand.domain}</text>

  <rect x="60" y="495" width="180" height="36" rx="18" fill="${C.em}" opacity="0.12"/>
  <text x="150" y="519" font-family="${F.display}, sans-serif" font-weight="700" font-size="12" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">VER PORTFOLIO</text>

  <text x="${W - 60}" y="${H - 25}" font-family="${F.display}, sans-serif" font-weight="700" font-size="13" fill="${C.txt3}" text-anchor="end" letter-spacing="1">NEXA</text>
</svg>`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderSvg(svgContent, filename, scale = 2) {
  const dims = svgContent.match(/width="(\d+)" height="(\d+)"/);
  const w = dims ? parseInt(dims[1]) : 1080;
  const h = dims ? parseInt(dims[2]) : 1080;

  const svgPath = path.join(OUT_DIR, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);

  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: w * scale },
    background: 'transparent',
    font: { fontFiles },
  });
  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, png);
  console.log(`  ${filename} — ${w * scale}x${h * scale}px — ${(png.length / 1024).toFixed(0)}KB`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const dirs = ['ig', 'stories', 'x', 'linkedin', 'carrusel'];
for (const dir of dirs) {
  const p = path.join(OUT_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

console.log('\n╔══════════════════════════════════════╗');
console.log('║   NEXA Social Media Generator v3     ║');
console.log('╚══════════════════════════════════════╝\n');

console.log('▸ Rendering Instagram feed posts...');
renderSvg(post_TechAuthority_Feed(), 'ig/01-tech-authority.png');
renderSvg(post_Services_Feed(),      'ig/02-services.png');
renderSvg(post_Education_Feed(),     'ig/03-education.png');
renderSvg(post_BrandStory_Feed(),    'ig/04-brand-story.png');
renderSvg(post_SocialProof_Feed(),   'ig/05-social-proof.png');

console.log('\n▸ Rendering Instagram stories...');
renderSvg(post_TechAuthority_Story(), 'stories/01-tech-authority.png');
renderSvg(post_Services_Story(),      'stories/02-services.png');
renderSvg(post_Education_Story(),     'stories/03-education.png');
renderSvg(post_BrandStory_Story(),    'stories/04-brand-story.png');

console.log('\n▸ Rendering X/Twitter posts...');
renderSvg(post_TechAuthority_X(),  'x/01-tech-authority.png');
renderSvg(post_BrandStory_X(),     'x/04-brand-story.png');
renderSvg(post_SocialProof_X(),    'x/05-social-proof.png');

console.log('\n▸ Rendering LinkedIn post...');
renderSvg(post_SocialProof_LinkedIn(), 'linkedin/05-social-proof.png');

console.log('\n▸ Rendering carousel slides...');
const carouselSlides = post_Services_Carousel();
carouselSlides.forEach((svg, i) => renderSvg(svg, `carrusel/02-services-slide${i + 1}.png`));

console.log('\n✓ Done! All posts in:', OUT_DIR);
