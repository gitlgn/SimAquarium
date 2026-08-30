/*
 **	AQUARIUM OBJECT MODULE
 **
 */

import { config } from './config.js';
import { fishShop } from './fishshop.js';
import { scenery } from './scenery.js';
import { lighting } from './lighting.js';
import { filtration, background } from './filtration.js';
import { stats } from './statistics.js';
import { uio } from './uio.js';
import {
	Fish,
	fishSpecies,
	fishAngle,
	computeBreedingRate,
	computeFishNumComfort,
} from './species.js';
import { $, ctx2d } from './dom.js';
import {
	BUY,
	SELL,
	TANK_SCALE_MAX,
	VIEW_AQUARIUM,
	SC_FGIMAGE,
	SC_BGIMAGE,
	SC_PRICE,
	SC_COMFORT,
	LI_PRICE,
	LI_COMFORT,
	LI_IMAGE,
	FI_PRICE,
	FI_POLLUTION,
	FI_ENERGY,
	FI_IMAGE,
	BG_PRICE,
} from './constants.js';

/** A 360x240 offscreen canvas for one of the two composited layers. */
function makeLayerCanvas() {
	const c = document.createElement('canvas');
	c.width = 360;
	c.height = 240;
	return c;
}

class Aquarium {
	#money = 0;

	#usedScenery = 0; // which scenery is shown
	#sceneries = [true]; // which sceneries the user owns (index 0 always available)

	#usedLight = 0;
	#lights = [true];

	#usedFilter = 0;
	#filters = [true];

	#usedBackground = 0;

	#fish: Fish[] = []; // the list of all fish
	#fishNum = 0;
	#fishNumBySpecies: number[] = new Array<number>(29).fill(0);

	#pollution = 0;
	#pollutionChanged = false;

	#medicine = 0;
	#food = 0;
	#growHormone = 0;
	#breedHormone = 0;
	#distraction = 0;

	#fishBirths = 0;
	#fishDeaths = 0;

	// Set in one method, consumed in update().
	#breedFish = -1;
	#killFish = -1;

	#comfortAquarium = 0;

	// Canvas + offscreen layers
	#imageGlassFront = new Image();
	#imageWater = new Image();
	#imageGlassBack = new Image();
	// the tiled back-wall colour. The 2014 code showed it as a CSS background on
	// #view0 behind a transparent canvas; the responsive tank canvas is opaque,
	// so it's drawn on-canvas now (like exportPhoto always did).
	#wallImage = new Image();
	#layerFront = makeLayerCanvas();
	#layerBack = makeLayerCanvas();
	#layerFrontCtx = ctx2d(this.#layerFront);
	#layerBackCtx = ctx2d(this.#layerBack);
	// The real tank context is wired in create(); a detached one stands in
	// until then so the field is always a valid context.
	#canvasTankCtx = ctx2d(document.createElement('canvas'));

	constructor() {
		this.#imageGlassFront.src = 'gfx/aquarium/tank/glassFront.png';
		this.#imageWater.src = 'gfx/aquarium/tank/water.png';
		this.#imageGlassBack.src = 'gfx/aquarium/tank/glassBack.png';
		this.#wallImage.addEventListener('load', () => this.render());
	}

	#setWall(bgNum: number) {
		this.#wallImage.src = background.getBackgroundSrc(bgNum);
	}

	resetAquarium() {
		this.resetMoney();

		this.#usedScenery = 0;
		this.#sceneries.length = 0;
		this.#sceneries[0] = true;

		this.#usedLight = 0;
		this.#lights.length = 0;
		this.#lights[0] = true;

		this.#usedFilter = 0;
		this.#filters.length = 0;
		this.#filters[0] = true;
		// the scenery / lighting / filter button classes are painted by
		// #updateBuyButtons() at the end of this method

		this.#usedBackground = 0;
		background.renderBackgrounds(this.#money, 0);
		this.#setWall(0);

		this.#fish.length = 0;
		for (let i = 0; i < 29; i++) {
			this.#fishNumBySpecies[i] = 0;
		}

		this.#fishNum = 0;

		this.#pollution = 0;
		this.#pollutionChanged = false;
		this.updatePollutionBar();

		this.#medicine = 0;
		this.#food = 0;

		this.#growHormone = 0;
		this.#breedHormone = 0;
		this.#distraction = 0;

		this.#killFish = -1;
		this.#breedFish = -1;

		this.#fishBirths = 0;
		this.#fishDeaths = 0;

		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		this.#updateBuyButtons();
	}

	saveAquarium() {
		config.setItem('money', this.#money);

		config.setItem('usedScenery', this.#usedScenery);
		config.setItem('usedLight', this.#usedLight);
		for (let i = 0; i < 9; i++) {
			config.setItem('sceneries' + i, this.#sceneries[i] === true ? '1' : '0');
			config.setItem('lights' + i, this.#lights[i] === true ? '1' : '0');
		}
		config.setItem('usedFilter', this.#usedFilter);
		for (let i = 0; i < 6; i++) {
			config.setItem('filters' + i, this.#filters[i] === true ? '1' : '0');
		}
		config.setItem('usedBackground', this.#usedBackground);

		// save the fish
		config.setItem('fishNum', this.#fishNum);
		for (let i = 0; i < 29; i++) {
			config.setItem('fishNumBySpecies' + i, this.#fishNumBySpecies[i]);
		}
		for (let i = 0; i < this.#fishNum; i++) {
			config.setItem('fish' + i, this.#fish[i].serialize());
		}

		config.setItem('pollution', this.#pollution);
		this.#pollutionChanged = false;
		this.updatePollutionBar();

		config.setItem('medicine', this.#medicine);
		config.setItem('food', this.#food);

		config.setItem('growHormone', this.#growHormone);
		config.setItem('breedHormone', this.#breedHormone);
		config.setItem('distraction', this.#distraction);

		config.setItem('killFish', this.#killFish);
		config.setItem('breedFish', this.#breedFish);

		config.setItem('fishBirths', this.#fishBirths);
		config.setItem('fishDeaths', this.#fishDeaths);
	}

	loadAquarium() {
		this.#money = parseFloat(config.getItem('money'));
		this.#renderMoney();

		// button classes for these three shops are painted from state by
		// #updateBuyButtons() at the end of this method
		this.#usedScenery = parseInt(config.getItem('usedScenery'), 10);
		this.#usedLight = parseInt(config.getItem('usedLight'), 10);
		for (let i = 0; i < 9; i++) {
			this.#sceneries[i] = config.getItem('sceneries' + i) === '1';
			this.#lights[i] = config.getItem('lights' + i) === '1';
		}
		this.#usedFilter = parseInt(config.getItem('usedFilter'), 10);
		for (let i = 0; i < 6; i++) {
			this.#filters[i] = config.getItem('filters' + i) === '1';
		}
		this.#usedBackground = parseInt(config.getItem('usedBackground'), 10) || 0;
		background.renderBackgrounds(this.#money, this.#usedBackground);
		this.#setWall(this.#usedBackground);

		// load fish data

		const storedFishNum = parseInt(config.getItem('fishNum'), 10);
		for (let i = 0; i < 29; i++) {
			this.#fishNumBySpecies[i] = parseInt(config.getItem('fishNumBySpecies' + i), 10);
		}
		this.#fishNum = 0;
		for (let i = 0; i < storedFishNum; i++) {
			const unSerialize = config.getItem('fish' + i).split('|');
			const spec = parseInt(unSerialize[0], 10);

			this.#fish[i] = new Fish(spec, 0.9999);
			this.#fishNum++;

			this.#fish[i].changeData(
				parseFloat(unSerialize[1]),
				parseFloat(unSerialize[2]),
				parseFloat(unSerialize[3]),
				parseFloat(unSerialize[4])
			);
		}
		this.updateComfortSpecies();

		this.#pollution = parseFloat(config.getItem('pollution'));
		this.#pollutionChanged = false;
		this.updatePollutionBar();

		this.#medicine = parseFloat(config.getItem('medicine'));
		this.#food = parseFloat(config.getItem('food'));

		this.#growHormone = parseFloat(config.getItem('growHormone'));
		this.#breedHormone = parseFloat(config.getItem('breedHormone'));
		this.#distraction = parseFloat(config.getItem('distraction'));

		this.#killFish = parseInt(config.getItem('killFish'), 10);
		this.#breedFish = parseInt(config.getItem('breedFish'), 10);

		this.#fishBirths = parseInt(config.getItem('fishBirths'), 10);
		this.#fishDeaths = parseInt(config.getItem('fishDeaths'), 10);

		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		this.#updateBuyButtons();
	}

	/*** AQUARIUM MONEY ***/

	getMoney() {
		return this.#money;
	}
	getUsedBackground() {
		return this.#usedBackground;
	}

	#renderMoney() {
		$('statusMoney').textContent = String(Math.trunc(this.#money));
	}

	resetMoney() {
		this.#money = 100;
		this.#renderMoney();
	}

	/** Returns false (and does nothing) when the change would overdraw. */
	changeMoney(diff: number) {
		if (this.#money + diff < 0) return false;
		this.#money = this.#money + diff;
		this.#renderMoney();
		return true;
	}

	addMoney(mNum: number) {
		this.changeMoney(mNum);
	}

	/*** AQUARIUM SCENERIES ***/

	getSceneries(sNum: number) {
		return this.#sceneries[sNum];
	}

	buyScenery(scNum: number) {
		if (this.#sceneries[scNum]) {
			this.chooseScenery(scNum);
		} else if (this.changeMoney(BUY * scenery.getSceneryData(scNum, SC_PRICE))) {
			this.#sceneries[scNum] = true;
			this.chooseScenery(scNum);
			this.#updateBuyButtons();
		}
	}
	chooseScenery(scNum: number) {
		this.#usedScenery = scNum;
		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		this.#renderAccessoryShops();
		config.saveGame();
	}

	sellScenery(scNum: number) {
		if (!this.#sceneries[scNum]) return;

		this.changeMoney(SELL * scenery.getSceneryData(scNum, SC_PRICE) * 0.5);
		this.#sceneries[scNum] = false;

		// Return to custom scenery if you sell current scenery
		if (scNum === this.#usedScenery) this.chooseScenery(0);
		this.#updateBuyButtons();
	}

	/*** AQUARIUM LIGHTING ***/

	buyLight(liNum: number) {
		if (this.#lights[liNum]) {
			this.chooseLight(liNum);
		} else if (this.changeMoney(BUY * lighting.getLightData(liNum, LI_PRICE))) {
			this.#lights[liNum] = true;
			this.chooseLight(liNum);
			this.#updateBuyButtons();
		}
	}

	chooseLight(liNum: number) {
		this.#usedLight = liNum;
		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		this.#renderAccessoryShops();
		config.saveGame();
	}

	sellLight(liNum: number) {
		if (!this.#lights[liNum]) return;

		this.changeMoney(SELL * lighting.getLightData(liNum, LI_PRICE) * 0.5);
		this.#lights[liNum] = false;

		// Return to custom scenery if you sell current scenery
		if (liNum === this.#usedLight) this.chooseLight(0);
		this.#updateBuyButtons();
	}

	/*** AQUARIUM FILTERS ***/

	buyFilter(fiNum: number) {
		if (this.#filters[fiNum]) {
			this.chooseFilter(fiNum);
		} else if (this.changeMoney(BUY * filtration.getFilterData(fiNum, FI_PRICE))) {
			this.#filters[fiNum] = true;
			this.chooseFilter(fiNum);
			this.#updateBuyButtons();
		}
	}

	chooseFilter(fiNum: number) {
		this.#usedFilter = fiNum;
		this.layerFrontRefresh();
		this.layerBackRefresh();
		this.#renderAccessoryShops();
		config.saveGame();
	}

	sellFilter(fiNum: number) {
		if (!this.#filters[fiNum]) return;

		this.changeMoney(SELL * filtration.getFilterData(fiNum, FI_PRICE) * 0.5);
		this.#filters[fiNum] = false;

		// Return to custom scenery if you sell current scenery
		if (fiNum === this.#usedFilter) this.chooseFilter(0);
		this.#updateBuyButtons();
	}

	/*** BUY AQUARIUM BACKGROUNDS ***/

	buyBackground(bgNum: number) {
		if (this.#usedBackground === bgNum) return;

		if (this.changeMoney(BUY * background.getBackgroundData(bgNum, BG_PRICE))) {
			this.#usedBackground = bgNum;
			this.#setWall(bgNum); // #wallImage 'load' repaints; render now for the cached case
			this.render();
			this.#updateBuyButtons();
			config.saveGame();
		}
	}

	/*** UPDATE AQUARIUM SHOPS — every button's class is derived from state ***/

	// One scenery / lighting / filter shop. Per slot the buy button is:
	//   choose off — this one is active        choose on — owned, tap to switch
	//   buy on     — affordable, not owned     buy off   — can't afford it
	// and the sell button (slots 1+) is `sell on` while owned, else `sell off`.
	#renderShopButtons(
		prefix: string,
		count: number,
		owned: boolean[],
		used: number,
		priceOf: (i: number) => number
	) {
		const active = Number(used) || 0;
		for (let i = 0; i < count; i++) {
			let cls;
			if (i === active) cls = 'button choose off';
			else if (owned[i]) cls = 'button choose on';
			else cls = this.#money < priceOf(i) ? 'button buy off' : 'button buy on';
			$('button' + prefix + 'Buy' + i).setAttribute('class', cls);

			if (i >= 1) {
				$('button' + prefix + 'Sell' + i).setAttribute(
					'class',
					owned[i] ? 'button sell on' : 'button sell off'
				);
			}
		}
	}

	#renderAccessoryShops() {
		this.#renderShopButtons('Scenery', 9, this.#sceneries, this.#usedScenery, (i: number) =>
			scenery.getSceneryData(i, SC_PRICE)
		);
		this.#renderShopButtons('Light', 9, this.#lights, this.#usedLight, (i: number) =>
			lighting.getLightData(i, LI_PRICE)
		);
		this.#renderShopButtons('Filter', 6, this.#filters, this.#usedFilter, (i: number) =>
			filtration.getFilterData(i, FI_PRICE)
		);
	}

	#updateBuyButtons() {
		fishShop.updateView();
		this.#renderAccessoryShops();
		background.renderBackgrounds(this.#money, this.#usedBackground);
	}

	updateBuyButtonsAlias() {
		this.#updateBuyButtons();
	}

	/*** AQUARIUM LAYERS ***/

	layerFrontRefresh() {
		this.#layerFrontCtx.clearRect(0, 0, 360, 240);
		this.#layerFrontCtx.drawImage(scenery.getSceneryData(this.#usedScenery, SC_FGIMAGE), 0, 0);
		this.#layerFrontCtx.drawImage(this.#imageWater, 0, 16);
		this.#layerFrontCtx.drawImage(lighting.getLightData(this.#usedLight, LI_IMAGE), 0, 0);
		this.#layerFrontCtx.drawImage(this.#imageGlassFront, 0, 0);
	}
	layerBackRefresh() {
		this.#layerBackCtx.clearRect(0, 0, 360, 240);
		this.#layerBackCtx.drawImage(this.#imageGlassBack, 0, 0);
		this.#layerBackCtx.drawImage(filtration.getFilterData(this.#usedFilter, FI_IMAGE), 10, 0);
		this.#layerBackCtx.drawImage(scenery.getSceneryData(this.#usedScenery, SC_BGIMAGE), 0, 0);
	}

	/*** CREATE THE AQUARIUM ***/

	create() {
		this.#fitTank();
		this.#setWall(this.#usedBackground);
		this.layerBackRefresh();
		this.layerFrontRefresh();
		// window resize / phone rotation — repaint promptly (render() re-fits).
		window.addEventListener('resize', () => this.render());
	}

	// Match the tank's backing store to the pixels it actually occupies on
	// screen (× devicePixelRatio) and scale the context, so all the drawing
	// code stays in 360×240 units while painting sharp. `object-fit: contain`
	// keeps the painted area at 360:240, so only the width needs measuring.
	// The scale is an INTEGER (ceil of the needed ratio): the wall is drawn as
	// 64×64 tiles, and a fractional scale leaves sub-pixel seams between them —
	// a visible grid. Integer scale → exact tile edges; the canvas ends up a
	// touch larger than the display and the browser downscales it cleanly.
	// Called at the top of every render(); one layout read, early-returns when
	// unchanged.
	#fitTank() {
		const canvas = $('tank') as HTMLCanvasElement;
		const box = canvas.getBoundingClientRect();
		if (box.width === 0 || box.height === 0) return;
		const paintW = Math.min(box.width, box.height * (360 / 240));
		const dpr = window.devicePixelRatio || 1;
		const scale = Math.max(2, Math.min(TANK_SCALE_MAX, Math.ceil((paintW * dpr) / 360)));
		const w = 360 * scale;
		const h = 240 * scale;
		if (canvas.width === w && canvas.height === h) return;
		canvas.width = w; // clears + resets the context
		canvas.height = h;
		this.#canvasTankCtx = ctx2d(canvas);
		this.#canvasTankCtx.setTransform(scale, 0, 0, scale, 0, 0);
	}

	// Photo making
	exportPhoto() {
		const PHOTO_SCALE = 4; // fixed, so a screenshot doesn't depend on window size
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = 360 * PHOTO_SCALE;
		tempCanvas.height = 240 * PHOTO_SCALE;
		const tempCtx = ctx2d(tempCanvas);
		tempCtx.scale(PHOTO_SCALE, PHOTO_SCALE);
		tempCtx.globalCompositeOperation = 'source-over';

		// DRAW BACKGROUND
		tempCtx.fillStyle = 'white';
		tempCtx.fillRect(0, 0, 360, 240);
		const wall = new Image();
		wall.src = background.getBackgroundSrc(this.#usedBackground);
		for (let x = 0; x < 6; x++) {
			for (let y = 0; y < 4; y++) {
				tempCtx.drawImage(wall, x * 64, y * 64);
			}
		}

		// DRAW TANK
		tempCtx.drawImage(this.#layerBack, 0, 0);
		for (let i = 0; i < this.#fishNum; i++) {
			const fishObj = this.#fish[i];
			tempCtx.save();
			tempCtx.translate(fishObj.getX(), fishObj.getY());
			tempCtx.rotate(fishAngle[fishObj.getVX()][fishObj.getVY()]);
			tempCtx.translate(fishObj.getBoxX1(), fishObj.getBoxY1());
			tempCtx.drawImage(fishObj.getImage(), 0, 0, fishObj.getSizeX(), fishObj.getSizeY());
			tempCtx.restore();
		}
		tempCtx.drawImage(this.#layerFront, 0, 0);
		// The 2014 version handed the data URL to the packaged-app wrapper to open;
		// there is no wrapper any more. A download/share flow is a later feature.
	}

	/********
	*********
	F   I  S  H
	*********
	*********/

	getFishNum() {
		return this.#fishNum;
	}

	getFishNumBySpecies(fSpec: number) {
		return this.#fishNumBySpecies[fSpec];
	}

	/**
	 * Add a fish by species.
	 * @param {number} sNum   species index
	 * @param {number} size   initial size, 0-1
	 */
	addFish(sNum: number, size: number) {
		this.#fish[this.#fishNum] = new Fish(sNum, size);
		this.#fishNum++;

		this.#fishNumBySpecies[sNum]++;

		this.updateComfortSpecies();
	}

	// Remove specific fish
	removeFish(fNum: number) {
		if (fNum >= this.#fishNum) return;

		this.#fishNumBySpecies[this.#fish[fNum].getSpecNum()]--;

		for (let i = fNum + 1; i < this.#fishNum; i++) {
			this.#fish[i - 1] = this.#fish[i];
		}

		this.#fishNum--;

		this.#fish.length = this.#fishNum;

		this.updateComfortSpecies();
	}

	// Fish is attacked and hurt
	hurtFish(fNum: number, hurtNum: number) {
		this.#fish[fNum].changeCondition(hurtNum);
	}

	/*** AQUARIUM POLLUTION ***/

	getPollution() {
		return this.#pollution;
	}

	changePollution(change: number) {
		this.#pollution = this.#pollution + change;
		if (this.#pollution < 0) this.#pollution = 0;
		else if (this.#pollution > 32) this.#pollution = 32;
		this.#pollutionChanged = true;
	}

	resetPollution() {
		this.#pollution = 0;
		this.#pollutionChanged = true;
	}

	updatePollutionBar() {
		// water-quality gauge (CSS bar, no bitmap): full = clean = good, drains
		// and reddens as pollution rises.
		const quality = 1 - Math.min(1, this.#pollution / 32);
		const bar = $('statusWaterBar');
		bar.style.height = (quality * 100).toFixed(1) + '%';
		bar.style.backgroundColor = 'hsl(' + quality * 130 + ' 65% 45%)';
		this.#pollutionChanged = false;
	}

	/*** AQUARIUM CLEANING ***/

	clean() {
		if (this.#pollution < 1) return;
		if (this.changeMoney(-10)) {
			this.changePollution(Math.random() * -4 - 2);
			this.updatePollutionBar();
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	waterChange() {
		if (this.#pollution < 1) return;
		if (this.changeMoney(-40)) {
			this.resetFood();
			this.resetMedicine();
			this.resetPollution();
			this.resetGrowHormone();
			this.resetBreedHormone();
			this.updatePollutionBar();
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	/*** AQUARIUM MEDICINE, FOOD AND HORMONES ***/

	/*** MEDICINE ***/

	getMedicine() {
		return this.#medicine;
	}
	changeMedicine(medNum: number) {
		this.#medicine = this.#medicine + medNum;
		if (this.#medicine < 0) this.#medicine = 0;
		if (this.#medicine > 100) this.#medicine = 100;
	}
	resetMedicine() {
		this.#medicine = 0;
	}
	updateMedicine() {
		const medicineMelt = Math.random();

		if (this.#medicine > 0) {
			this.changeMedicine(medicineMelt * -0.8);
			this.changePollution(medicineMelt * 0.02);
		}
	}

	addMedicine() {
		if (this.changeMoney(-20)) {
			this.changeMedicine(Math.random() * 4 + 4);
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	/*** FOOD ***/

	getFood() {
		return this.#food;
	}

	changeFood(foodNum: number) {
		this.#food = this.#food + foodNum;
		if (this.#food < 0) this.#food = 0;
		if (this.#food > 100) this.#food = 100;
	}

	resetFood() {
		this.#food = 0;
	}

	updateFood() {
		const foodMelt = Math.random();

		if (this.#food > 0) {
			this.changeFood(foodMelt * -0.04);
			this.changePollution(foodMelt * 0.01);
		}
	}

	addFood() {
		if (this.changeMoney(-20)) {
			this.changeFood(Math.random() * 8 + 8);
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	/*** HORMONES ***/

	// GROW HORMONE
	getGrowHormone() {
		return this.#growHormone;
	}

	resetGrowHormone() {
		this.#growHormone = 0;
	}

	changeGrowHormone(ghNum: number) {
		this.#growHormone = this.#growHormone + ghNum;
		if (this.#growHormone < 0) this.#growHormone = 0;
		if (this.#growHormone > 100) this.#growHormone = 100;
	}
	updateGrowHormone() {
		const growHormoneMelt = Math.random();
		if (this.#growHormone > 0) {
			this.changeGrowHormone(growHormoneMelt * -0.1);
			this.changePollution(growHormoneMelt * 0.5);
		}
	}

	addGrowHormone() {
		if (this.changeMoney(-100)) {
			this.changePollution(2);
			this.changeGrowHormone(Math.random() * 4 + 4);
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	// BREED HORMONE
	getBreedHormone() {
		return this.#breedHormone;
	}

	resetBreedHormone() {
		this.#breedHormone = 0;
	}

	changeBreedHormone(bhNum: number) {
		this.#breedHormone = this.#breedHormone + bhNum;
		if (this.#breedHormone < 0) this.#breedHormone = 0;
		if (this.#breedHormone > 100) this.#breedHormone = 100;
	}

	updateBreedHormone() {
		const breedHormoneMelt = Math.random();
		if (this.#breedHormone > 0) {
			this.changeBreedHormone(breedHormoneMelt * -0.2);
			this.changePollution(breedHormoneMelt);
		}
	}

	addBreedHormone() {
		if (this.changeMoney(-200)) {
			this.changePollution(4);
			this.changeBreedHormone(Math.random() * 4 + 4);
			this.#updateBuyButtons();
			stats.refreshStatsPage();
		}
	}

	/*** AQUARIUM DISTRACTION - CONFUSES FISH SO THEY DON'T ATTACK ***/

	getDistraction() {
		return this.#distraction;
	}

	distractFish() {
		this.#distraction = this.#distraction + 10;
		if (this.#distraction > 100) this.#distraction = 100;
		stats.refreshStatsPage();
	}

	updateDistraction() {
		if (this.#distraction === 0) return;
		this.#distraction--;
	}

	/*** SCARE / ATTRACT THE FISH ***/
	scareFish() {
		if (this.changeMoney(-5)) {
			for (let i = 0; i < this.#fishNum; i++) {
				const dirX = this.#fish[i].getX() > 180 ? 10 : -10;
				const dirY = this.#fish[i].getY() > 120 ? 5 : -5;
				this.#fish[i].rotate(dirX, dirY);
				this.#fish[i].speedUp();
			}
			this.#updateBuyButtons();
			this.distractFish();
		}
	}

	attractFish() {
		if (this.changeMoney(-5)) {
			for (let i = 0; i < this.#fishNum; i++) {
				const dirX = this.#fish[i].getX() > 180 ? -10 : 10;
				const dirY = this.#fish[i].getY() > 120 ? -5 : 5;
				this.#fish[i].rotate(dirX, dirY);
				this.#fish[i].speedUp();
			}
			this.#updateBuyButtons();
			this.distractFish();
		}
	}

	/*** *** REFRESH THE AQUARIUM *** ***/

	/* MOVE FISH EVERY 32/1000 -- 1024/1000 SECONDS */
	moveFish() {
		for (let i = 0; i < this.#fishNum; i++) this.#fish[i].move();
		if (uio.getView() === VIEW_AQUARIUM) this.render();
	}

	getFishBirths() {
		return this.#fishBirths;
	}
	getFishDeaths() {
		return this.#fishDeaths;
	}

	breedFishSet(bSpec: number) {
		this.#breedFish = bSpec;
	}

	/* UPDATE AQUARIUM EVERY 2 SECONDS */
	update() {
		/* FISH UPDATE */
		for (let i = 0; i < this.#fishNum; i++) {
			// Swim variations
			const swimVar = Math.random();
			if (swimVar < 0.3) this.#fish[i].speedUp();
			if (swimVar < 0.2) this.#fish[i].changeDirection();

			// Grow
			this.#fish[i].grow();

			// Breed
			this.#fish[i].breed();

			// Pollute water
			this.#fish[i].pollute();

			// Diseases & Heal
			this.#fish[i].diseaseCheck();

			// Hunger & Eat
			this.#fish[i].hungerCheck();

			// Attack
			this.#fish[i].fight(i);

			// Getting older
			this.#fish[i].getOld();

			// Death Check
			if (this.#fish[i].getCondition() <= 0) {
				this.#killFish = i;
			}
		}

		/* FILTERS UPDATE */
		if (this.#pollution > 0) {
			if (this.changeMoney(filtration.getFilterData(this.#usedFilter, FI_ENERGY))) {
				this.changePollution(filtration.getFilterData(this.#usedFilter, FI_POLLUTION));
			}
		}

		/* MEDICINE UPDATE */
		this.updateMedicine();

		/* FOOD UPDATE */
		this.updateFood();

		/* HORMONES UPDATE */
		this.updateGrowHormone();
		this.updateBreedHormone();

		/* DISTRACTION UPDATE */
		this.updateDistraction();

		/* GUI UPDATE */

		// pollution bar
		if (this.#pollutionChanged) {
			this.updatePollutionBar();
		}

		/*** BREED A NEW FISH ***/
		if (this.#breedFish > -1) {
			this.#fishBirths++;
			this.addFish(this.#breedFish, 0.2);
			this.#breedFish = -1;
			uio.changeAlertNum(2);
			config.saveGame();
		}

		/*** REMOVE DEAD FISH  ***/
		if (this.#killFish > -1) {
			this.#fishDeaths++;
			this.removeFish(this.#killFish);
			this.#killFish = -1;
			uio.changeAlertNum(3);
			config.saveGame();
		}

		// surface any pending game event (sick / hungry / breed / death / attack)
		uio.flushAlert();

		stats.refreshStatsPage();
	}

	/* UPDATE AQUARIUM IN RELAX MODE EVERY 2 SECONDS */
	updateRelaxMode() {
		/* FISH UPDATE */
		for (let i = 0; i < this.#fishNum; i++) {
			// Swim variations
			const swimVar = Math.random();
			if (swimVar < 0.3) this.#fish[i].speedUp();
			if (swimVar < 0.2) this.#fish[i].changeDirection();
		}
	}

	/*** COMPUTE THE COMFORT FACTOR ***/
	// Affects probability of breeding and attacking other fish

	getComfortAquarium() {
		return this.#comfortAquarium;
	}

	updateComfortAquarium() {
		this.#comfortAquarium =
			lighting.getLightData(this.#usedLight, LI_COMFORT) *
			scenery.getSceneryData(this.#usedScenery, SC_COMFORT);
		computeBreedingRate();
	}

	updateComfortSpecies() {
		computeFishNumComfort();
	}

	/*** AQUARIUM RENDERING ***/

	render() {
		this.#fitTank();
		this.#canvasTankCtx.clearRect(0, 0, 360, 240);
		this.#renderBackground();
		for (let i = 0; i < this.#fishNum; i++) {
			this.#renderFish(this.#fish[i]);
		}
		this.#renderForeground();
	}

	#renderForeground() {
		this.#canvasTankCtx.drawImage(this.#layerFront, 0, 0);
	}

	#renderBackground() {
		const wall = this.#wallImage;
		if (wall.complete && wall.naturalWidth > 0) {
			for (let x = 0; x < 360; x += 64) {
				for (let y = 0; y < 240; y += 64) {
					this.#canvasTankCtx.drawImage(wall, x, y);
				}
			}
		}
		this.#canvasTankCtx.drawImage(this.#layerBack, 0, 0);
	}

	#renderFish(fishObj: Fish) {
		this.#canvasTankCtx.save();
		this.#canvasTankCtx.translate(fishObj.getX(), fishObj.getY());
		this.#canvasTankCtx.rotate(fishAngle[fishObj.getVX()][fishObj.getVY()]);
		this.#canvasTankCtx.translate(fishObj.getBoxX1(), fishObj.getBoxY1());
		this.#canvasTankCtx.drawImage(
			fishObj.getImage(),
			0,
			0,
			fishObj.getSizeX(),
			fishObj.getSizeY()
		);
		this.#canvasTankCtx.restore();
	}

	// FOR STATISTICS — accessors by fish index

	returnSpecNum(fNum: number) {
		return this.#fish[fNum].getSpecNum();
	}

	returnSpecName(fNum: number) {
		return fishSpecies[this.#fish[fNum].getSpecNum()].name;
	}

	returnFishCondition(fNum: number) {
		return this.#fish[fNum].getCondition();
	}

	returnFishHunger(fNum: number) {
		return this.#fish[fNum].getHunger();
	}
	returnFishDisease(fNum: number) {
		return this.#fish[fNum].getDisease();
	}

	returnFishSize(fNum: number) {
		return this.#fish[fNum].getSize();
	}

	// sell fish
	sellFish(fNum: number) {
		this.changeMoney(fishSpecies[this.#fish[fNum].getSpecNum()].price / 2);
		this.removeFish(fNum);
		this.#updateBuyButtons();
		stats.refreshStatsPage();
	}
}

// The constructor only wires up its own canvases/images — it does not touch the
// other singletons — so importing this module has no cross-module side effects.
// The initial comfort factor is seeded from main.js `boot()`.
export const aquarium = new Aquarium();

// The 2014 code called a bare global updateBuyButtons() from several files.
export function updateBuyButtons() {
	aquarium.updateBuyButtonsAlias();
}
