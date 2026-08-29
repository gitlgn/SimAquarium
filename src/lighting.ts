/*
 **	LIGHTING OBJECT
 */

const PATH_LIGHTING = 'gfx/lighting/';

// Column order matches the LI_* constants in constants.ts.
type LightRow = readonly [
	name: string,
	price: number,
	comfort: number,
	energy: number,
	image: HTMLImageElement,
];

class Lighting {
	#light: LightRow[] = [];

	constructor() {
		const add = (
			name: string,
			fileName: string,
			price: number,
			comfort: number,
			energyCost: number
		) => {
			const img = new Image();
			img.src = PATH_LIGHTING + fileName;
			this.#light.push([name, price, comfort, energyCost, img]);
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

	getLightData<K extends number>(num: number, data: K): LightRow[K] {
		return this.#light[num || 0][data];
	}
}

export const lighting = new Lighting();
