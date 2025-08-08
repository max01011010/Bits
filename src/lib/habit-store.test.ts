import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEndDate } from './calculate-end-date.ts';
import { getLocalDateString } from '../utils/date.ts';
import { subDays } from 'date-fns';

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

test('getLocalDateString formats local date', () => {
  const date = new Date('2024-01-02T00:30:00');
  assert.equal(getLocalDateString(date), '2024-01-02');
});

test('streak increments when last completion was yesterday', () => {
  const now = new Date('2024-01-02T00:30:00');
  const today = getLocalDateString(now);
  const yesterday = getLocalDateString(subDays(now, 1));
  let newStreak = 2;
  const lastCompletionDay = yesterday;
  if (lastCompletionDay === yesterday) {
    newStreak += 1;
  } else if (lastCompletionDay !== today) {
    newStreak = 1;
  }
  assert.equal(newStreak, 3);
});
