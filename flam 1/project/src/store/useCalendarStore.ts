import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  addDays, 
  isSameDay, 
  parseISO, 
  format, 
  isAfter, 
  addWeeks, 
  addMonths, 
  getDay 
} from 'date-fns';
import type { CalendarEvent, RecurrencePattern } from '../types';

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (updatedEvent: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  moveEvent: (id: string, newDate: Date) => void;
  hasEventConflict: (event: Partial<CalendarEvent> & { id?: string }) => boolean;
}

const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (event) => {
        const newEvent = {
          ...event,
          id: crypto.randomUUID(),
        };
        set((state) => ({ events: [...state.events, newEvent] }));
      },
      
      updateEvent: (updatedEvent) => {
        set((state) => ({
          events: state.events.map((event) => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        }));
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        }));
      },
      
      getEventsForDate: (date) => {
        const { events } = get();
        const eventsForDate: CalendarEvent[] = [];
        
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        events.forEach(event => {
          // Regular event check
          if (event.startDate === formattedDate) {
            eventsForDate.push(event);
            return;
          }
          
          // Recurring event check
          if (!event.recurrence) return;
          
          const recurrence = event.recurrence;
          const eventStartDate = parseISO(event.startDate);
          
          // Check if the event has an end date and if the current date is after that
          if (recurrence.endDate && isAfter(date, parseISO(recurrence.endDate))) {
            return;
          }
          
          // Calculate occurrences
          if (recurrence.type === 'daily') {
            let currentDate = eventStartDate;
            let occurrenceCount = 0;
            
            while (true) {
              if (isSameDay(currentDate, date)) {
                eventsForDate.push(event);
                break;
              }
              
              // Move to next occurrence
              const interval = recurrence.interval || 1;
              currentDate = addDays(currentDate, interval);
              occurrenceCount++;
              
              // Check if we've passed the target date or reached the max occurrences
              if (
                isAfter(currentDate, date) || 
                (recurrence.occurrences && occurrenceCount >= recurrence.occurrences)
              ) {
                break;
              }
            }
          } 
          else if (recurrence.type === 'weekly' && recurrence.weekdays) {
            const dayOfWeek = getDay(date);
            
            // Check if the event repeats on this day of the week
            if (recurrence.weekdays.includes(dayOfWeek)) {
              // Check if the date is after the start date
              if (isAfter(date, eventStartDate) || isSameDay(date, eventStartDate)) {
                // Calculate the number of weeks since the start date
                const weeksSinceStart = Math.floor(
                  (date.getTime() - eventStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
                );
                
                // Check if the week matches the interval
                const interval = recurrence.interval || 1;
                if (weeksSinceStart % interval === 0) {
                  eventsForDate.push(event);
                }
              }
            }
          } 
          else if (recurrence.type === 'monthly') {
            // Check if the day of the month matches
            if (eventStartDate.getDate() === date.getDate()) {
              // Calculate months difference
              const monthsDiff = 
                (date.getFullYear() - eventStartDate.getFullYear()) * 12 + 
                date.getMonth() - eventStartDate.getMonth();
              
              const interval = recurrence.interval || 1;
              if (monthsDiff % interval === 0 && monthsDiff >= 0) {
                eventsForDate.push(event);
              }
            }
          } 
          else if (recurrence.type === 'custom') {
            // Implement custom recurrence logic as needed
            // For example, every X days
            const interval = recurrence.interval || 1;
            const daysSinceStart = Math.floor(
              (date.getTime() - eventStartDate.getTime()) / (24 * 60 * 60 * 1000)
            );
            
            if (daysSinceStart % interval === 0 && daysSinceStart >= 0) {
              eventsForDate.push(event);
            }
          }
        });
        
        return eventsForDate;
      },
      
      moveEvent: (id, newDate) => {
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id === id) {
              return {
                ...event,
                startDate: format(newDate, 'yyyy-MM-dd')
              };
            }
            return event;
          })
        }));
      },
      
      hasEventConflict: (event) => {
        const { events, getEventsForDate } = get();
        const targetDate = event.startDate ? parseISO(event.startDate) : new Date();
        const existingEvents = getEventsForDate(targetDate);
        
        // Skip current event being edited
        const filteredEvents = event.id 
          ? existingEvents.filter(e => e.id !== event.id)
          : existingEvents;
        
        if (!event.startTime || !event.endTime) return false;
        
        // Check for time conflicts
        return filteredEvents.some(existingEvent => {
          // Convert event times to minutes for easier comparison
          const eventStart = timeToMinutes(event.startTime);
          const eventEnd = timeToMinutes(event.endTime);
          const existingStart = timeToMinutes(existingEvent.startTime);
          const existingEnd = timeToMinutes(existingEvent.endTime);
          
          // Check for overlap
          return (
            (eventStart >= existingStart && eventStart < existingEnd) ||
            (eventEnd > existingStart && eventEnd <= existingEnd) ||
            (eventStart <= existingStart && eventEnd >= existingEnd)
          );
        });
      }
    }),
    {
      name: 'calendar-storage',
      getStorage: () => localStorage,
    }
  )
);

// Helper function to convert HH:MM time to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export default useCalendarStore;