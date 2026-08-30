/*
 **	FISH SPECIES + FISH FACTORY MODULE
 **	(was fish.js)
 */

import { aquarium } from './aquarium.js';
import { uio } from './uio.js';
import { fishArtSvgUri } from './fishArt.js';
import { TANK_SCALE_MAX } from './constants.js';

/**
 * @typedef {object} Species
 * @property {string} name
 * @property {number} price
 * @property {number} sizeX
 * @property {number} sizeY
 * @property {number} growth        growth rate per tick, 0-1
 * @property {number} breed         base breed rate, 0-1
 * @property {number} pollution     pollution per tick (negative = cleans water)
 * @property {number} pollutionTol  pollution tolerance, 0-32
 * @property {number} maxCondition
 * @property {number} foodNeed
 * @property {number} fishNumOptimal  comfortable population for this species
 * @property {number} aggression   attack chance, 0-1
 * @property {number} strength
 * @property {number} longevity    0-1; higher lives longer
 * @property {string} link         info URL
 * @property {number} fishNumAttack  min tank population before it starts attacking
 */

/*** GLOBALS ***/

// FISH ANGLES — lookup by [vX][vY]

export const fishAngle: number[][] = [];
fishAngle[-10] = [];
fishAngle[10] = [];

fishAngle[-10][-5] = -5.8195;
fishAngle[-10][-4] = -5.9026;
fishAngle[-10][-3] = -5.9917;
fishAngle[-10][-2] = -6.0857;
fishAngle[-10][-1] = -6.1835;
fishAngle[-10][0] = 6.2831;
fishAngle[-10][1] = 6.1835;
fishAngle[-10][2] = 6.0857;
fishAngle[-10][3] = 5.9917;
fishAngle[-10][4] = 5.9026;
fishAngle[-10][5] = 5.8195;
fishAngle[10][-5] = 5.8195;
fishAngle[10][-4] = 5.9026;
fishAngle[10][-3] = 5.9917;
fishAngle[10][-2] = 6.0857;
fishAngle[10][-1] = 6.1835;
fishAngle[10][0] = 6.2831;
fishAngle[10][1] = -6.1835;
fishAngle[10][2] = -6.0857;
fishAngle[10][3] = -5.9917;
fishAngle[10][4] = -5.9026;
fishAngle[10][5] = -5.8195;

// FISH SPECIES. All 29 share the same (vestigial) rarity tier, so it is not stored.
/** @type {Species[]} */
// prettier-ignore
export const fishSpecies = [
	{ name: 'Test fish', price: 10, sizeX: 21, sizeY: 11, growth: 0.001, breed: 0.001, pollution: 0.01, pollutionTol: 10, maxCondition: 4, foodNeed: 0.005, fishNumOptimal: 10, aggression: 0.001, strength: 0.1, longevity: 0.999, link: 'http://xtrsyz.org/', fishNumAttack: 20 },
	{ name: 'Southern platyfish', price: 20, sizeX: 21, sizeY: 11, growth: 0.005, breed: 0.012, pollution: 0.002, pollutionTol: 24, maxCondition: 1.2, foodNeed: 0.01, fishNumOptimal: 32, aggression: 0.001, strength: 0.8, longevity: 0.98, link: 'http://en.wikipedia.org/wiki/Southern_platyfish', fishNumAttack: 48 },
	{ name: 'Guppy', price: 24, sizeX: 17, sizeY: 9, growth: 0.006, breed: 0.016, pollution: 0.005, pollutionTol: 28, maxCondition: 1.0, foodNeed: 0.01, fishNumOptimal: 40, aggression: 0.01, strength: 0.5, longevity: 0.94, link: 'http://en.wikipedia.org/wiki/Guppy', fishNumAttack: 60 },
	{ name: 'Panda corydoras', price: 28, sizeX: 23, sizeY: 14, growth: 0.004, breed: 0.01, pollution: 0.003, pollutionTol: 16, maxCondition: 1.5, foodNeed: 0.02, fishNumOptimal: 18, aggression: 0.005, strength: 0.6, longevity: 0.96, link: 'http://en.wikipedia.org/wiki/Panda_corydoras', fishNumAttack: 27 },
	{ name: 'Bronze catfish', price: 40, sizeX: 29, sizeY: 12, growth: 0.0025, breed: 0.008, pollution: -0.005, pollutionTol: 30, maxCondition: 2.0, foodNeed: 0.04, fishNumOptimal: 15, aggression: 0.01, strength: 1.0, longevity: 0.995, link: 'http://en.wikipedia.org/wiki/Bronze_corydoras', fishNumAttack: 22 },
	{ name: 'Zebrafish', price: 48, sizeX: 25, sizeY: 8, growth: 0.0055, breed: 0.009, pollution: 0.008, pollutionTol: 12, maxCondition: 1.4, foodNeed: 0.02, fishNumOptimal: 42, aggression: 0.008, strength: 0.5, longevity: 0.99, link: 'http://en.wikipedia.org/wiki/Zebra_Danio', fishNumAttack: 63 },
	{ name: 'Sailfin molly', price: 56, sizeX: 22, sizeY: 14, growth: 0.008, breed: 0.007, pollution: 0.011, pollutionTol: 26, maxCondition: 2.0, foodNeed: 0.02, fishNumOptimal: 8, aggression: 0.0001, strength: 0.1, longevity: 0.85, link: 'http://en.wikipedia.org/wiki/Sailfin_molly', fishNumAttack: 12 },
	{ name: 'Rosy barb', price: 80, sizeX: 50, sizeY: 39, growth: 0.003, breed: 0.006, pollution: 0.018, pollutionTol: 22, maxCondition: 5.0, foodNeed: 0.02, fishNumOptimal: 12, aggression: 0.02, strength: 1.5, longevity: 0.99, link: 'http://en.wikipedia.org/wiki/Rosy_barb', fishNumAttack: 18 },
	{ name: 'Cardinal tetra', price: 96, sizeX: 15, sizeY: 7, growth: 0.002, breed: 0.005, pollution: 0.001, pollutionTol: 11, maxCondition: 1.2, foodNeed: 0.005, fishNumOptimal: 64, aggression: 0.0001, strength: 1.2, longevity: 0.992, link: 'http://en.wikipedia.org/wiki/Cardinal_tetra', fishNumAttack: 96 },
	{ name: 'Dojo loach', price: 112, sizeX: 45, sizeY: 12, growth: 0.0015, breed: 0.0045, pollution: 0.04, pollutionTol: 28, maxCondition: 4.5, foodNeed: 0.04, fishNumOptimal: 10, aggression: 0.01, strength: 1.4, longevity: 0.989, link: 'http://en.wikipedia.org/wiki/Misgurnus_anguillicaudatus', fishNumAttack: 15 },
	{ name: 'Paradise fish', price: 160, sizeX: 37, sizeY: 17, growth: 0.002, breed: 0.002, pollution: 0.006, pollutionTol: 22, maxCondition: 3.5, foodNeed: 0.04, fishNumOptimal: 5, aggression: 0.05, strength: 0.3, longevity: 0.985, link: 'http://en.wikipedia.org/wiki/Paradise_fish', fishNumAttack: 8 },
	{ name: 'Tropheus', price: 192, sizeX: 53, sizeY: 19, growth: 0.0015, breed: 0.0025, pollution: 0.009, pollutionTol: 8, maxCondition: 4.2, foodNeed: 0.07, fishNumOptimal: 7, aggression: 0.002, strength: 1.4, longevity: 0.992, link: 'http://en.wikipedia.org/wiki/Tropheus', fishNumAttack: 11 },
	{ name: 'Bala shark', price: 224, sizeX: 35, sizeY: 16, growth: 0.0012, breed: 0.0036, pollution: 0.007, pollutionTol: 24, maxCondition: 4.4, foodNeed: 0.03, fishNumOptimal: 6, aggression: 0.009, strength: 0.2, longevity: 0.99, link: 'http://en.wikipedia.org/wiki/Bala_shark', fishNumAttack: 9 },
	{ name: 'Electric yellow cichlid', price: 320, sizeX: 41, sizeY: 19, growth: 0.0018, breed: 0.0035, pollution: 0.011, pollutionTol: 10, maxCondition: 4.8, foodNeed: 0.05, fishNumOptimal: 12, aggression: 0.004, strength: 1.6, longevity: 0.993, link: 'http://en.wikipedia.org/wiki/Labidochromis_caeruleus', fishNumAttack: 18 },
	{ name: 'Clown loach', price: 384, sizeX: 60, sizeY: 31, growth: 0.00005, breed: 0.00001, pollution: 0.003, pollutionTol: 19, maxCondition: 7.0, foodNeed: 0.07, fishNumOptimal: 18, aggression: 0.001, strength: 2.4, longevity: 0.995, link: 'http://en.wikipedia.org/wiki/Botia_macracantha', fishNumAttack: 27 },
	{ name: 'Fairy cichlid', price: 448, sizeX: 32, sizeY: 15, growth: 0.003, breed: 0.0095, pollution: 0.011, pollutionTol: 11, maxCondition: 4.2, foodNeed: 0.04, fishNumOptimal: 10, aggression: 0.045, strength: 1.2, longevity: 0.992, link: 'http://en.wikipedia.org/wiki/Neolamprologus_brichardi', fishNumAttack: 15 },
	{ name: 'San Francisco piranha', price: 640, sizeX: 60, sizeY: 35, growth: 0.0015, breed: 0.0024, pollution: 0.009, pollutionTol: 12, maxCondition: 6.2, foodNeed: 0.09, fishNumOptimal: 8, aggression: 0.1, strength: 1.7, longevity: 0.991, link: 'http://en.wikipedia.org/wiki/Pygocentrus_piraya', fishNumAttack: 12 },
	{ name: 'Siamese fighting fish', price: 768, sizeX: 33, sizeY: 28, growth: 0.0039, breed: 0.0008, pollution: 0.055, pollutionTol: 29, maxCondition: 4.0, foodNeed: 0.08, fishNumOptimal: 5, aggression: 0.06, strength: 0.9, longevity: 0.987, link: 'http://en.wikipedia.org/wiki/Siamese_Fighting_Fish', fishNumAttack: 8 },
	{ name: 'Ram cichlid', price: 896, sizeX: 15, sizeY: 13, growth: 0.0065, breed: 0.0021, pollution: 0.003, pollutionTol: 1, maxCondition: 0.9, foodNeed: 0.03, fishNumOptimal: 30, aggression: 0.0005, strength: 0.4, longevity: 0.985, link: 'http://en.wikipedia.org/wiki/Mikrogeophagus_ramirezi', fishNumAttack: 45 },
	{ name: 'Oscar', price: 1280, sizeX: 89, sizeY: 45, growth: 0.0001, breed: 0.0002, pollution: 0.062, pollutionTol: 22, maxCondition: 13.0, foodNeed: 0.12, fishNumOptimal: 12, aggression: 0.002, strength: 1.0, longevity: 0.999, link: 'http://en.wikipedia.org/wiki/Oscar_(fish)', fishNumAttack: 18 },
	{ name: 'Marine angelfish', price: 1536, sizeX: 80, sizeY: 43, growth: 0.0001, breed: 0.0001, pollution: 0.009, pollutionTol: 13, maxCondition: 5.3, foodNeed: 0.08, fishNumOptimal: 11, aggression: 0.001, strength: 1.5, longevity: 0.99, link: 'http://en.wikipedia.org/wiki/Marine_angelfish', fishNumAttack: 17 },
	{ name: 'Electric Blue Hap', price: 1792, sizeX: 46, sizeY: 25, growth: 0.0011, breed: 0.0018, pollution: 0.024, pollutionTol: 9, maxCondition: 5.1, foodNeed: 0.08, fishNumOptimal: 17, aggression: 0.044, strength: 1.2, longevity: 0.992, link: 'http://en.wikipedia.org/wiki/Sciaenochromis', fishNumAttack: 26 },
	{ name: 'Goldfish', price: 2560, sizeX: 60, sizeY: 32, growth: 0.0007, breed: 0.0016, pollution: 0.09, pollutionTol: 16, maxCondition: 4.3, foodNeed: 0.08, fishNumOptimal: 16, aggression: 0.007, strength: 1.6, longevity: 0.997, link: 'http://en.wikipedia.org/wiki/Goldfish', fishNumAttack: 24 },
	{ name: 'Black Piranha', price: 3072, sizeX: 70, sizeY: 44, growth: 0.0003, breed: 0.0009, pollution: 0.041, pollutionTol: 29, maxCondition: 9.6, foodNeed: 0.13, fishNumOptimal: 1, aggression: 0.21, strength: 2.1, longevity: 0.995, link: 'http://en.wikipedia.org/wiki/Serrasalmus_rhombeus', fishNumAttack: 1 },
	{ name: 'Freshwater angelfish', price: 3584, sizeX: 48, sizeY: 60, growth: 0.0001, breed: 0.0052, pollution: 0.016, pollutionTol: 8, maxCondition: 7.2, foodNeed: 0.1, fishNumOptimal: 29, aggression: 0.002, strength: 1.8, longevity: 0.9945, link: 'http://en.wikipedia.org/wiki/Pterophyllum', fishNumAttack: 44 },
	{ name: 'Discus', price: 5120, sizeX: 65, sizeY: 59, growth: 0.0011, breed: 0.00005, pollution: 0.022, pollutionTol: 3, maxCondition: 8.5, foodNeed: 0.16, fishNumOptimal: 24, aggression: 0.008, strength: 1.8, longevity: 0.9, link: 'http://en.wikipedia.org/wiki/Discus_(fish)', fishNumAttack: 36 },
	{ name: 'Barracuda', price: 6144, sizeX: 100, sizeY: 27, growth: 0.0008, breed: 0.0002, pollution: 0.044, pollutionTol: 7, maxCondition: 12.5, foodNeed: 0.25, fishNumOptimal: 7, aggression: 0.08, strength: 9.2, longevity: 0.9, link: 'http://en.wikipedia.org/wiki/Barracuda', fishNumAttack: 15 },
	{ name: 'Green Sea Turtle', price: 7168, sizeX: 100, sizeY: 26, growth: 0.00001, breed: 0.00001, pollution: 0.045, pollutionTol: 5, maxCondition: 9.9, foodNeed: 0.17, fishNumOptimal: 2, aggression: 0.0004, strength: 2.1, longevity: 0.9, link: 'http://en.wikipedia.org/wiki/Green_Sea_Turtle', fishNumAttack: 64 },
	{ name: 'Bottlenose dolphin', price: 10240, sizeX: 188, sizeY: 51, growth: 0.00004, breed: 0.00001, pollution: 0.03, pollutionTol: 8, maxCondition: 15.2, foodNeed: 0.25, fishNumOptimal: 7, aggression: 0.012, strength: 9.4, longevity: 0.9993, link: 'http://en.wikipedia.org/wiki/Bottlenose_dolphin', fishNumAttack: 64 },
];

// Per-species derived rates, recomputed when aquarium comfort / fish count changes.

const speciesBreedingRate: number[] = [];
export function computeBreedingRate() {
	for (let i = 0; i < fishSpecies.length; i++) {
		speciesBreedingRate[i] = aquarium.getComfortAquarium() * fishSpecies[i].breed;
	}
}

const speciesFishNumComfort: number[] = [];
export function computeFishNumComfort() {
	for (let i = 0; i < fishSpecies.length; i++) {
		speciesFishNumComfort[i] = fishSpecies[i].fishNumOptimal / aquarium.getFishNum();
	}
}

// FISH FRAMES — fishFrame{L,R}[species][frame]
//
// The tank fish are the same art as the shop cards (src/fishArt.ts, skinnable),
// rasterised via a data-URI SVG. `#renderFish` scales them to the live size
// exactly as it did the PNGs; baked at TANK_SCALE_MAX so they stay ~1:1 even
// when the canvas is at its highest resolution.
// (The old fishNR.png files still ship — the Config panel preview uses one.)

const fishFrameL: HTMLImageElement[][] = [];
const fishFrameR: HTMLImageElement[][] = [];

for (let i = 0; i < 29; i++) {
	fishFrameL[i] = [new Image()];
	fishFrameR[i] = [new Image()];
}

/** (Re)point every frame image at the current fish skin. Cheap — data URIs. */
export function rebuildFishFrames() {
	for (let i = 0; i < 29; i++) {
		const w = Math.round(fishSpecies[i].sizeX * TANK_SCALE_MAX);
		const h = Math.round(fishSpecies[i].sizeY * TANK_SCALE_MAX);
		fishFrameR[i][0].src = fishArtSvgUri(i, w, h, false);
		fishFrameL[i][0].src = fishArtSvgUri(i, w, h, true);
	}
}
rebuildFishFrames();

export class Fish {
	#x;
	#y;
	#vX = 0;
	#vY = 0;
	#speed = 0;
	#maxSpeed = 0;
	#movX = 0;
	#movY = 0;
	#size;
	#sizeX = 0;
	#sizeY = 0;
	#boxX1 = 0;
	#boxY1 = 0;
	#boxX2 = 0;
	#boxY2 = 0;
	#image = new Image();
	#specNum;
	#specName;
	#disease = 0;
	#hunger = 0;
	#condition = 0;

	/**
	 * @param {number} sNum   species index into fishSpecies
	 * @param {number} fSize   initial size, 0-1
	 */
	constructor(sNum: number, fSize: number) {
		this.#specNum = sNum;
		this.#specName = fishSpecies[sNum].name;

		this.#size = fSize;
		this.grow();
		this.speedUp();
		this.#x = Math.trunc(Math.random() * 180 + 90);
		this.#y = Math.trunc(Math.random() * 120 + 60);
		this.changeDirection();
		this.setCondition();
	}

	get #spec() {
		return fishSpecies[this.#specNum];
	}

	getX() {
		return this.#x;
	}
	getY() {
		return this.#y;
	}
	getVX() {
		return this.#vX;
	}
	getVY() {
		return this.#vY;
	}
	getSize() {
		return this.#size;
	}
	getSizeX() {
		return this.#sizeX;
	}
	getSizeY() {
		return this.#sizeY;
	}
	getBoxX1() {
		return this.#boxX1;
	}
	getBoxY1() {
		return this.#boxY1;
	}
	getBoxX2() {
		return this.#boxX2;
	}
	getBoxY2() {
		return this.#boxY2;
	}
	getImage() {
		return this.#image;
	}
	getSpecNum() {
		return this.#specNum;
	}
	getSpecName() {
		return this.#specName;
	}
	getDisease() {
		return this.#disease;
	}
	getHunger() {
		return this.#hunger;
	}
	getCondition() {
		return this.#condition;
	}

	/*** FISH MOVEMENT ***/

	move() {
		this.#x = this.#x + this.#movX;
		this.#y = this.#y + this.#movY;

		// Fish hits borders check
		if (this.#x > 355 - this.#boxX2) {
			if (this.#vX === 10) this.rotate(-10, this.#vY);
		} else if (this.#x < 5 + this.#boxX2) {
			if (this.#vX === -10) this.rotate(10, this.#vY);
		}
		if (this.#y > 215 - this.#boxY2) {
			if (this.#vY > 0) this.rotate(this.#vX, this.#vY * -1);
		} else if (this.#y < 25 + this.#boxY2) {
			if (this.#vY < 0) this.rotate(this.#vX, this.#vY * -1);
		}

		this.slowDown();
	}

	slowDown() {
		if (this.#speed > 0.05) this.#speed = this.#speed * 0.985;
		this.#movX = this.#vX * this.#speed;
		this.#movY = this.#vY * this.#speed;
	}

	speedUp() {
		this.#speed = this.#maxSpeed;
		this.#movX = this.#vX * this.#speed;
		this.#movY = this.#vY * this.#speed;
	}

	changeDirection() {
		if (Math.random() < 0.5) this.rotate(10, Math.trunc(Math.random() * 11 - 5));
		else this.rotate(-10, Math.trunc(Math.random() * 11 - 5));
	}

	rotate(rX: number, rY: number) {
		this.#vX = rX;
		this.#vY = rY;
		this.#movX = this.#vX * this.#speed;
		this.#movY = this.#vY * this.#speed;
		if (this.#vX === 10) this.#image = fishFrameR[this.#specNum][0];
		else this.#image = fishFrameL[this.#specNum][0];
	}

	/*** FISH GROWTH ***/
	grow() {
		if (this.#size < 1) {
			if (aquarium.getGrowHormone() > 0) this.#size = this.#size + this.#spec.growth * 4;
			else this.#size = this.#size + this.#spec.growth;

			if (this.#size > 1) this.#size = 1;

			this.#sizeX = this.#spec.sizeX * this.#size;
			this.#sizeY = this.#spec.sizeY * this.#size;
			this.#boxX1 = this.#sizeX * -0.5;
			this.#boxY1 = this.#sizeY * -0.5;
			this.#boxX2 = this.#sizeX * 0.5;
			this.#boxY2 = this.#sizeY * 0.5;

			this.#maxSpeed = this.#size * 0.5;
		}
	}

	/*** FISH BREED ***/
	breed() {
		if (aquarium.getFishNum() > 63) return;

		if (aquarium.getFishNum() > this.#spec.fishNumOptimal) {
			if (Math.random() < 0.9) return;
		}

		if (this.#size === 1) {
			if (aquarium.getFishNumBySpecies(this.#specNum) > 1) {
				if (aquarium.getBreedHormone() > 0) {
					if (Math.random() < speciesBreedingRate[this.#specNum] * 2 + 0.01) {
						aquarium.breedFishSet(this.#specNum);
					}
				} else {
					if (Math.random() < speciesBreedingRate[this.#specNum]) {
						aquarium.breedFishSet(this.#specNum);
					}
				}
			}
		}
	}

	/*** FISH POLLUTION ***/
	pollute() {
		aquarium.changePollution(this.#spec.pollution);
	}

	/*** FISH DISEASES ***/
	diseaseCheck() {
		const illChance = Math.random();

		if (this.#disease > 0) {
			this.changeCondition(illChance * -0.1);
			this.changeDisease(illChance * -0.2);

			if (aquarium.getMedicine() > 0) {
				if (aquarium.getMedicine() < illChance) {
					this.changeDisease(aquarium.getMedicine() * -2);
					aquarium.resetMedicine();
				} else {
					this.changeDisease(illChance * -2);
					aquarium.changeMedicine(illChance * -1);
				}
			}
		} else {
			const currentPollution = aquarium.getPollution();

			if (illChance < 0.00001) {
				this.makeSick();
			} else {
				if (this.#spec.pollutionTol < currentPollution) {
					if (this.#spec.pollutionTol / currentPollution < illChance) {
						if (Math.random() * 1000 < currentPollution) {
							this.makeSick();
						}
					}
				}
			}
		}
	}

	changeDisease(disNum: number) {
		this.#disease = this.#disease + disNum;
		if (this.#disease < 0) this.#disease = 0;
	}

	makeSick() {
		this.#disease = Math.random() * this.#spec.maxCondition + 0.5;
		uio.changeAlertNum(0);
	}

	/*** FISH HUNGER ***/
	hungerCheck() {
		const hungerChance = Math.random();
		if (hungerChance < this.#spec.foodNeed) {
			this.#hunger = this.#hunger + 1;
		}

		// Try to eat food
		if (this.#hunger > 0) {
			if (aquarium.getFood() > 0) {
				const eatFoodNumber = this.#spec.foodNeed * 10;

				if (eatFoodNumber < aquarium.getFood()) {
					this.changeHunger(eatFoodNumber * -5);
					aquarium.changeFood(eatFoodNumber * -0.1);
				} else {
					this.changeHunger(aquarium.getFood() * -2);
					aquarium.resetFood();
				}
			}
		}

		// starve
		if (this.#hunger > 100) {
			uio.changeAlertNum(1);
			this.changeCondition(Math.random() * -0.5);
		}
	}

	changeHunger(hNum: number) {
		this.#hunger = this.#hunger + hNum;
		if (this.#hunger < 0) this.#hunger = 0;
		if (this.#hunger > 101) this.#hunger = 101;
	}

	/*** FISH CONDITION / HEALTH ***/
	setCondition() {
		this.#condition = this.#spec.maxCondition;
	}

	changeCondition(condValue: number) {
		this.#condition = this.#condition + condValue;
		if (this.#condition < 0) {
			this.#condition = 0;
		} else if (this.#condition > this.#spec.maxCondition) {
			this.#condition = this.#spec.maxCondition;
		}
	}

	/*** FISH FIGHTS ***/
	fight(me: number) {
		if (aquarium.getFishNum() < 2) return;

		if (aquarium.getDistraction() > 0) return;

		if (this.#size >= 1) {
			if (aquarium.getFishNum() > this.#spec.fishNumAttack) {
				const biteRnd1 = Math.random();
				if (biteRnd1 < this.#spec.aggression) {
					const biteRnd2 = Math.random();
					if (this.#hunger > 100) {
						this.attackEnemy(me);
					} else if (biteRnd2 > speciesFishNumComfort[this.#specNum]) {
						this.attackEnemy(me);
					}
				}
			}
		}
	}

	attackEnemy(me: number) {
		const enemy = Math.trunc(Math.random() * aquarium.getFishNum());

		if (enemy === me) return;

		aquarium.hurtFish(enemy, Math.random() * this.#spec.strength * -1);
		uio.changeAlertNum(4);
	}

	/*** FISH GETTING OLD ***/
	getOld() {
		if (this.#size < 1) return;

		if (Math.random() > this.#spec.longevity) {
			this.changeCondition(Math.random() * -0.1);
		}
	}

	/*** FISH DATA SERIALIZING ***/
	/** @returns {string} `specNum|size|disease|hunger|condition` */
	serialize() {
		return (
			this.#specNum +
			'|' +
			this.#size +
			'|' +
			this.#disease +
			'|' +
			this.#hunger +
			'|' +
			this.#condition
		);
	}

	changeData(s: number, d: number, h: number, c: number) {
		this.#size = s;
		this.#disease = d;
		this.#hunger = h;
		this.#condition = c;

		if (this.#size > 1) this.#size = 1;
		this.#sizeX = this.#spec.sizeX * this.#size;
		this.#sizeY = this.#spec.sizeY * this.#size;
		this.#boxX1 = this.#sizeX * -0.5;
		this.#boxY1 = this.#sizeY * -0.5;
		this.#boxX2 = this.#sizeX * 0.5;
		this.#boxY2 = this.#sizeY * 0.5;
		this.#maxSpeed = this.#size * 0.5;
	}
}
