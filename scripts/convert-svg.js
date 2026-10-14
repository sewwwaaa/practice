import fs from 'fs';

const content = fs.readFileSync('public/world-map.svg', 'utf8');

const start = content.indexOf('>', content.indexOf('<svg')) + 1;
const end = content.lastIndexOf('</svg>');
let inner = content.substring(start, end);

inner = inner.replace(/<title>[\s\S]*?<\/title>/gi, '');
inner = inner.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
inner = inner.replace(/class="([^"]+)"/g, 'className="$1"');

const code = `import React from 'react';

export default function WorldMapPaths() {
  return (
    <g id="real-world-continents" fill="#131e33" stroke="#233552" strokeWidth="0.55">
      ${inner}
    </g>
  );
}
`;

fs.writeFileSync('src/components/WorldMapPaths.jsx', code, 'utf8');
console.log('Successfully generated src/components/WorldMapPaths.jsx');
