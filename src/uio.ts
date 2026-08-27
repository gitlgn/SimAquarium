/*
 **	UIO - USER INTERFACE OBJECT MODULE
 **	Every change in user interface is controlled by this object
 */

import { aquarium } from './aquarium.js';
import { config } from './config.js';
import { loop, smallIntervals } from './loop.js';
import { PAGE_FRONT, PAGE_BACK, PAGEMODE_MAXI, PAGEMODE_MINI, VIEW_AQUARIUM } from './constants.js';
import { $ } from './dom.js';

class Uio {
	#page = PAGE_FRONT;
	#frontPageMode = PAGEMODE_MAXI;
	#view = VIEW_AQUARIUM;
	#rememberSpeed;
	#alertNumber = -1; // 0 sick, 1 hungry/starving, 2 breeds, 3 dies, 4 attacks
	#hideStatusTimer;

	getView() {
		return this.#view;
	}

	// Minimizing & maximizing front page
	changeFrontPageMode() {
		if (this.#frontPageMode === PAGEMODE_MAXI) {
			$('aquariumViews').style.display = 'none';
			$('toolbarTools').style.display = 'none';
			$('pageMode').style.bottom = '193px';
			$('pageMode').style.content = 'url(gfx/interface/viewIcon1.png)';
			$('pageFront').style.backgroundPosition = '379px 0';
			this.#frontPageMode = PAGEMODE_MINI;
			this.#rememberSpeed = loop.chosenSpeed;
			this.setSmallInterval(0);
		} else if (this.#frontPageMode === PAGEMODE_MINI) {
			$('aquariumViews').style.display = 'block';
			$('toolbarTools').style.display = 'block';
			$('pageMode').style.bottom = '13px';
			$('pageMode').style.content = 'url(gfx/interface/viewIcon0.png)';
			$('pageFront').style.backgroundPosition = '-78px 0';
			this.#frontPageMode = PAGEMODE_MAXI;
			this.setSmallInterval(this.#rememberSpeed);
		}
	}

	// Flipping the widget
	flipWidget() {
		if (this.#page === PAGE_FRONT) {
			$('pageFront').style.display = 'none';
			$('pageBack').style.display = 'block';
			this.#page = PAGE_BACK;
		} else if (this.#page === PAGE_BACK) {
			$('pageBack').style.display = 'none';
			$('pageFront').style.display = 'block';
			this.#page = PAGE_FRONT;
		}
	}

	// Highlight view button On and Off
	highlightViewButtonOn(viewNumber) {
		if (this.#view === viewNumber) return;
		$('buttonView' + viewNumber).style.backgroundPosition = '48px 0';
	}
	highlightViewButtonOff(viewNumber) {
		if (this.#view === viewNumber) return;
		$('buttonView' + viewNumber).style.backgroundPosition = '0 0';
	}

	// Changing the view
	changeView(viewNumber) {
		if (this.#view === viewNumber) return;

		if (viewNumber === VIEW_AQUARIUM) aquarium.render();

		$('buttonView' + this.#view).style.backgroundPosition = '0 0';
		$('buttonView' + this.#view).setAttribute('class', 'buttonView');
		$('view' + this.#view).style.display = 'none';

		$('buttonView' + viewNumber).style.backgroundPosition = '24px 0';
		$('buttonView' + viewNumber).setAttribute('class', 'buttonView active');
		$('view' + viewNumber).style.display = 'block';

		this.#view = viewNumber;
	}

	closeWidget() {
		config.saveGame();
		window.close();
	}

	openHelp() {
		// widget.openURL( "http://xtrsyz.org/" );
	}

	changeTab(tabOff, tabOn) {
		$('tab' + tabOff).style.display = 'none';
		$('tab' + tabOn).style.display = 'block';

		$('tabButton' + tabOff).setAttribute('class', 'tab');
		$('tabButton' + tabOn).setAttribute('class', 'tab active');
	}

	/*** Speed bar — map the x offset within the 50px bar to one of six speeds. */
	speedBarSet(e: MouseEvent) {
		const x = e.offsetX;
		if (x < 7) this.setSmallInterval(0);
		else if (x < 15) this.setSmallInterval(1);
		else if (x < 25) this.setSmallInterval(2);
		else if (x < 33) this.setSmallInterval(3);
		else if (x < 42) this.setSmallInterval(4);
		else this.setSmallInterval(5);
	}

	setSmallInterval(delay: number) {
		window.clearInterval(loop.small);
		loop.small = window.setInterval(() => {
			aquarium.moveFish();
		}, smallIntervals[delay]);
		const handleLeft = 389 + delay * 9;
		$('speedHandle').style.left = handleLeft + 'px';
		loop.chosenSpeed = delay;
	}

	getAlertNum() {
		return this.#alertNumber;
	}
	changeAlertNum(alertNum) {
		this.#alertNumber = alertNum;
	}

	blikStatusWidgetIcon() {
		window.clearTimeout(this.#hideStatusTimer);
		$('statusEvent').style.backgroundPosition = '38px';
		$('statusEventIcon').style.background =
			'url(gfx/interface/alertLightIcon' + this.#alertNumber + '.png)';
		$('statusEventIcon').style.display = 'block';
		this.#hideStatusTimer = window.setTimeout(() => {
			this.hideStatusWidgetIcon();
		}, 4000);
	}

	hideStatusWidgetIcon() {
		$('statusEvent').style.backgroundPosition = '0';
		$('statusEventIcon').style.display = 'none';
	}
}

export const uio = new Uio();
