/*
 * toast.ts — transient event notifications. Replaces the 2014 alertLight.png
 * lamp (which only ever showed its dim off-state). A message slides in over the
 * tank, holds ~4 s, fades out; at most a few stack.
 */

import { $ } from './dom.js';

const HOLD_MS = 4000;
const MAX_VISIBLE = 3;

/** kind → css modifier + default text (aligned with uio's #alertNumber 0-4). */
export const EVENTS = [
	{ kind: 'sick', text: 'A fish fell ill' },
	{ kind: 'hungry', text: 'A fish is starving' },
	{ kind: 'breed', text: 'A fish bred — new fry!' },
	{ kind: 'death', text: 'A fish died' },
	{ kind: 'attack', text: 'A fish attacked another' },
] as const;

function container(): HTMLElement {
	let el = document.getElementById('toasts');
	if (!el) {
		el = document.createElement('div');
		el.id = 'toasts';
		$('stage').append(el);
	}
	return el;
}

export const toast = {
	/** @param kind css modifier (e.g. 'breed'); @param text message */
	show(kind: string, text: string) {
		const box = container();

		while (box.childElementCount >= MAX_VISIBLE && box.firstElementChild) {
			box.firstElementChild.remove();
		}

		const el = document.createElement('div');
		el.className = `toast toast--${kind}`;
		el.textContent = text;
		box.append(el);

		window.setTimeout(() => {
			el.classList.add('is-leaving');
			el.addEventListener('animationend', () => el.remove(), { once: true });
			window.setTimeout(() => el.remove(), 600); // fallback if animationend doesn't fire
		}, HOLD_MS);
	},

	/** Fire the message for one of the numbered game events (0-4). */
	event(n: number) {
		const e = EVENTS[n];
		if (e) this.show(e.kind, e.text);
	},
};
