import { addDays, addWeeks, addMonths, addYears, parseISO } from 'date-fns';

export type DurationUnit = 'days' | 'weeks' | 'months' | 'years';

// Calculate the end date for a habit given a start date and duration
export const calculateEndDate = (
  startDate: string,
  value: number,
  unit: DurationUnit,
): Date => {
  let date = parseISO(startDate);
  switch (unit) {
    case 'days':
      return addDays(date, value);
    case 'weeks':
      return addWeeks(date, value);
    case 'months':
      return addMonths(date, value);
    case 'years':
      return addYears(date, value);
  }
};

