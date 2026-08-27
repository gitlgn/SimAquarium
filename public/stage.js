/*
 * stage.js — keep #stage scaled so the fixed 457x300 widget fills the space
 * inside #viewport (which carries the safe-area padding). Classic script,
 * loaded with `defer`. Paired with css/stage.css + css/mobile.css.
 */
(function () {
	'use strict';

	var BASE_W = 457;
	var BASE_H = 300;
	var MAX_SCALE = 4; // don't blow the pixel art up absurdly on a 4K monitor

	function fit() {
		var viewport = document.getElementById('viewport');
		// Available box = the viewport element's content area (safe-area padding
		// already removed) with a window fallback for the earliest call.
		var w = (viewport && viewport.clientWidth) || window.innerWidth;
		var h = (viewport && viewport.clientHeight) || window.innerHeight;
		// Ignore degenerate 0x0 (hidden/background tab) — a later resize recovers it.
		if (w < 1 || h < 1) return;
		var scale = Math.min(w / BASE_W, h / BASE_H, MAX_SCALE);
		document.documentElement.style.setProperty('--stage-scale', String(scale));
	}

	window.addEventListener('resize', fit, false);
	window.addEventListener('orientationchange', fit, false);
	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', fit, false);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', fit, false);
	} else {
		fit();
	}
})();
