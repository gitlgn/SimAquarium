/*
 **	FILTRATION + BACKGROUND WALL OBJECTS
 **
 */

import { $ } from './dom.js';
import { BG_NAME, BG_PRICE, BG_IMAGE } from './constants.js';

const PATH_FILTERS = 'gfx/filters/';
const PATH_BGS = 'gfx/view4/';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

// Column order matches the FI_* constants in constants.ts.
type FilterRow = readonly [
	name: string,
	price: number,
	comfort: number,
	pollution: number,
	energy: number,
	image: HTMLImageElement,
];

// Column order matches the BG_* constants; the image column is a path string.
type BackgroundRow = readonly [name: string, price: number, imageSrc: string];

class Filtration {
	#filter: FilterRow[] = [];

	constructor() {
		const add = (
			name: string,
			fileName: string,
			price: number,
			comfort: number,
			pollution: number,
			energyCost: number
		) => {
			const img = new Image();
			img.src = PATH_FILTERS + fileName;
			this.#filter.push([name, price, comfort, pollution, energyCost, img]);
		};

		add('Box filter', 'filter0.png', 0, 0.95, -0.06, 0.032);
		add('Cannister filter', 'filter1.png', 120, 0.92, -0.12, 0.016);
		add('Undergravel filter', 'filter2.png', 240, 0.99, -0.24, 0.008);
		add('Fluidized bed filter', 'filter3.png', 960, 0.97, -0.48, 0.004);
		add('Power filter', 'filter4.png', 1920, 0.96, -0.96, 0.002);
		add('Advanced Power Filter', 'filter5.png', 7680, 0.98, -1.92, 0.001);
	}

	getFilterData<K extends number>(num: number, data: K): FilterRow[K] {
		return this.#filter[num || 0][data];
	}
}

class BackgroundWall {
	#background: BackgroundRow[] = [];

	constructor() {
		const add = (name: string, fileName: string, price: number) => {
			this.#background.push([name, price, PATH_BGS + fileName]);
		};

		add('White', 'bg0.png', 60);
		add('Black', 'bg1.png', 60);
		add('Red', 'bg2.png', 60);
		add('Yellow', 'bg3.png', 60);
		add('Blue', 'bg4.png', 60);

		add('Orange', 'bg5.png', 90);
		add('Green', 'bg6.png', 90);
		add('Violet', 'bg7.png', 90);
		add('Brown', 'bg8.png', 90);
		add('Sepia', 'bg9.png', 90);

		add('Metal', 'bg10.png', 120);
		add('Rivets', 'bg11.png', 120);
		add('Rust', 'bg12.png', 120);
		add('Fun', 'bg13.png', 180);
		add('Transparent', 'bg14.png', 240);
	}

	getBackgroundSrc(bg: number): string {
		return this.#background[bg || 0][BG_IMAGE];
	}

	getBackgroundData<K extends number>(num: number, data: K): BackgroundRow[K] {
		return this.#background[num || 0][data];
	}

	getBackgroundCount() {
		return this.#background.length;
	}

	/*** RENDER THE BACKGROUND SHOP FROM STATE ***/
	// `id="backgroundSlot${i}"` is kept because the per-swatch artwork lives in
	// CSS keyed on that id; `data-bg` / `data-act` drive the delegated buy
	// listener in events.ts. A tile is `off` (unclickable) when it is the wall
	// currently in use or the player can't afford it.
	renderBackgrounds(money = 0, used = 0) {
		let html = '';
		for (let i = 0; i < this.#background.length; i++) {
			const price = this.#background[i][BG_PRICE];
			const disabled = i === used || money < price;
			html +=
				`<div class="backgroundSlot" id="backgroundSlot${i}" data-bg="${i}">` +
				`<div class="title">${esc(this.#background[i][BG_NAME])}</div>` +
				`<div class="money">${price}</div>` +
				`<div class="button buy ${disabled ? 'off' : 'on'}" data-act="buy"></div>` +
				`</div>`;
		}
		$('tabBackgroundShop').innerHTML = html;
	}
}

export const filtration = new Filtration();
export const background = new BackgroundWall();
