import React from 'react';
import type { CalendarEvent } from '../../types';

interface DragOverlayProps {
  event: CalendarEvent;
}

const DragOverlay: React.FC<DragOverlayProps> = ({ event }) => {
  return (
    <div 
      style={{
        backgroundColor: event.color || '#3b82f6',
        borderLeft: `3px solid ${event.color || '#3b82f6'}`,
      }}
      className="p-2 rounded-sm text-xs text-white truncate bg-opacity-90 shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{event.title}</span>
        <span className="text-[10px] opacity-80">{event.startTime}</span>
      </div>
    </div>
  );
};

export default DragOverlay;