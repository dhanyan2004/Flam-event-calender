/**
 * @typedef {Object} CalendarEvent
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} startDate - ISO string
 * @property {string} startTime - HH:MM format
 * @property {string} endTime - HH:MM format
 * @property {string} color - CSS color code
 * @property {RecurrencePattern|null} recurrence
 */

/**
 * @typedef {'none'|'daily'|'weekly'|'monthly'|'custom'} RecurrenceType
 */

/**
 * @typedef {Object} RecurrencePattern
 * @property {RecurrenceType} type
 * @property {number} [interval] - Every X days/weeks/months
 * @property {number[]} [weekdays] - 0-6 for Sunday-Saturday
 * @property {string|null} [endDate] - ISO string
 * @property {number|null} [occurrences] - Number of times to repeat
 */

/**
 * @typedef {'month'} ViewType
 */

/**
 * @typedef {Object} DateInfo
 * @property {Date} date
 * @property {boolean} isCurrentMonth
 * @property {boolean} isToday
 * @property {CalendarEvent[]} events
 */

export {};