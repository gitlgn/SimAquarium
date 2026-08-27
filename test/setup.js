import { beforeEach } from 'vitest';

// jsdom has no canvas implementation — stub getContext so importing modules
// that create offscreen canvases (aquarium.js) doesn't warn or crash.
const ctxStub = new Proxy(
	{},
	{
		get: () => () => {},
	}
);
if (typeof HTMLCanvasElement !== 'undefined') {
	HTMLCanvasElement.prototype.getContext = () => ctxStub;
}

// A handful of elements the non-rendering game paths write to.
beforeEach(() => {
	document.body.innerHTML = `
		<div id="statusMoney"></div>
		<div id="statusWaterBar"></div>
	`;
});
