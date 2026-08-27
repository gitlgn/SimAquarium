/*
 **	STATISTICS OBJECT
 **
 */

import { aquarium } from './aquarium.js';
import { uio } from './uio.js';
import { fishSpecies } from './species.js';
import { VIEW_STATISTICS } from './constants.js';

const FISH_LIST_ROWS = 64;

function makeDiv(className, id) {
	const div = document.createElement('div');
	div.setAttribute('class', className);
	if (id) div.setAttribute('id', id);
	return div;
}

class Stats {
	createFishListTable() {
		const container = document.getElementById('fishTableContainer');

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

		document.getElementById('fishTableContainer').style.overflow =
			fishNum < 10 ? 'hidden' : 'auto';

		if (fishNum === 0) {
			document.getElementById('fishTableIcons').style.display = 'none';
			document.getElementById('fishTableInfo').style.display = 'block';
		} else {
			document.getElementById('fishTableIcons').style.display = 'block';
			document.getElementById('fishTableInfo').style.display = 'none';
		}

		for (let i = 0; i < fishNum; i++) {
			document.getElementById('fishTableRow' + i).style.display = 'block';
			document.getElementById('fishTableSpeciesName' + i).innerHTML =
				aquarium.returnSpecName(i);
			document.getElementById('fishTableHealthBoxBar' + i).style.width =
				(aquarium.returnFishCondition(i) /
					fishSpecies[aquarium.returnSpecNum(i)].maxCondition) *
					25 +
				'px';
			document.getElementById('fishTableHungerBoxBar' + i).style.width =
				aquarium.returnFishHunger(i) / 4 + 'px';
			document.getElementById('fishTableSickBox' + i).innerHTML =
				aquarium.returnFishDisease(i) > 0 ? 'SICK' : '';
			const sizePercent = Math.round(aquarium.returnFishSize(i) * 100);
			document.getElementById('fishTableSizeBox' + i).innerHTML = sizePercent + '%';
			document.getElementById('fishTablePrice' + i).innerHTML = String(
				fishSpecies[aquarium.returnSpecNum(i)].price / 2
			);
		}

		for (let i = fishNum; i < FISH_LIST_ROWS; i++) {
			document.getElementById('fishTableRow' + i).style.display = 'none';
		}
	}

	refreshStatsPage() {
		if (uio.getView() !== VIEW_STATISTICS) return;

		if (document.getElementById('tabFishList').style.display === 'block') {
			this.updateFishListTable();
		} else {
			document.getElementById('statFishNumber').innerHTML = String(aquarium.getFishNum());
			document.getElementById('statFishBirths').innerHTML = String(aquarium.getFishBirths());
			document.getElementById('statFishDeaths').innerHTML = String(aquarium.getFishDeaths());
			document.getElementById('statPollution').innerHTML =
				Math.trunc(aquarium.getPollution() * 3.15) + '%';
			document.getElementById('statFood').innerHTML = Math.trunc(aquarium.getFood()) + '%';
			document.getElementById('statMedicine').innerHTML =
				Math.trunc(aquarium.getMedicine()) + '%';
			document.getElementById('statGrowH').innerHTML =
				Math.trunc(aquarium.getGrowHormone()) + '%';
			document.getElementById('statBreedH').innerHTML =
				Math.trunc(aquarium.getBreedHormone()) + '%';
			document.getElementById('statDistraction').innerHTML =
				Math.trunc(aquarium.getDistraction()) + '%';
		}
	}
}

export const stats = new Stats();
