const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const outDir = path.join(__dirname, 'posts');
const fontDir = path.join(__dirname, '..', 'brand', 'fonts');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const fontFiles = fs.readdirSync(fontDir)
  .filter(f => /\.(ttf|otf|woff2?)$/i.test(f))
  .map(f => path.join(fontDir, f));

const W = 1080;
const H = 1080;

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

function renderSvg(svgContent, filename, scale = 2) {
  const r = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: W * scale },
    background: 'transparent',
    font: { fontFiles },
  });
  const inst = r.render();
  const png = Buffer.from(inst.asPng());
  const outPath = path.join(outDir, filename.replace('.svg', '.png'));
  fs.writeFileSync(outPath, png);
  console.log(`${filename.replace('.svg', '.png')} — ${W * scale}x${H * scale}px — ${(png.length / 1024).toFixed(0)}KB`);
}

// =============================================
// POST 1: PRODUCT SHOWCASE — NexaPanel Dashboard
// =============================================
const post1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="emGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.em4}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${C.em}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="cardClip"><rect x="60" y="200" width="960" height="620" rx="16"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04" stroke="${C.em}" stroke-width="0.5" fill="none">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${H}"/>`).join('\n    ')}
    ${Array.from({length: 20}, (_, i) => `<line x1="0" y1="${i * 60}" x2="${W}" y2="${i * 60}"/>`).join('\n    ')}
  </g>

  <!-- Topographic lines -->
  <g opacity="0.06" stroke="${C.em3}" stroke-width="1" fill="none">
    <path d="M0,100 Q270,60 540,120 T1080,80"/>
    <path d="M0,140 Q270,100 540,160 T1080,120"/>
    <path d="M0,180 Q270,140 540,200 T1080,160"/>
  </g>

  <!-- Glow orb top right -->
  <circle cx="900" cy="150" r="200" fill="${C.em}" opacity="0.06" filter="url(#glow)"/>

  <!-- Badge -->
  <rect x="60" y="60" width="140" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="130" y="84" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">PRODUCTO</text>

  <!-- Isotipo small -->
  <g transform="translate(920, 55) scale(0.35)">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>

  <!-- Title -->
  <text x="60" y="140" font-family="Syne, sans-serif" font-weight="800" font-size="52" fill="${C.txt}">NexaPanel</text>
  <text x="60" y="185" font-family="DM Sans, sans-serif" font-weight="400" font-size="20" fill="${C.txt2}">Tu panel SMM. Potencia infinita.</text>

  <!-- Dashboard mockup card -->
  <g clip-path="url(#cardClip)">
    <rect x="60" y="200" width="960" height="620" rx="16" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>

    <!-- Top bar -->
    <rect x="60" y="200" width="960" height="50" fill="${C.bg3}"/>
    <circle cx="90" cy="225" r="6" fill="#FF5F56"/>
    <circle cx="110" cy="225" r="6" fill="#FFBD2E"/>
    <circle cx="130" cy="225" r="6" fill="#27C93F"/>
    <text x="540" y="230" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="middle">nexapanel.com/dashboard</text>

    <!-- Sidebar -->
    <rect x="60" y="250" width="200" height="570" fill="${C.bg3}"/>
    <rect x="80" y="270" width="160" height="8" rx="4" fill="${C.em}" opacity="0.3"/>
    <rect x="80" y="295" width="120" height="6" rx="3" fill="${C.txt3}" opacity="0.3"/>
    <rect x="80" y="320" width="140" height="6" rx="3" fill="${C.txt3}" opacity="0.2"/>
    <rect x="80" y="345" width="100" height="6" rx="3" fill="${C.txt3}" opacity="0.2"/>
    <rect x="80" y="370" width="130" height="6" rx="3" fill="${C.txt3}" opacity="0.2"/>

    <!-- Active menu item -->
    <rect x="75" y="315" width="170" height="30" rx="8" fill="${C.em}" opacity="0.1"/>
    <rect x="85" y="323" width="8" height="8" rx="2" fill="${C.em}"/>
    <rect x="100" y="324" width="100" height="6" rx="3" fill="${C.em}"/>

    <!-- Main content area -->
    <!-- Stats cards row -->
    <rect x="280" y="270" width="220" height="100" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="300" y="300" font-family="DM Sans, sans-serif" font-size="11" fill="${C.txt3}">Pedidos activos</text>
    <text x="300" y="335" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.em3}">1,247</text>
    <text x="300" y="355" font-family="DM Sans, sans-serif" font-size="11" fill="${C.em}">+12.5% esta semana</text>

    <rect x="520" y="270" width="220" height="100" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="540" y="300" font-family="DM Sans, sans-serif" font-size="11" fill="${C.txt3}">Ingresos</text>
    <text x="540" y="335" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.txt}">$4,820</text>
    <text x="540" y="355" font-family="DM Sans, sans-serif" font-size="11" fill="${C.em}">+8.3% este mes</text>

    <rect x="760" y="270" width="220" height="100" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="780" y="300" font-family="DM Sans, sans-serif" font-size="11" fill="${C.txt3}">Clientes</text>
    <text x="780" y="335" font-family="Syne, sans-serif" font-weight="800" font-size="36" fill="${C.txt}">892</text>
    <text x="780" y="355" font-family="DM Sans, sans-serif" font-size="11" fill="${C.em}">+5.2% este mes</text>

    <!-- Chart area -->
    <rect x="280" y="390" width="700" height="280" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="300" y="420" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt2}">Pedidos últimos 7 días</text>

    <!-- Chart bars -->
    <g transform="translate(320, 440)">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
        const heights = [120, 180, 150, 200, 170, 90, 140];
        const h = heights[i];
        return `<rect x="${i * 90}" y="${200 - h}" width="50" height="${h}" rx="6" fill="${i === 3 ? C.em : C.em}" opacity="${i === 3 ? 0.8 : 0.25}"/>
      <text x="${i * 90 + 25}" y="218" font-family="DM Sans, sans-serif" font-size="10" fill="${C.txt3}" text-anchor="middle">${day}</text>`;
      }).join('\n      ')}
    </g>

    <!-- Bottom section -->
    <rect x="280" y="690" width="340" height="110" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="300" y="720" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt2}">Servicios populares</text>
    <rect x="300" y="738" width="80" height="22" rx="6" fill="${C.em}" opacity="0.15"/>
    <text x="340" y="754" font-family="DM Sans, sans-serif" font-size="10" fill="${C.em3}" text-anchor="middle">Instagram</text>
    <rect x="390" y="738" width="65" height="22" rx="6" fill="${C.em}" opacity="0.15"/>
    <text x="422" y="754" font-family="DM Sans, sans-serif" font-size="10" fill="${C.em3}" text-anchor="middle">TikTok</text>
    <rect x="465" y="738" width="65" height="22" rx="6" fill="${C.em}" opacity="0.15"/>
    <text x="497" y="754" font-family="DM Sans, sans-serif" font-size="10" fill="${C.em3}" text-anchor="middle">YouTube</text>
    <rect x="300" y="768" width="60" height="22" rx="6" fill="${C.em}" opacity="0.15"/>
    <text x="330" y="784" font-family="DM Sans, sans-serif" font-size="10" fill="${C.em3}" text-anchor="middle">Twitter</text>

    <rect x="640" y="690" width="340" height="110" rx="12" fill="${C.bg4}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="660" y="720" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt2}">Último pedido</text>
    <text x="660" y="748" font-family="DM Mono, monospace" font-size="11" fill="${C.em3}">10K Instagram Followers</text>
    <text x="660" y="770" font-family="DM Sans, sans-serif" font-size="11" fill="${C.txt3}">@usuario_fit • Hace 2 min</text>
    <rect x="880" y="755" width="80" height="28" rx="8" fill="${C.em}" opacity="0.2"/>
    <text x="920" y="774" font-family="DM Sans, sans-serif" font-size="11" fill="${C.em3}" text-anchor="middle">Activo</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${H - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="${W - 60}" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexapanel.com</text>
</svg>`;

// =============================================
// POST 2: TECH AUTHORITY — Code/Architecture
// =============================================
const post2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="emGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.em4}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="glow2">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <!-- Grid -->
  <g opacity="0.03" stroke="${C.em}" stroke-width="0.5" fill="none">
    ${Array.from({length: 22}, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${H}"/>`).join('\n    ')}
    ${Array.from({length: 22}, (_, i) => `<line x1="0" y1="${i * 50}" x2="${W}" y2="${i * 50}"/>`).join('\n    ')}
  </g>

  <!-- Glow -->
  <circle cx="200" cy="300" r="250" fill="${C.em}" opacity="0.04" filter="url(#glow2)"/>

  <!-- Badge -->
  <rect x="60" y="60" width="160" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="140" y="84" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">TECH AUTHORITY</text>

  <!-- Isotipo -->
  <g transform="translate(920, 55) scale(0.35)">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>

  <!-- Title -->
  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.txt}">Cómo escalamos</text>
  <text x="60" y="210" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.em3}">10K pedidos/día</text>

  <!-- Code block -->
  <rect x="60" y="260" width="960" height="520" rx="16" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>

  <!-- Code header -->
  <rect x="60" y="260" width="960" height="44" rx="16" fill="${C.bg3}"/>
  <rect x="60" y="288" width="960" height="16" fill="${C.bg3}"/>
  <circle cx="90" cy="282" r="6" fill="#FF5F56"/>
  <circle cx="110" cy="282" r="6" fill="#FFBD2E"/>
  <circle cx="130" cy="282" r="6" fill="#27C93F"/>
  <text x="160" y="287" font-family="DM Mono, monospace" font-size="12" fill="${C.txt3}">services/order-processor.ts</text>

  <!-- Code content -->
  <g font-family="DM Mono, monospace" font-size="13" fill="${C.txt2}">
    <!-- Line numbers -->
    <g fill="${C.txt3}" opacity="0.3">
      <text x="80" y="330">1</text>
      <text x="80" y="352">2</text>
      <text x="80" y="374">3</text>
      <text x="80" y="396">4</text>
      <text x="80" y="418">5</text>
      <text x="80" y="440">6</text>
      <text x="80" y="462">7</text>
      <text x="80" y="484">8</text>
      <text x="80" y="506">9</text>
      <text x="80" y="528">10</text>
      <text x="80" y="550">11</text>
      <text x="80" y="572">12</text>
      <text x="80" y="594">13</text>
      <text x="80" y="616">14</text>
      <text x="80" y="638">15</text>
      <text x="80" y="660">16</text>
      <text x="80" y="682">17</text>
    </g>

    <!-- Code -->
    <text x="110" y="330" fill="${C.em3}">export class</text> <text x="215" y="330" fill="${C.txt}">OrderProcessor</text> <text x="355" y="330" fill="${C.txt}">{</text>
    <text x="110" y="352" fill="${C.txt3}">  // Batch processing para alta concurrencia</text>
    <text x="110" y="374" fill="${C.em3}">  private</text> <text x="195" y="374" fill="${C.txt}">queue = </text> <text x="275" y="374" fill="${C.em3}">new</text> <text x="310" y="374" fill="${C.txt}">BullQueue(</text> <text x="410" y="374" fill="${C.em4}">'orders'</text> <text x="495" y="374" fill="${C.txt}">);</text>

    <text x="110" y="406" fill="${C.em3}">  async</text> <text x="175" y="406" fill="${C.txt}">processBatch(</text> <text x="325" y="406" fill="${C.em3}">orders</text> <text x="395" y="406" fill="${C.txt}">: </text> <text x="415" y="406" fill="${C.em4}">Order[]</text> <text x="495" y="406" fill="${C.txt}">) {</text>
    <text x="110" y="428" fill="${C.txt3}">    // Pool de conexiones para throughput masivo</text>
    <text x="110" y="450" fill="${C.em3}">    const</text> <text x="180" y="450" fill="${C.txt}"> batch = </text> <text x="275" y="450" fill="${C.em3}">this</text> <text x="310" y="450" fill="${C.txt}">.chunk(orders, </text> <text x="455" y="450" fill="${C.em4}">100</text> <text x="490" y="450" fill="${C.txt}">);</text>

    <text x="110" y="482" fill="${C.em3}">    await</text> <text x="180" y="482" fill="${C.txt}"> Promise.</text> <text x="275" y="482" fill="${C.em3}">allSettled</text> <text x="380" y="482" fill="${C.txt}">(</text>
    <text x="130" y="504" fill="${C.txt}">batch.</text> <text x="180" y="504" fill="${C.em3}">map</text> <text x="220" y="504" fill="${C.txt}">(</text> <text x="230" y="504" fill="${C.em3}">async</text> <text x="285" y="504" fill="${C.txt}">(chunk) =&gt; {</text>
    <text x="150" y="526" fill="${C.em3}">        const</text> <text x="230" y="526" fill="${C.txt}"> conn = </text> <text x="325" y="526" fill="${C.em3}">await</text> <text x="385" y="526" fill="${C.txt}"> </text> <text x="390" y="526" fill="${C.em3}">this</text> <text x="425" y="526" fill="${C.txt}">.pool.</text> <text x="465" y="526" fill="${C.em3}">acquire</text> <text x="545" y="526" fill="${C.txt}">();</text>
    <text x="150" y="548" fill="${C.em3}">        try</text> <text x="195" y="548" fill="${C.txt}"> {</text>
    <text x="170" y="570" fill="${C.em3}">          await</text> <text x="260" y="570" fill="${C.txt}"> conn.</text> <text x="305" y="570" fill="${C.em3}">execute</text> <text x="380" y="570" fill="${C.txt}">(chunk);</text>
    <text x="150" y="592" fill="${C.txt}">        } </text> <text x="175" y="592" fill="${C.em3}">finally</text> <text x="245" y="592" fill="${C.txt}"> {</text>
    <text x="170" y="614" fill="${C.em3}">          await</text> <text x="260" y="614" fill="${C.txt}"> conn.</text> <text x="305" y="614" fill="${C.em3}">release</text> <text x="375" y="614" fill="${C.txt}">();</text>
    <text x="150" y="636" fill="${C.txt}">        }</text>
    <text x="130" y="658" fill="${C.txt}">      })</text>
    <text x="110" y="680" fill="${C.txt}">    );</text>
    <text x="110" y="702" fill="${C.txt}">  }</text>
    <text x="110" y="724" fill="${C.txt}">}</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${H - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="${W - 60}" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexapanel.com</text>
</svg>`;

// =============================================
// POST 3: EDUCATION — 5 tips para crecer en Instagram
// =============================================
const post3 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="emGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${C.em4}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${C.em}" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="glow3">
      <feGaussianBlur stdDeviation="25" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <!-- Radial glow -->
  <circle cx="540" cy="400" r="400" fill="${C.em}" opacity="0.03" filter="url(#glow3)"/>

  <!-- Badge -->
  <rect x="60" y="60" width="120" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="120" y="84" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">EDUCACIÓN</text>

  <!-- Isotipo -->
  <g transform="translate(920, 55) scale(0.35)">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>

  <!-- Title -->
  <text x="60" y="150" font-family="Syne, sans-serif" font-weight="800" font-size="46" fill="${C.txt}">5 estrategias para</text>
  <text x="60" y="210" font-family="Syne, sans-serif" font-weight="800" font-size="46" fill="${C.em3}">escalar tu marca</text>
  <text x="60" y="250" font-family="DM Sans, sans-serif" font-size="18" fill="${C.txt2}">Swipe para ver cada una →</text>

  <!-- Tip cards -->
  ${[
    { num: '01', title: 'Consistencia Visual', desc: 'Usá una paleta de colores fija. En NEXA todo pasa por emerald.', y: 300 },
    { num: '02', title: 'Contenido con Valor', desc: 'Enseñá algo en cada post. El educate-to-sell funciona.', y: 420 },
    { num: '03', title: 'Automatizá lo Repetitivo', desc: 'Panels como NexaPanel liberan tu tiempo para crear.', y: 540 },
    { num: '04', title: 'Métricas > Instinto', desc: 'Mirá los números. Lo que no se mide, no se mejora.', y: 660 },
    { num: '05', title: 'Comunidad, no Audiencia', desc: 'Respondé, interactuá, creá conversación real.', y: 780 },
  ].map(t => `
    <g>
      <rect x="60" y="${t.y}" width="960" height="100" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
      <rect x="60" y="${t.y}" width="4" height="100" rx="2" fill="${C.em}" opacity="0.6"/>
      <text x="100" y="${t.y + 40}" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em}" opacity="0.3">${t.num}</text>
      <text x="155" y="${t.y + 38}" font-family="Syne, sans-serif" font-weight="700" font-size="20" fill="${C.txt}">${t.title}</text>
      <text x="155" y="${t.y + 65}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">${t.desc}</text>
    </g>
  `).join('')}

  <!-- Bottom bar -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${H - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="${W - 60}" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexapanel.com</text>
</svg>`;

// =============================================
// POST 4: BRAND STORY — Behind the Scenes
// =============================================
const post4 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="emGrad4" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${C.em4}" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="glow4">
      <feGaussianBlur stdDeviation="40" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <!-- Large glow -->
  <circle cx="540" cy="500" r="350" fill="${C.em}" opacity="0.04" filter="url(#glow4)"/>

  <!-- Topographic lines -->
  <g opacity="0.05" stroke="${C.em3}" stroke-width="1" fill="none">
    <path d="M0,200 Q200,150 400,220 T800,180 T1080,240"/>
    <path d="M0,250 Q200,200 400,270 T800,230 T1080,290"/>
    <path d="M0,300 Q200,250 400,320 T800,280 T1080,340"/>
    <path d="M0,700 Q300,660 600,720 T1080,690"/>
    <path d="M0,750 Q300,710 600,770 T1080,740"/>
  </g>

  <!-- Badge -->
  <rect x="60" y="60" width="160" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="140" y="84" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">BEHIND THE SCENES</text>

  <!-- Isotipo -->
  <g transform="translate(920, 55) scale(0.35)">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>

  <!-- Big quote -->
  <text x="540" y="200" font-family="Syne, sans-serif" font-weight="800" font-size="80" fill="${C.em}" opacity="0.08" text-anchor="middle">"</text>

  <!-- Main text -->
  <text x="60" y="260" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">No construimos</text>
  <text x="60" y="320" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.txt}">un SMM panel.</text>
  <text x="60" y="400" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">Construimos</text>
  <text x="60" y="460" font-family="Syne, sans-serif" font-weight="800" font-size="44" fill="${C.em3}">infraestructura.</text>

  <!-- Divider -->
  <rect x="60" y="510" width="120" height="3" rx="1.5" fill="${C.em}" opacity="0.5"/>

  <!-- Description -->
  <text x="60" y="560" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}" letter-spacing="0.01em">NEXA nació de la necesidad de crear tecnología que</text>
  <text x="60" y="588" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}" letter-spacing="0.01em">realmente funcione. Cada línea de código, cada sistema,</text>
  <text x="60" y="616" font-family="DM Sans, sans-serif" font-size="17" fill="${C.txt2}" letter-spacing="0.01em">cada decisión de arquitectura está pensada para escalar.</text>

  <!-- Stats -->
  <g transform="translate(60, 660)">
    <rect x="0" y="0" width="200" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="100" y="35" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">6+</text>
    <text x="100" y="58" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">meses desarrollando</text>

    <rect x="220" y="0" width="200" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="320" y="35" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">30+</text>
    <text x="320" y="58" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">plataformas soportadas</text>

    <rect x="440" y="0" width="200" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="540" y="35" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">99.9%</text>
    <text x="540" y="58" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">uptime garantizado</text>

    <rect x="660" y="0" width="200" height="80" rx="12" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <text x="760" y="35" font-family="Syne, sans-serif" font-weight="800" font-size="28" fill="${C.em3}" text-anchor="middle">24/7</text>
    <text x="760" y="58" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">soporte activo</text>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${H - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="${W - 60}" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexapanel.com</text>
</svg>`;

// =============================================
// POST 5: SOCIAL PROOF — Resultados
// =============================================
const post5 = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="emGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${C.em}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${C.em4}" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="glow5">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <!-- Glow orbs -->
  <circle cx="200" cy="200" r="200" fill="${C.em}" opacity="0.04" filter="url(#glow5)"/>
  <circle cx="880" cy="800" r="250" fill="${C.em3}" opacity="0.03" filter="url(#glow5)"/>

  <!-- Badge -->
  <rect x="60" y="60" width="180" height="36" rx="18" fill="${C.em}" opacity="0.15"/>
  <text x="150" y="84" font-family="Syne, sans-serif" font-weight="700" font-size="13" fill="${C.em3}" text-anchor="middle" letter-spacing="0.1em">SOCIAL PROOF</text>

  <!-- Isotipo -->
  <g transform="translate(920, 55) scale(0.35)">
    <polygon points="20,0 40,10 40,30 20,20" fill="${C.em}" opacity="0.8"/>
    <polygon points="40,10 60,0 60,20 40,30" fill="${C.em3}" opacity="0.6"/>
    <polygon points="0,20 20,30 20,50 0,40" fill="${C.em2}" opacity="0.7"/>
    <polygon points="20,30 40,20 40,40 20,50" fill="${C.em}" opacity="0.5"/>
    <polygon points="40,20 60,10 60,30 40,40" fill="${C.em4}" opacity="0.6"/>
    <polygon points="60,20 80,10 80,30 60,40" fill="${C.em3}" opacity="0.4"/>
  </g>

  <!-- Title -->
  <text x="60" y="160" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.txt}">Los números</text>
  <text x="60" y="225" font-family="Syne, sans-serif" font-weight="800" font-size="48" fill="${C.em3}">hablan solos.</text>

  <!-- Big stat -->
  <text x="540" y="420" font-family="Syne, sans-serif" font-weight="800" font-size="140" fill="${C.em}" opacity="0.12" text-anchor="middle">10K+</text>
  <text x="540" y="470" font-family="DM Sans, sans-serif" font-size="20" fill="${C.txt2}" text-anchor="middle">pedidos procesados este mes</text>

  <!-- Stats grid -->
  <g transform="translate(60, 520)">
    ${[
      { value: '2.5M', label: 'Seguidores entregados', x: 0 },
      { value: '99.7%', label: 'Tasa de entrega', x: 250 },
      { value: '3min', label: 'Tiempo promedio', x: 500 },
      { value: '4.9/5', label: 'Satisfacción', x: 750 },
    ].map(s => `
      <g transform="translate(${s.x}, 0)">
        <rect x="0" y="0" width="220" height="100" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
        <text x="110" y="42" font-family="Syne, sans-serif" font-weight="800" font-size="32" fill="${C.em3}" text-anchor="middle">${s.value}</text>
        <text x="110" y="70" font-family="DM Sans, sans-serif" font-size="12" fill="${C.txt3}" text-anchor="middle">${s.label}</text>
      </g>
    `).join('')}
  </g>

  <!-- Testimonial -->
  <g transform="translate(60, 660)">
    <rect x="0" y="0" width="960" height="120" rx="14" fill="${C.bg2}" stroke="${C.em}" stroke-opacity="0.1" stroke-width="1"/>
    <rect x="0" y="0" width="4" height="120" rx="2" fill="${C.em}" opacity="0.6"/>
    <text x="40" y="35" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">"NexaPanel cambió cómo manejo mis redes."</text>
    <text x="40" y="65" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt2}">— Usuario verificado, +50K seguidores entregados</text>
    <g transform="translate(40, 80)">
      ${Array.from({length: 5}, (_, i) => `<text x="${i * 20}" y="0" font-size="16" fill="${C.em3}">★</text>`).join('')}
    </g>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${C.bg2}" opacity="0.8"/>
  <line x1="0" y1="${H - 80}" x2="${W}" y2="${H - 80}" stroke="${C.em}" stroke-opacity="0.12" stroke-width="1"/>
  <text x="60" y="${H - 45}" font-family="Syne, sans-serif" font-weight="700" font-size="16" fill="${C.txt}">NEXA</text>
  <text x="130" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="14" fill="${C.txt3}">Tecnología que trasciende</text>
  <text x="${W - 60}" y="${H - 45}" font-family="DM Sans, sans-serif" font-size="13" fill="${C.txt3}" text-anchor="end">nexapanel.com</text>
</svg>`;

// =============================================
// RENDER ALL
// =============================================
const posts = [
  { svg: post1, name: '01-product-showcase.svg' },
  { svg: post2, name: '02-tech-authority.svg' },
  { svg: post3, name: '03-education.svg' },
  { svg: post4, name: '04-brand-story.svg' },
  { svg: post5, name: '05-social-proof.svg' },
];

console.log('Rendering NEXA social media posts...\n');

for (const post of posts) {
  // Save SVG
  const svgPath = path.join(outDir, post.name);
  fs.writeFileSync(svgPath, post.svg);

  // Render to PNG
  renderSvg(post.svg, post.name, 2);
}

console.log('\nDone! All posts rendered to:', outDir);
