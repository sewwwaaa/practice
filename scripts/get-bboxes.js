import fs from 'fs';

const svg = fs.readFileSync('public/world-map.svg', 'utf8');

function getBBox(id) {
  const marker = `id="${id}"`;
  const idx = svg.indexOf(marker);
  if (idx === -1) return null;
  const tagStart = svg.lastIndexOf('<', idx);
  const closeSlash = svg.indexOf('/>', idx);
  const closeGroup = svg.indexOf('</g>', idx);
  let tagEnd = -1;
  if (closeSlash !== -1 && (closeGroup === -1 || closeSlash < closeGroup)) {
    tagEnd = closeSlash + 2;
  } else if (closeGroup !== -1) {
    tagEnd = closeGroup + 4;
  }
  if (tagStart === -1 || tagEnd === -1) return null;
  const chunk = svg.slice(tagStart, tagEnd);
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
