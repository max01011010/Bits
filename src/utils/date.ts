import { format } from 'date-fns';

export const getLocalDateString = (date: Date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};

