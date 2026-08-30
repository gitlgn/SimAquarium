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

const on = (id: string, type: string, handler: EventListener) =>
	$(id).addEventListener(type, handler, false);

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
	on('pageMode', 'click', () => uio.changeFrontPageMode());

	// Autosave — the game already saves on every buy/sell/tool; also flush when
	// the tab is hidden or unloaded (there's no "Save & Exit" button any more).
	const flush = () => config.saveGame();
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') flush();
	});
	window.addEventListener('pagehide', flush);
	on('Copyrights', 'click', () => openTab('https://xtrsyz.org/'));

	/*** VIEW BUTTONS (index === view number) — :hover is CSS now ***/
	for (let v = 0; v <= 5; v++) {
		on('buttonView' + v, 'click', () => {
			uio.changeView(v);
			if (v === 5) {
				$('view5').classList.remove('show-tankinfo'); // stats button = fish list
				stats.refreshStatsPage();
			}
		});
	}

	/*** WATER GAUGE — tap to toggle the Statistics view between Fish List and
	     Tank Info (tap again, or the Statistics button, to go back). ***/
	on('statusWater', 'click', () => {
		const wantTankInfo = !$('view5').classList.contains('show-tankinfo');
		$('view5').classList.toggle('show-tankinfo', wantTankInfo);
		uio.changeView(5); // no-op if already there
		stats.refreshStatsPage();
	});

	/*** SCENERY / LIGHTING / FILTER SHOPS (static buttons in index.html) ***/
	const shops = [
		{ prefix: 'Scenery', count: 9, buy: 'buyScenery', sell: 'sellScenery' },
		{ prefix: 'Light', count: 9, buy: 'buyLight', sell: 'sellLight' },
		{ prefix: 'Filter', count: 6, buy: 'buyFilter', sell: 'sellFilter' },
	] as const;
	for (const { prefix, count, buy, sell } of shops) {
		for (let i = 0; i < count; i++) {
			on('button' + prefix + 'Buy' + i, 'click', () => aquarium[buy](i));
			if (sell && i > 0) on('button' + prefix + 'Sell' + i, 'click', () => aquarium[sell](i));
		}
	}

	/*** BACKGROUND SHOP — delegated (the panel is re-rendered from state) ***/
	on('tabBackgroundShop', 'click', (e) => {
		const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act="buy"]');
		const slot = el?.closest<HTMLElement>('[data-bg]');
		if (!slot) return;
		aquarium.buyBackground(Number(slot.dataset.bg));
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
	] as const;
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

	/*** FISH SHOP SLOTS — delegated (the panel is re-rendered from state) ***/
	on('view1', 'click', (e) => {
		const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
		if (!el) return;
		const slot = Number(el.closest<HTMLElement>('[data-slot]')?.dataset.slot);
		if (Number.isNaN(slot)) return;
		if (el.dataset.act === 'info') fishShop.openFishInfo(slot);
		else if (el.dataset.act === 'buy') fishShop.buyFish(slot);
	});

	/*** PREFERENCES ***/
	on('confClose', 'click', () => uio.flipWidget());
	on('confRelaxMode', 'change', () => config.relaxChange());
	on('confFishSkin', 'change', () => config.skinChange());
	on('confNewGame', 'click', () => config.newGame());
	on('coinAdd', 'click', () => coinAdd());
}
