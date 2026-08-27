/*
 **	FILTRATION OBJECT
 **
 */

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

/*** CONSTANTS ***/

const PATH_FILTERS = 'gfx/filters/';

function filtrationConstructor() {
	const filter = [];

	const createFilter = (name, fileName, price, comfort, pollution, energyCost) => {
		const row = [];
		row[FI_NAME] = name;
		row[FI_PRICE] = price;
		row[FI_COMFORT] = comfort;
		row[FI_POLLUTION] = pollution;
		row[FI_ENERGY] = energyCost;
		row[FI_IMAGE] = new Image();
		row[FI_IMAGE].src = PATH_FILTERS + fileName;
		filter.push(row);
	};

	createFilter('Box filter', 'filter0.png', 0, 0.95, -0.06, 0.032);
	createFilter('Cannister filter', 'filter1.png', 120, 0.92, -0.12, 0.016);
	createFilter('Undergravel filter', 'filter2.png', 240, 0.99, -0.24, 0.008);
	createFilter('Fluidized bed filter', 'filter3.png', 960, 0.97, -0.48, 0.004);
	createFilter('Power filter', 'filter4.png', 1920, 0.96, -0.96, 0.002);
	createFilter('Advanced Power Filter', 'filter5.png', 7680, 0.98, -1.92, 0.001);

	this.getFilterData = (num, data) => {
		const idx = Number.parseInt(num, 10) || 0;
		return filter[idx][data];
	};
}

export const filtration = new filtrationConstructor();

/*** BACKGROUND WALL OBJECT ***/

const PATH_BGS = 'gfx/view4/';

function backgroundConstructor() {
	const background = [];

	const createBackground = (name, fileName, price) => {
		const row = [];
		row[BG_NAME] = name;
		row[BG_PRICE] = price;
		row[BG_IMAGE] = PATH_BGS + fileName;
		background.push(row);
	};

	this.getBackgroundSrc = (bg) => background[bg][BG_IMAGE];

	/*** CREATE HTML FOR BACKGROUNDS ***/
	this.createBackgroundSlots = () => {
		for (let i = 0; i < background.length; i++) {
			const bgSlot = document.createElement('div');
			const bgSlotTitle = document.createElement('div');
			const bgSlotMoney = document.createElement('div');
			const bgSlotBuy = document.createElement('div');

			bgSlot.setAttribute('class', 'backgroundSlot');
			bgSlot.setAttribute('id', 'backgroundSlot' + i);

			bgSlotTitle.innerHTML = background[i][BG_NAME];
			bgSlotTitle.setAttribute('class', 'title');

			bgSlotMoney.innerHTML = background[i][BG_PRICE];
			bgSlotMoney.setAttribute('class', 'money');

			bgSlotBuy.setAttribute('class', 'button buy on');
			bgSlotBuy.setAttribute('id', 'buttonBackgroundBuy' + i);

			document.getElementById('tabBackgroundShop').appendChild(bgSlot);
			bgSlot.appendChild(bgSlotTitle);
			bgSlot.appendChild(bgSlotMoney);
			bgSlot.appendChild(bgSlotBuy);
		}
		document.getElementById('buttonBackgroundBuy0').setAttribute('class', 'button buy off');
	};

	createBackground('White', 'bg0.png', 60);
	createBackground('Black', 'bg1.png', 60);
	createBackground('Red', 'bg2.png', 60);
	createBackground('Yellow', 'bg3.png', 60);
	createBackground('Blue', 'bg4.png', 60);

	createBackground('Orange', 'bg5.png', 90);
	createBackground('Green', 'bg6.png', 90);
	createBackground('Violet', 'bg7.png', 90);
	createBackground('Brown', 'bg8.png', 90);
	createBackground('Sepia', 'bg9.png', 90);

	createBackground('Metal', 'bg10.png', 120);
	createBackground('Rivets', 'bg11.png', 120);
	createBackground('Rust', 'bg12.png', 120);
	createBackground('Fun', 'bg13.png', 180);
	createBackground('Transparent', 'bg14.png', 240);

	this.getBackgroundData = (num, data) => background[num][data];
}

export const background = new backgroundConstructor();
