import { describe, it, expect, beforeEach } from 'vitest';
import { aquarium } from '../src/aquarium.js';
import { Fish, fishSpecies } from '../src/species.js';

describe('aquarium money', () => {
	beforeEach(() => {
		aquarium.resetMoney();
	});

	it('starts a new balance at 100', () => {
		expect(aquarium.getMoney()).toBe(100);
	});

	it('applies an affordable change and reports success', () => {
		expect(aquarium.changeMoney(-40)).toBe(true);
		expect(aquarium.getMoney()).toBe(60);
		expect(aquarium.changeMoney(25)).toBe(true);
		expect(aquarium.getMoney()).toBe(85);
	});

	it('rejects a change that would overdraw and leaves the balance untouched', () => {
		expect(aquarium.changeMoney(-101)).toBe(false);
		expect(aquarium.getMoney()).toBe(100);
	});

	it('allows spending down to exactly zero', () => {
		expect(aquarium.changeMoney(-100)).toBe(true);
		expect(aquarium.getMoney()).toBe(0);
		expect(aquarium.changeMoney(-1)).toBe(false);
	});

	it('addMoney is a plain top-up', () => {
		aquarium.addMoney(500);
		expect(aquarium.getMoney()).toBe(600);
	});
});

describe('aquarium fish bookkeeping', () => {
	beforeEach(() => {
		// drain any fish left by a previous test
		while (aquarium.getFishNum() > 0) aquarium.removeFish(0);
	});

	it('getFishNum tracks add / remove', () => {
		expect(aquarium.getFishNum()).toBe(0);
		aquarium.addFish(2, 0.5);
		aquarium.addFish(2, 0.5);
		aquarium.addFish(7, 0.5);
		expect(aquarium.getFishNum()).toBe(3);
		aquarium.removeFish(0);
		expect(aquarium.getFishNum()).toBe(2);
	});

	it('per-species counts sum to the total', () => {
		aquarium.addFish(2, 0.5);
		aquarium.addFish(2, 0.5);
		aquarium.addFish(19, 0.5);
		let sum = 0;
		for (let s = 0; s < fishSpecies.length; s++) sum += aquarium.getFishNumBySpecies(s);
		expect(sum).toBe(aquarium.getFishNum());
		expect(aquarium.getFishNumBySpecies(2)).toBe(2);
	});

	it('removeFish is a no-op for an out-of-range index', () => {
		aquarium.addFish(5, 0.5);
		aquarium.removeFish(99);
		expect(aquarium.getFishNum()).toBe(1);
	});
});

describe('Fish serialization round-trip', () => {
	it('serialize -> changeData restores size / disease / hunger / condition', () => {
		const fish = new Fish(13, 0.4);
		const [specNum, size, disease, hunger, condition] = fish.serialize().split('|').map(Number);

		expect(specNum).toBe(13);

		const restored = new Fish(specNum, 0.9999);
		restored.changeData(size, disease, hunger, condition);

		expect(restored.getSpecNum()).toBe(13);
		expect(restored.getSize()).toBeCloseTo(size);
		expect(restored.getDisease()).toBeCloseTo(disease);
		expect(restored.getHunger()).toBeCloseTo(hunger);
		expect(restored.getCondition()).toBeCloseTo(condition);
	});

	it('condition is clamped to the species maxCondition', () => {
		const fish = new Fish(0, 1);
		fish.changeCondition(9999);
		expect(fish.getCondition()).toBe(fishSpecies[0].maxCondition);
		fish.changeCondition(-9999);
		expect(fish.getCondition()).toBe(0);
	});
});
