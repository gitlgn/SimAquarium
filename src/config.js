/*
 **	CONFIGURATION OBJECT
 **
 */

import { aquarium, updateBuyButtons } from './aquarium.js';
import { fishShop } from './fishshop.js';
import { storage } from './storage.js';
import { loop } from './loop.js';
import { computeBreedingRate, computeFishNumComfort } from './species.js';

class Config {
	#relaxEnable() {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.updateRelaxMode();
		}, 2000);
		document.getElementById('statusEvent').style.backgroundPosition = '38px';
		document.getElementById('statusEventIcon').style.background =
			'url(gfx/interface/alertLightIcon5.png)';
		document.getElementById('statusEventIcon').style.display = 'block';
	}

	#relaxDisable() {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.update();
		}, 2000);
		document.getElementById('statusEvent').style.backgroundPosition = '0';
		document.getElementById('statusEventIcon').style.display = 'none';
	}

	relaxChange() {
		if (document.getElementById('confRelaxMode').checked === true) this.#relaxEnable();
		else this.#relaxDisable();
		this.saveGame();
	}

	/*** NEW GAME ***/
	newGame() {
		fishShop.clearDerliveryTimer();
		fishShop.init();

		aquarium.resetAquarium();
		aquarium.addFish(1, 0.9999);

		computeBreedingRate();
		computeFishNumComfort();

		window.clearInterval(loop.small);
		window.clearInterval(loop.big);
		loop.small = window.setInterval(() => {
			aquarium.moveFish();
		}, 128);
		loop.big = window.setInterval(() => {
			aquarium.update();
		}, 2000);

		document.getElementById('confRelaxMode').checked = false;

		updateBuyButtons();
		this.saveGame();
	}

	checkFirstTime() {
		if (this.getItem('firstRun') === '1') return false;
		this.setItem('firstRun', '1');
		return true;
	}

	saveGame() {
		aquarium.saveAquarium();
		fishShop.save();
	}

	loadGame() {
		aquarium.loadAquarium();
		fishShop.load();
	}

	setItem(key, val) {
		storage.setItem(key, val);
	}

	getItem(key) {
		return storage.getItem(key);
	}
}

export const config = new Config();
