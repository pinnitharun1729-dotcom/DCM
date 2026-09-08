import fs from 'fs';
import { createCanvas, Image } from 'canvas';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="40" r="18" fill="#a01a20" />
  <path d="M70,80 C80,60 120,60 130,80 L160,50 M130,80 L140,125 L165,180 M100,105 L80,150 M70,80 L40,50 M80,150 L35,140" stroke="#a01a20" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>`;

const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0);
  const base64 = canvas.toDataURL('image/png');
  fs.writeFileSync('rgukt_logo_base64.txt', base64);
};
img.src = Buffer.from(svg);
