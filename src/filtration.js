/*
 **	FILTRATION + BACKGROUND WALL OBJECTS
 **
 */

import { $ } from './dom.js';
import {
	FI_NAME,
	FI_PRICE,
	FI_COMFORT,
	FI_POLLUTION,
	FI_ENERGY,
	FI_IMAGE,
	BG_NAME,
	BG_PRICE,
	BG_IMAGE,
} from './constants.js';

const PATH_FILTERS = 'gfx/filters/';
const PATH_BGS = 'gfx/view4/';

class Filtration {
	#filter = [];

	constructor() {
		const add = (name, fileName, price, comfort, pollution, energyCost) => {
			const row = [];
			row[FI_NAME] = name;
			row[FI_PRICE] = price;
			row[FI_COMFORT] = comfort;
			row[FI_POLLUTION] = pollution;
			row[FI_ENERGY] = energyCost;
			row[FI_IMAGE] = new Image();
			row[FI_IMAGE].src = PATH_FILTERS + fileName;
			this.#filter.push(row);
		};

		add('Box filter', 'filter0.png', 0, 0.95, -0.06, 0.032);
		add('Cannister filter', 'filter1.png', 120, 0.92, -0.12, 0.016);
		add('Undergravel filter', 'filter2.png', 240, 0.99, -0.24, 0.008);
		add('Fluidized bed filter', 'filter3.png', 960, 0.97, -0.48, 0.004);
		add('Power filter', 'filter4.png', 1920, 0.96, -0.96, 0.002);
		add('Advanced Power Filter', 'filter5.png', 7680, 0.98, -1.92, 0.001);
	}

	getFilterData(num, data) {
		const idx = Number.parseInt(num, 10) || 0;
		return this.#filter[idx][data];
	}
}

class BackgroundWall {
	#background = [];

	constructor() {
		const add = (name, fileName, price) => {
			const row = [];
			row[BG_NAME] = name;
			row[BG_PRICE] = price;
			row[BG_IMAGE] = PATH_BGS + fileName;
			this.#background.push(row);
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

	getBackgroundSrc(bg) {
		return this.#background[bg][BG_IMAGE];
	}

	getBackgroundData(num, data) {
		return this.#background[num][data];
	}

	/*** CREATE HTML FOR BACKGROUNDS ***/
	createBackgroundSlots() {
		for (let i = 0; i < this.#background.length; i++) {
			const bgSlot = document.createElement('div');
			const bgSlotTitle = document.createElement('div');
			const bgSlotMoney = document.createElement('div');
			const bgSlotBuy = document.createElement('div');

			bgSlot.setAttribute('class', 'backgroundSlot');
			bgSlot.setAttribute('id', 'backgroundSlot' + i);

			bgSlotTitle.innerHTML = this.#background[i][BG_NAME];
			bgSlotTitle.setAttribute('class', 'title');

			bgSlotMoney.innerHTML = this.#background[i][BG_PRICE];
			bgSlotMoney.setAttribute('class', 'money');

			bgSlotBuy.setAttribute('class', 'button buy on');
			bgSlotBuy.setAttribute('id', 'buttonBackgroundBuy' + i);

			$('tabBackgroundShop').appendChild(bgSlot);
			bgSlot.appendChild(bgSlotTitle);
			bgSlot.appendChild(bgSlotMoney);
			bgSlot.appendChild(bgSlotBuy);
		}
		$('buttonBackgroundBuy0').setAttribute('class', 'button buy off');
	}
}

export const filtration = new Filtration();
export const background = new BackgroundWall();
