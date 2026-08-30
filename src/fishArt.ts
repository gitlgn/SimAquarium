/*
 ** FISH ART — one hand-drawn vector fish per species, approximating the
 ** original 2014 sprites (public/gfx/aquarium/fishes/fishNR.png).
 **
 ** `fishArt(spec)` returns the inner markup for an
 ** `<svg viewBox="0 0 100 56">`. All fish face right, body ~centred; the shop
 ** card (fishshop.ts) drops it straight in.
 */

// clipPath ids must be unique among the fish rendered together — the shop
// paints 9 at once. Monotonic counter; old ids leave the DOM on re-render.
let uid = 0;

const eye = (color = '#10222f') =>
	`<circle cx="79" cy="23" r="3" fill="${color}"/>` +
	`<circle cx="80" cy="22" r="0.9" fill="#e3edf2"/>`;

function tail(kind: string, color: string): string {
	switch (kind) {
		case 'fork':
			return `<path d="M25 28 L6 15 Q14 28 6 41 Z" fill="${color}"/>`;
		case 'point':
			return `<path d="M23 28 L6 22 Q12 28 6 34 Z" fill="${color}"/>`;
		case 'lyre':
			return `<path d="M26 28 L3 8 Q16 28 3 48 Z" fill="${color}"/>`;
		case 'round':
			return `<path d="M26 28 Q5 11 4 28 Q5 45 26 28 Z" fill="${color}"/>`;
		default: // fan
			return `<path d="M24 28 L6 15 L6 41 Z" fill="${color}"/>`;
	}
}

function bodyShape(shape: string): string {
	switch (shape) {
		case 'slim':
			return '<ellipse cx="54" cy="28" rx="33" ry="9.5"/>';
		case 'long':
			return '<ellipse cx="52" cy="28" rx="35" ry="12"/>';
		case 'deep':
			return '<ellipse cx="55" cy="28" rx="29" ry="20"/>';
		case 'round':
			return '<circle cx="56" cy="28" r="24"/>';
		case 'torpedo':
			return '<path d="M18 28 Q46 13 96 24 Q100 28 96 32 Q46 43 18 28 Z"/>';
		case 'needle':
			return '<path d="M10 29 Q50 21 99 26 Q101 28 99 30 Q50 35 10 27 Z"/>';
		case 'eel':
			return '<path d="M6 28 Q52 20 98 26.5 Q100 28 98 29.5 Q52 36 6 28 Z"/>';
		case 'small':
			return '<ellipse cx="56" cy="28" rx="22" ry="15"/>';
		default: // oval
			return '<ellipse cx="54" cy="28" rx="33" ry="14.5"/>';
	}
}

// markings, positioned in the 100×56 space and clipped to the body
const hstripe = (cy: number, h: number, c: string) =>
	`<rect x="0" y="${cy - h / 2}" width="100" height="${h}" fill="${c}"/>`;
const vband = (cx: number, w: number, c: string) =>
	`<path d="M${cx - w / 2} 0 L${cx - w / 2 + 6} 0 L${cx + w / 2 + 6} 56 L${cx + w / 2} 56 Z" fill="${c}"/>`;
const spot = (cx: number, cy: number, r: number, c?: string) =>
	`<circle cx="${cx}" cy="${cy}" r="${r}"${c ? ` fill="${c}"` : ''}/>`;

interface FishDef {
	shape: string;
	fill: string;
	back?: string; // darker dorsal wash
	belly?: string;
	fin?: string; // tail + dorsal + pelvic colour (defaults to fill)
	tail?: string;
	dorsal?: boolean;
	pelvic?: boolean;
	sail?: boolean; // oversized dorsal sail (molly)
	eyeColor?: string;
	marks?: string;
}

function drawFish(o: FishDef): string {
	const id = 'fc' + uid++;
	const shp = bodyShape(o.shape);
	const finC = o.fin ?? o.fill;
	// small/round bodies sit further right — nudge the tail up to the body
	const tx = o.shape === 'small' ? 12 : o.shape === 'round' ? 6 : 0;
	return (
		`<defs><clipPath id="${id}">${shp}</clipPath></defs>` +
		`<g transform="translate(${tx},0)">${tail(o.tail ?? 'fan', finC)}</g>` +
		(o.sail
			? `<path d="M28 26 Q40 -18 84 20 L82 26 Z" fill="${finC}"/>` +
				`<g fill="#7c8285">${spot(44, 8, 1.5, '')}${spot(56, 4, 1.5, '')}${spot(66, 12, 1.5, '')}${spot(52, 16, 1.5, '')}</g>`
			: (o.dorsal ?? true)
				? `<path d="M42 13 Q55 -3 72 12 Z" fill="${finC}"/>`
				: '') +
		(o.pelvic ? `<path d="M46 44 Q56 55 68 42 Z" fill="${finC}"/>` : '') +
		`<g fill="${o.fill}">${shp}</g>` +
		(o.back
			? `<ellipse cx="54" cy="21" rx="33" ry="9" fill="${o.back}" clip-path="url(#${id})"/>`
			: '') +
		(o.belly
			? `<ellipse cx="56" cy="37" rx="30" ry="8" fill="${o.belly}" clip-path="url(#${id})"/>`
			: '') +
		(o.marks ? `<g clip-path="url(#${id})">${o.marks}</g>` : '') +
		eye(o.eyeColor)
	);
}

/* --- the few that aren't fish-shaped --------------------------------- */

function betta(): string {
	return (
		`<path d="M34 28 Q2 0 6 28 Q2 56 34 28 Z" fill="#3f7fc0"/>` + // caudal veil
		`<path d="M40 20 Q44 -10 78 14 Q56 12 40 24 Z" fill="#3f7fc0"/>` + // dorsal
		`<path d="M40 36 Q48 60 82 42 Q58 44 40 34 Z" fill="#3f7fc0"/>` + // anal
		`<ellipse cx="56" cy="28" rx="22" ry="12" fill="#2f6fb0"/>` +
		`<ellipse cx="56" cy="23" rx="22" ry="6" fill="#245c98"/>` +
		eye()
	);
}

function angelfish(): string {
	const id = 'fc' + uid++;
	const shp =
		'<path d="M56 8 Q30 -2 44 24 Q20 30 44 34 Q28 60 56 50 Q80 40 82 28 Q80 16 56 8 Z"/>';
	return (
		`<defs><clipPath id="${id}">${shp}</clipPath></defs>` +
		`<path d="M50 6 Q54 -6 58 6 Z" fill="#cfd7da"/>` +
		`<path d="M50 50 Q54 62 58 50 Z" fill="#cfd7da"/>` +
		`<path d="M26 30 L6 22 M26 30 L6 40" stroke="#cfd7da" stroke-width="2" fill="none"/>` +
		`<g fill="#dfe6e9">${shp}</g>` +
		`<g clip-path="url(#${id})" opacity="0.45">` +
		vband(44, 6, '#4a5054') +
		vband(60, 6, '#4a5054') +
		vband(74, 6, '#4a5054') +
		`</g>` +
		eye('#7a2b22')
	);
}

function turtle(): string {
	return (
		`<path d="M70 42 Q84 52 76 58 Q68 50 62 44 Z" fill="#7d6b3f"/>` +
		`<path d="M22 42 Q10 54 18 58 Q28 50 34 44 Z" fill="#7d6b3f"/>` +
		`<path d="M74 16 Q86 8 88 16 Q80 20 70 22 Z" fill="#7d6b3f"/>` +
		`<path d="M20 16 Q10 10 10 18 Q20 20 28 20 Z" fill="#7d6b3f"/>` +
		`<ellipse cx="86" cy="28" rx="9" ry="7" fill="#7d6b3f"/>` +
		`<ellipse cx="49" cy="29" rx="35" ry="22" fill="#7a6338"/>` +
		`<ellipse cx="49" cy="26" rx="35" ry="12" fill="#8a7442"/>` +
		`<g fill="none" stroke="#524226" stroke-width="1.6">` +
		`<path d="M49 8 L49 50 M20 20 Q49 30 20 40 M78 20 Q49 30 78 40"/>` +
		`<ellipse cx="49" cy="29" rx="14" ry="10"/>` +
		`</g>` +
		`<circle cx="90" cy="26" r="1.8" fill="#22303a"/>`
	);
}

function dolphin(): string {
	return (
		`<path d="M8 30 L0 21 Q5 30 0 39 Z" fill="#87949b"/>` + // tail fluke
		`<path d="M6 30 Q30 11 72 19 Q93 23 99 30 Q92 34 76 34 Q40 41 6 30 Z" fill="#95a1a8"/>` +
		`<path d="M22 33 Q52 41 88 33 Q60 37 22 35 Z" fill="#c7cfd3"/>` + // belly
		`<path d="M52 20 Q58 4 68 19 Q60 17 52 22 Z" fill="#87949b"/>` + // dorsal fin
		`<path d="M60 33 Q68 47 52 45 Q56 37 60 33 Z" fill="#87949b"/>` + // pectoral
		`<path d="M92 31 q5 2 8 1" stroke="#5f6b71" stroke-width="1.4" fill="none"/>` + // mouth
		`<circle cx="83" cy="27" r="1.7" fill="#22303a"/>`
	);
}

// index → definition. Species 0 ("Test fish") can't spawn — the shop formula
// `3*i + rand + 1` never yields 0 and the starter is species 1 — but the
// dormant table slot still gets a frame precomputed, so mirror species 1
// (as the old fishNR.png fallback `i === 0 ? 1 : i` did).
const DEFS: Record<number, () => string> = {
	0: () => inner(1),
	1: () =>
		drawFish({ shape: 'oval', fill: '#d9c9a8', back: '#b39a6f', belly: '#dd9a77' }),
	2: () =>
		drawFish({
			shape: 'slim',
			fill: '#cf5a30',
			fin: '#e07a3a',
			marks: `<path d="M70 17 Q90 28 70 39 Q80 28 70 17 Z" fill="#48423d"/>`,
		}),
	3: () =>
		drawFish({
			shape: 'oval',
			fill: '#e9e6de',
			pelvic: true,
			marks:
				spot(76, 24, 6, '#2f2c28') +
				`<path d="M42 15 Q54 5 66 15 Z" fill="#2f2c28"/>` +
				`<rect x="24" y="17" width="11" height="22" fill="#2f2c28"/>`,
			eyeColor: '#0c0c0c',
		}),
	4: () =>
		drawFish({ shape: 'long', fill: '#7d6b3f', back: '#4f4327', pelvic: true }),
	5: () =>
		drawFish({
			shape: 'slim',
			fill: '#9aa06a',
			tail: 'fork',
			marks: hstripe(22, 2, '#41442a') + hstripe(28, 2, '#41442a') + hstripe(34, 2, '#41442a'),
		}),
	6: () =>
		drawFish({ shape: 'oval', fill: '#9fa6a8', sail: true, marks: spot(60, 32, 1.4, '#6f7679') }),
	7: () =>
		drawFish({
			shape: 'deep',
			fill: '#e8892a',
			back: '#d9701c',
			fin: '#efaa5c',
			tail: 'round',
			pelvic: true,
		}),
	8: () =>
		drawFish({
			shape: 'slim',
			fill: '#cfd6d3',
			tail: 'fork',
			marks: hstripe(30, 3, '#d23b2f') + hstripe(26, 2.4, '#2f8fd2'),
		}),
	9: () =>
		drawFish({
			shape: 'eel',
			fill: '#cabfa0',
			dorsal: false,
			marks:
				`<ellipse cx="40" cy="28" rx="7" ry="4" fill="#a89a76" opacity=".55"/>` +
				`<ellipse cx="66" cy="27" rx="6" ry="3.5" fill="#a89a76" opacity=".55"/>`,
		}),
	10: () =>
		drawFish({
			shape: 'oval',
			fill: '#3f6fae',
			fin: '#5b86c4',
			tail: 'point',
			pelvic: true,
			marks: vband(40, 4, '#c7b23e') + vband(52, 4, '#c7b23e') + vband(64, 4, '#c7b23e'),
		}),
	11: () =>
		drawFish({ shape: 'oval', fill: '#332a24', fin: '#2a2420', marks: vband(52, 15, '#e8c33a') }),
	12: () =>
		drawFish({
			shape: 'torpedo',
			fill: '#c3c9cd',
			back: '#8f989d',
			tail: 'fork',
			marks:
				`<path d="M3 13 L11 20 M3 43 L11 36" stroke="#1c2126" stroke-width="3" fill="none"/>` +
				`<path d="M48 6 L54 12 L58 6 Z" fill="#1c2126"/>`,
		}),
	13: () =>
		drawFish({
			shape: 'oval',
			fill: '#f2c21e',
			marks:
				`<path d="M40 13 Q55 -1 72 12 L72 15 Q55 4 42 16 Z" fill="#151515"/>` +
				`<path d="M46 43 Q56 54 68 41 L66 39 Q56 48 48 40 Z" fill="#151515"/>`,
		}),
	14: () =>
		drawFish({
			shape: 'long',
			fill: '#e0872c',
			fin: '#c94f2a',
			tail: 'fork',
			marks: vband(33, 7, '#181410') + vband(52, 8, '#181410') + vband(71, 7, '#181410'),
		}),
	15: () =>
		drawFish({
			shape: 'slim',
			fill: '#c6c2ac',
			back: '#a7a184',
			fin: '#d6d2bd',
			tail: 'lyre',
			marks: `<path d="M40 34 L60 34 L52 44 Z" fill="#d6d2bd"/>`,
		}),
	16: () =>
		drawFish({ shape: 'deep', fill: '#7f9a5c', back: '#5f7a44', belly: '#a9bd86', pelvic: true }),
	17: betta,
	18: () =>
		drawFish({
			shape: 'small',
			fill: '#bcae7a',
			back: '#5a86b0',
			marks: `<path d="M70 12 L74 12 L70 34 L66 34 Z" fill="#2a2a2a" opacity=".8"/>`,
		}),
	19: () =>
		drawFish({
			shape: 'deep',
			fill: '#3a3330',
			tail: 'round',
			pelvic: true,
			marks:
				spot(42, 34, 3, '#d9782a') +
				spot(50, 30, 2.4, '#d9782a') +
				spot(46, 39, 2, '#d9782a') +
				spot(58, 36, 2.6, '#d9782a') +
				spot(38, 28, 2, '#d9782a'),
		}),
	20: () =>
		drawFish({
			shape: 'deep',
			fill: '#274a9e',
			fin: '#f2c21e',
			marks:
				hstripe(16, 1.6, '#f2c21e') +
				hstripe(20, 1.6, '#f2c21e') +
				hstripe(24, 1.6, '#f2c21e') +
				hstripe(28, 1.6, '#f2c21e') +
				hstripe(32, 1.6, '#f2c21e') +
				hstripe(36, 1.6, '#f2c21e') +
				hstripe(40, 1.6, '#f2c21e') +
				`<path d="M72 15 Q90 28 72 41 Q80 28 72 15 Z" fill="#141a2b"/>`,
		}),
	21: () =>
		drawFish({ shape: 'oval', fill: '#1f7fd0', back: '#155fa8', eyeColor: '#7a2b22' }),
	22: () =>
		drawFish({
			shape: 'deep',
			fill: '#f0932b',
			back: '#e07b1e',
			fin: '#f4b45c',
			tail: 'round',
			pelvic: true,
		}),
	23: () => drawFish({ shape: 'deep', fill: '#9aa6a6', back: '#6f7b7b', belly: '#c2cbcb' }),
	24: angelfish,
	25: () =>
		drawFish({
			shape: 'round',
			fill: '#cf6a2a',
			marks:
				`<g fill="none" stroke="#d7e8ec" stroke-width="1.3" opacity=".8">` +
				`<path d="M34 20 Q54 16 78 21 M32 28 Q54 24 82 29 M34 36 Q54 33 78 37"/>` +
				`</g>` +
				`<path d="M72 6 L76 6 L72 50 L68 50 Z" fill="#7a3f1e" opacity=".85"/>`,
		}),
	26: () =>
		drawFish({
			shape: 'needle',
			fill: '#b9c2c6',
			back: '#8a969b',
			tail: 'fork',
			dorsal: false,
			marks:
				spot(40, 26, 1.5, '#7a868b') +
				spot(52, 27, 1.5, '#7a868b') +
				spot(64, 26, 1.5, '#7a868b') +
				// small dorsal + anal fin set back near the tail
				`<path d="M30 24 L38 24 L34 18 Z" fill="#9aa4a8"/>` +
				`<path d="M30 32 L38 32 L34 38 Z" fill="#9aa4a8"/>` +
				`<path d="M90 30 q6 1 9 -1" stroke="#5f6b71" stroke-width="1.2" fill="none"/>`,
		}),
	27: turtle,
	28: dolphin,
};

function inner(spec: number): string {
	return (DEFS[spec] ?? DEFS[0])();
}

/* ------------------------------------------------------------------ *
 * Skins: `classic` = the drawn set above; `cartoon` = the flat Kenney
 * Fish Pack (CC0, public/gfx/kenney/fish). 28 species map onto the 9
 * Kenney fish by colour family + body shape — it's the stylised
 * alternative, not a species catalogue.
 * ------------------------------------------------------------------ */

export type FishSkin = 'classic' | 'cartoon';
let skin: FishSkin = 'classic';
export const setFishSkin = (s: FishSkin) => {
	skin = s;
};
export const getFishSkin = (): FishSkin => skin;

// prettier-ignore
const KENNEY_FISH: readonly string[] = [
	'fish_brown',        // 0  Test fish (mirrors 1)
	'fish_brown',        // 1  Southern platyfish
	'fish_orange',       // 2  Guppy
	'fish_grey',         // 3  Panda corydoras
	'fish_brown',        // 4  Bronze catfish
	'fish_green',        // 5  Zebrafish
	'fish_grey',         // 6  Sailfin molly
	'fish_orange',       // 7  Rosy barb
	'fish_red',          // 8  Cardinal tetra
	'fish_grey',         // 9  Dojo loach
	'fish_blue',         // 10 Paradise fish
	'fish_brown',        // 11 Tropheus
	'fish_grey',         // 12 Bala shark
	'fish_orange',       // 13 Electric yellow cichlid
	'fish_orange',       // 14 Clown loach
	'fish_grey',         // 15 Fairy cichlid
	'fish_green',        // 16 San Francisco piranha
	'fish_blue',         // 17 Siamese fighting fish
	'fish_pink',         // 18 Ram cichlid
	'fish_brown',        // 19 Oscar
	'fish_blue',         // 20 Marine angelfish
	'fish_blue',         // 21 Electric Blue Hap
	'fish_orange',       // 22 Goldfish
	'fish_grey',         // 23 Black Piranha
	'fish_grey',         // 24 Freshwater angelfish
	'fish_pink',         // 25 Discus
	'fish_grey',         // 26 Barracuda
	'fish_green',        // 27 Green Sea Turtle
	'fish_grey',         // 28 Bottlenose dolphin
];

const kenneyName = (spec: number) => KENNEY_FISH[spec] ?? KENNEY_FISH[0];
const kenneyUrl = (spec: number) => `gfx/kenney/fish/${kenneyName(spec)}.svg`;

// A data-URI SVG rendered in an <img> can't pull an external file, so the
// Kenney sprites are fetched once and cached as base64 data URIs to embed.
const kenneyCache = new Map<string, string>();
export async function loadCartoonSprites(): Promise<void> {
	await Promise.all(
		[...new Set(KENNEY_FISH)].map(async (name) => {
			if (kenneyCache.has(name)) return;
			const txt = await fetch(`gfx/kenney/fish/${name}.svg`).then((r) => r.text());
			kenneyCache.set(name, 'data:image/svg+xml;base64,' + btoa(txt));
		})
	);
}

// Per-species viewBox crop for the tank raster. Most fish sit fine in the full
// 0 0 100 56 box (~1.8:1, a typical fish); the very long / very tall species
// get a tighter box so stretching it to their sizeX:sizeY barely distorts.
const CROP: Record<number, readonly [number, number, number, number]> = {
	5: [4, 14, 92, 26], // zebrafish  ~3.1:1
	9: [2, 16, 96, 22], // dojo loach ~3.8:1
	11: [4, 8, 92, 38], // tropheus   ~2.8:1
	24: [20, 0, 54, 56], // freshwater angelfish  ~0.8:1 (tall)
	26: [2, 16, 96, 22], // barracuda  ~3.7:1
	27: [0, 8, 100, 40], // sea turtle ~3.9:1 (wide shell)
	28: [2, 14, 98, 30], // dolphin    ~3.7:1
};

/** Markup for the shop card — an inline SVG (classic) or an <img> (cartoon). */
export function fishArt(spec: number): string {
	if (skin === 'cartoon') {
		return `<img class="shopCard-fishIcon" src="${kenneyUrl(spec)}" alt="">`;
	}
	return `<svg class="shopCard-fishIcon" viewBox="0 0 100 56" aria-hidden="true">${inner(spec)}</svg>`;
}

/**
 * Standalone SVG as a `data:` URI for an `<img>` / canvas (the aquarium tank).
 * `preserveAspectRatio="none"` so the caller can stretch it to each species'
 * sizeX:sizeY; `flip` mirrors the fish to face left.
 */
export function fishArtSvgUri(spec: number, w: number, h: number, flip = false): string {
	const cartoon = skin === 'cartoon' ? kenneyCache.get(kenneyName(spec)) : undefined;
	if (cartoon) {
		const g = flip
			? `<g transform="translate(64,0) scale(-1,1)"><image href="${cartoon}" width="64" height="64"/></g>`
			: `<image href="${cartoon}" width="64" height="64"/>`;
		const svg =
			`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
			`viewBox="0 0 64 64" preserveAspectRatio="none">${g}</svg>`;
		return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
	}
	// classic (also the fallback while the cartoon sprites are still loading)
	const g = flip
		? `<g transform="translate(100,0) scale(-1,1)">${inner(spec)}</g>`
		: inner(spec);
	const [vx, vy, vw, vh] = CROP[spec] ?? [0, 0, 100, 56];
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
		`viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="none">${g}</svg>`;
	return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
