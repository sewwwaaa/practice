import fs from 'fs';

const svg = fs.readFileSync('public/world-map.svg', 'utf8');

function getBBox(id) {
  const match = svg.match(new RegExp(`<(?:g|path)[^>]*id="${id}"[\\s\\S]*?(?:<\\/g>|\\/>)`));
  if (!match) return null;
  const chunk = match[0];
  const coords = [...chunk.matchAll(/([0-9.]+)[,\s]+([0-9.]+)/g)].map(m => [parseFloat(m[1]), parseFloat(m[2])]);
  if (!coords.length) return null;
  const xs = coords.map(c => c[0]).filter(x => x > 20 && x < 850);
  const ys = coords.map(c => c[1]).filter(y => y > 200 && y < 750);
  return {
    minX: Math.round(Math.min(...xs)), maxX: Math.round(Math.max(...xs)),
    minY: Math.round(Math.min(...ys)), maxY: Math.round(Math.max(...ys)),
    centerX: Math.round((Math.min(...xs) + Math.max(...xs)) / 2),
    centerY: Math.round((Math.min(...ys) + Math.max(...ys)) / 2)
  };
}

console.log('BBoxes:', {
  us: getBBox('us'),
  gb: getBBox('gb'),
  ru: getBBox('ru'),
  jp: getBBox('jp'),
  au: getBBox('au'),
  br: getBBox('br'),
  de: getBBox('de')
});
