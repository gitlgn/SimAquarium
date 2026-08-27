/*
 **	FISH SHOP OBJECT
 **
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

class FishShop {
	#slots = [];
	#deliveryTime = 60;
	#timer;

	#delivery() {
		for (let i = 0; i < 9; i++) {
			this.#slots[i][SHOPSLOT_SPEC] = 3 * i + Math.trunc(Math.random() * 3) + 1;

			// The dolphin is a rarity — needs a swimming pool to appear.
			if (i === 8) {
				if (aquarium.getSceneries(4)) {
					if (Math.random() < 0.1) {
						this.#slots[i][SHOPSLOT_SPEC] = 28;
					}
				}
			}

			const spec = fishSpecies[this.#slots[i][SHOPSLOT_SPEC]];
			this.#slots[i][SHOPSLOT_NUM] = Math.trunc((Math.random() * (10 - i) + (10 - i)) / 2);
			this.#slots[i][SHOPSLOT_NAME] = spec.name;
			this.#slots[i][SHOPSLOT_PRICE] = spec.price;
			this.#slots[i][SHOPSLOT_LINK] = spec.link;

			const el = $('fishSlot' + i);
			el.children[0].innerHTML = this.#slots[i][SHOPSLOT_NAME];
			el.children[2].innerHTML = this.#slots[i][SHOPSLOT_PRICE];
			el.children[3].innerHTML = this.#slots[i][SHOPSLOT_NUM];
			/** @type {HTMLElement} */ (el.children[1]).style.backgroundImage =
				'url(gfx/aquarium/fishes/fish' + this.#slots[i][SHOPSLOT_SPEC] + 'R.png)';
		}
	}

	/* Initialize the fish shop */
	init() {
		this.#deliveryTime = 60;
		for (let i = 0; i < 9; i++) {
			this.#slots[i] = [];
		}
		this.#delivery();
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
			this.#delivery();
			aquarium.updateBuyButtonsAlias();
			this.#deliveryTime = 60;
		}
		$('newFishTime').innerHTML = String(this.#deliveryTime);
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
			$('fishSlot' + slotNum).children[3].innerHTML = this.#slots[slotNum][SHOPSLOT_NUM];
			aquarium.updateBuyButtonsAlias();
			config.saveGame();
		}
	}

	updateView() {
		for (let i = 0; i < 9; i++) {
			const buyButton = $('fishSlot' + i).children[5];
			if (this.#slots[i][SHOPSLOT_PRICE] > aquarium.getMoney()) {
				buyButton.setAttribute('class', 'button buy off');
			} else if (this.#slots[i][SHOPSLOT_NUM] === 0) {
				buyButton.setAttribute('class', 'button buy off');
			} else {
				buyButton.setAttribute('class', 'button buy on');
			}
		}
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
			this.#deliveryTime = parseInt(config.getItem('fishShopDeliveryTime'), 10);

			$('newFishTime').innerHTML = String(this.#deliveryTime);
			const el = $('fishSlot' + i);
			el.children[0].innerHTML = this.#slots[i][SHOPSLOT_NAME];
			el.children[2].innerHTML = this.#slots[i][SHOPSLOT_PRICE];
			el.children[3].innerHTML = this.#slots[i][SHOPSLOT_NUM];
			/** @type {HTMLElement} */ (el.children[1]).style.backgroundImage =
				'url(gfx/aquarium/fishes/fish' + this.#slots[i][SHOPSLOT_SPEC] + 'R.png)';
		}
	}
}

export const fishShop = new FishShop();
