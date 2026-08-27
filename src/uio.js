/*
 **	UIO - USER INTERFACE OBJECT MODULE
 **	Every change in user interface is controlled by this object
 */

import { aquarium } from './aquarium.js';
import { config } from './config.js';
import { loop, smallIntervals } from './loop.js';
import { PAGE_FRONT, PAGE_BACK, PAGEMODE_MAXI, PAGEMODE_MINI, VIEW_AQUARIUM } from './constants.js';

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
			document.getElementById('aquariumViews').style.display = 'none';
			document.getElementById('toolbarTools').style.display = 'none';
			document.getElementById('pageMode').style.bottom = '193px';
			document.getElementById('pageMode').style.content = 'url(gfx/interface/viewIcon1.png)';
			document.getElementById('pageFront').style.backgroundPosition = '379px 0';
			this.#frontPageMode = PAGEMODE_MINI;
			this.#rememberSpeed = loop.chosenSpeed;
			this.setSmallInterval(0);
		} else if (this.#frontPageMode === PAGEMODE_MINI) {
			document.getElementById('aquariumViews').style.display = 'block';
			document.getElementById('toolbarTools').style.display = 'block';
			document.getElementById('pageMode').style.bottom = '13px';
			document.getElementById('pageMode').style.content = 'url(gfx/interface/viewIcon0.png)';
			document.getElementById('pageFront').style.backgroundPosition = '-78px 0';
			this.#frontPageMode = PAGEMODE_MAXI;
			this.setSmallInterval(this.#rememberSpeed);
		}
	}

	// Flipping the widget
	flipWidget() {
		if (this.#page === PAGE_FRONT) {
			document.getElementById('pageFront').style.display = 'none';
			document.getElementById('pageBack').style.display = 'block';
			this.#page = PAGE_BACK;
		} else if (this.#page === PAGE_BACK) {
			document.getElementById('pageBack').style.display = 'none';
			document.getElementById('pageFront').style.display = 'block';
			this.#page = PAGE_FRONT;
		}
	}

	// Highlight view button On and Off
	highlightViewButtonOn(viewNumber) {
		if (this.#view === viewNumber) return;
		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '48px 0';
	}
	highlightViewButtonOff(viewNumber) {
		if (this.#view === viewNumber) return;
		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '0 0';
	}

	// Changing the view
	changeView(viewNumber) {
		if (this.#view === viewNumber) return;

		if (viewNumber === VIEW_AQUARIUM) aquarium.render();

		document.getElementById('buttonView' + this.#view).style.backgroundPosition = '0 0';
		document.getElementById('buttonView' + this.#view).setAttribute('class', 'buttonView');
		document.getElementById('view' + this.#view).style.display = 'none';

		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '24px 0';
		document
			.getElementById('buttonView' + viewNumber)
			.setAttribute('class', 'buttonView active');
		document.getElementById('view' + viewNumber).style.display = 'block';

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
		document.getElementById('tab' + tabOff).style.display = 'none';
		document.getElementById('tab' + tabOn).style.display = 'block';

		document.getElementById('tabButton' + tabOff).setAttribute('class', 'tab');
		document.getElementById('tabButton' + tabOn).setAttribute('class', 'tab active');
	}

	/*** Speed bar ***/
	speedBarSet(domEvent) {
		const e = domEvent || window.event;
		if (e.offsetX < 7) this.setSmallInterval(0);
		else if (e.offsetX < 15) this.setSmallInterval(1);
		else if (e.offsetX < 25) this.setSmallInterval(2);
		else if (e.offsetX < 33) this.setSmallInterval(3);
		else if (e.offsetX < 42) this.setSmallInterval(4);
		else this.setSmallInterval(5);
	}

	setSmallInterval(delay) {
		window.clearInterval(loop.small);
		loop.small = window.setInterval(() => {
			aquarium.moveFish();
		}, smallIntervals[delay]);
		const handleLeft = 389 + delay * 9;
		document.getElementById('speedHandle').style.left = handleLeft + 'px';
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
		document.getElementById('statusEvent').style.backgroundPosition = '38px';
		document.getElementById('statusEventIcon').style.background =
			'url(gfx/interface/alertLightIcon' + this.#alertNumber + '.png)';
		document.getElementById('statusEventIcon').style.display = 'block';
		this.#hideStatusTimer = window.setTimeout(() => {
			this.hideStatusWidgetIcon();
		}, 4000);
	}

	hideStatusWidgetIcon() {
		document.getElementById('statusEvent').style.backgroundPosition = '0';
		document.getElementById('statusEventIcon').style.display = 'none';
	}
}

export const uio = new Uio();
