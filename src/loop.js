/**
 * Game-loop timer state. The 2014 code kept `smallInterval` / `bigInterval` /
 * `chosenSpeed` as mutable globals reassigned from several files; ES modules
 * can't reassign an imported binding, so they live on this shared object.
 *
 * `small` / `big` hold `window.setInterval` ids (0 = no timer running;
 * `clearInterval(0)` is a safe no-op).
 *
 * @type {{ small: number, big: number, chosenSpeed: number }}
 */
export const loop = {
	small: 0, // aquarium.moveFish()
	big: 0, // aquarium.update()
	chosenSpeed: 3, // index into smallIntervals
};

export const smallIntervals = [1024, 512, 256, 128, 64, 32];
