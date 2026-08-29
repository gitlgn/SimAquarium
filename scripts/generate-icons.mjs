/**
 * Rasterize public/gfx/icon.svg into the PNG app icons.
 *
 *   npm run icons
 *
 * The SVG is the source of truth; the PNGs it writes are committed so the
 * build and the deploy don't depend on `sharp` at runtime.
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const gfx = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'gfx');
const svg = readFileSync(join(gfx, 'icon.svg'));

// name -> pixel size. icon.svg is full-bleed with the fish inside the safe
// circle, so pwa-512.png serves `purpose: "any maskable"` on its own.
const targets = [
	['favicon.png', 16],
	['pwa-192.png', 192],
	['pwa-512.png', 512],
];

for (const [name, size] of targets) {
	// Render the SVG well above the target, then downscale — crisp edges.
	await sharp(svg, { density: 512 })
		.resize(size, size, { fit: 'cover' })
		.png({ compressionLevel: 9, palette: size <= 64 })
		.toFile(join(gfx, name));
	console.log(`  ${name}  ${size}x${size}`);
}
console.log('icons written to public/gfx/');
