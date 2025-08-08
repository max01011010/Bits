import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEndDate } from './calculate-end-date.ts';

test('calculateEndDate adds days correctly', () => {
  const result = calculateEndDate('2023-01-01', 5, 'days');
  assert.equal(result.toISOString().split('T')[0], '2023-01-06');
});

test('calculateEndDate adds weeks correctly', () => {
  const result = calculateEndDate('2023-01-01', 2, 'weeks');
  assert.equal(result.toISOString().split('T')[0], '2023-01-15');
});

test('calculateEndDate adds months correctly', () => {
  const result = calculateEndDate('2023-01-01', 1, 'months');
  assert.equal(result.toISOString().split('T')[0], '2023-02-01');
});

test('calculateEndDate adds years correctly', () => {
  const result = calculateEndDate('2023-01-01', 1, 'years');
  assert.equal(result.toISOString().split('T')[0], '2024-01-01');
});
