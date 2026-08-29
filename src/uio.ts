/*
 **	UIO - USER INTERFACE OBJECT MODULE
 **	Every change in user interface is controlled by this object
 */

import { aquarium } from './aquarium.js';
import { loop, smallIntervals } from './loop.js';
import { PAGEMODE_MAXI, PAGEMODE_MINI, VIEW_AQUARIUM } from './constants.js';
import { $ } from './dom.js';
import { toast } from './toast.js';

class Uio {
	#frontPageMode = PAGEMODE_MAXI;
	#view = VIEW_AQUARIUM;
	#rememberSpeed;
	#alertNumber = -1; // 0 sick, 1 hungry/starving, 2 breeds, 3 dies, 4 attacks

	getView() {
		return this.#view;
	}

	// Minimizing & maximizing front page — `.mini` on #stage drives the CSS
	// (shell.css / toolbar.css); the game loop just slows to a crawl.
	changeFrontPageMode() {
		if (this.#frontPageMode === PAGEMODE_MAXI) {
			this.changeView(VIEW_AQUARIUM); // panel body must be showing the tank, not a shop
			$('stage').classList.add('mini'); // CSS swaps the pageMode icon + hides the chrome
			this.#frontPageMode = PAGEMODE_MINI;
			this.#rememberSpeed = loop.chosenSpeed;
			this.setSmallInterval(0);
		} else if (this.#frontPageMode === PAGEMODE_MINI) {
			$('stage').classList.remove('mini');
			this.#frontPageMode = PAGEMODE_MAXI;
			this.setSmallInterval(this.#rememberSpeed);
		}
	}

	// Configuration overlay — #pageBack sits on top of the (still-rendered)
	// #pageFront, with its own Close button, so opening it can't strand you.
	flipWidget() {
		const back = $('pageBack');
		back.hidden = !back.hidden;
	}

	// Changing the view — the `.active` class drives the button look (toolbar.css),
	// :hover is pure CSS now.
	changeView(viewNumber) {
		if (this.#view === viewNumber) return;

		if (viewNumber === VIEW_AQUARIUM) aquarium.render();

		$('buttonView' + this.#view).setAttribute('class', 'buttonView');
		$('view' + this.#view).hidden = true;

		$('buttonView' + viewNumber).setAttribute('class', 'buttonView active');
		$('view' + viewNumber).hidden = false;

		this.#view = viewNumber;
	}

	openHelp() {
		// widget.openURL( "http://xtrsyz.org/" );
	}

	/*** Speed bar — map the pointer's x fraction across the bar to one of the
	 * six speeds (0 = slowest). Width-independent so the bar can be any size. */
	speedBarSet(e: MouseEvent) {
		const width = $('speedBar').clientWidth || 1;
		const frac = e.offsetX / width;
		const delay = Math.min(5, Math.max(0, Math.floor(frac * 6)));
		this.setSmallInterval(delay);
	}

	setSmallInterval(delay: number) {
		window.clearInterval(loop.small);
		loop.small = window.setInterval(() => {
			aquarium.moveFish();
		}, smallIntervals[delay]);

		// paint the slider fill + thumb from the value (calc(var()*%) is flaky
		// with plain-number custom props, so compute it here)
		const frac = delay / 5;
		const stop = (frac * 100).toFixed(1) + '%';
		$('speedBar').style.background =
			'linear-gradient(to right, var(--speed-fill) ' +
			stop +
			', var(--speed-track) ' +
			stop +
			')';
		$('speedHandle').style.left = 'calc(' + stop + ' - ' + (frac * 16).toFixed(1) + 'px)';

		loop.chosenSpeed = delay;
	}

	changeAlertNum(alertNum) {
		this.#alertNumber = alertNum;
	}

	/** Called once per update() tick — surface any pending game event as a toast. */
	flushAlert() {
		if (this.#alertNumber < 0) return;
		toast.event(this.#alertNumber);
		this.#alertNumber = -1;
	}
}

export const uio = new Uio();
