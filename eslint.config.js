import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/**
 * Flat config. Two tiers:
 *  - src/**       : new/modernized code, strict rules (added during the ESM migration)
 *  - public/js/** : the original 2014 game code, relaxed rules so lint stays
 *                   actionable while it is incrementally rewritten.
 */
export default [
	{ ignores: ['dist/**', 'node_modules/**', 'dev-dist/**', 'android/**', 'ios/**'] },

	js.configs.recommended,
	prettier,

	// Modernized sources (ES modules).
	{
		files: ['src/**/*.{js,mjs}'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.browser },
		},
		rules: {
			'no-var': 'error',
			'prefer-const': 'error',
			eqeqeq: ['error', 'smart'],
			'no-implied-eval': 'error',
		},
	},

	// Tooling / config files that run in Node.
	{
		files: ['*.config.js', 'scripts/**/*.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.node },
		},
	},

	// Legacy game code — classic scripts sharing one global scope.
	{
		files: ['public/js/**/*.js', 'public/storageAPI.js', 'public/sandbox.js'],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: 'script',
			globals: {
				...globals.browser,
				// cross-file singletons and helpers defined across the game modules
				storageAPI: 'writable',
				aquarium: 'writable',
				config: 'writable',
				fishShop: 'writable',
				stats: 'writable',
				uio: 'writable',
				scenery: 'writable',
				lighting: 'writable',
				filtration: 'writable',
				background: 'writable',
				eventsCreate: 'writable',
				updateBuyButtons: 'writable',
				computeBreedingRate: 'writable',
				computeFishNumComfort: 'writable',
				openTab: 'writable',
				dbg: 'writable',
				debug: 'writable',
				result: 'writable',
				smallInterval: 'writable',
				bigInterval: 'writable',
				smallIntervals: 'writable',
				chosenSpeed: 'writable',
				fishSpecies: 'writable',
				fishSpeciesNum: 'writable',
				fishAngle: 'writable',
				fishFrameL: 'writable',
				fishFrameR: 'writable',
				speciesBreedingRate: 'writable',
				speciesFishNumComfort: 'writable',
				fishConstructor: 'writable',
			},
		},
		rules: {
			'no-unused-vars': 'warn',
			'no-undef': 'warn',
			'no-implied-eval': 'warn',
			'no-redeclare': 'warn',
			'no-empty': 'warn',
		},
	},
];
