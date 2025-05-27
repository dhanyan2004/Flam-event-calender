import React, { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './components/Calendar/Calendar';
import DragOverlayComponent from './components/Calendar/DragOverlay';
import useCalendarStore from './store/useCalendarStore';
import { format } from 'date-fns';

function App() {
  const [activeEvent, setActiveEvent] = useState(null);
  const moveEvent = useCalendarStore(state => state.moveEvent);
  
  const handleDragStart = (event) => {
    setActiveEvent(event.active.data.current?.event || null);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.data.current?.event) {
      const eventId = active.id;
      const dropDate = over.data.current?.date;
      
      if (dropDate) {
        moveEvent(eventId, dropDate);
      }
    }
    
    setActiveEvent(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <CalendarIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Event Calendar</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Manage your schedule with our interactive calendar
        </p>
      </header>
      
      <main className="max-w-5xl mx-auto">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="bg-white rounded-xl shadow-lg min-h-[600px]">
            <Calendar />
          </div>
          
          <DragOverlay>
            {activeEvent ? <DragOverlayComponent event={activeEvent} /> : null}
          </DragOverlay>
        </DndContext>
        
        <footer className="mt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Event Calendar</p>
        </footer>
      </main>
    </div>
  );
}

export default App;