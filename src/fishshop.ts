/*
 **	FISH SHOP OBJECT
 **
 **	Phase 6f: #view1 is rendered from #slots each time it changes — no
 **	per-cell `$('fishSlotN').children[x].innerHTML = …` writes, one delegated
 **	Buy / Info listener (wired in events.ts).
 */

import { aquarium } from './aquarium.js';
import { config } from './config.js';
import { fishSpecies } from './species.js';
import { openTab } from './util.js';
import { $ } from './dom.js';
import {
	SHOPSLOT_SPEC,
	SHOPSLOT_NUM,
	SHOPSLOT_NAME,
	SHOPSLOT_PRICE,
	SHOPSLOT_LINK,
	BUY,
	TIME_MINUTE,
} from './constants.js';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

class FishShop {
	#slots: any[][] = [];
	#deliveryTime = 60;
	#timer;

	/*** RENDER — the whole shop panel from #slots ***/
	#render() {
		const money = aquarium.getMoney();
		const full = aquarium.getFishNum() > 63;

		let html =
			'<h2 class="panelHead">Fish Shop</h2>' +
			`<p class="panelInfo">New fish in: <span id="newFishTime">${this.#deliveryTime}</span> minutes</p>`;

		for (let i = 0; i < 9; i++) {
			const s = this.#slots[i];
			const num = s[SHOPSLOT_NUM];
			const price = s[SHOPSLOT_PRICE];
			const canBuy = num > 0 && price <= money && !full;

			html +=
				`<div class="fishSlot" data-slot="${i}">` +
				`<div class="title">${esc(s[SHOPSLOT_NAME])}</div>` +
				`<div class="image" style="background-image:url(gfx/aquarium/fishes/fish${s[SHOPSLOT_SPEC]}R.png)"></div>` +
				`<div class="money">${price}</div>` +
				`<div class="number">${num}</div>` +
				`<div class="button info" data-act="info"></div>` +
				`<div class="button buy${canBuy ? '' : ' off'}" data-act="buy"></div>` +
				`</div>`;
		}
		$('view1').innerHTML = html;
	}

	#deliver() {
		for (let i = 0; i < 9; i++) {
			this.#slots[i][SHOPSLOT_SPEC] = 3 * i + Math.trunc(Math.random() * 3) + 1;

			// The dolphin is a rarity — needs a swimming pool to appear.
			if (i === 8 && aquarium.getSceneries(4) && Math.random() < 0.1) {
				this.#slots[i][SHOPSLOT_SPEC] = 28;
			}

			const spec = fishSpecies[this.#slots[i][SHOPSLOT_SPEC]];
			this.#slots[i][SHOPSLOT_NUM] = Math.trunc((Math.random() * (10 - i) + (10 - i)) / 2);
			this.#slots[i][SHOPSLOT_NAME] = spec.name;
			this.#slots[i][SHOPSLOT_PRICE] = spec.price;
			this.#slots[i][SHOPSLOT_LINK] = spec.link;
		}
		this.#render();
	}

	/* Initialize the fish shop */
	init() {
		this.#deliveryTime = 60;
		for (let i = 0; i < 9; i++) {
			this.#slots[i] = [];
		}
		this.#deliver();
		this.updateDeliveryTime(); // start the fish shop counter
	}

	setDeliveryTimer() {
		this.#timer = window.setTimeout(() => this.updateDeliveryTime(), TIME_MINUTE);
	}

	clearDerliveryTimer() {
		window.clearTimeout(this.#timer);
	}

	updateDeliveryTime() {
		this.#deliveryTime--;
		if (this.#deliveryTime === 0) {
			this.#deliver();
			aquarium.updateBuyButtonsAlias();
			this.#deliveryTime = 60;
		}
		$('newFishTime').textContent = String(this.#deliveryTime); // one value binding per tick
		this.#timer = window.setTimeout(() => this.updateDeliveryTime(), TIME_MINUTE);
	}

	openFishInfo(slotNum) {
		openTab(this.#slots[slotNum][SHOPSLOT_LINK]);
	}

	buyFish(slotNum) {
		if (this.#slots[slotNum][SHOPSLOT_NUM] < 1) return;
		if (aquarium.getFishNum() > 63) return;

		if (aquarium.changeMoney(BUY * this.#slots[slotNum][SHOPSLOT_PRICE])) {
			aquarium.addFish(this.#slots[slotNum][SHOPSLOT_SPEC], 0.4);
			this.#slots[slotNum][SHOPSLOT_NUM]--;
			this.#render();
			aquarium.updateBuyButtonsAlias();
			config.saveGame();
		}
	}

	/** Re-evaluate affordability / stock (called from aquarium.#updateBuyButtons). */
	updateView() {
		this.#render();
	}

	save() {
		for (let i = 0; i < 9; i++) {
			config.setItem('fishShopSlot' + i + 'spec', this.#slots[i][SHOPSLOT_SPEC]);
			config.setItem('fishShopSlot' + i + 'num', this.#slots[i][SHOPSLOT_NUM]);
			config.setItem('fishShopSlot' + i + 'name', this.#slots[i][SHOPSLOT_NAME]);
			config.setItem('fishShopSlot' + i + 'price', this.#slots[i][SHOPSLOT_PRICE]);
			config.setItem('fishShopSlot' + i + 'link', this.#slots[i][SHOPSLOT_LINK]);
			config.setItem('fishShopDeliveryTime', this.#deliveryTime);
		}
	}

	load() {
		for (let i = 0; i < 9; i++) {
			this.#slots[i][SHOPSLOT_SPEC] = parseInt(
				config.getItem('fishShopSlot' + i + 'spec'),
				10
			);
			this.#slots[i][SHOPSLOT_NUM] = parseInt(config.getItem('fishShopSlot' + i + 'num'), 10);
			this.#slots[i][SHOPSLOT_NAME] = config.getItem('fishShopSlot' + i + 'name');
			this.#slots[i][SHOPSLOT_PRICE] = parseInt(
				config.getItem('fishShopSlot' + i + 'price'),
				10
			);
			this.#slots[i][SHOPSLOT_LINK] = config.getItem('fishShopSlot' + i + 'link');
		}
		this.#deliveryTime = parseInt(config.getItem('fishShopDeliveryTime'), 10);
		this.#render();
	}
}

export const fishShop = new FishShop();
