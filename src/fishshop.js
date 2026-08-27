/*
 **	FISH SHOP OBJECT
 **
 */

import { aquarium } from './aquarium.js';
import { config } from './config.js';
import { fishSpecies } from './species.js';
import { openTab } from './util.js';
import {
	SHOPSLOT_SPEC,
	SHOPSLOT_NUM,
	SHOPSLOT_NAME,
	SHOPSLOT_PRICE,
	SHOPSLOT_LINK,
	SPEC_NAME,
	SPEC_PRICE,
	SPEC_LINK,
	BUY,
	TIME_MINUTE,
} from './constants.js';

function fishShopConstructor() {
	/*** FISH SHOP INIT ***/

	const fishShopSlot = [];
	let fishShopDeliveryTime = 60;
	let fishShopTimer;

	/*** FISH SHOP DELIVERY ***/

	const delivery = () => {
		for (let i = 0; i < 9; i++) {
			fishShopSlot[i][SHOPSLOT_SPEC] = 3 * i + parseInt(Math.random() * 3) + 1;

			// DOLPHIN IS A RARITY AND YOU NEED TO HAVE A SWIMMING POOL TO GET IT
			if (i === 8) {
				if (aquarium.getSceneries(4)) {
					if (Math.random() < 0.1) {
						fishShopSlot[i][SHOPSLOT_SPEC] = 28;
					}
				}
			}

			fishShopSlot[i][SHOPSLOT_NUM] = parseInt((Math.random() * (10 - i) + (10 - i)) / 2);
			fishShopSlot[i][SHOPSLOT_NAME] = fishSpecies[fishShopSlot[i][SHOPSLOT_SPEC]][SPEC_NAME];
			fishShopSlot[i][SHOPSLOT_PRICE] =
				fishSpecies[fishShopSlot[i][SHOPSLOT_SPEC]][SPEC_PRICE];
			fishShopSlot[i][SHOPSLOT_LINK] = fishSpecies[fishShopSlot[i][SHOPSLOT_SPEC]][SPEC_LINK];

			const slot = document.getElementById('fishSlot' + i);
			slot.children[0].innerHTML = fishShopSlot[i][SHOPSLOT_NAME];
			slot.children[2].innerHTML = fishShopSlot[i][SHOPSLOT_PRICE];
			slot.children[3].innerHTML = fishShopSlot[i][SHOPSLOT_NUM];
			slot.children[1].style.backgroundImage =
				'url(gfx/aquarium/fishes/fish' + fishShopSlot[i][SHOPSLOT_SPEC] + 'R.png)';
		}
	};

	/* Initialize the fish shop */
	this.init = () => {
		fishShopDeliveryTime = 60;
		for (let i = 0; i < 9; i++) {
			fishShopSlot[i] = [];
		}
		delivery();
		fishShop.updateDeliveryTime(); // start the fish shop counter
	};

	/*** FISH SHOP DELIVERY TIMER ***/

	this.setDeliveryTimer = () => {
		fishShopTimer = window.setTimeout(() => {
			fishShop.updateDeliveryTime();
		}, TIME_MINUTE);
	};

	this.clearDerliveryTimer = () => {
		window.clearTimeout(fishShopTimer);
	};

	this.updateDeliveryTime = () => {
		fishShopDeliveryTime--;
		if (fishShopDeliveryTime === 0) {
			delivery();
			aquarium.updateBuyButtonsAlias();
			fishShopDeliveryTime = 60;
		}
		document.getElementById('newFishTime').innerHTML = fishShopDeliveryTime;
		fishShopTimer = window.setTimeout(() => {
			fishShop.updateDeliveryTime();
		}, TIME_MINUTE);
	};

	/*** OPEN FISH INFO ***/
	this.openFishInfo = (slotNum) => {
		openTab(fishShopSlot[slotNum][SHOPSLOT_LINK]);
	};

	/*** BUY FISH ***/
	this.buyFish = (slotNum) => {
		if (fishShopSlot[slotNum][SHOPSLOT_NUM] < 1) return;
		if (aquarium.getFishNum() > 63) return;

		if (aquarium.changeMoney(BUY * fishShopSlot[slotNum][SHOPSLOT_PRICE])) {
			aquarium.addFish(fishShopSlot[slotNum][SHOPSLOT_SPEC], 0.4);
			fishShopSlot[slotNum][SHOPSLOT_NUM]--;
			document.getElementById('fishSlot' + slotNum).children[3].innerHTML =
				fishShopSlot[slotNum][SHOPSLOT_NUM];
			aquarium.updateBuyButtonsAlias();
			config.saveGame();
		}
	};

	this.updateView = () => {
		for (let i = 0; i < 9; i++) {
			const buyButton = document.getElementById('fishSlot' + i).children[5];
			if (fishShopSlot[i][SHOPSLOT_PRICE] > aquarium.getMoney()) {
				buyButton.setAttribute('class', 'button buy off');
			} else if (fishShopSlot[i][SHOPSLOT_NUM] === 0) {
				buyButton.setAttribute('class', 'button buy off');
			} else {
				buyButton.setAttribute('class', 'button buy on');
			}
		}
	};

	this.save = () => {
		for (let i = 0; i < 9; i++) {
			config.setItem('fishShopSlot' + i + 'spec', fishShopSlot[i][SHOPSLOT_SPEC]);
			config.setItem('fishShopSlot' + i + 'num', fishShopSlot[i][SHOPSLOT_NUM]);
			config.setItem('fishShopSlot' + i + 'name', fishShopSlot[i][SHOPSLOT_NAME]);
			config.setItem('fishShopSlot' + i + 'price', fishShopSlot[i][SHOPSLOT_PRICE]);
			config.setItem('fishShopSlot' + i + 'link', fishShopSlot[i][SHOPSLOT_LINK]);
			config.setItem('fishShopDeliveryTime', fishShopDeliveryTime);
		}
	};

	this.load = () => {
		for (let i = 0; i < 9; i++) {
			fishShopSlot[i][SHOPSLOT_SPEC] = parseInt(
				config.getItem('fishShopSlot' + i + 'spec'),
				10
			);
			fishShopSlot[i][SHOPSLOT_NUM] = parseInt(
				config.getItem('fishShopSlot' + i + 'num'),
				10
			);
			fishShopSlot[i][SHOPSLOT_NAME] = config.getItem('fishShopSlot' + i + 'name');
			fishShopSlot[i][SHOPSLOT_PRICE] = parseInt(
				config.getItem('fishShopSlot' + i + 'price'),
				10
			);
			fishShopSlot[i][SHOPSLOT_LINK] = config.getItem('fishShopSlot' + i + 'link');
			fishShopDeliveryTime = config.getItem('fishShopDeliveryTime');

			document.getElementById('newFishTime').innerHTML = fishShopDeliveryTime;
			const slot = document.getElementById('fishSlot' + i);
			slot.children[0].innerHTML = fishShopSlot[i][SHOPSLOT_NAME];
			slot.children[2].innerHTML = fishShopSlot[i][SHOPSLOT_PRICE];
			slot.children[3].innerHTML = fishShopSlot[i][SHOPSLOT_NUM];
			slot.children[1].style.backgroundImage =
				'url(gfx/aquarium/fishes/fish' + fishShopSlot[i][SHOPSLOT_SPEC] + 'R.png)';
		}
	};
}

export const fishShop = new fishShopConstructor();
