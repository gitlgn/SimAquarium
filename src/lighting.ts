/*
 **	LIGHTING OBJECT
 */

import { LI_NAME, LI_PRICE, LI_COMFORT, LI_ENERGY, LI_IMAGE } from './constants.js';

const PATH_LIGHTING = 'gfx/lighting/';

class Lighting {
	#light: any[][] = [];

	constructor() {
		const add = (name, fileName, price, comfort, energyCost) => {
			const row: any[] = [];
			row[LI_NAME] = name;
			row[LI_PRICE] = price;
			row[LI_COMFORT] = comfort;
			row[LI_ENERGY] = energyCost;
			row[LI_IMAGE] = new Image();
			row[LI_IMAGE].src = PATH_LIGHTING + fileName;
			this.#light.push(row);
		};

		add('Simple Light', 'light0.png', 0, 0.91, 0.01);
		add('Wide Light', 'light1.png', 100, 0.92, 0.02);
		add('Diagonal Light', 'light2.png', 300, 0.93, 0.03);
		add('Five Light Up', 'light3.png', 600, 0.94, 0.04);
		add('Five Light Down', 'light4.png', 1000, 0.95, 0.05);
		add('Horizontal Lights', 'light5.png', 1500, 0.96, 0.06);
		add('Triple Spotlight', 'light6.png', 2100, 0.97, 0.07);
		add('Star Lamps', 'light7.png', 2800, 0.98, 0.08);
		add('Corner Reflectors', 'light8.png', 3600, 0.99, 0.09);
	}

	getLightData(num, data) {
		const idx = Number.parseInt(num, 10) || 0;
		return this.#light[idx][data];
	}
}

export const lighting = new Lighting();
