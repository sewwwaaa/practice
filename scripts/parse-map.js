import fs from 'fs';

const svg = fs.readFileSync('public/world-map.svg', 'utf8');

// Find paths or groups with id
const matches = svg.matchAll(/id="([a-zA-Z0-9_]+)"[\s\S]*?d="M\s*([\d.]+)[,\s]+([\d.]+)/g);
const result = {};
for (const m of matches) {
  result[m[1]] = { x: parseFloat(m[2]), y: parseFloat(m[3]) };
}

console.log('Result:', {
  us: result['us'],
  gb: result['gb'],
  ru: result['ru'],
  jp: result['jp'],
  cn: result['cn'],
  de: result['de'],
  br: result['br'],
  au: result['au']
});
