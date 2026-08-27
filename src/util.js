/** Small shared helpers. */

/** Toggle to true for verbose console logging. */
export const debug = false;

/** Debug log, no-op unless `debug` is true. */
export function dbg(msg) {
	if (!debug) return;
	console.log('[SimAquarium]', msg);
}

/** Open a URL in a new tab. */
export function openTab(url) {
	const a = document.createElement('a');
	a.href = url;
	a.target = '_blank';
	a.rel = 'noopener';
	a.click();
}
