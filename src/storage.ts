/**
 * Persistence. The 2014 `storageAPI` had a chrome.storage + sandbox-iframe
 * bridge for the packaged Chrome App and fell back to localStorage everywhere
 * else. Only the fallback remains.
 *
 * `getItem` returns `''` (not `null`) for a missing key — the game's callers
 * treat "missing" and "empty" the same (`parseFloat('')` and `'' === '1'`
 * behave like the old `null` did).
 */
export const storage = {
	/**
	 * @param {string} key
	 * @returns {string}
	 */
	getItem(key) {
		return window.localStorage.getItem(key) ?? '';
	},
	/**
	 * @param {string} key
	 * @param {string | number} value
	 */
	setItem(key, value) {
		window.localStorage.setItem(key, String(value));
	},
	/** @param {string} key */
	removeItem(key) {
		window.localStorage.removeItem(key);
	},
};
