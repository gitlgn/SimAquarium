/**
 * Game-loop timer state. The 2014 code kept `smallInterval` / `bigInterval` /
 * `chosenSpeed` as mutable globals reassigned from several files; ES modules
 * can't reassign an imported binding, so they live on this shared object.
 */

export const smallIntervals = [1024, 512, 256, 128, 64, 32];

export const loop = {
	small: null, // window.setInterval id for aquarium.moveFish()
	big: null, // window.setInterval id for aquarium.update()
	chosenSpeed: 3, // index into smallIntervals
};
