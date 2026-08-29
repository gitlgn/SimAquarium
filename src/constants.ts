/**
 * Shared numeric constants, previously scattered as implicit globals across the
 * game files. Values are unchanged from the 2014 source.
 */

// Buy / sell sign used with changeMoney().
export const BUY = -1;
export const SELL = 1;

// The tank is a 360×240 logical space (the 2014 canvas size). The on-screen
// canvas backs it at this multiple and `ctx.scale()`s so all the drawing code
// keeps working in 360×240 while rendering at higher resolution — the vector
// fish (src/fishArt.ts) then draw crisp instead of being CSS-upscaled ~4×.
export const TANK_SCALE = 4;

// Fish facing (vX values). Not yet referenced by name — species.js still uses
// the literals 10 / -10.
export const DIRECTION_LEFT = -10;
export const DIRECTION_RIGHT = 10;

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
