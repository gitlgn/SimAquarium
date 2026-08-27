/*
 * stage.js — keep #stage scaled so the fixed 457x300 widget fills the window.
 * Paired with css/stage.css. Classic script, loaded with `defer`.
 */
(function () {
	'use strict';

	var BASE_W = 457;
	var BASE_H = 300;

	function fit() {
		var vw = window.innerWidth;
		var vh = window.innerHeight;
		// Ignore degenerate measurements (hidden/background tab reports 0x0) so the
		// stage doesn't collapse to scale 0 — the next real resize event recovers it.
		if (vw < 1 || vh < 1) return;
		var scale = Math.min(vw / BASE_W, vh / BASE_H);
		document.documentElement.style.setProperty('--stage-scale', String(scale));
	}

	window.addEventListener('resize', fit, false);
	window.addEventListener('orientationchange', fit, false);

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', fit, false);
	} else {
		fit();
	}
})();
