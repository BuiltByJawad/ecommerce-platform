import { format } from 'date-fns';

export const formatDate = (value?: string | Date | null, fallback = ''): string => {
  if (!value) return fallback;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return fallback;
  return format(d, 'PP'); // e.g. Jan 1, 2025
};

export const formatDateTime = (value?: string | Date | null, fallback = ''): string => {
  if (!value) return fallback;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return fallback;
  return format(d, 'PP p'); // e.g. Jan 1, 2025, 10:30 AM
};

export const currentYear = (): string => {
  return format(new Date(), 'yyyy');
};
