const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// NEXA Brand Colors
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

const OUT_DIR = path.join(__dirname, 'posts');
const BANNER_DIR = path.join(OUT_DIR, 'banner');
fs.mkdirSync(BANNER_DIR, { recursive: true });

function escXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Load logo SVG
const logoPath = path.join(__dirname, 'src', 'logotipo-core.svg');
const logoSvg = fs.readFileSync(logoPath, 'utf8');

// Extract the logo content (everything inside the <svg> tag)
const logoMatch = logoSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
const logoContent = logoMatch ? logoMatch[1] : '';

// FIX: leer el bounding box real del logo (viewBox o width/height) en vez de
// asumir un valor fijo. Antes el centrado usaba translate(-40,-40) hardcodeado,
// que no coincidía con el tamaño real del contenido (ícono + wordmark "NEXA"),
// por eso el logo aparecía corrido a la izquierda.
const viewBoxMatch = logoSvg.match(/viewBox="[\-\d.]+\s+[\-\d.]+\s+([\d.]+)\s+([\d.]+)"/);
const widthMatch = logoSvg.match(/<svg[^>]*\swidth="([\d.]+)"/);
const heightMatch = logoSvg.match(/<svg[^>]*\sheight="([\d.]+)"/);

const LOGO_W = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : (widthMatch ? parseFloat(widthMatch[1]) : 250);
const LOGO_H = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : (heightMatch ? parseFloat(heightMatch[1]) : 90);

if (!viewBoxMatch && !widthMatch) {
  console.warn('⚠ No se pudo leer el viewBox de logotipo-core.svg — usando tamaño por defecto 250x90, revisá el centrado visualmente.');
}

// Helper para insertar el logo ya centrado en (cx, cy) con una escala dada
function centeredLogo(cx, cy, scale) {
  return `<g transform="translate(${cx}, ${cy}) scale(${scale})">
    <g transform="translate(${-LOGO_W / 2}, ${-LOGO_H / 2})">
      ${logoContent}
    </g>
  </g>`;
}

// Page shell with dark background
function pageShell(w, h) {
  return `<rect width="${w}" height="${h}" fill="${C.bg}"/>`;
}

// Grid pattern
function gridPattern(w, h, opacity = 0.02) {
  let lines = '';
  for (let x = 0; x < w; x += 80) {
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${C.txt}" stroke-opacity="${opacity}" stroke-width="0.5"/>`;
  }
  for (let y = 0; y < h; y += 80) {
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${C.txt}" stroke-opacity="${opacity}" stroke-width="0.5"/>`;
  }
  return `<g>${lines}</g>`;
}

// Topo lines
function topoLines(yStart, yEnd) {
  let paths = '';
  for (let y = yStart; y < yEnd; y += 60) {
    const amplitude = 20 + Math.random() * 30;
    const frequency = 0.003 + Math.random() * 0.002;
    const phase = Math.random() * Math.PI * 2;
    let d = `M -20 ${y}`;
    for (let x = 0; x <= 3300; x += 10) {
      const dy = Math.sin(x * frequency + phase) * amplitude;
      d += ` L ${x} ${y + dy}`;
    }
    paths += `<path d="${d}" fill="none" stroke="${C.em}" stroke-opacity="0.04" stroke-width="1"/>`;
  }
  return `<g>${paths}</g>`;
}

// Glow orb
function glowOrb(cx, cy, r, color, opacity, id = 'g1') {
  return `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="url(#${id})"/>`;
}

// Geometric pattern element
function geoPattern(x, y, size, rotation = 0) {
  // FIX: opacidad subida de 0.15/0.1 -> 0.35/0.25 para que los triángulos se
  // vean como elemento de diseño y no se pierdan contra el fondo casi negro.
  return `<g transform="translate(${x}, ${y}) rotate(${rotation})">
    <polygon points="0,${-size} ${size*0.866},${size*0.5} ${-size*0.866},${size*0.5}" 
             fill="none" stroke="${C.em}" stroke-opacity="0.35" stroke-width="1.5"/>
    <polygon points="0,${-size*0.6} ${size*0.52},${size*0.3} ${-size*0.52},${size*0.3}" 
             fill="none" stroke="${C.em3}" stroke-opacity="0.25" stroke-width="1"/>
  </g>`;
}

// Circuit lines
function circuitLines(startX, startY, length, direction = 'right') {
  let d = `M ${startX} ${startY}`;
  let x = startX, y = startY;
  const segments = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < segments; i++) {
    const segLen = length / segments;
    if (direction === 'right') {
      x += segLen;
      d += ` L ${x} ${y}`;
      if (i < segments - 1) {
        y += (Math.random() - 0.5) * 40;
        d += ` L ${x} ${y}`;
      }
    } else {
      y += segLen;
      d += ` L ${x} ${y}`;
      if (i < segments - 1) {
        x += (Math.random() - 0.5) * 40;
        d += ` L ${x} ${y}`;
      }
    }
  }
  // FIX: opacidad subida de 0.2 -> 0.4
  return `<path d="${d}" fill="none" stroke="${C.em}" stroke-opacity="0.4" stroke-width="1.5" stroke-linecap="round"/>`;
}

// Dot pattern
function dotPattern(x, y, cols, rows, spacing, size) {
  let dots = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // FIX: opacidad subida de 0.15 -> 0.3
      dots += `<circle cx="${x + c * spacing}" cy="${y + r * spacing}" r="${size}" fill="${C.em}" opacity="0.3"/>`;
    }
  }
  return `<g>${dots}</g>`;
}

// Generate the full 3240x1080 banner
function generateFullBanner() {
  const W = 3240, H = 1080;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${topoLines(200, 800)}
  
  ${glowOrb(1620, 540, 600, C.em, 0.1, 'center-glow')}
  ${glowOrb(400, 540, 300, C.em3, 0.07, 'left-glow')}
  ${glowOrb(2840, 540, 300, C.em3, 0.07, 'right-glow')}
  
  <!-- Left section: Geometric elements -->
  ${geoPattern(200, 300, 120, 0)}
  ${geoPattern(350, 500, 90, 30)}
  ${geoPattern(150, 700, 70, 60)}
  ${geoPattern(800, 850, 60, -30)}
  ${dotPattern(100, 200, 12, 8, 30, 2.5)}
  ${circuitLines(100, 300, 500, 'right')}
  ${circuitLines(100, 500, 400, 'right')}
  ${circuitLines(100, 700, 350, 'right')}
  
  <!-- Left code snippet -->
  <rect x="100" y="380" width="280" height="120" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="120" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6">const </text>
  <text x="175" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt2}" opacity="0.6">nexa</text>
  <text x="210" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6"> = {</text>
  <text x="140" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">tech: </text>
  <text x="195" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"premium"</text>
  <text x="140" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">code: </text>
  <text x="200" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"clean"</text>
  <text x="140" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">  scale: </text>
  <text x="230" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"∞"</text>
  
  <!-- Left circular elements -->
  <circle cx="900" cy="300" r="60" fill="none" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="900" cy="300" r="40" fill="none" stroke="${C.em3}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="900" cy="300" r="20" fill="${C.em}" opacity="0.05"/>
  
  <!-- Center section: NEXA Logo -->
  ${centeredLogo(1620, 527, 2.5)}
  
  <text x="1620" y="620" font-family="${F.display}, sans-serif" font-weight="700" font-size="28" fill="${C.txt2}" text-anchor="middle" letter-spacing="8">TECNOLOGÍA QUE TRASCIENDE</text>
  
  <rect x="1520" y="650" width="200" height="2" rx="1" fill="${C.em}" opacity="0.4"/>
  
  <!-- Right section: Geometric elements -->
  ${geoPattern(3040, 300, 120, 0)}
  ${geoPattern(2890, 500, 90, -30)}
  ${geoPattern(3090, 700, 70, -60)}
  ${geoPattern(2280, 850, 60, 30)}
  ${dotPattern(2900, 200, 12, 8, 30, 2.5)}
  ${circuitLines(2740, 300, 500, 'right')}
  ${circuitLines(2640, 500, 400, 'right')}
  ${circuitLines(2590, 700, 350, 'right')}
  
  <!-- Right code snippet -->
  <rect x="2860" y="380" width="280" height="120" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="2880" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6">// </text>
  <text x="2905" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt2}" opacity="0.6">future-proof</text>
  <text x="3020" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6"> //</text>
  <text x="2880" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">function </text>
  <text x="2960" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">build</text>
  <text x="3000" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">() {</text>
  <text x="2900" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">  return </text>
  <text x="2990" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"excellence"</text>
  <text x="2880" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">}</text>
  
  <!-- Right circular elements -->
  <circle cx="2380" cy="300" r="60" fill="none" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="2380" cy="300" r="40" fill="none" stroke="${C.em3}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="2380" cy="300" r="20" fill="${C.em}" opacity="0.05"/>
  
  <!-- Divider lines -->
  <line x1="1080" y1="100" x2="1080" y2="980" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="4,8"/>
  <line x1="2160" y1="100" x2="2160" y2="980" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="4,8"/>
  
  <!-- Post indicators -->
  <text x="540" y="1050" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">POST 1/3</text>
  <text x="1620" y="1050" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">POST 2/3</text>
  <text x="2700" y="1050" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">POST 3/3</text>
</svg>`;
}

// Generate individual post (left, center, right)
function generatePost(part) {
  const W = 1080, H = 1080;
  const fullW = 3240;
  
  let content = '';
  
  if (part === 'left') {
    content = `
  ${glowOrb(540, 540, 400, C.em3, 0.08, 'left-glow')}
  
  <!-- Large decorative triangles -->
  ${geoPattern(300, 250, 120, 0)}
  ${geoPattern(700, 400, 90, 30)}
  ${geoPattern(200, 600, 70, 60)}
  ${geoPattern(800, 750, 60, -30)}
  ${geoPattern(400, 850, 50, 45)}
  
  <!-- Dot grid pattern -->
  ${dotPattern(100, 200, 12, 8, 30, 2.5)}
  
  <!-- Circuit lines -->
  ${circuitLines(80, 300, 500, 'right')}
  ${circuitLines(80, 500, 400, 'right')}
  ${circuitLines(80, 700, 350, 'right')}
  
  <!-- Horizontal accent lines -->
  <line x1="100" y1="180" x2="600" y2="180" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  <line x1="100" y1="920" x2="700" y2="920" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  
  <!-- Code snippet decoration -->
  <rect x="100" y="380" width="280" height="120" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="120" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6">const </text>
  <text x="175" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt2}" opacity="0.6">nexa</text>
  <text x="210" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6"> = {</text>
  <text x="140" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">tech: </text>
  <text x="195" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"premium"</text>
  <text x="290" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">,</text>
  <text x="140" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">code: </text>
  <text x="200" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"clean"</text>
  <text x="265" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">,</text>
  <text x="140" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">  scale: </text>
  <text x="230" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"∞"</text>
  <text x="250" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">};</text>
  
  <!-- Circular decorative elements -->
  <circle cx="850" cy="300" r="60" fill="none" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="850" cy="300" r="40" fill="none" stroke="${C.em3}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="850" cy="300" r="20" fill="${C.em}" opacity="0.05"/>
  
  <!-- Small decorative dots -->
  <circle cx="900" cy="200" r="4" fill="${C.em}" opacity="0.3"/>
  <circle cx="950" cy="250" r="3" fill="${C.em3}" opacity="0.25"/>
  <circle cx="920" cy="350" r="5" fill="${C.em}" opacity="0.2"/>
  
  <text x="540" y="980" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">1/3</text>`;
  } else if (part === 'center') {
    content = `
  ${glowOrb(540, 540, 600, C.em, 0.12, 'center-glow')}
  
  ${centeredLogo(540, 527, 2.5)}
  
  <text x="540" y="620" font-family="${F.display}, sans-serif" font-weight="700" font-size="28" fill="${C.txt2}" text-anchor="middle" letter-spacing="8">TECNOLOGÍA QUE TRASCIENDE</text>
  
  <rect x="440" y="650" width="200" height="2" rx="1" fill="${C.em}" opacity="0.4"/>
  
  <!-- Subtle corner decorations -->
  <line x1="80" y1="80" x2="180" y2="80" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
  <line x1="80" y1="80" x2="80" y2="180" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
  <line x1="1000" y1="1000" x2="900" y2="1000" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
  <line x1="1000" y1="1000" x2="1000" y2="900" stroke="${C.em}" stroke-opacity="0.15" stroke-width="1"/>
  
  <text x="540" y="980" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">2/3</text>`;
  } else {
    content = `
  ${glowOrb(540, 540, 400, C.em3, 0.08, 'right-glow')}
  
  <!-- Large decorative triangles -->
  ${geoPattern(780, 250, 120, 0)}
  ${geoPattern(380, 400, 90, -30)}
  ${geoPattern(880, 600, 70, -60)}
  ${geoPattern(280, 750, 60, 30)}
  ${geoPattern(680, 850, 50, -45)}
  
  <!-- Dot grid pattern -->
  ${dotPattern(880, 200, 12, 8, 30, 2.5)}
  
  <!-- Circuit lines -->
  ${circuitLines(500, 300, 500, 'right')}
  ${circuitLines(600, 500, 400, 'right')}
  ${circuitLines(650, 700, 350, 'right')}
  
  <!-- Horizontal accent lines -->
  <line x1="480" y1="180" x2="980" y2="180" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  <line x1="380" y1="920" x2="980" y2="920" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
  
  <!-- Code snippet decoration -->
  <rect x="700" y="380" width="280" height="120" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="720" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6">// </text>
  <text x="745" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt2}" opacity="0.6">future-proof</text>
  <text x="860" y="410" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em3}" opacity="0.6"> //</text>
  <text x="720" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">function </text>
  <text x="800" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">build</text>
  <text x="840" y="435" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">() {</text>
  <text x="740" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">  return </text>
  <text x="830" y="460" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.em}" opacity="0.6">"excellence"</text>
  <text x="720" y="485" font-family="${F.mono}, monospace" font-weight="400" font-size="11" fill="${C.txt3}" opacity="0.5">}</text>
  
  <!-- Circular decorative elements -->
  <circle cx="230" cy="300" r="60" fill="none" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1.5"/>
  <circle cx="230" cy="300" r="40" fill="none" stroke="${C.em3}" stroke-opacity="0.08" stroke-width="1"/>
  <circle cx="230" cy="300" r="20" fill="${C.em}" opacity="0.05"/>
  
  <!-- Small decorative dots -->
  <circle cx="180" cy="200" r="4" fill="${C.em}" opacity="0.3"/>
  <circle cx="130" cy="250" r="3" fill="${C.em3}" opacity="0.25"/>
  <circle cx="160" cy="350" r="5" fill="${C.em}" opacity="0.2"/>
  
  <text x="540" y="980" font-family="${F.mono}, monospace" font-weight="400" font-size="10" fill="${C.txt3}" text-anchor="middle" opacity="0.5">3/3</text>`;
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${pageShell(W, H)}
  ${gridPattern(W, H, 0.015)}
  ${topoLines(200, 800)}
  ${content}
</svg>`;
}

// Render SVG to PNG
function renderPng(svgContent, filename, scale = 2) {
  const dims = svgContent.match(/width="(\d+)" height="(\d+)"/);
  const w = dims ? parseInt(dims[1]) : 1080;
  const h = dims ? parseInt(dims[2]) : 1080;

  const svgPath = path.join(BANNER_DIR, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);

  // FIX: antes se pasaban rutas fijas a fontFiles con loadSystemFonts:false.
  // Si UNA sola de esas rutas no existía o el TTF no matcheaba el font-family
  // usado en el SVG ("Syne", "DM Sans", "DM Mono"), resvg no dibujaba NINGÚN
  // texto y fallaba en silencio (por eso el wordmark "NEXA", la tagline y el
  // texto de las cajas de código no aparecían en los PNG).
  const wantedFonts = [
    'Syne-Bold.ttf',
    'Syne-Regular.ttf',
    'DMSans-Regular.ttf',
    'DMMono-Regular.ttf',
  ];
  const fontDir = path.join(__dirname, 'fonts');
  const fontFiles = wantedFonts
    .map(f => path.join(fontDir, f))
    .filter(f => fs.existsSync(f));

  const missing = wantedFonts.filter((f, i) => !fs.existsSync(path.join(fontDir, f)));
  if (missing.length > 0) {
    console.warn(`⚠ Faltan fuentes en ${fontDir}: ${missing.join(', ')}`);
    console.warn('  El texto que use esas familias no se va a renderizar en el PNG.');
  }

  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: w * scale },
    font: {
      fontFiles,
      // Si no se encontró ninguna fuente custom, usamos las del sistema como
      // fallback para al menos no perder el texto por completo.
      loadSystemFonts: fontFiles.length === 0,
      defaultFontFamily: fontFiles.length === 0 ? 'sans-serif' : undefined,
    },
  });

  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const pngPath = path.join(BANNER_DIR, filename);
  fs.writeFileSync(pngPath, png);
  
  const sizeKB = Math.round(fs.statSync(pngPath).size / 1024);
  return { filename, width: w * scale, height: h * scale, sizeKB };
}

// Split a wide PNG into 3 equal parts
function splitPng(inputPath, outputDir) {
  // We'll generate 3 separate SVGs instead
  console.log('  Use the individual post SVGs for uploading to Instagram');
}

// Main
console.log('\n╔══════════════════════════════════════╗');
console.log('║   NEXA Instagram Banner Generator     ║');
console.log('╚══════════════════════════════════════╝\n');

const results = [];

// Generate full banner
console.log('▸ Generating full banner (3240x1080)...');
const fullBanner = generateFullBanner();
const fullResult = renderPng(fullBanner, 'banner-full.png', 2);
results.push(fullResult);
console.log(`  ${fullResult.filename} — ${fullResult.width}x${fullResult.height}px — ${fullResult.sizeKB}KB`);

// Generate individual posts
console.log('\n▸ Generating individual posts (1080x1080)...');

const leftPost = generatePost('left');
const leftResult = renderPng(leftPost, 'banner-left.png', 2);
results.push(leftResult);
console.log(`  ${leftResult.filename} — ${leftResult.width}x${leftResult.height}px — ${leftResult.sizeKB}KB`);

const centerPost = generatePost('center');
const centerResult = renderPng(centerPost, 'banner-center.png', 2);
results.push(centerResult);
console.log(`  ${centerResult.filename} — ${centerResult.width}x${centerResult.height}px — ${centerResult.sizeKB}KB`);

const rightPost = generatePost('right');
const rightResult = renderPng(rightPost, 'banner-right.png', 2);
results.push(rightResult);
console.log(`  ${rightResult.filename} — ${rightResult.width}x${rightResult.height}px — ${rightResult.sizeKB}KB`);

console.log('\n✓ Done! Files in: ' + BANNER_DIR);
console.log('\nTo use on Instagram:');
console.log('  1. Upload posts in order: banner-left.png → banner-center.png → banner-right.png');
console.log('  2. Or split banner-full.png into 3 equal parts (1080x1080 each)');
