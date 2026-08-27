import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

/**
 * Flat config.
 *
 * `src/**` and `test/**` are TypeScript. ESLint's built-in parser can't read
 * `.ts`, and `typescript-eslint` does not yet support the TS 7 compiler API
 * (typescript-eslint#10940), so those are covered by `tsc --strict`
 * (+ `noUnusedLocals`) and Prettier instead — see `npm run check`.
 *
 * What ESLint still lints:
 *  - *.config.js   : Node tooling config.
 *  - public/*.js   : the one classic browser script (`stage.js`).
 */
export default [
	{
		ignores: [
			'dist/**',
			'dev-dist/**',
			'node_modules/**',
			'android/**',
			'ios/**',
			'src/**',
			'test/**',
		],
	},

	js.configs.recommended,
	prettier,

	{
		files: ['*.config.js', 'scripts/**/*.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.node },
		},
	},

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
