/*
 **	LIGHTING OBJECT
 */

import { LI_NAME, LI_PRICE, LI_COMFORT, LI_ENERGY, LI_IMAGE } from './constants.js';

const PATH_LIGHTING = 'gfx/lighting/';

function lightingConstructor() {
	const light = [];

	const createLight = (name, fileName, price, comfort, energyCost) => {
		const row = [];
		row[LI_NAME] = name;
		row[LI_PRICE] = price;
		row[LI_COMFORT] = comfort;
		row[LI_ENERGY] = energyCost;
		row[LI_IMAGE] = new Image();
		row[LI_IMAGE].src = PATH_LIGHTING + fileName;
		light.push(row);
	};

	createLight('Simple Light', 'light0.png', 0, 0.91, 0.01);
	createLight('Wide Light', 'light1.png', 100, 0.92, 0.02);
	createLight('Diagonal Light', 'light2.png', 300, 0.93, 0.03);
	createLight('Five Light Up', 'light3.png', 600, 0.94, 0.04);
	createLight('Five Light Down', 'light4.png', 1000, 0.95, 0.05);
	createLight('Horizontal Lights', 'light5.png', 1500, 0.96, 0.06);
	createLight('Triple Spotlight', 'light6.png', 2100, 0.97, 0.07);
	createLight('Star Lamps', 'light7.png', 2800, 0.98, 0.08);
	createLight('Corner Reflectors', 'light8.png', 3600, 0.99, 0.09);

	this.getLightData = (num, data) => {
		const idx = Number.parseInt(num, 10) || 0;
		return light[idx][data];
	};
}

export const lighting = new lightingConstructor();
