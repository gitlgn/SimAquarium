/*
 **	STATISTICS OBJECT
 **
 */

import { aquarium } from './aquarium.js';
import { uio } from './uio.js';
import { fishSpecies } from './species.js';
import { VIEW_STATISTICS } from './constants.js';
import { $ } from './dom.js';

const FISH_LIST_ROWS = 64;

function makeDiv(className, id) {
	const div = document.createElement('div');
	div.setAttribute('class', className);
	if (id) div.setAttribute('id', id);
	return div;
}

class Stats {
	createFishListTable() {
		const container = $('fishTableContainer');

		for (let i = 0; i < FISH_LIST_ROWS; i++) {
			const row = makeDiv('fishTableRow', 'fishTableRow' + i);
			row.setAttribute('style', 'display: none;');

			const name = makeDiv('fishTableSpeciesName', 'fishTableSpeciesName' + i);
			const health = makeDiv('fishTableHealthBox', 'fishTableHealthBox' + i);
			const healthBar = makeDiv('fishTableHealthBoxBar', 'fishTableHealthBoxBar' + i);
			const hunger = makeDiv('fishTableHungerBox', 'fishTableHungerBox' + i);
			const hungerBar = makeDiv('fishTableHungerBoxBar', 'fishTableHungerBoxBar' + i);
			const sick = makeDiv('fishTableSickBox', 'fishTableSickBox' + i);
			const size = makeDiv('fishTableSizeBox', 'fishTableSizeBox' + i);
			const sell = makeDiv('button sell on', 'fishTableSellFish' + i);
			const price = makeDiv('money', 'fishTablePrice' + i);

			container.appendChild(row);
			row.append(name, health, hunger, sick, size, sell, price);
			health.appendChild(healthBar);
			hunger.appendChild(hungerBar);

			sell.addEventListener('click', () => aquarium.sellFish(i), false);
		}
	}

	updateFishListTable() {
		const fishNum = aquarium.getFishNum();

		$('fishTableContainer').style.overflowY = fishNum < 10 ? 'hidden' : 'auto';

		// toggle via `hidden` / empty inline display so panels.css's grid rules win
		($('fishTableIcons') as HTMLElement).hidden = fishNum === 0;
		($('fishTableInfo') as HTMLElement).hidden = fishNum !== 0;

		for (let i = 0; i < fishNum; i++) {
			$('fishTableRow' + i).style.display = '';
			$('fishTableSpeciesName' + i).innerHTML = aquarium.returnSpecName(i);
			$('fishTableHealthBoxBar' + i).style.width =
				(aquarium.returnFishCondition(i) /
					fishSpecies[aquarium.returnSpecNum(i)].maxCondition) *
					25 +
				'px';
			$('fishTableHungerBoxBar' + i).style.width = aquarium.returnFishHunger(i) / 4 + 'px';
			$('fishTableSickBox' + i).innerHTML = aquarium.returnFishDisease(i) > 0 ? 'SICK' : '';
			const sizePercent = Math.round(aquarium.returnFishSize(i) * 100);
			$('fishTableSizeBox' + i).innerHTML = sizePercent + '%';
			$('fishTablePrice' + i).innerHTML = String(
				fishSpecies[aquarium.returnSpecNum(i)].price / 2
			);
		}

		for (let i = fishNum; i < FISH_LIST_ROWS; i++) {
			$('fishTableRow' + i).style.display = 'none';
		}
	}

	refreshStatsPage() {
		if (uio.getView() !== VIEW_STATISTICS) return;

		if (!($('tabFishList') as HTMLElement).hidden) {
			this.updateFishListTable();
		} else {
			$('statFishNumber').innerHTML = String(aquarium.getFishNum());
			$('statFishBirths').innerHTML = String(aquarium.getFishBirths());
			$('statFishDeaths').innerHTML = String(aquarium.getFishDeaths());
			$('statPollution').innerHTML = Math.trunc(aquarium.getPollution() * 3.15) + '%';
			$('statFood').innerHTML = Math.trunc(aquarium.getFood()) + '%';
			$('statMedicine').innerHTML = Math.trunc(aquarium.getMedicine()) + '%';
			$('statGrowH').innerHTML = Math.trunc(aquarium.getGrowHormone()) + '%';
			$('statBreedH').innerHTML = Math.trunc(aquarium.getBreedHormone()) + '%';
			$('statDistraction').innerHTML = Math.trunc(aquarium.getDistraction()) + '%';
		}
	}
}

export const stats = new Stats();
