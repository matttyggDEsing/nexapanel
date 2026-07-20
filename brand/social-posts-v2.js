const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const outDir = path.join(__dirname, 'posts');
const fontDir = path.join(__dirname, '..', 'brand', 'fonts');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const fontFiles = fs.readdirSync(fontDir)
  .filter(f => /\.(ttf|otf|woff2?)$/i.test(f))
  .map(f => path.join(fontDir, f));

// Brand colors
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

// Isotipo SVG fragment
const isotipo = (x, y, s = 0.35) => `
  <g transform="translate(${x}, ${y}) scale(${s})">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>`;

const badge = (text, y = 60) => `
  <rect x="60" y="${y}" width="${text.length * 11 + 40}" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="${60 + (text.length * 11 + 40) / 2}" y="${y + 24}" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">${text}</text>`;

const bottomBar = (h) => `
  <rect x="0" y="${h - 80}" width="1080" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${h - 80}" x2="1080" y2="${h - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${h - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${h - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="1020" y="${h - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexa.design</text>`;

const grid = (w, h, opacity = 0.03) => {
  const cols = Math.ceil(w / 50);
  const rows = Math.ceil(h / 50);
  return `<g opacity="${opacity}" stroke="${C.em}" stroke-width="0.5" fill="none">
    ${Array.from({length: cols}, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${h}"/>`).join('\n    ')}
    ${Array.from({length: rows}, (_, i) => `<line x1="0" y1="${i * 50}" x2="${w}" y2="${i * 50}"/>`).join('\n    ')}
  </g>`;
};

const topoLines = (y1, y2, opacity = 0.05) => `
  <g opacity="${opacity}" stroke="${C.em3}" stroke-width="1" fill="none">
    <path d="M0,${y1} Q270,${y1 - 40} 540,${y1 + 20} T1080,${y1 - 20}"/>
    <path d="M0,${y1 + 40} Q270,${y1} 540,${y1 + 60} T1080,${y1 + 20}"/>
    <path d="M0,${y2} Q300,${y2 - 30} 600,${y2 + 20} T1080,${y2 - 10}"/>
  </g>`;

function renderSvg(svgContent, filename, scale = 2) {
  const dims = svgContent.match(/width="(\d+)" height="(\d+)"/);
  const w = dims ? parseInt(dims[1]) : 1080;
  const h = dims ? parseInt(dims[2]) : 1080;
  // Save SVG for debugging
  const svgPath = path.join(outDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: w * scale },
    background: 'transparent',
    font: { fontFiles },
  });
  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, png);
  console.log(`${filename} — ${w * scale}x${h * scale}px — ${(png.length / 1024).toFixed(0)}KB`);
}

// =============================================
// POST 1: TECH AUTHORITY — Arquitectura de Software
// =============================================
function post1_ig() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="g1"><feGaussianBlur stdDeviation="25" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080)}
  <circle cx="200" cy="300" r="250" fill="${C.em}" opacity="0.04" filter="url(#g1)"/>
  ${badge('TECH AUTHORITY')}
  ${isotipo(920, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.txt}">Arquitectura</text>
  <text x="60" y="210" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.em3}">de software</text>
  <text x="60" y="255" font-family="DM Sans, sans-serif" font-size="18" fill="${C.txt2}">Así construimos sistemas que escalan.</text>

  <rect x="60" y="290" width="960" height="580" rx="16" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <rect x="60" y="290" width="960" height="44" rx="16" fill="${C.bg3}"/>
  <rect x="60" y="318" width="960" height="16" fill="${C.bg3}"/>
  <circle cx="90" cy="312" r="6" fill="#FF5F56"/>
  <circle cx="110" cy="312" r="6" fill="#FFBD2E"/>
  <circle cx="130" cy="312" r="6" fill="#27C93F"/>
  <text x="160" y="317" font-family="DM Mono, monospace" font-size="12" fill="${C.txt3}">src/core/architecture.ts</text>

  <g font-family="DM Mono, monospace" font-size="13">
    <g fill="${C.txt3}" opacity="0.3">
      <text x="80" y="360">1</text><text x="80" y="382">2</text><text x="80" y="404">3</text>
      <text x="80" y="426">4</text><text x="80" y="448">5</text><text x="80" y="470">6</text>
      <text x="80" y="492">7</text><text x="80" y="514">8</text><text x="80" y="536">9</text>
      <text x="80" y="558">10</text><text x="80" y="580">11</text><text x="80" y="602">12</text>
      <text x="80" y="624">13</text><text x="80" y="646">14</text><text x="80" y="668">15</text>
      <text x="80" y="690">16</text><text x="80" y="712">17</text><text x="80" y="734">18</text>
      <text x="80" y="756">19</text><text x="80" y="778">20</text><text x="80" y="800">21</text>
    </g>
    <text x="110" y="360" fill="${C.em3}">export interface</text> <text x="270" y="360" fill="${C.txt}">SystemArch {</text>
    <text x="110" y="382" fill="${C.txt}">  modules: </text> <text x="220" y="382" fill="${C.em4}">Module[]</text><text x="310" y="382" fill="${C.txt}">;</text>
    <text x="110" y="404" fill="${C.txt}">  events: </text> <text x="205" y="404" fill="${C.em4}">EventBus</text><text x="295" y="404" fill="${C.txt}">;</text>
    <text x="110" y="426" fill="${C.txt}">  cache: </text> <text x="195" y="426" fill="${C.em4}">RedisLayer</text><text x="300" y="426" fill="${C.txt}">;</text>
    <text x="110" y="448" fill="${C.txt}">}</text>
    <text x="110" y="480" fill="${C.txt3}">// Cada módulo es independiente y autocontenido</text>
    <text x="110" y="502" fill="${C.txt3}">// Comunicación async vía eventos</text>
    <text x="110" y="534" fill="${C.em3}">export class</text> <text x="220" y="534" fill="${C.txt}">CoreEngine {</text>
    <text x="110" y="556" fill="${C.txt}">  </text> <text x="130" y="556" fill="${C.em3}">private</text> <text x="210" y="556" fill="${C.txt}"> arch: </text> <text x="290" y="556" fill="${C.em4}">SystemArch</text><text x="395" y="556" fill="${C.txt}">;</text>
    <text x="110" y="588" fill="${C.txt}">  </text> <text x="130" y="588" fill="${C.em3}">async</text> <text x="185" y="588" fill="${C.txt}"> init() {</text>
    <text x="130" y="610" fill="${C.em3}">    await</text> <text x="210" y="610" fill="${C.txt}"> </text> <text x="215" y="610" fill="${C.em3}">this</text> <text x="255" y="610" fill="${C.txt}">.loadModules();</text>
    <text x="130" y="632" fill="${C.em3}">    await</text> <text x="210" y="632" fill="${C.txt}"> </text> <text x="215" y="632" fill="${C.em3}">this</text> <text x="255" y="632" fill="${C.txt}">.connectEvents();</text>
    <text x="130" y="654" fill="${C.em3}">    await</text> <text x="210" y="654" fill="${C.txt}"> </text> <text x="215" y="654" fill="${C.em3}">this</text> <text x="255" y="654" fill="${C.txt}">.warmCache();</text>
    <text x="110" y="676" fill="${C.txt}">  }</text>
    <text x="110" y="708" fill="${C.txt}">  </text> <text x="130" y="708" fill="${C.em3}">private async</text> <text x="250" y="708" fill="${C.txt}"> loadModules() {</text>
    <text x="130" y="730" fill="${C.em3}">    for</text> <text x="175" y="730" fill="${C.txt}"> (</text> <text x="180" y="730" fill="${C.em3}">const</text> <text x="235" y="730" fill="${C.txt}"> m </text> <text x="260" y="730" fill="${C.em3}">of</text> <text x="285" y="730" fill="${C.txt}"> </text> <text x="290" y="730" fill="${C.em3}">this</text> <text x="325" y="730" fill="${C.txt}">.arch.modules) {</text>
    <text x="150" y="752" fill="${C.em3}">      await</text> <text x="230" y="752" fill="${C.txt}"> m.</text> <text x="250" y="752" fill="${C.em3}"> bootstrap</text> <text x="340" y="752" fill="${C.txt}">();</text>
    <text x="130" y="774" fill="${C.txt}">    }</text>
    <text x="110" y="796" fill="${C.txt}">  }</text>
    <text x="110" y="818" fill="${C.txt}">}</text>
  </g>

  ${bottomBar(1080)}
</svg>`;
}

// POST 1 — Story 9:16
function post1_story() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><filter id="g1"><feGaussianBlur stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1920" fill="${C.bg}"/>
  ${grid(1080, 1920, 0.02)}
  <circle cx="540" cy="400" r="300" fill="${C.em}" opacity="0.05" filter="url(#g1)"/>

  ${badge('TECH AUTHORITY', 100)}
  ${isotipo(920, 95)}

  <text x="60" y="220" font-family="Syne, sans-serif" font-weight="800" font-size="56" fill="${C.txt}">Cómo diseñamos</text>
  <text x="60" y="290" font-family="Syne, sans-serif" font-weight="800" font-size="56" fill="${C.em3}">la arquitectura</text>
  <text x="60" y="350" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}">Sistemas modulares que escalan.</text>

  <rect x="60" y="420" width="960" height="800" rx="16" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <rect x="60" y="420" width="960" height="44" rx="16" fill="${C.bg3}"/>
  <rect x="60" y="448" width="960" height="16" fill="${C.bg3}"/>
  <circle cx="90" cy="442" r="6" fill="#FF5F56"/>
  <circle cx="110" cy="442" r="6" fill="#FFBD2E"/>
  <circle cx="130" cy="442" r="6" fill="#27C93F"/>
  <text x="160" y="447" font-family="DM Mono, monospace" font-size="12" fill="${C.txt3}">src/core/architecture.ts</text>

  <g font-family="DM Mono, monospace" font-size="14">
    <text x="110" y="500" fill="${C.em3}">export interface</text> <text x="290" y="500" fill="${C.txt}">SystemArch {</text>
    <text x="110" y="528" fill="${C.txt}">  modules: </text> <text x="230" y="528" fill="${C.em4}">Module[]</text><text x="325" y="528" fill="${C.txt}">;</text>
    <text x="110" y="556" fill="${C.txt}">  events: </text> <text x="215" y="556" fill="${C.em4}">EventBus</text><text x="310" y="556" fill="${C.txt}">;</text>
    <text x="110" y="584" fill="${C.txt}">  cache: </text> <text x="205" y="584" fill="${C.em4}">RedisLayer</text><text x="315" y="584" fill="${C.txt}">;</text>
    <text x="110" y="612" fill="${C.txt}">}</text>
    <text x="110" y="650" fill="${C.txt3}">// Módulos independientes</text>
    <text x="110" y="678" fill="${C.txt3}">// Comunicación async vía eventos</text>
    <text x="110" y="716" fill="${C.em3}">export class</text> <text x="240" y="716" fill="${C.txt}">CoreEngine {</text>
    <text x="110" y="744" fill="${C.txt}">  </text> <text x="130" y="744" fill="${C.em3}">private</text> <text x="220" y="744" fill="${C.txt}"> arch;</text>
    <text x="110" y="782" fill="${C.txt}">  </text> <text x="130" y="782" fill="${C.em3}">async</text> <text x="195" y="782" fill="${C.txt}"> init() {</text>
    <text x="130" y="810" fill="${C.em3}">    await</text> <text x="220" y="810" fill="${C.txt}"> </text> <text x="225" y="810" fill="${C.em3}">this</text> <text x="270" y="810" fill="${C.txt}">.loadModules();</text>
    <text x="130" y="838" fill="${C.em3}">    await</text> <text x="220" y="838" fill="${C.txt}"> </text> <text x="225" y="838" fill="${C.em3}">this</text> <text x="270" y="838" fill="${C.txt}">.connectEvents();</text>
    <text x="130" y="866" fill="${C.em3}">    await</text> <text x="220" y="866" fill="${C.txt}"> </text> <text x="225" y="866" fill="${C.em3}">this</text> <text x="270" y="866" fill="${C.txt}">.warmCache();</text>
    <text x="110" y="894" fill="${C.txt}">  }</text>
    <text x="110" y="932" fill="${C.txt}">  </text> <text x="130" y="932" fill="${C.em3}">private async</text> <text x="270" y="932" fill="${C.txt}"> loadModules() {</text>
    <text x="130" y="960" fill="${C.em3}">    for</text> <text x="180" y="960" fill="${C.txt}"> (</text> <text x="185" y="960" fill="${C.em3}">const</text> <text x="245" y="960" fill="${C.txt}"> m </text> <text x="275" y="960" fill="${C.em3}">of</text> <text x="305" y="960" fill="${C.txt}"> </text> <text x="310" y="960" fill="${C.em3}">this</text> <text x="350" y="960" fill="${C.txt}">.arch.modules) {</text>
    <text x="150" y="988" fill="${C.em3}">      await</text> <text x="240" y="988" fill="${C.txt}"> m.bootstrap();</text>
    <text x="130" y="1016" fill="${C.txt}">    }</text>
    <text x="110" y="1044" fill="${C.txt}">  }</text>
    <text x="110" y="1072" fill="${C.txt}">}</text>
  </g>

  <text x="540" y="1350" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.txt}" text-anchor="middle">Modular. Escalable.</text>
  <text x="540" y="1410" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.em3}" text-anchor="middle">Maintainable.</text>

  <rect x="60" y="1480" width="960" height="3" rx="1.5" fill="${C.em}" opacity="0.3"/>

  ${bottomBar(1920)}
</svg>`;
}

// =============================================
// POST 2: SERVICES — Qué hace NEXA
// =============================================
function post2_ig() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="g2"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <circle cx="880" cy="200" r="250" fill="${C.em}" opacity="0.04" filter="url(#g2)"/>
  ${badge('SERVICIOS')}
  ${isotipo(920, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.txt}">Construimos</text>
  <text x="60" y="210" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.em3}">lo que necesitás.</text>

  ${[
    { icon: '01', title: 'Desarrollo Web', desc: 'Apps fullstack con React, Next.js, Node.', y: 280 },
    { icon: '02', title: 'Apps Móviles', desc: 'iOS y Android con React Native y Flutter.', y: 400 },
    { icon: '03', title: 'Software a Medida', desc: 'Sistemas ERP, CRM, plataformas SaaS.', y: 520 },
    { icon: '04', title: 'APIs &amp; Backend', desc: 'Microservicios, REST, GraphQL, WebSockets.', y: 640 },
    { icon: '05', title: 'UI/UX Design', desc: 'Interfaces que se sienten premium.', y: 760 },
  ].map(s => `
    <g>
      <rect x="60" y="${s.y}" width="960" height="100" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${s.y}" width="4" height="100" rx="2" fill="${C.em}" opacity="0.6"/>
      <text x="100" y="${s.y + 45}" font-family="Syne, sans-serif" font-weight="800" font-size="24" fill="${C.em}" opacity="0.25">${s.icon}</text>
      <text x="150" y="${s.y + 40}" font-family="Syne, sans-serif" font-weight="700" font-size="20" fill="${C.txt}">${s.title}</text>
      <text x="150" y="${s.y + 68}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">${s.desc}</text>
    </g>
  `).join('')}

  ${bottomBar(1080)}
</svg>`;
}

// POST 2 — Carrusel (3 slides)
function post2_carrusel() {
  const slides = [];
  // Slide 1 — Cover
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="gc1"><feGaussianBlur stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <circle cx="540" cy="500" r="300" fill="${C.em}" opacity="0.06" filter="url(#gc1)"/>
  ${isotipo(470, 350, 1.2)}
  <text x="540" y="620" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.txt}" text-anchor="middle">Qué hace NEXA</text>
  <text x="540" y="670" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}" text-anchor="middle">Desarrollo de software a otro nivel.</text>
  <text x="540" y="780" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt3}" text-anchor="middle">Deslizá para ver nuestros servicios →</text>
  ${bottomBar(1080)}
</svg>`);

  // Slide 2 — Services grid
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <text x="60" y="100" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.txt}">Nuestros servicios</text>
  <rect x="60" y="120" width="80" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  ${[
    { title: 'Desarrollo Web', desc: 'React, Next.js, Vite.\nFullstack moderno.', x: 60, y: 170 },
    { title: 'Apps Móviles', desc: 'React Native, Flutter.\niOS y Android.', x: 560, y: 170 },
    { title: 'Software a Medida', desc: 'ERP, CRM, SaaS.\nEscalable y robusto.', x: 60, y: 420 },
    { title: 'APIs &amp; Backend', desc: 'Node, Go, Python.\nMicroservicios.', x: 560, y: 420 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="${s.y}" width="460" height="220" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 30}" y="${s.y + 50}" font-family="Syne, sans-serif" font-weight="700" font-size="22" fill="${C.em3}">${s.title}</text>
      ${s.desc.split('\n').map((line, i) => `<text x="${s.x + 30}" y="${s.y + 90 + i * 28}" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}">${line}</text>`).join('')}
    </g>
  `).join('')}

  <text x="60" y="740" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.txt}">Stack tecnológico</text>
  <rect x="60" y="760" width="80" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>
  <g transform="translate(60, 790)">
    ${['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Redis', 'Docker', 'AWS'].map((t, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      return `<rect x="${col * 200}" y="${row * 45}" width="180" height="35" rx="8" fill="${C.bg3}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${col * 200 + 90}" y="${row * 45 + 23}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.em3}" text-anchor="middle">${t}</text>`;
    }).join('')}
  </g>

  ${bottomBar(1080)}
</svg>`);

  // Slide 3 — CTA
  slides.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="gc3"><feGaussianBlur stdDeviation="50" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <circle cx="540" cy="480" r="350" fill="${C.em}" opacity="0.05" filter="url(#gc3)"/>

  <text x="540" y="380" font-family="Syne, sans-serif" font-weight="800" font-size="56" fill="${C.txt}" text-anchor="middle">¿Tenés un proyecto</text>
  <text x="540" y="450" font-family="Syne, sans-serif" font-weight="800" font-size="56" fill="${C.em3}" text-anchor="middle">en mente?</text>

  <rect x="340" y="530" width="400" height="60" rx="30" fill="${C.em}"/>
  <text x="540" y="568" font-family="Syne, sans-serif" font-weight="700" font-size="18" fill="${C.bg}" text-anchor="middle">HABLEMOS</text>

  <text x="540" y="660" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}" text-anchor="middle">nexa.design</text>

  ${isotipo(485, 730, 0.8)}
  ${bottomBar(1080)}
</svg>`);

  return slides;
}

// =============================================
// POST 3: EDUCACIÓN — Tips de desarrollo
// =============================================
function post3_ig() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="g3"><feGaussianBlur stdDeviation="25" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <circle cx="540" cy="400" r="300" fill="${C.em}" opacity="0.03" filter="url(#g3)"/>
  ${badge('EDUCACIÓN')}
  ${isotipo(920, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">5 prácticas que todo</text>
  <text x="60" y="205" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">dev debería seguir</text>
  <text x="60" y="245" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}">Swipe para ver cada una →</text>

  ${[
    { num: '01', title: 'TypeScript SIEMPRE', desc: 'Tipos fuertes = menos bugs en producción.' },
    { num: '02', title: 'Tests antes de feature', desc: 'TDD no es lento, es inversión en velocidad.' },
    { num: '03', title: 'Modular el código', desc: 'Si un archivo tiene +300 líneas, separalo.' },
    { num: '04', title: 'Code Review obligatorio', desc: 'Un segundo par de ojos previene errores críticos.' },
    { num: '05', title: 'Documentar desde día 1', desc: 'Tu futuro yo te lo va a agradecer.' },
  ].map((t, i) => `
    <g>
      <rect x="60" y="${280 + i * 130}" width="960" height="110" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${280 + i * 130}" width="4" height="110" rx="2" fill="${C.em}" opacity="0.6"/>
      <text x="100" y="${280 + i * 130 + 48}" font-family="Syne, sans-serif" font-weight="800" font-size="26" fill="${C.em}" opacity="0.25">${t.num}</text>
      <text x="155" y="${280 + i * 130 + 42}" font-family="Syne, sans-serif" font-weight="700" font-size="19" fill="${C.txt}">${t.title}</text>
      <text x="155" y="${280 + i * 130 + 72}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">${t.desc}</text>
    </g>
  `).join('')}

  ${bottomBar(1080)}
</svg>`;
}

// POST 3 — Story
function post3_story() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><filter id="g3s"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1920" fill="${C.bg}"/>
  ${grid(1080, 1920, 0.02)}
  <circle cx="540" cy="350" r="250" fill="${C.em}" opacity="0.04" filter="url(#g3s)"/>

  ${badge('EDUCACIÓN', 100)}
  ${isotipo(920, 95)}

  <text x="60" y="220" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.txt}">5 prácticas que</text>
  <text x="60" y="285" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.em3}">todo dev debería</text>
  <text x="60" y="350" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.em3}">seguir</text>

  ${[
    { num: '01', title: 'TypeScript SIEMPRE', desc: 'Tipos fuertes = menos bugs en producción.' },
    { num: '02', title: 'Tests antes de feature', desc: 'TDD no es lento, es inversión en velocidad.' },
    { num: '03', title: 'Modular el código', desc: 'Si un archivo tiene +300 líneas, separalo.' },
    { num: '04', title: 'Code Review obligatorio', desc: 'Un segundo par de ojos previene errores críticos.' },
    { num: '05', title: 'Documentar desde día 1', desc: 'Tu futuro yo te lo va a agradecer.' },
  ].map((t, i) => `
    <g>
      <rect x="60" y="${420 + i * 170}" width="960" height="145" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${420 + i * 170}" width="4" height="145" rx="2" fill="${C.em}" opacity="0.6"/>
      <text x="100" y="${420 + i * 170 + 55}" font-family="Syne, sans-serif" font-weight="800" font-size="30" fill="${C.em}" opacity="0.25">${t.num}</text>
      <text x="160" y="${420 + i * 170 + 50}" font-family="Syne, sans-serif" font-weight="700" font-size="22" fill="${C.txt}">${t.title}</text>
      <text x="160" y="${420 + i * 170 + 85}" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}">${t.desc}</text>
    </g>
  `).join('')}

  ${bottomBar(1920)}
</svg>`;
}

// =============================================
// POST 4: BRAND STORY — Visión
// =============================================
function post4_ig() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="g4"><feGaussianBlur stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  ${topoLines(200, 700)}
  <circle cx="540" cy="500" r="350" fill="${C.em}" opacity="0.04" filter="url(#g4)"/>

  ${badge('BRAND STORY')}
  ${isotipo(920, 55)}

  <text x="540" y="200" font-family="Syne, sans-serif" font-weight="800" font-size="70" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="260" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.txt}">No somos una</text>
  <text x="60" y="320" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.txt}">agencia más.</text>
  <text x="60" y="400" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.em3}">Somos ingenieros</text>
  <text x="60" y="460" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.em3}">que construyen.</text>

  <rect x="60" y="510" width="100" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="560" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}">NEXA existe para resolver problemas reales</text>
  <text x="60" y="590" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}">con tecnologia que funciona. Sin atajos.</text>
  <text x="60" y="620" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}">Sin humo. Solo codigo que escala.</text>

  ${[
    { value: '2', label: 'Fundadores', x: 60 },
    { value: '30+', label: 'Proyectos', x: 290 },
    { value: '99.9%', label: 'Uptime', x: 520 },
    { value: '24/7', label: 'Compromiso', x: 750 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="670" width="210" height="90" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 105}" y="${s.y + 40}" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">${s.value}</text>
      <text x="${s.x + 105}" y="${s.y + 65}" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
    </g>
  `).join('')}

  ${bottomBar(1080)}
</svg>`;
}

// POST 4 — Story
function post4_story() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><filter id="g4s"><feGaussianBlur stdDeviation="50" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1920" fill="${C.bg}"/>
  ${grid(1080, 1920, 0.02)}
  ${topoLines(300, 1200)}
  <circle cx="540" cy="700" r="400" fill="${C.em}" opacity="0.04" filter="url(#g4s)"/>

  ${badge('BRAND STORY', 100)}
  ${isotipo(920, 95)}

  <text x="540" y="280" font-family="Syne, sans-serif" font-weight="800" font-size="90" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="360" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.txt}">No somos una</text>
  <text x="60" y="430" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.txt}">agencia más.</text>
  <text x="60" y="530" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.em3}">Somos ingenieros</text>
  <text x="60" y="600" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.em3}">que construyen.</text>

  <rect x="60" y="660" width="120" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="730" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}">NEXA existe para resolver problemas reales</text>
  <text x="60" y="765" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}">con tecnología que funciona.</text>
  <text x="60" y="800" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}">Sin atajos. Sin humo. Solo código que escala.</text>

  ${[
    { value: '2', label: 'Fundadores', x: 60 },
    { value: '30+', label: 'Proyectos', x: 560 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="870" width="460" height="100" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 230}" y="${s.y + 45}" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.em3}" text-anchor="middle">${s.value}</text>
      <text x="${s.x + 230}" y="${s.y + 75}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
    </g>
  `).join('')}

  ${[
    { value: '99.9%', label: 'Uptime', x: 60 },
    { value: '24/7', label: 'Compromiso', x: 560 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="990" width="460" height="100" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 230}" y="${s.y + 45}" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.em3}" text-anchor="middle">${s.value}</text>
      <text x="${s.x + 230}" y="${s.y + 75}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
    </g>
  `).join('')}

  ${bottomBar(1920)}
</svg>`;
}

// =============================================
// POST 5: SOCIAL PROOF — Portfolio
// =============================================
function post5_ig() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><filter id="g5"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1080" height="1080" fill="${C.bg}"/>
  ${grid(1080, 1080, 0.02)}
  <circle cx="200" cy="200" r="200" fill="${C.em}" opacity="0.04" filter="url(#g5)"/>
  <circle cx="880" cy="800" r="250" fill="${C.em3}" opacity="0.03" filter="url(#g5)"/>

  ${badge('SOCIAL PROOF')}
  ${isotipo(920, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.txt}">Nuestro</text>
  <text x="60" y="210" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.em3}">trabajo habla.</text>

  <text x="540" y="380" font-family="Syne, sans-serif" font-weight="800" font-size="120" fill="${C.em}" opacity="0.1" text-anchor="middle">30+</text>
  <text x="540" y="430" font-family="DM Sans, sans-serif" font-size="18" fill="${C.txt2}" text-anchor="middle">proyectos entregados</text>

  <g transform="translate(60, 480)">
    ${[
      { value: '100%', label: 'Proyectos a tiempo', x: 0 },
      { value: '0', label: 'Proyectos abandonados', x: 250 },
      { value: '&lt;24h', label: 'Tiempo de respuesta', x: 500 },
      { value: '5/5', label: 'Satisfacción client', x: 750 },
    ].map(s => `
      <g transform="translate(${s.x}, 0)">
        <rect x="0" y="0" width="220" height="90" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="110" y="38" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">${s.value}</text>
        <text x="110" y="65" font-family="DM Sans, sans-serif" font-size="11" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
      </g>
    `).join('')}
  </g>

  <g transform="translate(60, 600)">
    <rect x="0" y="0" width="960" height="140" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <rect x="0" y="0" width="4" height="140" rx="2" fill="${C.em}" opacity="0.6"/>
    <text x="40" y="35" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">"NEXA entregó exactamente lo que necesitábamos."</text>
    <text x="40" y="65" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">— Cliente verificado, plataforma SaaS</text>
    <g transform="translate(40, 85)">
      ${Array.from({length: 5}, (_, i) => `<text x="${i * 22}" y="0" font-size="18" fill="${C.em3}">★</text>`).join('')}
    </g>
  </g>

  ${bottomBar(1080)}
</svg>`;
}

// POST 5 — LinkedIn
function post5_linkedin() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="627" viewBox="0 0 1200 627">
  <defs><filter id="g5l"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1200" height="627" fill="${C.bg}"/>
  ${grid(1200, 627, 0.02)}
  <circle cx="300" cy="300" r="200" fill="${C.em}" opacity="0.04" filter="url(#g5l)"/>

  ${badge('SOCIAL PROOF')}
  ${isotipo(1060, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.txt}">Nuestro trabajo</text>
  <text x="60" y="205" font-family="Syne, sans-serif" font-weight="800" font-size="42" fill="${C.em3}">habla por sí solo.</text>

  <g transform="translate(60, 250)">
    ${[
      { value: '30+', label: 'Proyectos', x: 0 },
      { value: '100%', label: 'A tiempo', x: 260 },
      { value: '&lt;24h', label: 'Respuesta', x: 520 },
      { value: '5/5', label: 'Satisfacción', x: 780 },
    ].map(s => `
      <g transform="translate(${s.x}, 0)">
        <rect x="0" y="0" width="230" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="115" y="35" font-family="Syne, sans-serif" font-weight="800" font-size="26" fill="${C.em3}" text-anchor="middle">${s.value}</text>
        <text x="115" y="60" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
      </g>
    `).join('')}
  </g>

  <rect x="60" y="380" width="1080" height="3" rx="1.5" fill="${C.em}" opacity="0.2"/>

  <text x="60" y="430" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}">Desarrollo de software profesional. Web, móvil, APIs, SaaS.</text>
  <text x="60" y="460" font-family="DM Sans, sans-serif" font-size="16" fill="${C.txt2}">Soluciones escalables para empresas que quieren crecer.</text>

  <text x="60" y="530" font-family="Syne, sans-serif" font-weight="700" font-size="18" fill="${C.em3}">nexa.design</text>

  <g>
    <rect x="60" y="560" width="200" height="40" rx="20" fill="${C.em}" opacity="0.15"/>
    <text x="160" y="586" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle">VER PORTFOLIO</text>
  </g>

  <text x="1140" y="600" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

// =============================================
// X/TWITTER VERSIONS (1600x900)
// =============================================
function post1_x() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><filter id="gx1"><feGaussianBlur stdDeviation="25" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1600" height="900" fill="${C.bg}"/>
  ${grid(1600, 900, 0.02)}
  <circle cx="300" cy="400" r="250" fill="${C.em}" opacity="0.04" filter="url(#gx1)"/>

  ${badge('TECH AUTHORITY')}
  ${isotipo(1460, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">Arquitectura de software</text>
  <text x="60" y="205" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">que escala.</text>

  <rect x="60" y="250" width="700" height="520" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <rect x="60" y="250" width="700" height="38" rx="14" fill="${C.bg3}"/>
  <rect x="60" y="274" width="700" height="14" fill="${C.bg3}"/>
  <circle cx="85" cy="269" r="5" fill="#FF5F56"/>
  <circle cx="102" cy="269" r="5" fill="#FFBD2E"/>
  <circle cx="119" cy="269" r="5" fill="#27C93F"/>
  <text x="140" y="274" font-family="DM Mono, monospace" font-size="11" fill="${C.txt3}">src/core/architecture.ts</text>

  <g font-family="DM Mono, monospace" font-size="12">
    <text x="90" y="320" fill="${C.em3}">export interface</text> <text x="240" y="320" fill="${C.txt}">SystemArch {</text>
    <text x="90" y="340" fill="${C.txt}">  modules: </text> <text x="195" y="340" fill="${C.em4}">Module[]</text><text x="280" y="340" fill="${C.txt}">;</text>
    <text x="90" y="360" fill="${C.txt}">  events: </text> <text x="185" y="360" fill="${C.em4}">EventBus</text><text x="270" y="360" fill="${C.txt}">;</text>
    <text x="90" y="380" fill="${C.txt}">  cache: </text> <text x="175" y="380" fill="${C.em4}">RedisLayer</text><text x="275" y="380" fill="${C.txt}">;</text>
    <text x="90" y="400" fill="${C.txt}">}</text>
    <text x="90" y="430" fill="${C.em3}">export class</text> <text x="200" y="430" fill="${C.txt}">CoreEngine {</text>
    <text x="90" y="450" fill="${C.txt}">  </text> <text x="105" y="450" fill="${C.em3}">async</text> <text x="155" y="450" fill="${C.txt}"> init() {</text>
    <text x="110" y="470" fill="${C.em3}">    await</text> <text x="185" y="470" fill="${C.txt}"> </text> <text x="190" y="470" fill="${C.em3}">this</text> <text x="225" y="470" fill="${C.txt}">.loadModules();</text>
    <text x="110" y="490" fill="${C.em3}">    await</text> <text x="185" y="490" fill="${C.txt}"> </text> <text x="190" y="490" fill="${C.em3}">this</text> <text x="225" y="490" fill="${C.txt}">.connectEvents();</text>
    <text x="110" y="510" fill="${C.em3}">    await</text> <text x="185" y="510" fill="${C.txt}"> </text> <text x="190" y="510" fill="${C.em3}">this</text> <text x="225" y="510" fill="${C.txt}">.warmCache();</text>
    <text x="90" y="530" fill="${C.txt}">  }</text>
    <text x="90" y="555" fill="${C.txt}">  </text> <text x="105" y="555" fill="${C.em3}">private async</text> <text x="220" y="555" fill="${C.txt}"> loadModules() {</text>
    <text x="110" y="575" fill="${C.em3}">    for</text> <text x="155" y="575" fill="${C.txt}"> (</text> <text x="160" y="575" fill="${C.em3}">const</text> <text x="210" y="575" fill="${C.txt}"> m </text> <text x="235" y="575" fill="${C.em3}">of</text> <text x="260" y="575" fill="${C.txt}"> </text> <text x="265" y="575" fill="${C.em3}">this</text> <text x="300" y="575" fill="${C.txt}">.arch.modules) {</text>
    <text x="130" y="595" fill="${C.em3}">      await</text> <text x="210" y="595" fill="${C.txt}"> m.bootstrap();</text>
    <text x="110" y="615" fill="${C.txt}">    }</text>
    <text x="90" y="635" fill="${C.txt}">  }</text>
    <text x="90" y="655" fill="${C.txt}">}</text>
  </g>

  <g transform="translate(820, 250)">
    <text x="0" y="0" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Pilares:</text>
    ${['Módulos independientes', 'Event-driven async', 'Cache distribuido', 'Type-safe everywhere', 'Zero-downtime deploys'].map((t, i) => `
      <g transform="translate(0, ${25 + i * 35})">
        <rect x="0" y="0" width="8" height="8" rx="2" fill="${C.em}" opacity="0.6"/>
        <text x="20" y="8" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">${t}</text>
      </g>
    `).join('')}
  </g>

  <text x="820" y="540" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">nexa.design</text>
  <text x="1540" y="870" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

function post2_x() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><filter id="gx2"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1600" height="900" fill="${C.bg}"/>
  ${grid(1600, 900, 0.02)}
  <circle cx="1300" cy="300" r="250" fill="${C.em}" opacity="0.04" filter="url(#gx2)"/>

  ${badge('SERVICIOS')}
  ${isotipo(1460, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">Construimos lo que</text>
  <text x="60" y="205" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">necesitás.</text>

  ${[
    { title: 'Desarrollo Web', desc: 'React, Next.js, Vite. Fullstack.', x: 60, y: 260 },
    { title: 'Apps Móviles', desc: 'React Native, Flutter.', x: 420, y: 260 },
    { title: 'Software a Medida', desc: 'ERP, CRM, SaaS.', x: 780, y: 260 },
    { title: 'APIs &amp; Backend', desc: 'Node, Go, Python.', x: 60, y: 400 },
    { title: 'UI/UX Design', desc: 'Interfaces premium.', x: 420, y: 400 },
    { title: 'DevOps &amp; Cloud', desc: 'AWS, Docker, CI/CD.', x: 780, y: 400 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="${s.y}" width="340" height="110" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 20}" y="${s.y + 40}" font-family="Syne, sans-serif" font-weight="700" font-size="18" fill="${C.em3}">${s.title}</text>
      <text x="${s.x + 20}" y="${s.y + 68}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">${s.desc}</text>
    </g>
  `).join('')}

  <text x="60" y="600" font-family="DM Sans, sans-serif" font-size="15" fill="${C.txt2}">Stack: React · Next.js · Node · TypeScript · Tailwind · PostgreSQL · Redis · Docker · AWS</text>

  <text x="60" y="660" font-family="Syne, sans-serif" font-weight="700" font-size="18" fill="${C.em3}">nexa.design</text>

  <text x="1540" y="870" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

function post3_x() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><filter id="gx3"><feGaussianBlur stdDeviation="25" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1600" height="900" fill="${C.bg}"/>
  ${grid(1600, 900, 0.02)}
  <circle cx="540" cy="400" r="250" fill="${C.em}" opacity="0.03" filter="url(#gx3)"/>

  ${badge('EDUCACIÓN')}
  ${isotipo(1460, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="40" fill="${C.txt}">5 prácticas que todo</text>
  <text x="60" y="200" font-family="Syne, sans-serif" font-weight="800" font-size="40" fill="${C.em3}">dev debería seguir</text>

  ${[
    { num: '01', title: 'TypeScript SIEMPRE', desc: 'Tipos fuertes = menos bugs.' },
    { num: '02', title: 'Tests antes de feature', desc: 'TDD es inversión en velocidad.' },
    { num: '03', title: 'Modular el código', desc: '+300 líneas = separalo.' },
    { num: '04', title: 'Code Review', desc: 'Un segundo par de ojos previene errores.' },
    { num: '05', title: 'Documentar desde día 1', desc: 'Tu futuro yo te lo agradece.' },
  ].map((t, i) => `
    <g>
      <rect x="60" y="${250 + i * 110}" width="700" height="90" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${250 + i * 110}" width="4" height="90" rx="2" fill="${C.em}" opacity="0.6"/>
      <text x="100" y="${250 + i * 110 + 40}" font-family="Syne, sans-serif" font-weight="800" font-size="22" fill="${C.em}" opacity="0.25">${t.num}</text>
      <text x="145" y="${250 + i * 110 + 35}" font-family="Syne, sans-serif" font-weight="700" font-size="17" fill="${C.txt}">${t.title}</text>
      <text x="145" y="${250 + i * 110 + 60}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt2}">${t.desc}</text>
    </g>
  `).join('')}

  <text x="820" y="350" font-family="Syne, sans-serif" font-weight="800" font-size="80" fill="${C.em}" opacity="0.06">DEV</text>
  <text x="820" y="450" font-family="Syne, sans-serif" font-weight="800" font-size="80" fill="${C.em}" opacity="0.04">TIPS</text>

  <text x="60" y="850" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.em3}">nexa.design</text>
  <text x="1540" y="870" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

function post4_x() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><filter id="gx4"><feGaussianBlur stdDeviation="40" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1600" height="900" fill="${C.bg}"/>
  ${grid(1600, 900, 0.02)}
  ${topoLines(200, 600)}
  <circle cx="800" cy="450" r="350" fill="${C.em}" opacity="0.04" filter="url(#gx4)"/>

  ${badge('BRAND STORY')}
  ${isotipo(1460, 55)}

  <text x="540" y="200" font-family="Syne, sans-serif" font-weight="800" font-size="70" fill="${C.em}" opacity="0.06" text-anchor="middle">"</text>

  <text x="60" y="280" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">No somos una agencia más.</text>
  <text x="60" y="350" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">Somos ingenieros que construyen.</text>

  <rect x="60" y="400" width="100" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <text x="60" y="450" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}">NEXA existe para resolver problemas reales con tecnología</text>
  <text x="60" y="480" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}">que funciona. Sin atajos. Sin humo. Solo código que escala.</text>

  ${[
    { value: '2', label: 'Fundadores', x: 60 },
    { value: '30+', label: 'Proyectos', x: 320 },
    { value: '99.9%', label: 'Uptime', x: 580 },
    { value: '24/7', label: 'Compromiso', x: 840 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="540" width="240" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 120}" y="${s.y + 35}" font-family="Syne, sans-serif" font-weight="800" font-size="26" fill="${C.em3}" text-anchor="middle">${s.value}</text>
      <text x="${s.x + 120}" y="${s.y + 60}" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
    </g>
  `).join('')}

  <text x="60" y="850" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.em3}">nexa.design</text>
  <text x="1540" y="870" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

function post5_x() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><filter id="gx5"><feGaussianBlur stdDeviation="30" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="1600" height="900" fill="${C.bg}"/>
  ${grid(1600, 900, 0.02)}
  <circle cx="300" cy="300" r="200" fill="${C.em}" opacity="0.04" filter="url(#gx5)"/>
  <circle cx="1300" cy="700" r="250" fill="${C.em3}" opacity="0.03" filter="url(#gx5)"/>

  ${badge('SOCIAL PROOF')}
  ${isotipo(1460, 55)}

  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">Nuestro trabajo</text>
  <text x="60" y="205" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">habla por sí solo.</text>

  <text x="400" y="420" font-family="Syne, sans-serif" font-weight="800" font-size="140" fill="${C.em}" opacity="0.1" text-anchor="middle">30+</text>
  <text x="400" y="470" font-family="DM Sans, sans-serif" font-size="18" fill="${C.txt2}" text-anchor="middle">proyectos entregados</text>

  ${[
    { value: '100%', label: 'A tiempo', x: 820, y: 280 },
    { value: '0', label: 'Abandonados', x: 1100, y: 280 },
    { value: '&lt;24h', label: 'Respuesta', x: 820, y: 420 },
    { value: '5/5', label: 'Satisfacción', x: 1100, y: 420 },
  ].map(s => `
    <g>
      <rect x="${s.x}" y="${s.y}" width="250" height="100" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <text x="${s.x + 125}" y="${s.y + 42}" font-family="Syne, sans-serif" font-weight="800" font-size="30" fill="${C.em3}" text-anchor="middle">${s.value}</text>
      <text x="${s.x + 125}" y="${s.y + 70}" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
    </g>
  `).join('')}

  <text x="60" y="620" font-family="DM Sans, sans-serif" font-size="15" fill="${C.txt2}">Desarrollo de software profesional. Web, móvil, APIs, SaaS.</text>
  <text x="60" y="650" font-family="DM Sans, sans-serif" font-size="15" fill="${C.txt2}">Soluciones escalables para empresas que quieren crecer.</text>

  <text x="60" y="720" font-family="Syne, sans-serif" font-weight="700" font-size="18" fill="${C.em3}">nexa.design</text>

  <text x="1540" y="870" font-family="Syne, sans-serif" font-weight="700" font-size="14" fill="${C.txt3}" text-anchor="end">NEXA</text>
</svg>`;
}

// =============================================
// RENDER ALL
// =============================================
const allPosts = [
  // Instagram Posts (1080x1080)
  { svg: post1_ig(), name: 'ig/01-tech-authority.png' },
  { svg: post2_ig(), name: 'ig/02-services.png' },
  { svg: post3_ig(), name: 'ig/03-education.png' },
  { svg: post4_ig(), name: 'ig/04-brand-story.png' },
  { svg: post5_ig(), name: 'ig/05-social-proof.png' },

  // Instagram Stories (1080x1920)
  { svg: post1_story(), name: 'stories/01-tech-authority.png' },
  { svg: post3_story(), name: 'stories/03-education.png' },
  { svg: post4_story(), name: 'stories/04-brand-story.png' },

  // X/Twitter (1600x900)
  { svg: post1_x(), name: 'x/01-tech-authority.png' },
  { svg: post2_x(), name: 'x/02-services.png' },
  { svg: post3_x(), name: 'x/03-education.png' },
  { svg: post4_x(), name: 'x/04-brand-story.png' },
  { svg: post5_x(), name: 'x/05-social-proof.png' },

  // LinkedIn (1200x627)
  { svg: post5_linkedin(), name: 'linkedin/05-social-proof.png' },
];

// Carruseles (multi-slide)
const carruselSlides = post2_carrusel();
carruselSlides.forEach((svg, i) => {
  allPosts.push({ svg, name: `carrusel/02-services-slide${i + 1}.png` });
});

console.log('Rendering NEXA social media posts (focused on dev brand)...\n');

// Create subdirectories
const subdirs = ['ig', 'stories', 'x', 'linkedin', 'carrusel'];
for (const dir of subdirs) {
  const dirPath = path.join(outDir, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

for (const post of allPosts) {
  renderSvg(post.svg, post.name, 2);
}

console.log('\nDone! All posts rendered to:', outDir);
