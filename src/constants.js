/**
 * Shared numeric constants, previously scattered as implicit globals across the
 * game files. Values are unchanged from the 2014 source.
 */

// Buy / sell sign used with changeMoney().
export const BUY = -1;
export const SELL = 1;

// fishSpecies[] column indices.
export const SPEC_NAME = 0;
export const SPEC_RARITY = 1; // not used
export const SPEC_PRICE = 2;
export const SPEC_SIZEX = 3;
export const SPEC_SIZEY = 4;
export const SPEC_GROWTH = 5; // growth rate 0-1
export const SPEC_BREED = 6; // breed rate 0-1
export const SPEC_POLLUTION = 7; // pollution rate 0-1
export const SPEC_POLLUTIONTOL = 8; // pollution tolerance 0-32
export const SPEC_MAXCONDITION = 9;
export const SPEC_FOODNEED = 10;
export const SPEC_FISHNUMOPTIMAL = 11; // max breeding number
export const SPEC_AGGRESSION = 12; // attack chance
export const SPEC_STRENGTH = 13;
export const SPEC_LONGEVITY = 14;
export const SPEC_LINK = 15;
export const SPEC_FISHNUMATTACK = 16; // min number before attacking

// Fish facing.
export const DIRECTION_LEFT = -10;
export const DIRECTION_RIGHT = 10;

// Fish rarity tiers.
export const RARITY_POPULAR = 0;
export const RARITY_MEDIUM = 1;
export const RARITY_RARE = 2;
export const RARITY_UNIQUE = 3;

// Widget faces.
export const PAGE_FRONT = 0;
export const PAGE_BACK = 1;

// Front-page size modes.
export const PAGEMODE_MAXI = 0;
export const PAGEMODE_MINI = 1;

// View tabs.
export const VIEW_AQUARIUM = 0;
export const VIEW_FISH = 1;
export const VIEW_SCENERY = 2;
export const VIEW_LIGHTING = 3;
export const VIEW_ACCESSORIES = 4;
export const VIEW_STATISTICS = 5;

// Scenery data column indices.
export const SC_NAME = 0;
export const SC_FGIMAGE = 1;
export const SC_BGIMAGE = 2;
export const SC_PRICE = 3;
export const SC_COMFORT = 4;
export const SC_BONUSFISH = 5;

// Lighting data column indices.
export const LI_NAME = 0;
export const LI_PRICE = 1;
export const LI_COMFORT = 2;
export const LI_ENERGY = 3;
export const LI_IMAGE = 4;

// Filter data column indices.
export const FI_NAME = 0;
export const FI_PRICE = 1;
export const FI_COMFORT = 2;
export const FI_POLLUTION = 3;
export const FI_ENERGY = 4;
export const FI_IMAGE = 5;

// Background data column indices.
export const BG_NAME = 0;
export const BG_PRICE = 1;
export const BG_IMAGE = 2;

// Fish-shop slot column indices.
export const SHOPSLOT_SPEC = 0;
export const SHOPSLOT_NUM = 1;
export const SHOPSLOT_NAME = 2;
export const SHOPSLOT_PRICE = 3;
export const SHOPSLOT_LINK = 4;

// Milliseconds.
export const TIME_SECOND = 1000;
export const TIME_MINUTE = 60000;
export const TIME_HOUR = 3600000;
