/*
 **	CONFIGURATION OBJECT
 **
 */

import { aquarium, updateBuyButtons } from './aquarium.js';
import { fishShop } from './fishshop.js';
import { storage } from './storage.js';
import { loop } from './loop.js';
import { computeBreedingRate, computeFishNumComfort, rebuildFishFrames } from './species.js';
import { setFishSkin, loadCartoonSprites, type FishSkin } from './fishArt.js';
import { $ } from './dom.js';
import { toast } from './toast.js';

class Config {
	#relaxEnable() {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.updateRelaxMode();
		}, 2000);
		$('stage').classList.add('relax');
		toast.show('relax', 'Relax mode on — game paused');
	}

	#relaxDisable() {
		clearInterval(loop.big);
		loop.big = window.setInterval(() => {
			aquarium.update();
		}, 2000);
		$('stage').classList.remove('relax');
		toast.show('relax', 'Relax mode off');
	}

	/** @returns {HTMLInputElement} */
	#relaxCheckbox() {
		return $('confRelaxMode') as HTMLInputElement;
	}

	relaxChange() {
		if (this.#relaxCheckbox().checked === true) this.#relaxEnable();
		else this.#relaxDisable();
		this.saveGame();
	}

	/*** FISH SKIN — classic drawn set vs the flat Kenney sprites ***/
	#applySkin(s: FishSkin) {
		setFishSkin(s);
		const paint = () => {
			rebuildFishFrames();
			fishShop.updateView();
			aquarium.render();
		};
		if (s === 'cartoon') void loadCartoonSprites().then(paint);
		else paint();
	}

	/** Read the saved skin on boot and reflect it in the checkbox. */
	loadSkin() {
		const s: FishSkin = this.getItem('fishSkin') === 'cartoon' ? 'cartoon' : 'classic';
		($('confFishSkin') as HTMLInputElement).checked = s === 'cartoon';
		this.#applySkin(s);
	}

	skinChange() {
		const s: FishSkin = ($('confFishSkin') as HTMLInputElement).checked ? 'cartoon' : 'classic';
		this.setItem('fishSkin', s);
		this.#applySkin(s);
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

		this.#relaxCheckbox().checked = false;

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

	setItem(key: string, val: string | number) {
		storage.setItem(key, val);
	}

	getItem(key: string) {
		return storage.getItem(key);
	}
}

export const config = new Config();
