/*
 **	SCENERY OBJECT
 **
 */

import {
	SC_NAME,
	SC_FGIMAGE,
	SC_BGIMAGE,
	SC_PRICE,
	SC_COMFORT,
	SC_BONUSFISH,
} from './constants.js';

const PATH_SCENERY_READY = 'gfx/sceneries/readyMade/';
const PATH_SCENERY_PARTS = 'gfx/sceneries/parts/';

/* Custom scenery part column indices */
const SP_NAME = 0;
const SP_IMAGE = 1;
const SP_SIZEX = 2;
const SP_SIZEY = 3;
const SP_PRICE = 4;
const SP_COMFORT = 5;

class Scenery {
	#scenery = []; // pre-made sceneries
	#part = []; // custom scenery parts — no consumer yet (Scenery Creator is unfinished)

	constructor() {
		const add = (name, fgfile, bgfile, price, comfort, bonusfish) => {
			const row = [];
			row[SC_NAME] = name;
			row[SC_PRICE] = price;
			row[SC_COMFORT] = comfort;
			row[SC_BONUSFISH] = bonusfish;
			row[SC_FGIMAGE] = new Image();
			row[SC_FGIMAGE].src = PATH_SCENERY_READY + fgfile;
			row[SC_BGIMAGE] = new Image();
			row[SC_BGIMAGE].src = PATH_SCENERY_READY + bgfile;
			this.#scenery.push(row);
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

		const addPart = (name, file, sizeX, sizeY, price, comfort) => {
			const row = [];
			row[SP_NAME] = name;
			row[SP_IMAGE] = new Image();
			row[SP_IMAGE].src = PATH_SCENERY_PARTS + file;
			row[SP_SIZEX] = sizeX;
			row[SP_SIZEY] = sizeY;
			row[SP_PRICE] = price;
			row[SP_COMFORT] = comfort;
			this.#part.push(row);
		};
		addPart('Java Moss', 'javaMoss.png', 70, 66, 5, 1.01);
		addPart('Java Fern', 'javaFern.png', 65, 85, 10, 1.02);
		addPart('Marimo', 'marimo.png', 71, 84, 320, 1.21);
	}

	getSceneryData(num, data) {
		const idx = Number.parseInt(num, 10) || 0;
		return this.#scenery[idx][data];
	}

	getSceneryPartData(num, data) {
		return this.#part[num][data];
	}
}

export const scenery = new Scenery();
