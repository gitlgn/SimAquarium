/**
 * `document.getElementById` that never returns null: the game's markup is
 * static, so a missing id is a bug worth failing loudly on.
 * @param {string} id
 * @returns {HTMLElement}
 */
export function $(id) {
	const el = document.getElementById(id);
	if (el === null) throw new Error(`missing element #${id}`);
	return el;
}

/**
 * A canvas's 2d context, asserted non-null.
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
export function ctx2d(canvas) {
	const context = canvas.getContext('2d');
	if (context === null) throw new Error('2d canvas context unavailable');
	return context;
}
