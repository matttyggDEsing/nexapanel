const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');
const fontDir = path.join(__dirname, '..', 'brand', 'fonts');
const fontFiles = fs.readdirSync(fontDir).filter(f => /\.(ttf|otf|woff2?)$/i.test(f)).map(f => path.join(fontDir, f));

// Test 1: > in text
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/><text x="10" y="50">Test &gt; arrow</text></svg>`;
try {
  new Resvg(svg1, { font: { fontFiles } });
  console.log('Test 1 (&gt; in text): OK');
} catch(e) {
  console.log('Test 1: FAILED -', e.message);
}

// Test 2: raw > in text
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/><text x="10" y="50">Test > arrow</text></svg>`;
try {
  new Resvg(svg2, { font: { fontFiles } });
  console.log('Test 2 (raw > in text): OK');
} catch(e) {
  console.log('Test 2: FAILED -', e.message.substring(0, 80));
}

// Test 3: ★ character
const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/><text x="10" y="50">Star ★</text></svg>`;
try {
  new Resvg(svg3, { font: { fontFiles } });
  console.log('Test 3 (★ char): OK');
} catch(e) {
  console.log('Test 3: FAILED -', e.message.substring(0, 80));
}

// Test 4: em dash
const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/><text x="10" y="50">Test — dash</text></svg>`;
try {
  new Resvg(svg4, { font: { fontFiles } });
  console.log('Test 4 (— dash): OK');
} catch(e) {
  console.log('Test 4: FAILED -', e.message.substring(0, 80));
}
