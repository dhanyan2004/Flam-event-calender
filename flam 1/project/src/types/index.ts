export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  color: string; // CSS color code
  recurrence: RecurrencePattern | null;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrencePattern {
  type: RecurrenceType;
  interval?: number; // Every X days/weeks/months
  weekdays?: number[]; // 0-6 for Sunday-Saturday
  endDate?: string | null; // ISO string
  occurrences?: number | null; // Number of times to repeat
}

export type ViewType = 'month';

export interface DateInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}