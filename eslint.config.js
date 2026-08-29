import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Flat config.
 *
 * `src/**` and `test/**` (TypeScript) are linted by typescript-eslint with
 * type-aware rules. That needs the TS compiler API, which the native TS 7.0
 * build does not expose yet (lands in 7.1) — so the repo pins `typescript` to
 * the classic `6.0.x` line, which is feature-identical. Bump both back when
 * typescript-eslint supports the 7.1 API (typescript-eslint#10940).
 *
 * Also linted:
 *  - *.config.js   : Node tooling config.
 *  - public/*.js   : the one classic browser script (`stage.js`).
 */
export default tseslint.config(
	{
		ignores: ['dist/**', 'dev-dist/**', 'node_modules/**', 'android/**', 'ios/**'],
	},

	js.configs.recommended,

	// --- TypeScript sources -------------------------------------------------
	{
		files: ['src/**/*.ts', 'test/**/*.ts'],
		extends: [tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// The scenery/light/filter/shop rows are `T[]` indexed by column
			// constants (see tsconfig `noImplicitAny: false`); the shop button
			// helpers take loosely-typed callbacks. Keep these as warnings
			// rather than blocking the build.
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
		},
	},
	{
		files: ['test/**/*.ts'],
		languageOptions: { globals: { ...globals.node } },
	},

	// --- Node tooling config ----------------------------------------------
	{
		files: ['*.config.js', 'scripts/**/*.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.node },
		},
	},

	// --- classic browser script -----------------------------------------
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

	prettier
);
