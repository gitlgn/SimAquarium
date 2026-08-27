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
import {
	BUY,
	SELL,
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
	BG_IMAGE,
} from './constants.js';

function aquariumConstructor() {
	// Set in one method, consumed in update(); genuinely shared across the instance.
	let breedFish = -1;
	let killFish = -1;

	this.resetAquarium = function () {
		this.resetMoney();

		usedScenery = 0;
		sceneries.length = 0;
		sceneries[0] = true;
		document.getElementById('buttonSceneryBuy0').setAttribute('class', 'button choose off');
		for (let i = 1; i < 9; i++) {
			document
				.getElementById('buttonScenerySell' + i)
				.setAttribute('class', 'button sell off');
		}

		usedLight = 0;
		lights.length = 0;
		lights[0] = true;
		document.getElementById('buttonLightBuy0').setAttribute('class', 'button choose off');
		for (let i = 1; i < 9; i++) {
			document.getElementById('buttonLightSell' + i).setAttribute('class', 'button sell off');
		}

		usedFilter = 0;
		filters.length = 0;
		filters[0] = true;
		document.getElementById('buttonFilterBuy0').setAttribute('class', 'button choose off');
		for (let i = 1; i < 6; i++) {
			document
				.getElementById('buttonFilterSell' + i)
				.setAttribute('class', 'button sell off');
		}

		usedBackground = 0;
		document.getElementById('buttonBackgroundBuy0').setAttribute('class', 'button buy off');
		document.getElementById('view0').style.background =
			'url(' + background.getBackgroundData(0, BG_IMAGE) + ')';

		fish.length = 0;
		for (let i = 0; i < 29; i++) {
			fishNumBySpecies[i] = 0;
		}

		fishNum = 0;

		pollution = 0;
		pollutionChanged = false;
		this.updatePollutionBar();

		medicine = 0;
		food = 0;

		growHormone = 0;
		breedHormone = 0;
		distraction = 0;

		killFish = -1;
		breedFish = -1;

		fishBirths = 0;
		fishDeaths = 0;

		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		updateBuyButtons();
	};

	this.saveAquarium = function () {
		config.setItem('money', money);

		config.setItem('usedScenery', usedScenery);
		config.setItem('usedLight', usedLight);
		for (let i = 0; i < 9; i++) {
			config.setItem('sceneries' + i, sceneries[i] === true ? '1' : '0');
			config.setItem('lights' + i, lights[i] === true ? '1' : '0');
		}
		config.setItem('usedFilter', usedFilter);
		for (let i = 0; i < 6; i++) {
			config.setItem('filters' + i, filters[i] === true ? '1' : '0');
		}
		config.setItem('usedBackground', usedBackground);

		// save the fish
		config.setItem('fishNum', fishNum);
		for (let i = 0; i < 29; i++) {
			config.setItem('fishNumBySpecies' + i, fishNumBySpecies[i]);
		}
		for (let i = 0; i < fishNum; i++) {
			config.setItem('fish' + i, fish[i].serialize());
		}

		config.setItem('pollution', pollution);
		pollutionChanged = false;
		this.updatePollutionBar();

		config.setItem('medicine', medicine);
		config.setItem('food', food);

		config.setItem('growHormone', growHormone);
		config.setItem('breedHormone', breedHormone);
		config.setItem('distraction', distraction);

		config.setItem('killFish', killFish);
		config.setItem('breedFish', breedFish);

		config.setItem('fishBirths', fishBirths);
		config.setItem('fishDeaths', fishDeaths);
	};

	this.loadAquarium = function () {
		money = parseFloat(config.getItem('money'));
		document.getElementById('statusMoney').innerHTML = parseInt(money);

		usedScenery = parseInt(config.getItem('usedScenery'), 10);
		usedLight = parseInt(config.getItem('usedLight'), 10);
		for (let i = 0; i < 9; i++) {
			const scStored = config.getItem('sceneries' + i);
			if (scStored === '1') {
				sceneries[i] = true;
				if (i !== usedScenery) {
					document
						.getElementById('buttonSceneryBuy' + i)
						.setAttribute('class', 'button choose on');
				} else {
					document
						.getElementById('buttonSceneryBuy' + i)
						.setAttribute('class', 'button choose off');
				}
				if (i > 0) {
					document
						.getElementById('buttonScenerySell' + i)
						.setAttribute('class', 'button sell on');
				}
			} else {
				sceneries[i] = false;
			}

			const liStored = config.getItem('lights' + i);
			if (liStored === '1') {
				lights[i] = true;
				if (i !== usedLight) {
					document
						.getElementById('buttonLightBuy' + i)
						.setAttribute('class', 'button choose on');
				} else {
					document
						.getElementById('buttonLightBuy' + i)
						.setAttribute('class', 'button choose off');
				}
				if (i > 0) {
					document
						.getElementById('buttonLightSell' + i)
						.setAttribute('class', 'button sell on');
				}
			} else {
				lights[i] = false;
			}
		}
		usedFilter = parseInt(config.getItem('usedFilter'), 10);
		for (let i = 0; i < 6; i++) {
			const fiStored = config.getItem('filters' + i);
			if (fiStored === '1') {
				filters[i] = true;
				if (i !== usedFilter) {
					document
						.getElementById('buttonFilterBuy' + i)
						.setAttribute('class', 'button choose on');
				} else {
					document
						.getElementById('buttonFilterBuy' + i)
						.setAttribute('class', 'button choose off');
				}
				if (i > 0) {
					document
						.getElementById('buttonFilterSell' + i)
						.setAttribute('class', 'button sell on');
				}
			} else {
				filters[i] = false;
			}
		}
		usedBackground = parseInt(config.getItem('usedBackground'), 10) || 0;
		document
			.getElementById('buttonBackgroundBuy' + usedBackground)
			.setAttribute('class', 'button buy off');
		document.getElementById('view0').style.background =
			'url(' + background.getBackgroundData(usedBackground, BG_IMAGE) + ')';

		// load fish data

		const storedFishNum = parseInt(config.getItem('fishNum'), 10);
		for (let i = 0; i < 29; i++) {
			fishNumBySpecies[i] = parseInt(config.getItem('fishNumBySpecies' + i), 10);
		}
		fishNum = 0;
		for (let i = 0; i < storedFishNum; i++) {
			const unSerialize = config.getItem('fish' + i).split('|');
			const spec = parseInt(unSerialize[0], 10);

			fish[i] = new Fish(spec, 0.9999);
			fishNum++;

			fish[i].changeData(
				parseFloat(unSerialize[1]),
				parseFloat(unSerialize[2]),
				parseFloat(unSerialize[3]),
				parseFloat(unSerialize[4])
			);
		}
		aquarium.updateComfortSpecies();

		pollution = parseFloat(config.getItem('pollution'));
		pollutionChanged = false;
		this.updatePollutionBar();

		medicine = parseFloat(config.getItem('medicine'));
		food = parseFloat(config.getItem('food'));

		growHormone = parseFloat(config.getItem('growHormone'));
		breedHormone = parseFloat(config.getItem('breedHormone'));
		distraction = parseFloat(config.getItem('distraction'));

		killFish = parseInt(config.getItem('killFish'), 10);
		breedFish = parseInt(config.getItem('breedFish'), 10);

		fishBirths = parseInt(config.getItem('fishBirths'), 10);
		fishDeaths = parseInt(config.getItem('fishDeaths'), 10);

		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		updateBuyButtons();
	};

	/*** AQUARIUM CANVAS & CONTEXT ***/
	let canvasTank;
	let canvasTankCtx;

	/*** AQUARIUM MONEY ***/
	let money = 0;

	this.getMoney = function () {
		return money;
	};
	this.resetMoney = function () {
		money = 100;
		document.getElementById('statusMoney').innerHTML = parseInt(money);
	};

	const changeMoney = (diff) => {
		if (money + diff < 0) return false;
		money = money + diff;
		document.getElementById('statusMoney').innerHTML = parseInt(money);
		return true;
	};
	this.changeMoney = changeMoney; // used by fishShop.buyFish

	/*** AQUARIUM SCENERIES ***/

	let usedScenery = 0; // which scenery is used in the aquarium
	const sceneries = []; // which sceneries the user owns
	this.getSceneries = function (sNum) {
		return sceneries[sNum];
	};

	sceneries[0] = true; // the first scenery is always available

	this.buyScenery = function (scNum) {
		if (sceneries[scNum]) {
			this.chooseScenery(scNum);
		} else {
			if (changeMoney(BUY * scenery.getSceneryData(scNum, SC_PRICE))) {
				document
					.getElementById('buttonSceneryBuy' + scNum)
					.setAttribute('class', 'button choose on');
				if (scNum)
					document
						.getElementById('buttonScenerySell' + scNum)
						.setAttribute('class', 'button sell on');
				sceneries[scNum] = true;
				this.chooseScenery(scNum);
				updateBuyButtons();
			}
		}
	};
	this.chooseScenery = function (scNum) {
		usedScenery = parseInt(usedScenery, 10) || 0;
		if (sceneries[usedScenery])
			document
				.getElementById('buttonSceneryBuy' + usedScenery)
				.setAttribute('class', 'button choose on');
		else
			document
				.getElementById('buttonSceneryBuy' + usedScenery)
				.setAttribute('class', 'button buy on');

		document
			.getElementById('buttonSceneryBuy' + scNum)
			.setAttribute('class', 'button choose off');
		usedScenery = scNum;
		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		config.saveGame();
	};

	this.sellScenery = function (scNum) {
		if (!sceneries[scNum]) return;

		changeMoney(SELL * scenery.getSceneryData(scNum, SC_PRICE) * 0.5);
		document.getElementById('buttonSceneryBuy' + scNum).setAttribute('class', 'button buy on');
		document
			.getElementById('buttonScenerySell' + scNum)
			.setAttribute('class', 'button sell off');
		sceneries[scNum] = false;

		// Return to custom scenery if you sell current scenery
		if (scNum === usedScenery) this.chooseScenery(0);
		updateBuyButtons();
	};

	/*** AQUARIUM LIGHTING ***/

	let usedLight = 0;
	const lights = [];
	lights[0] = true;

	this.buyLight = function (liNum) {
		if (lights[liNum]) {
			this.chooseLight(liNum);
		} else {
			if (changeMoney(BUY * lighting.getLightData(liNum, LI_PRICE))) {
				document
					.getElementById('buttonLightBuy' + liNum)
					.setAttribute('class', 'button choose on');
				if (liNum)
					document
						.getElementById('buttonLightSell' + liNum)
						.setAttribute('class', 'button sell on');
				lights[liNum] = true;
				this.chooseLight(liNum);
				updateBuyButtons();
			}
		}
	};

	this.chooseLight = function (liNum) {
		if (lights[usedLight])
			document
				.getElementById('buttonLightBuy' + usedLight)
				.setAttribute('class', 'button choose on');
		else
			document
				.getElementById('buttonLightBuy' + usedLight)
				.setAttribute('class', 'button buy on');

		document
			.getElementById('buttonLightBuy' + liNum)
			.setAttribute('class', 'button choose off');
		usedLight = liNum;
		this.updateComfortAquarium();
		this.layerFrontRefresh();
		this.layerBackRefresh();
		config.saveGame();
	};

	this.sellLight = function (liNum) {
		if (!lights[liNum]) return;

		changeMoney(SELL * lighting.getLightData(liNum, LI_PRICE) * 0.5);
		document.getElementById('buttonLightBuy' + liNum).setAttribute('class', 'button buy on');
		document.getElementById('buttonLightSell' + liNum).setAttribute('class', 'button sell off');
		lights[liNum] = false;

		// Return to custom scenery if you sell current scenery
		if (liNum === usedLight) this.chooseLight(0);
		updateBuyButtons();
	};

	/*** AQUARIUM FILTERS ***/

	let usedFilter = 0;
	const filters = [];
	filters[0] = true;

	this.buyFilter = function (fiNum) {
		if (filters[fiNum]) {
			this.chooseFilter(fiNum);
		} else {
			if (changeMoney(BUY * filtration.getFilterData(fiNum, FI_PRICE))) {
				document
					.getElementById('buttonFilterBuy' + fiNum)
					.setAttribute('class', 'button choose on');
				if (fiNum)
					document
						.getElementById('buttonFilterSell' + fiNum)
						.setAttribute('class', 'button sell on');
				filters[fiNum] = true;
				this.chooseFilter(fiNum);
				updateBuyButtons();
			}
		}
	};

	this.chooseFilter = function (fiNum) {
		if (filters[usedFilter])
			document
				.getElementById('buttonFilterBuy' + usedFilter)
				.setAttribute('class', 'button choose on');
		else
			document
				.getElementById('buttonFilterBuy' + usedFilter)
				.setAttribute('class', 'button buy on');

		document
			.getElementById('buttonFilterBuy' + fiNum)
			.setAttribute('class', 'button choose off');
		usedFilter = fiNum;
		this.layerFrontRefresh();
		this.layerBackRefresh();
		config.saveGame();
	};

	this.sellFilter = function (fiNum) {
		if (!filters[fiNum]) return;

		changeMoney(SELL * filtration.getFilterData(fiNum, FI_PRICE) * 0.5);
		document.getElementById('buttonFilterBuy' + fiNum).setAttribute('class', 'button buy on');
		document
			.getElementById('buttonFilterSell' + fiNum)
			.setAttribute('class', 'button sell off');
		filters[fiNum] = false;

		// Return to custom scenery if you sell current scenery
		if (fiNum === usedFilter) this.chooseFilter(0);
		updateBuyButtons();
	};

	/*** BUY AQUARIUM BACKGROUNDS ***/

	let usedBackground = 0;

	this.buyBackground = function (bgNum) {
		if (usedBackground === bgNum) return;

		if (changeMoney(BUY * background.getBackgroundData(bgNum, BG_PRICE))) {
			document
				.getElementById('buttonBackgroundBuy' + usedBackground)
				.setAttribute('class', 'button buy on');
			document
				.getElementById('buttonBackgroundBuy' + bgNum)
				.setAttribute('class', 'button buy off');
			document.getElementById('view0').style.background =
				'url(' + background.getBackgroundData(bgNum, BG_IMAGE) + ')';
			usedBackground = bgNum;
			updateBuyButtons();
			config.saveGame();
		}
	};

	/*** UPDATE AQUARIUM SHOPS - DISABLE OPTIONS YOU CAN'T AFFORD ***/

	const updateBuyButtons = () => {
		fishShop.updateView();

		for (let i = 0; i < 9; i++) {
			// update sceneries view
			if (!sceneries[i]) {
				if (aquarium.getMoney() < scenery.getSceneryData(i, SC_PRICE)) {
					document
						.getElementById('buttonSceneryBuy' + i)
						.setAttribute('class', 'button buy off');
				} else {
					document
						.getElementById('buttonSceneryBuy' + i)
						.setAttribute('class', 'button buy on');
				}
			}

			// update lights view
			if (!lights[i]) {
				if (aquarium.getMoney() < lighting.getLightData(i, LI_PRICE)) {
					document
						.getElementById('buttonLightBuy' + i)
						.setAttribute('class', 'button buy off');
				} else {
					document
						.getElementById('buttonLightBuy' + i)
						.setAttribute('class', 'button buy on');
				}
			}
		}

		for (let i = 0; i < 6; i++) {
			// update filters view
			if (!filters[i]) {
				if (aquarium.getMoney() < filtration.getFilterData(i, FI_PRICE)) {
					document
						.getElementById('buttonFilterBuy' + i)
						.setAttribute('class', 'button buy off');
				} else {
					document
						.getElementById('buttonFilterBuy' + i)
						.setAttribute('class', 'button buy on');
				}
			}
		}

		for (let i = 0; i < 15; i++) {
			// update backgrounds view
			if (i !== usedBackground) {
				if (aquarium.getMoney() < background.getBackgroundData(i, BG_PRICE)) {
					document
						.getElementById('buttonBackgroundBuy' + i)
						.setAttribute('class', 'button buy off');
				} else {
					document
						.getElementById('buttonBackgroundBuy' + i)
						.setAttribute('class', 'button buy on');
				}
			}
		}
	};

	this.updateBuyButtonsAlias = function () {
		updateBuyButtons();
	};

	/*** AQUARIUM IMAGES ***/

	const imageGlassFront = new Image();
	const imageWater = new Image();
	const imageGlassBack = new Image();
	imageGlassFront.src = 'gfx/aquarium/tank/glassFront.png';
	imageWater.src = 'gfx/aquarium/tank/water.png';
	imageGlassBack.src = 'gfx/aquarium/tank/glassBack.png';

	/*** AQUARIUM LAYERS ***/

	const layerFront = document.createElement('canvas');
	layerFront.setAttribute('width', 360);
	layerFront.setAttribute('height', 240);
	const layerFrontCtx = layerFront.getContext('2d');

	const layerBack = document.createElement('canvas');
	layerBack.setAttribute('width', 360);
	layerBack.setAttribute('height', 240);
	const layerBackCtx = layerBack.getContext('2d');

	this.layerFrontRefresh = function () {
		layerFrontCtx.clearRect(0, 0, 360, 240);
		layerFrontCtx.drawImage(scenery.getSceneryData(usedScenery, SC_FGIMAGE), 0, 0);
		layerFrontCtx.drawImage(imageWater, 0, 16);
		layerFrontCtx.drawImage(lighting.getLightData(usedLight, LI_IMAGE), 0, 0);
		layerFrontCtx.drawImage(imageGlassFront, 0, 0);
	};
	this.layerBackRefresh = function () {
		layerBackCtx.clearRect(0, 0, 360, 240);
		layerBackCtx.drawImage(imageGlassBack, 0, 0);
		layerBackCtx.drawImage(filtration.getFilterData(usedFilter, FI_IMAGE), 10, 0);
		layerBackCtx.drawImage(scenery.getSceneryData(usedScenery, SC_BGIMAGE), 0, 0);
	};

	/*** CREATE THE AQUARIUM ***/

	this.create = function () {
		canvasTank = document.getElementById('tank');
		canvasTankCtx = canvasTank.getContext('2d');
		this.layerBackRefresh();
		this.layerFrontRefresh();
	};

	// Photo making
	this.exportPhoto = function () {
		const tempCanvas = document.createElement('canvas');
		tempCanvas.setAttribute('width', 360);
		tempCanvas.setAttribute('height', 240);
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx.globalCompositeOperation = 'source-over';

		// DRAW BACKGROUND
		tempCtx.fillStyle = 'white';
		tempCtx.fillRect(0, 0, 360, 240);
		const wall = new Image();
		wall.src = background.getBackgroundSrc(usedBackground);
		for (let x = 0; x < 6; x++) {
			for (let y = 0; y < 4; y++) {
				tempCtx.drawImage(wall, x * 64, y * 64);
			}
		}

		// DRAW TANK
		tempCtx.drawImage(layerBack, 0, 0);
		for (let i = 0; i < fishNum; i++) {
			const fishObj = fish[i];
			tempCtx.save();
			tempCtx.translate(fishObj.getX(), fishObj.getY());
			tempCtx.rotate(fishAngle[fishObj.getVX()][fishObj.getVY()]);
			tempCtx.translate(fishObj.getBoxX1(), fishObj.getBoxY1());
			tempCtx.drawImage(fishObj.getImage(), 0, 0, fishObj.getSizeX(), fishObj.getSizeY());
			tempCtx.restore();
		}
		tempCtx.drawImage(layerFront, 0, 0);
		// The 2014 version handed the data URL to the packaged-app wrapper to open;
		// there is no wrapper any more. A download/share flow is a later feature.
	};

	/********
	*********
	F   I  S  H
	*********
	*********/

	/*** ADD/REMOVE THE FISH IN THE AQUARIUM ***/

	const fish = []; // the list of all fish

	let fishNum = 0; // number of fish in the aquarium
	this.getFishNum = function () {
		return fishNum;
	};

	const fishNumBySpecies = []; // count of every species in the aquarium
	for (let i = 0; i < 29; i++) {
		fishNumBySpecies[i] = 0;
	}

	this.getFishNumBySpecies = function (fSpec) {
		return fishNumBySpecies[fSpec];
	};

	// Add a fish by species
	this.addFish = function (sNum, size) {
		fish[fishNum] = new Fish(sNum, size);
		fishNum++;

		fishNumBySpecies[sNum]++;

		aquarium.updateComfortSpecies();
	};

	// Remove specific fish
	this.removeFish = function (fNum) {
		if (fNum >= fishNum) return;

		fishNumBySpecies[fish[fNum].getSpecNum()]--;

		for (let i = fNum + 1; i < fishNum; i++) {
			fish[i - 1] = fish[i];
		}

		fishNum--;

		fish.length = fishNum;

		aquarium.updateComfortSpecies();
	};

	// Fish is attacked and hurt
	this.hurtFish = function (fNum, hurtNum) {
		fish[fNum].changeCondition(hurtNum);
	};

	/*** AQUARIUM POLLUTION ***/

	let pollution = 0;
	let pollutionChanged = false;

	this.getPollution = function () {
		return pollution;
	};

	this.changePollution = function (change) {
		pollution = pollution + change;
		if (pollution < 0) pollution = 0;
		else if (pollution > 32) pollution = 32;
		pollutionChanged = true;
	};

	this.resetPollution = function () {
		pollution = 0;
		pollutionChanged = true;
	};

	this.updatePollutionBar = function () {
		document.getElementById('statusWaterBar').style.height = parseInt(pollution) + 'px';
		pollutionChanged = false;
	};

	/*** AQUARIUM CLEANING ***/

	this.clean = function () {
		if (pollution < 1) return;
		if (changeMoney(-10)) {
			this.changePollution(Math.random() * -4 - 2);
			this.updatePollutionBar();
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	this.waterChange = function () {
		if (pollution < 1) return;
		if (changeMoney(-40)) {
			this.resetFood();
			this.resetMedicine();
			this.resetPollution();
			this.resetGrowHormone();
			this.resetBreedHormone();
			this.updatePollutionBar();
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	/*** AQUARIUM MEDICINE, FOOD AND HORMONES ***/

	/*** MEDICINE ***/

	let medicine = 0;
	this.getMedicine = function () {
		return medicine;
	};
	this.changeMedicine = function (medNum) {
		medicine = medicine + medNum;
		if (medicine < 0) medicine = 0;
		if (medicine > 100) medicine = 100;
	};
	this.resetMedicine = function () {
		medicine = 0;
	};
	this.updateMedicine = function () {
		const medicineMelt = Math.random();

		if (medicine > 0) {
			this.changeMedicine(medicineMelt * -0.8);
			this.changePollution(medicineMelt * 0.02);
		}
	};

	this.addMedicine = function () {
		if (changeMoney(-20)) {
			this.changeMedicine(Math.random() * 4 + 4);
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	/*** FOOD ***/

	let food = 0;
	this.getFood = function () {
		return food;
	};

	this.changeFood = function (foodNum) {
		food = food + foodNum;
		if (food < 0) food = 0;
		if (food > 100) food = 100;
	};

	this.resetFood = function () {
		food = 0;
	};

	this.updateFood = function () {
		const foodMelt = Math.random();

		if (food > 0) {
			this.changeFood(foodMelt * -0.04);
			this.changePollution(foodMelt * 0.01);
		}
	};

	this.addFood = function () {
		if (changeMoney(-20)) {
			this.changeFood(Math.random() * 8 + 8);
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	/*** HORMONES ***/

	// GROW HORMONE
	let growHormone = 0;

	this.getGrowHormone = function () {
		return growHormone;
	};

	this.resetGrowHormone = function () {
		growHormone = 0;
	};

	this.changeGrowHormone = function (ghNum) {
		growHormone = growHormone + ghNum;
		if (growHormone < 0) growHormone = 0;
		if (growHormone > 100) growHormone = 100;
	};
	this.updateGrowHormone = function () {
		const growHormoneMelt = Math.random();
		if (growHormone > 0) {
			this.changeGrowHormone(growHormoneMelt * -0.1);
			this.changePollution(growHormoneMelt * 0.5);
		}
	};

	this.addGrowHormone = function () {
		if (changeMoney(-100)) {
			this.changePollution(2);
			this.changeGrowHormone(Math.random() * 4 + 4);
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	// BREED HORMONE
	let breedHormone = 0;

	this.getBreedHormone = function () {
		return breedHormone;
	};

	this.resetBreedHormone = function () {
		breedHormone = 0;
	};

	this.changeBreedHormone = function (bhNum) {
		breedHormone = breedHormone + bhNum;
		if (breedHormone < 0) breedHormone = 0;
		if (breedHormone > 100) breedHormone = 100;
	};

	this.updateBreedHormone = function () {
		const breedHormoneMelt = Math.random();
		if (breedHormone > 0) {
			this.changeBreedHormone(breedHormoneMelt * -0.2);
			this.changePollution(breedHormoneMelt);
		}
	};

	this.addBreedHormone = function () {
		if (changeMoney(-200)) {
			this.changePollution(4);
			this.changeBreedHormone(Math.random() * 4 + 4);
			updateBuyButtons();
			stats.refreshStatsPage();
		}
	};

	/*** AQUARIUM DISTRACTION - CONFUSES FISH SO THEY DON'T ATTACK ***/
	let distraction = 0;

	this.getDistraction = function () {
		return distraction;
	};

	this.distractFish = function () {
		distraction = distraction + 10;
		if (distraction > 100) distraction = 100;
		stats.refreshStatsPage();
	};

	this.updateDistraction = function () {
		if (distraction === 0) return;
		distraction--;
	};

	/*** SCARE / ATTRACT THE FISH ***/
	this.scareFish = function () {
		if (changeMoney(-5)) {
			for (let i = 0; i < fishNum; i++) {
				const dirX = fish[i].getX() > 180 ? 10 : -10;
				const dirY = fish[i].getY() > 120 ? 5 : -5;
				fish[i].rotate(dirX, dirY);
				fish[i].speedUp();
			}
			updateBuyButtons();
			this.distractFish();
		}
	};

	this.attractFish = function () {
		if (changeMoney(-5)) {
			for (let i = 0; i < fishNum; i++) {
				const dirX = fish[i].getX() > 180 ? -10 : 10;
				const dirY = fish[i].getY() > 120 ? -5 : 5;
				fish[i].rotate(dirX, dirY);
				fish[i].speedUp();
			}
			updateBuyButtons();
			this.distractFish();
		}
	};

	/*** *** REFRESH THE AQUARIUM *** ***/

	/* MOVE FISH EVERY 32/1000 -- 1024/1000 SECONDS */
	this.moveFish = function () {
		for (let i = 0; i < fishNum; i++) fish[i].move();
		if (uio.getView() === VIEW_AQUARIUM) this.render();
	};

	let fishBirths = 0;
	let fishDeaths = 0;
	this.getFishBirths = function () {
		return fishBirths;
	};
	this.getFishDeaths = function () {
		return fishDeaths;
	};

	this.breedFishSet = function (bSpec) {
		breedFish = bSpec;
	};

	/* UPDATE AQUARIUM EVERY 2 SECONDS */
	this.update = function () {
		/* FISH UPDATE */
		for (let i = 0; i < fishNum; i++) {
			// Swim variations
			const swimVar = Math.random();
			if (swimVar < 0.3) fish[i].speedUp();
			if (swimVar < 0.2) fish[i].changeDirection();

			// Grow
			fish[i].grow();

			// Breed
			fish[i].breed();

			// Pollute water
			fish[i].pollute();

			// Diseases & Heal
			fish[i].diseaseCheck();

			// Hunger & Eat
			fish[i].hungerCheck();

			// Attack
			fish[i].fight(i);

			// Getting older
			fish[i].getOld();

			// Death Check
			if (fish[i].getCondition() <= 0) {
				killFish = i;
			}
		}

		/* FILTERS UPDATE */
		if (pollution > 0) {
			if (changeMoney(filtration.getFilterData(usedFilter, FI_ENERGY))) {
				aquarium.changePollution(filtration.getFilterData(usedFilter, FI_POLLUTION));
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
		if (pollutionChanged) {
			this.updatePollutionBar();
		}

		/*** BREED A NEW FISH ***/
		if (breedFish > -1) {
			fishBirths++;
			this.addFish(breedFish, 0.2);
			breedFish = -1;
			uio.changeAlertNum(2);
			config.saveGame();
		}

		/*** REMOVE DEAD FISH  ***/
		if (killFish > -1) {
			fishDeaths++;
			this.removeFish(killFish);
			killFish = -1;
			uio.changeAlertNum(3);
			config.saveGame();
		}

		// animate icon
		if (uio.getAlertNum() > -1) {
			uio.blikStatusWidgetIcon();
			uio.changeAlertNum(-1);
		}

		stats.refreshStatsPage();
	};

	/* UPDATE AQUARIUM IN RELAX MODE EVERY 2 SECONDS */
	this.updateRelaxMode = function () {
		/* FISH UPDATE */
		for (let i = 0; i < fishNum; i++) {
			// Swim variations
			const swimVar = Math.random();
			if (swimVar < 0.3) fish[i].speedUp();
			if (swimVar < 0.2) fish[i].changeDirection();
		}
	};

	/*** COMPUTE THE COMFORT FACTOR ***/
	// Affects probability of breeding and attacking other fish

	let comfortAquarium; // global aquarium factor
	this.getComfortAquarium = function () {
		return comfortAquarium;
	};

	this.updateComfortAquarium = function () {
		comfortAquarium =
			lighting.getLightData(usedLight, LI_COMFORT) *
			scenery.getSceneryData(usedScenery, SC_COMFORT);
		computeBreedingRate();
	};

	this.updateComfortSpecies = function () {
		computeFishNumComfort();
	};

	/*** AQUARIUM RENDERING ***/

	this.render = function () {
		canvasTankCtx.clearRect(0, 0, 360, 240);
		renderBackground();
		for (let i = 0; i < fishNum; i++) {
			renderFish(fish[i]);
		}
		renderForeground();
	};

	const renderForeground = () => {
		canvasTankCtx.drawImage(layerFront, 0, 0);
	};

	const renderBackground = () => {
		canvasTankCtx.drawImage(layerBack, 0, 0);
	};

	const renderFish = (fishObj) => {
		canvasTankCtx.save();
		canvasTankCtx.translate(fishObj.getX(), fishObj.getY());
		canvasTankCtx.rotate(fishAngle[fishObj.getVX()][fishObj.getVY()]);
		canvasTankCtx.translate(fishObj.getBoxX1(), fishObj.getBoxY1());
		canvasTankCtx.drawImage(fishObj.getImage(), 0, 0, fishObj.getSizeX(), fishObj.getSizeY());
		canvasTankCtx.restore();
	};

	// FOR STATISTICS — accessors by fish index

	this.returnSpecNum = function (fNum) {
		return fish[fNum].getSpecNum();
	};

	this.returnSpecName = function (fNum) {
		return fishSpecies[fish[fNum].getSpecNum()].name;
	};

	this.returnFishCondition = function (fNum) {
		return fish[fNum].getCondition();
	};

	this.returnFishHunger = function (fNum) {
		return fish[fNum].getHunger();
	};
	this.returnFishDisease = function (fNum) {
		return fish[fNum].getDisease();
	};

	this.returnFishSize = function (fNum) {
		return fish[fNum].getSize();
	};

	// sell fish
	this.sellFish = function (fNum) {
		changeMoney(fishSpecies[fish[fNum].getSpecNum()].price / 2);
		aquarium.removeFish(fNum);
		updateBuyButtons();
		stats.updateFishListTable();
	};

	this.addMoney = function (mNum) {
		changeMoney(mNum);
	};
}

export const aquarium = new aquariumConstructor();
aquarium.updateComfortAquarium();

// The 2014 code called a bare global updateBuyButtons() from several files.
export function updateBuyButtons() {
	aquarium.updateBuyButtonsAlias();
}
