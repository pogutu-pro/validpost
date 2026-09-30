import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { initialScrollHour } from './scroll';

// initialScrollHour only reads startOf/add/hour, so plain dayjs is enough.
describe('initialScrollHour', () => {
  const weekStart = dayjs('2026-09-28T00:00:00'); // a Monday

  it('opens the current week one hour before now', () => {
    expect(initialScrollHour(weekStart, dayjs('2026-09-30T15:32:00'))).toBe(14);
  });

  it('never goes below midnight', () => {
    expect(initialScrollHour(weekStart, dayjs('2026-09-30T00:20:00'))).toBe(0);
  });

  it('opens other weeks at the start of the working day', () => {
    expect(initialScrollHour(weekStart, dayjs('2026-10-15T15:00:00'))).toBe(8);
    expect(initialScrollHour(weekStart, dayjs('2026-09-01T15:00:00'))).toBe(8);
  });

  it('treats the last moment of the week as inside it', () => {
    expect(initialScrollHour(weekStart, dayjs('2026-10-04T23:30:00'))).toBe(22);
  });
});
