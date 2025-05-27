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

const useCalendarStore = create(
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
        const eventsForDate = [];
        
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
          
          if (recurrence.endDate && isAfter(date, parseISO(recurrence.endDate))) {
            return;
          }
          
          if (recurrence.type === 'daily') {
            let currentDate = eventStartDate;
            let occurrenceCount = 0;
            
            while (true) {
              if (isSameDay(currentDate, date)) {
                eventsForDate.push(event);
                break;
              }
              
              const interval = recurrence.interval || 1;
              currentDate = addDays(currentDate, interval);
              occurrenceCount++;
              
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
            
            if (recurrence.weekdays.includes(dayOfWeek)) {
              if (isAfter(date, eventStartDate) || isSameDay(date, eventStartDate)) {
                const weeksSinceStart = Math.floor(
                  (date.getTime() - eventStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
                );
                
                const interval = recurrence.interval || 1;
                if (weeksSinceStart % interval === 0) {
                  eventsForDate.push(event);
                }
              }
            }
          } 
          else if (recurrence.type === 'monthly') {
            if (eventStartDate.getDate() === date.getDate()) {
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
        
        const filteredEvents = event.id 
          ? existingEvents.filter(e => e.id !== event.id)
          : existingEvents;
        
        if (!event.startTime || !event.endTime) return false;
        
        return filteredEvents.some(existingEvent => {
          const eventStart = timeToMinutes(event.startTime);
          const eventEnd = timeToMinutes(event.endTime);
          const existingStart = timeToMinutes(existingEvent.startTime);
          const existingEnd = timeToMinutes(existingEvent.endTime);
          
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

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export default useCalendarStore;