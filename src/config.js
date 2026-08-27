/*
 **	CONFIGURATION OBJECT
 **
 */

import { aquarium, updateBuyButtons } from './aquarium.js';
import { fishShop } from './fishshop.js';
import { storage } from './storage.js';
import { loop } from './loop.js';
import { computeBreedingRate, computeFishNumComfort } from './species.js';

function configConstructor() {
	const relaxEnable = () => {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.updateRelaxMode();
		}, 2000);
		document.getElementById('statusEvent').style.backgroundPosition = '38px';
		document.getElementById('statusEventIcon').style.background =
			'url(gfx/interface/alertLightIcon5.png)';
		document.getElementById('statusEventIcon').style.display = 'block';
	};

	const relaxDisable = () => {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.update();
		}, 2000);
		document.getElementById('statusEvent').style.backgroundPosition = '0';
		document.getElementById('statusEventIcon').style.display = 'none';
	};

	this.relaxChange = function () {
		if (document.getElementById('confRelaxMode').checked === true) relaxEnable();
		else relaxDisable();
		this.saveGame();
	};

	/*** NEW GAME ***/

	this.newGame = function () {
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
	};

	this.checkFirstTime = function () {
		if (this.getItem('firstRun') === '1') return false;
		this.setItem('firstRun', '1');
		return true;
	};

	this.saveGame = function () {
		aquarium.saveAquarium();
		fishShop.save();
	};

	this.loadGame = function () {
		aquarium.loadAquarium();
		fishShop.load();
	};

	this.setItem = (key, val) => {
		storage.setItem(key, val);
	};

	this.getItem = (key) => storage.getItem(key);
}

export const config = new configConstructor();
