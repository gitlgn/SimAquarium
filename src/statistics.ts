/*
 **	STATISTICS OBJECT
 **
 **	Phase 6: the fish list and Tank Info panels are rendered from game state
 **	each refresh — no pre-built hidden rows, no per-cell `$('id').style.*`
 **	writes. Sell is one delegated listener on the container.
 */

import { aquarium } from './aquarium.js';
import { uio } from './uio.js';
import { fishSpecies } from './species.js';
import { VIEW_STATISTICS } from './constants.js';
import { $ } from './dom.js';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESCAPES[c]);
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const pct = (n: number) => Math.trunc(n) + '%';

/** A CSS bar: `--v` (0-1) drives both the fill width and its colour. */
function meter(kind: string, frac: number) {
	const p = Math.round(frac * 100);
	return (
		`<span class="fishRow-meter fishRow-meter--${kind}" title="${kind} ${p}%">` +
		`<i style="width:${p}%;--v:${frac.toFixed(3)}"></i></span>`
	);
}

class Stats {
	/** Wire the delegated Sell handler once (called from boot). */
	init() {
		$('fishTableContainer').addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const btn = target.closest<HTMLElement>('[data-sell]');
			if (btn) aquarium.sellFish(Number(btn.dataset.sell));
		});
	}

	refreshStatsPage() {
		if (uio.getView() !== VIEW_STATISTICS) return;
		if (($('tabFishList') as HTMLElement).hidden) this.#renderTankInfo();
		else this.#renderFishList();
	}

	#renderFishList() {
		const n = aquarium.getFishNum();
		($('fishTableIcons') as HTMLElement).hidden = n === 0;
		($('fishTableInfo') as HTMLElement).hidden = n !== 0;

		let html = '';
		for (let i = 0; i < n; i++) {
			const specNum = aquarium.returnSpecNum(i);
			const health = clamp01(
				aquarium.returnFishCondition(i) / fishSpecies[specNum].maxCondition
			);
			const hunger = clamp01(aquarium.returnFishHunger(i) / 100);
			const size = clamp01(aquarium.returnFishSize(i)); // #size is already 0-1
			const sick = aquarium.returnFishDisease(i) > 0;
			const price = fishSpecies[specNum].price / 2;

			html +=
				'<div class="fishRow">' +
				`<span class="fishRow-name">${esc(aquarium.returnSpecName(i))}</span>` +
				meter('health', health) +
				meter('hunger', hunger) +
				meter('size', size) +
				`<span class="fishRow-dot${sick ? ' is-sick' : ''}" title="${sick ? 'sick' : 'healthy'}"></span>` +
				`<button type="button" class="fishRow-sell" data-sell="${i}">Sell</button>` +
				`<span class="fishRow-price money">${price}</span>` +
				'</div>';
		}
		$('fishTableContainer').innerHTML = html;
	}

	#renderTankInfo() {
		const line = (label: string, value: string | number) =>
			`<div class="statList-row"><dt>${label}</dt><dd>${value}</dd></div>`;

		$('tabStatistics').innerHTML =
			'<h3 class="statList-head">Fish</h3>' +
			'<dl class="statList">' +
			line('Number', aquarium.getFishNum()) +
			line('Births', aquarium.getFishBirths()) +
			line('Deaths', aquarium.getFishDeaths()) +
			'</dl>' +
			'<h3 class="statList-head">Water</h3>' +
			'<dl class="statList">' +
			line('Pollution', pct(aquarium.getPollution() * 3.15)) +
			line('Food', pct(aquarium.getFood())) +
			line('Medicine', pct(aquarium.getMedicine())) +
			line('Growth hormone', pct(aquarium.getGrowHormone())) +
			line('Breed hormone', pct(aquarium.getBreedHormone())) +
			line('Distraction', pct(aquarium.getDistraction())) +
			'</dl>';
	}
}

export const stats = new Stats();
