/*
 **	SCENERY OBJECT
 **
 */

const PATH_SCENERY_READY = 'gfx/sceneries/readyMade/';
const PATH_SCENERY_PARTS = 'gfx/sceneries/parts/';

// Column order matches the SC_* constants in constants.ts (0-indexed, in
// declaration order). `getSceneryData(n, SC_PRICE)` resolves to the element
// type at that index, so callers get `number` / `HTMLImageElement` — no cast.
type SceneryRow = readonly [
	name: string,
	fgImage: HTMLImageElement,
	bgImage: HTMLImageElement,
	price: number,
	comfort: number,
	bonusFish: number | null,
];

// Custom scenery parts (Scenery Creator is unfinished — no consumer yet).
type SceneryPartRow = readonly [
	name: string,
	image: HTMLImageElement,
	sizeX: number,
	sizeY: number,
	price: number,
	comfort: number,
];

class Scenery {
	#scenery: SceneryRow[] = []; // pre-made sceneries
	#part: SceneryPartRow[] = []; // custom scenery parts — no consumer yet (Scenery Creator is unfinished)

	constructor() {
		const add = (
			name: string,
			fgfile: string,
			bgfile: string,
			price: number,
			comfort: number,
			bonusfish: number | null
		) => {
			const fg = new Image();
			fg.src = PATH_SCENERY_READY + fgfile;
			const bg = new Image();
			bg.src = PATH_SCENERY_READY + bgfile;
			this.#scenery.push([name, fg, bg, price, comfort, bonusfish]);
		};

		//  name					fgfile		bgfile		price	comfort	bonusfish
		add('Custom Scenery', 'null.png', '0bg.png', 0, 0.5, null);
		add('Water Plants', '1fg.png', '1bg.png', 100, 0.55, null);
		add('Dense Water Plants', '2fg.png', '2bg.png', 400, 0.6, null);
		add('Coral Reef', '3fg.png', '3bg.png', 1600, 0.65, 1);
		add('Swimming Pool', 'null.png', '4bg.png', 3200, 0.7, 2);
		add('Underwater Cave', '5fg.png', '5bg.png', 6400, 0.75, 3);
		add("Pirates' Treasure", '6fg.png', '6bg.png', 12800, 0.8, 4);
		add('Web Browsers', '7fg.png', '7bg.png', 25600, 0.89, 5);
		add('Seashell Palace', '8fg.png', '8bg.png', 51200, 0.99, 6);

		const addPart = (
			name: string,
			file: string,
			sizeX: number,
			sizeY: number,
			price: number,
			comfort: number
		) => {
			const img = new Image();
			img.src = PATH_SCENERY_PARTS + file;
			this.#part.push([name, img, sizeX, sizeY, price, comfort]);
		};
		addPart('Java Moss', 'javaMoss.png', 70, 66, 5, 1.01);
		addPart('Java Fern', 'javaFern.png', 65, 85, 10, 1.02);
		addPart('Marimo', 'marimo.png', 71, 84, 320, 1.21);
	}

	getSceneryData<K extends number>(num: number, data: K): SceneryRow[K] {
		return this.#scenery[num || 0][data];
	}

	getSceneryPartData<K extends number>(num: number, data: K): SceneryPartRow[K] {
		return this.#part[num || 0][data];
	}
}

export const scenery = new Scenery();
