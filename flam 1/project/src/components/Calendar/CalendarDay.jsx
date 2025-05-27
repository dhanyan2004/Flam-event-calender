import React from 'react';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import EventItem from './EventItem';

const CalendarDay = ({ 
  dayInfo, 
  onEventClick, 
  onAddEvent 
}) => {
  const { date, isCurrentMonth, isToday, events } = dayInfo;
  
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `day-${format(date, 'yyyy-MM-dd')}`,
    data: { date }
  });
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Limit the number of events shown
  const MAX_VISIBLE_EVENTS = 3;
  const visibleEvents = sortedEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = sortedEvents.length - MAX_VISIBLE_EVENTS;
  
  return (
    <div
      ref={setDroppableRef}
      className={`border border-gray-200 p-1 min-h-[100px] flex flex-col ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span 
          className={`text-sm font-medium ${
            isToday 
              ? 'bg-blue-500 text-white h-6 w-6 rounded-full flex items-center justify-center' 
              : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {format(date, 'd')}
        </span>
        <button 
          onClick={onAddEvent}
          className="text-gray-400 hover:text-blue-500 transition-colors"
          aria-label="Add event"
        >
          <PlusCircle size={16} />
        </button>
      </div>
      
      <div className="flex-grow overflow-hidden">
        {visibleEvents.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
        
        {hiddenEventsCount > 0 && (
          <div 
            className="text-xs text-gray-500 mt-1 cursor-pointer hover:text-blue-500 transition-colors"
            onClick={onAddEvent}
          >
            +{hiddenEventsCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;