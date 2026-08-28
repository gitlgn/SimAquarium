/*
 **	EVENTS MODULE
 **	Wires the DOM controls to the game objects. Called once from main.js.
 */

import { aquarium, updateBuyButtons } from './aquarium.js';
import { config } from './config.js';
import { fishShop } from './fishshop.js';
import { stats } from './statistics.js';
import { uio } from './uio.js';
import { openTab } from './util.js';
import { $ } from './dom.js';

const on = (id, type, handler) => $(id).addEventListener(type, handler, false);

// The 2014 version gated this behind a code fetched from xtrsyz.org (now dead).
// Just top up the balance directly.
function coinAdd() {
	aquarium.addMoney(1000);
	updateBuyButtons();
	config.saveGame();
}

export function eventsCreate() {
	/*** WIDGET / CHROME ***/
	on('buttonWidget0', 'click', () =>
		openTab('https://xtrsyz.org/2014/02/simaquarium-extensions/')
	);
	on('buttonWidget1', 'click', () => uio.flipWidget());
	on('buttonWidget2', 'click', () => {
		uio.closeWidget();
		config.saveGame();
	});
	on('pageMode', 'click', () => uio.changeFrontPageMode());
	on('Copyrights', 'click', () => openTab('https://xtrsyz.org/'));

	/*** VIEW BUTTONS (index === view number) — :hover is CSS now ***/
	for (let v = 0; v <= 5; v++) {
		on('buttonView' + v, 'click', () => {
			uio.changeView(v);
			if (v === 5) stats.refreshStatsPage();
		});
	}

	/*** SCENERY / LIGHTING / FILTER / BACKGROUND SHOPS ***/
	const shops = [
		{ prefix: 'Scenery', count: 9, buy: 'buyScenery', sell: 'sellScenery' },
		{ prefix: 'Light', count: 9, buy: 'buyLight', sell: 'sellLight' },
		{ prefix: 'Filter', count: 6, buy: 'buyFilter', sell: 'sellFilter' },
		{ prefix: 'Background', count: 15, buy: 'buyBackground', sell: null },
	];
	for (const { prefix, count, buy, sell } of shops) {
		for (let i = 0; i < count; i++) {
			on('button' + prefix + 'Buy' + i, 'click', () => aquarium[buy](i));
			if (sell && i > 0) on('button' + prefix + 'Sell' + i, 'click', () => aquarium[sell](i));
		}
	}

	/*** ACCESSORIES / STATISTICS TABS ***/
	on('tabButtonFilterShop', 'click', () => uio.changeTab('BackgroundShop', 'FilterShop'));
	on('tabButtonBackgroundShop', 'click', () => uio.changeTab('FilterShop', 'BackgroundShop'));
	on('tabButtonFishList', 'click', () => {
		uio.changeTab('Statistics', 'FishList');
		stats.refreshStatsPage();
	});
	on('tabButtonStatistics', 'click', () => {
		uio.changeTab('FishList', 'Statistics');
		stats.refreshStatsPage();
	});

	/*** AQUARIUM TOOLS (buttonTool0..7) ***/
	const tools = [
		'scareFish',
		'attractFish',
		'addFood',
		'addMedicine',
		'clean',
		'waterChange',
		'addGrowHormone',
		'addBreedHormone',
	];
	tools.forEach((method, i) => on('buttonTool' + i, 'click', () => aquarium[method]()));

	on('cameraTool', 'click', () => aquarium.exportPhoto());

	// Speed bar: drag (or tap) to set — one handler for mouse, pen and touch.
	const speedBar = $('speedBar');
	let draggingSpeed = false;
	speedBar.addEventListener('pointerdown', (e) => {
		draggingSpeed = true;
		try {
			speedBar.setPointerCapture(e.pointerId);
		} catch {
			/* no active pointer (synthetic event) — the flag is enough */
		}
		uio.speedBarSet(e);
	});
	speedBar.addEventListener('pointermove', (e) => {
		if (draggingSpeed) uio.speedBarSet(e);
	});
	const endSpeedDrag = () => {
		draggingSpeed = false;
	};
	speedBar.addEventListener('pointerup', endSpeedDrag);
	speedBar.addEventListener('pointercancel', endSpeedDrag);

	/*** FISH SHOP SLOTS (info = child 4, buy = child 5) ***/
	for (let i = 0; i < 9; i++) {
		const slot = $('fishSlot' + i);
		slot.children[4].addEventListener('click', () => fishShop.openFishInfo(i), false);
		slot.children[5].addEventListener('click', () => fishShop.buyFish(i), false);
	}

	/*** PREFERENCES ***/
	on('confRelaxMode', 'change', () => config.relaxChange());
	on('confNewGame', 'click', () => config.newGame());
	on('coinAdd', 'click', () => coinAdd());
}
