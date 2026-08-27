/*
 **	SCENERY OBJECT
 **
 */

import {
	SC_NAME,
	SC_FGIMAGE,
	SC_BGIMAGE,
	SC_PRICE,
	SC_COMFORT,
	SC_BONUSFISH,
} from './constants.js';

/*** CONSTANTS ***/

/* Scenery image paths */

var PATH_SCENERY_READY = 'gfx/sceneries/readyMade/';
var PATH_SCENERY_PARTS = 'gfx/sceneries/parts/';

/* Custom scenery part variables */

var SP_NAME = 0;
var SP_IMAGE = 1;
var SP_SIZEX = 2;
var SP_SIZEY = 3;
var SP_PRICE = 4;
var SP_COMFORT = 5;

var sceneryConstructor = function () {
	/*** PRE-MADE SCENERIES ***/
	var scenery = new Array();
	var sceneryNum = scenery.length;

	var createScenery = function (name, fgfile, bgfile, price, comfort, bonusfish) {
		scenery[sceneryNum] = new Array();

		scenery[sceneryNum][SC_NAME] = name;
		scenery[sceneryNum][SC_PRICE] = price;
		scenery[sceneryNum][SC_COMFORT] = comfort;
		scenery[sceneryNum][SC_BONUSFISH] = bonusfish;
		scenery[sceneryNum][SC_FGIMAGE] = new Image();
		scenery[sceneryNum][SC_FGIMAGE].src = PATH_SCENERY_READY + fgfile;
		scenery[sceneryNum][SC_BGIMAGE] = new Image();
		scenery[sceneryNum][SC_BGIMAGE].src = PATH_SCENERY_READY + bgfile;

		sceneryNum = scenery.length;
	};

	//				name						fgfile			bgfile			price		comfort	bonusfish
	createScenery('Custom Scenery', 'null.png', '0bg.png', 0, 0.5, null);
	createScenery('Water Plants', '1fg.png', '1bg.png', 100, 0.55, null);
	createScenery('Dense Water Plants', '2fg.png', '2bg.png', 400, 0.6, null);
	createScenery('Coral Reef', '3fg.png', '3bg.png', 1600, 0.65, 1);
	createScenery('Swimming Pool', 'null.png', '4bg.png', 3200, 0.7, 2);
	createScenery('Underwater Cave', '5fg.png', '5bg.png', 6400, 0.75, 3);
	createScenery("Pirates' Treasure", '6fg.png', '6bg.png', 12800, 0.8, 4);
	createScenery('Web Browsers', '7fg.png', '7bg.png', 25600, 0.89, 5);
	createScenery('Seashell Palace', '8fg.png', '8bg.png', 51200, 0.99, 6);

	this.getSceneryData = function (num, data) {
		//dbg( "getSceneryData( " + num + ", " + data + " )" );
		num = parseInt(num) || 0;
		return scenery[num][data];
	};

	/*** CUSTOM SCENERY PARTS ***/
	var sceneryPart = new Array();
	var createSceneryPart = function (name, file, sizeX, sizeY, price, comfort) {
		var i = sceneryPart.length;
		sceneryPart[i] = new Array();
		sceneryPart[i][SP_NAME] = name;
		sceneryPart[i][SP_IMAGE] = new Image();
		sceneryPart[i][SP_IMAGE].src = PATH_SCENERY_PARTS + file;
		sceneryPart[i][SP_SIZEX] = sizeX;
		sceneryPart[i][SP_SIZEY] = sizeY;
		sceneryPart[i][SP_PRICE] = price;
		sceneryPart[i][SP_COMFORT] = comfort;
	};
	createSceneryPart('Java Moss', 'javaMoss.png', 70, 66, 5, 1.01);
	createSceneryPart('Java Fern', 'javaFern.png', 65, 85, 10, 1.02);
	createSceneryPart('Marimo', 'marimo.png', 71, 84, 320, 1.21);

	/*** ***/
};

export const scenery = new sceneryConstructor();
