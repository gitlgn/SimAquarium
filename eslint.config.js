import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/**
 * Flat config. Two tiers:
 *  - src/**        : the game as ES modules (Phase 2b). Enforces import
 *                    correctness (no-undef) and no-implied-eval; syntax rules
 *                    (no-var, eqeqeq) wait for Phase 3.
 *  - public/*.js   : classic browser scripts — only `stage.js` remains.
 */
export default [
	{ ignores: ['dist/**', 'node_modules/**', 'dev-dist/**', 'android/**', 'ios/**'] },

	js.configs.recommended,
	prettier,

	// ES-module sources (Phase 2b). The module *structure* is modern; syntax
	// modernization (var -> const/let, == -> ===, TypeScript) is Phase 3, so
	// those rules stay off here for now to keep that diff separate.
	{
		files: ['src/**/*.{js,mjs}'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.browser },
		},
		rules: {
			'no-undef': 'error',
			'no-implied-eval': 'error',
			// benign `var` re-declarations in the 2014 code; Phase 3 (const/let) removes them
			'no-redeclare': 'warn',
			'no-unused-vars': 'warn',
			'no-var': 'off',
			'prefer-const': 'off',
			eqeqeq: 'off',
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

	// Classic browser scripts served from /public (currently just stage.js).
	{
		files: ['public/**/*.js'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'script',
			globals: { ...globals.browser },
		},
		rules: {
			'no-unused-vars': 'warn',
			'no-implied-eval': 'warn',
		},
	},
];
