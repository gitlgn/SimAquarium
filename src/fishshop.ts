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

// A plain fish glyph, tinted per species via `currentColor` (CSS reads
// `--fish-hue` off the card). Recognisable as a fish without needing 29
// per-species bitmaps — see public/css/viewFish.css.
const FISH_GLYPH =
	'<svg class="shopCard-fishIcon" viewBox="0 0 64 40" aria-hidden="true">' +
	'<path d="M20 20 L3 6 Q9 20 3 34 Z" fill="currentColor"/>' +
	'<ellipse cx="36" cy="20" rx="21" ry="13" fill="currentColor"/>' +
	'<path d="M27 8 Q36 -3 46 8 Z" fill="currentColor"/>' +
	'<circle cx="47" cy="15" r="2.6" fill="#08263b"/>' +
	'</svg>';

// Column order matches the SHOPSLOT_* constants. Mutable — `buyFish` decrements
// the stock count in place; the rest of the row is only ever replaced wholesale
// (by #deliver / load).
type ShopSlotRow = [spec: number, num: number, name: string, price: number, link: string];

class FishShop {
	#slots: ShopSlotRow[] = [];
	#deliveryTime = 60;
	#timer = 0;

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
			const hue = (s[SHOPSLOT_SPEC] * 47) % 360;
			const soldOut = num < 1;

			html +=
				`<div class="shopCard" data-slot="${i}">` +
				`<div class="shopCard-art" style="--fish-hue:${hue}">` +
				FISH_GLYPH +
				`<span class="shopCard-stock${soldOut ? ' is-empty' : ''}" title="In stock: ${num}">${num}</span>` +
				`</div>` +
				`<div class="shopCard-name" title="${esc(s[SHOPSLOT_NAME])}">${esc(s[SHOPSLOT_NAME])}</div>` +
				`<div class="shopCard-actions">` +
				`<button type="button" class="shopCard-btn shopCard-info" data-act="info" aria-label="Species info">i</button>` +
				`<button type="button" class="shopCard-btn shopCard-buy${canBuy ? '' : ' is-off'}" data-act="buy"${canBuy ? '' : ' disabled'}>` +
				`Buy <b>${price}</b>` +
				`</button>` +
				`</div>` +
				`</div>`;
		}
		$('view1').innerHTML = html;
	}

	#deliver() {
		for (let i = 0; i < 9; i++) {
			let specNum = 3 * i + Math.trunc(Math.random() * 3) + 1;

			// The dolphin is a rarity — needs a swimming pool to appear.
			if (i === 8 && aquarium.getSceneries(4) && Math.random() < 0.1) specNum = 28;

			const spec = fishSpecies[specNum];
			const num = Math.trunc((Math.random() * (10 - i) + (10 - i)) / 2);
			this.#slots[i] = [specNum, num, spec.name, spec.price, spec.link];
		}
		this.#render();
	}

	/* Initialize the fish shop */
	init() {
		this.#deliveryTime = 60;
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

	openFishInfo(slotNum: number) {
		openTab(this.#slots[slotNum][SHOPSLOT_LINK]);
	}

	buyFish(slotNum: number) {
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
			const key = 'fishShopSlot' + i;
			this.#slots[i] = [
				parseInt(config.getItem(key + 'spec'), 10),
				parseInt(config.getItem(key + 'num'), 10),
				config.getItem(key + 'name'),
				parseInt(config.getItem(key + 'price'), 10),
				config.getItem(key + 'link'),
			];
		}
		this.#deliveryTime = parseInt(config.getItem('fishShopDeliveryTime'), 10);
		this.#render();
	}
}

export const fishShop = new FishShop();
