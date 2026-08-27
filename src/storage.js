/**
 * Persistence. The 2014 `storageAPI` had a chrome.storage + sandbox-iframe
 * bridge for the packaged Chrome App and fell back to localStorage everywhere
 * else. Only the fallback remains.
 */
export const storage = {
	getItem(key) {
		return window.localStorage.getItem(key);
	},
	setItem(key, value) {
		window.localStorage.setItem(key, value);
	},
	removeItem(key) {
		window.localStorage.removeItem(key);
	},
};
