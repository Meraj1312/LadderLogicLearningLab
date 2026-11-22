import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTank } from './process.js';

test('Pump 1 increases the tank level', () => {
  assert.equal(advanceTank(30, { pump1: true, dtMs: 1000 }), 42);
});

test('Pump 2 increases the tank level at its own rate', () => {
  assert.equal(advanceTank(30, { pump2: true, dtMs: 1000 }), 38);
});

test('The drain decreases the tank level', () => {
  assert.equal(advanceTank(30, { drainOpen: true, dtMs: 1000 }), 27);
});

test('The tank level stays unchanged when nothing is active', () => {
  assert.equal(advanceTank(30, { dtMs: 1000 }), 30);
});

test('The tank cannot exceed 100 percent', () => {
  assert.equal(advanceTank(98, { pump1: true, dtMs: 1000 }), 100);
});

test('The tank cannot fall below zero', () => {
  assert.equal(advanceTank(2, { drainOpen: true, dtMs: 1000 }), 0);
});

test('Invalid levels and elapsed times are rejected', () => {
  assert.throws(() => advanceTank(101), RangeError);
  assert.throws(() => advanceTank(30, { dtMs: -1 }), RangeError);
});
