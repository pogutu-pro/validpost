import type dayjs from 'dayjs';

/**
 * Which hour row a week view should open on. The current week opens one hour
 * before "now" so the present and the next few hours are in view (as Google
 * Calendar does); any other week opens at the start of a typical working day.
 */
export const initialScrollHour = (
  weekStart: dayjs.Dayjs,
  now: dayjs.Dayjs
): number => {
  const inWeek =
    !now.isBefore(weekStart.startOf('day')) &&
    now.isBefore(weekStart.startOf('day').add(7, 'day'));
  return inWeek ? Math.max(0, now.hour() - 1) : 8;
};
