import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const EventItem = ({ event, onClick }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    isDragging 
  } = useDraggable({
    id: event.id,
    data: { event }
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: event.color || '#3b82f6',
    borderLeft: `3px solid ${event.color || '#3b82f6'}`,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-1 mb-1 rounded-sm cursor-grab 
        text-xs text-white truncate bg-opacity-90
        hover:bg-opacity-100 transition-opacity
        shadow-sm hover:shadow
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{event.title}</span>
        <span className="text-[10px] opacity-80">{event.startTime}</span>
      </div>
    </div>
  );
};

export default EventItem;