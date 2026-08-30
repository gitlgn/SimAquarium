/*
 ** BUBBLES — a small particle layer for the tank.
 **
 ** Three sources, each rarer and larger than the last:
 **   fish    — one small bubble now and then, from each fish's mouth
 **   filter  — bigger, less often. The Box (0) and Undergravel (2) filters
 **             bubble up from the substrate; the powered ones vent at the
 **             top-left outlet.
 **   ambient — biggest, very rarely, drifting up from the floor
 **
 ** Hard-capped at MAX so a full tank of fish can't flood the screen (the
 ** per-fish spawn rate is also budgeted independent of the fish count).
 */

const bubbleImg = (name: string): HTMLImageElement => {
	const img = new Image();
	img.src = `gfx/kenney/fx/${name}.svg`;
	return img;
};
// Kenney bubbles sit centred in a 64 box: the single ring (bubble_b) spans
// ~12u, the double ring (bubble_c) ~24u. Scale the draw box so a bubble of
// "diameter d" shows at d.
const RING = { img: bubbleImg('bubble_b'), boxPerD: 64 / 12 };
const DOUBLE_RING = { img: bubbleImg('bubble_c'), boxPerD: 64 / 24 };

const MAX = 16; // hard cap — a calm scattering, and cheap to draw
const FISH_MAX = MAX - 4; // leave headroom so filter / ambient bubbles still show
const WATER_TOP = 14; // bubbles fade out and pop above this y (360×240 space)
const FLOOR_Y = 226;

interface FishHead {
	x: number;
	y: number;
	sizeX: number;
	right: boolean;
}

interface Bubble {
	x: number;
	y: number;
	d: number; // visible diameter
	vy: number; // rise speed (px/tick)
	phase: number; // wobble
	amp: number;
	big: boolean; // double ring (filter / ambient) vs single (fish)
}

class Bubbles {
	#list: Bubble[] = [];

	/** Advance + spawn. Called once per move-fish tick from aquarium.moveFish(). */
	tick(fish: FishHead[], filter: number) {
		for (let i = this.#list.length - 1; i >= 0; i--) {
			const b = this.#list[i];
			b.y -= b.vy;
			b.phase += 0.18;
			b.x += Math.sin(b.phase) * b.amp;
			if (b.y < WATER_TOP) this.#list.splice(i, 1);
		}
		if (this.#list.length >= MAX) return;

		// fish: small, frequent — but only a few fish are considered per tick,
		// so 5 fish and 60 fish spawn at the same rate
		const budget = Math.min(fish.length, 3);
		for (let n = 0; n < budget && this.#list.length < FISH_MAX; n++) {
			if (Math.random() < 0.22) {
				const f = fish[(Math.random() * fish.length) | 0];
				this.#spawn(
					f.x + (f.right ? 1 : -1) * f.sizeX * 0.42,
					f.y - 2,
					3 + Math.random() * 2,
					false
				);
			}
		}

		// filter: bigger, less often. Box (0) / Undergravel (2) rise from the
		// substrate along the left; the powered filters vent at the top-left.
		if (Math.random() < 0.11 && this.#list.length < MAX) {
			const d = 6 + Math.random() * 3;
			if (filter === 0 || filter === 2) {
				this.#spawn(22 + Math.random() * 66, FLOOR_Y, d, true);
			} else {
				this.#spawn(12 + Math.random() * 22, 40 + Math.random() * 16, d, true);
			}
		}

		// ambient: biggest, very rare, anywhere along the floor
		if (Math.random() < 0.012 && this.#list.length < MAX) {
			this.#spawn(24 + Math.random() * 312, FLOOR_Y, 10 + Math.random() * 5, true);
		}
	}

	#spawn(x: number, y: number, d: number, big: boolean) {
		this.#list.push({
			x,
			y,
			d,
			vy: 0.45 + d * 0.05,
			phase: Math.random() * Math.PI * 2,
			amp: 0.15 + Math.random() * 0.35,
			big,
		});
	}

	/** Draw on the tank context (already in 360×240 units). */
	draw(ctx: CanvasRenderingContext2D) {
		if (this.#list.length === 0) return;
		ctx.save();
		for (const b of this.#list) {
			const kind = b.big ? DOUBLE_RING : RING;
			const box = b.d * kind.boxPerD;
			// ease out over the last 22px before the surface
			const fade = b.y < WATER_TOP + 22 ? Math.max(0, (b.y - WATER_TOP) / 22) : 1;
			ctx.globalAlpha = 0.5 * fade;
			ctx.drawImage(kind.img, b.x - box / 2, b.y - box / 2, box, box);
		}
		ctx.restore();
	}

	clear() {
		this.#list.length = 0;
	}

	get count() {
		return this.#list.length;
	}
}

export const bubbles = new Bubbles();
