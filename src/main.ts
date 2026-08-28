/*
 **	ENTRY POINT
 **
 **	Loaded as <script type="module">. Replaces the 2014 split of
 **	sandbox.js + js/main.js (DOMContentLoaded + a 1s setTimeout hack that
 **	worked around the sandbox-iframe messaging — no longer needed).
 */

import { aquarium, updateBuyButtons } from './aquarium.js';
import { config } from './config.js';
import { fishShop } from './fishshop.js';
import { stats } from './statistics.js';
import { scenery } from './scenery.js';
import { lighting } from './lighting.js';
import { filtration, background } from './filtration.js';
import { uio } from './uio.js';
import { eventsCreate } from './events.js';
import { loop } from './loop.js';

// Dev-only: expose the singletons for poking around in DevTools.
if (import.meta.env.DEV) {
	Object.assign(window, {
		aquarium,
		config,
		fishShop,
		stats,
		scenery,
		lighting,
		filtration,
		background,
		uio,
		loop,
	});
}

function boot() {
	aquarium.updateComfortAquarium(); // seed the comfort factor / breeding rates
	background.createBackgroundSlots();
	eventsCreate();
	aquarium.create();
	fishShop.init();
	stats.createFishListTable();

	if (config.checkFirstTime()) {
		aquarium.addFish(1, 0.9999);
		aquarium.resetMoney();
		config.saveGame();
	} else {
		config.loadGame();
	}

	// starts the fish-move interval at the default speed and syncs the speed handle
	uio.setSmallInterval(loop.chosenSpeed);
	loop.big = window.setInterval(function () {
		aquarium.update();
	}, 2000);

	updateBuyButtons();
}

if (document.readyState === 'complete') {
	boot();
} else {
	window.addEventListener('load', boot, { once: true });
}
