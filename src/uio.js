/*
 **	UIO - USER INTERFACE OBJECT MODULE
 **	Every change in user interface is controlled by this object
 */

import { aquarium } from './aquarium.js';
import { config } from './config.js';
import { loop, smallIntervals } from './loop.js';
import { PAGE_FRONT, PAGE_BACK, PAGEMODE_MAXI, PAGEMODE_MINI, VIEW_AQUARIUM } from './constants.js';

/*** CONSTRUCTOR ***/

function uioConstructor() {
	let page = PAGE_FRONT;
	let frontPageMode = PAGEMODE_MAXI;
	let view = VIEW_AQUARIUM;
	let rememberSpeed;
	let alertNumber = -1; // 0 sick, 1 hungry/starving, 2 breeds, 3 dies, 4 attacks
	let hideStatusE;

	this.getView = () => view;

	// Minimizing & maximizing front page
	this.changeFrontPageMode = () => {
		if (frontPageMode === PAGEMODE_MAXI) {
			document.getElementById('aquariumViews').style.display = 'none';
			document.getElementById('toolbarTools').style.display = 'none';
			document.getElementById('pageMode').style.bottom = '193px';
			document.getElementById('pageMode').style.content = 'url(gfx/interface/viewIcon1.png)';
			document.getElementById('pageFront').style.backgroundPosition = '379px 0';
			frontPageMode = PAGEMODE_MINI;
			rememberSpeed = loop.chosenSpeed;
			uio.setSmallInterval(0);
		} else if (frontPageMode === PAGEMODE_MINI) {
			document.getElementById('aquariumViews').style.display = 'block';
			document.getElementById('toolbarTools').style.display = 'block';
			document.getElementById('pageMode').style.bottom = '13px';
			document.getElementById('pageMode').style.content = 'url(gfx/interface/viewIcon0.png)';
			document.getElementById('pageFront').style.backgroundPosition = '-78px 0';
			frontPageMode = PAGEMODE_MAXI;
			uio.setSmallInterval(rememberSpeed);
		}
	};

	// Flipping the widget
	this.flipWidget = () => {
		if (page === PAGE_FRONT) {
			document.getElementById('pageFront').style.display = 'none';
			document.getElementById('pageBack').style.display = 'block';
			page = PAGE_BACK;
		} else if (page === PAGE_BACK) {
			document.getElementById('pageBack').style.display = 'none';
			document.getElementById('pageFront').style.display = 'block';
			page = PAGE_FRONT;
		}
	};

	// Highlight view button On and Off
	this.highlightViewButtonOn = (viewNumber) => {
		if (view === viewNumber) return;
		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '48px 0';
	};
	this.highlightViewButtonOff = (viewNumber) => {
		if (view === viewNumber) return;
		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '0 0';
	};

	// Changing the view
	this.changeView = (viewNumber) => {
		if (view === viewNumber) return;

		if (viewNumber === VIEW_AQUARIUM) aquarium.render();

		document.getElementById('buttonView' + view).style.backgroundPosition = '0 0';
		document.getElementById('buttonView' + view).setAttribute('class', 'buttonView');
		document.getElementById('view' + view).style.display = 'none';

		document.getElementById('buttonView' + viewNumber).style.backgroundPosition = '24px 0';
		document
			.getElementById('buttonView' + viewNumber)
			.setAttribute('class', 'buttonView active');
		document.getElementById('view' + viewNumber).style.display = 'block';

		view = viewNumber;
	};

	this.closeWidget = () => {
		config.saveGame();
		window.close();
	};

	this.openHelp = () => {
		// widget.openURL( "http://xtrsyz.org/" );
	};

	this.changeTab = (tabOff, tabOn) => {
		document.getElementById('tab' + tabOff).style.display = 'none';
		document.getElementById('tab' + tabOn).style.display = 'block';

		document.getElementById('tabButton' + tabOff).setAttribute('class', 'tab');
		document.getElementById('tabButton' + tabOn).setAttribute('class', 'tab active');
	};

	/*** Speed bar ***/
	this.speedBarSet = (domEvent) => {
		const e = domEvent || window.event;
		if (e.offsetX < 7) uio.setSmallInterval(0);
		else if (e.offsetX < 15) uio.setSmallInterval(1);
		else if (e.offsetX < 25) uio.setSmallInterval(2);
		else if (e.offsetX < 33) uio.setSmallInterval(3);
		else if (e.offsetX < 42) uio.setSmallInterval(4);
		else uio.setSmallInterval(5);
	};

	this.setSmallInterval = (delay) => {
		window.clearInterval(loop.small);
		loop.small = window.setInterval(() => {
			aquarium.moveFish();
		}, smallIntervals[delay]);
		const handleLeft = 389 + delay * 9;
		document.getElementById('speedHandle').style.left = handleLeft + 'px';
		loop.chosenSpeed = delay;
	};

	this.getAlertNum = () => alertNumber;
	this.changeAlertNum = (alertNum) => {
		alertNumber = alertNum;
	};

	this.blikStatusWidgetIcon = () => {
		window.clearTimeout(hideStatusE);
		document.getElementById('statusEvent').style.backgroundPosition = '38px';
		document.getElementById('statusEventIcon').style.background =
			'url(gfx/interface/alertLightIcon' + alertNumber + '.png)';
		document.getElementById('statusEventIcon').style.display = 'block';
		hideStatusE = window.setTimeout(() => {
			uio.hideStatusWidgetIcon();
		}, 4000);
	};

	this.hideStatusWidgetIcon = () => {
		document.getElementById('statusEvent').style.backgroundPosition = '0';
		document.getElementById('statusEventIcon').style.display = 'none';
	};
}

// create the user interface object
export const uio = new uioConstructor();
