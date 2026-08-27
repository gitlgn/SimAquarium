import { describe, it, expect } from 'vitest';
import { fishSpecies } from '../src/species.js';

const NUMERIC_FIELDS = [
	'price',
	'sizeX',
	'sizeY',
	'growth',
	'breed',
	'pollution',
	'pollutionTol',
	'maxCondition',
	'foodNeed',
	'fishNumOptimal',
	'aggression',
	'strength',
	'longevity',
	'fishNumAttack',
];

describe('fishSpecies data', () => {
	it('has 29 species (index 0 is the debug "Test fish")', () => {
		expect(fishSpecies).toHaveLength(29);
		expect(fishSpecies[0].name).toBe('Test fish');
	});

	it('every species has a name, a URL link and finite numeric stats', () => {
		for (const [i, s] of fishSpecies.entries()) {
			expect(typeof s.name, `species ${i} name`).toBe('string');
			expect(s.name.length).toBeGreaterThan(0);
			expect(s.link, `species ${i} link`).toMatch(/^https?:\/\//);
			for (const f of NUMERIC_FIELDS) {
				expect(Number.isFinite(s[f]), `species ${i} .${f} = ${s[f]}`).toBe(true);
			}
		}
	});

	it('stats stay in their documented ranges', () => {
		for (const [i, s] of fishSpecies.entries()) {
			expect(s.price, `species ${i} price`).toBeGreaterThan(0);
			expect(s.longevity, `species ${i} longevity`).toBeGreaterThan(0);
			expect(s.longevity).toBeLessThanOrEqual(1);
			expect(s.growth).toBeGreaterThan(0);
			expect(s.growth).toBeLessThanOrEqual(1);
			expect(s.aggression).toBeGreaterThanOrEqual(0);
			expect(s.aggression).toBeLessThanOrEqual(1);
			expect(s.pollutionTol).toBeGreaterThanOrEqual(0);
			expect(s.pollutionTol).toBeLessThanOrEqual(32);
			expect(Number.isInteger(s.sizeX)).toBe(true);
			expect(Number.isInteger(s.sizeY)).toBe(true);
		}
	});

	it('price increases monotonically with species index (shop progression)', () => {
		for (let i = 1; i < fishSpecies.length; i++) {
			expect(fishSpecies[i].price, `species ${i} vs ${i - 1}`).toBeGreaterThan(
				fishSpecies[i - 1].price
			);
		}
	});

	it('the dolphin (28) is the most expensive and a rarity', () => {
		const prices = fishSpecies.map((s) => s.price);
		expect(Math.max(...prices)).toBe(fishSpecies[28].price);
		expect(fishSpecies[28].name).toBe('Bottlenose dolphin');
	});
});
