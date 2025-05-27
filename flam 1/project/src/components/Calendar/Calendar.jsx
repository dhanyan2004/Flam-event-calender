import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import CalendarDay from './CalendarDay';
import EventModal from './EventModal';
import useCalendarStore from '../../store/useCalendarStore';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getEventsForDate = useCalendarStore(state => state.getEventsForDate);
  
  const getDaysForMonth = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const today = new Date();
    
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(date => ({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      events: getEventsForDate(date)
    }));
    
    const startDay = monthStart.getDay();
    
    const prevMonthDays = [];
    if (startDay > 0) {
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(monthStart);
        date.setDate(1 - (i + 1));
        prevMonthDays.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          events: getEventsForDate(date)
        });
      }
    }
    
    const endDay = monthEnd.getDay();
    const nextMonthDays = [];
    if (endDay < 6) {
      for (let i = 1; i <= 6 - endDay; i++) {
        const date = new Date(monthEnd);
        date.setDate(monthEnd.getDate() + i);
        nextMonthDays.push({
          date,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
          events: getEventsForDate(date)
        });
      }
    }
    
    return [...prevMonthDays, ...days, ...nextMonthDays];
  };
  
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    } else {
      setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    }
  };
  
  const handleDayClick = (date, event) => {
    setSelectedDate(date);
    setSelectedEvent(event || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const daysInMonth = getDaysForMonth(currentMonth);
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-blue-600 text-white">
        <button 
          className="p-2 rounded-full hover:bg-blue-500 transition-colors"
          onClick={() => navigateMonth('prev')}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <button 
          className="p-2 rounded-full hover:bg-blue-500 transition-colors"
          onClick={() => navigateMonth('next')}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 bg-gray-100">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-grow grid grid-cols-7 auto-rows-fr">
        {daysInMonth.map((dayInfo, i) => (
          <CalendarDay 
            key={format(dayInfo.date, 'yyyy-MM-dd')}
            dayInfo={dayInfo}
            onEventClick={(event) => handleDayClick(dayInfo.date, event)}
            onAddEvent={() => handleDayClick(dayInfo.date)}
          />
        ))}
      </div>
      
      <button
        className="m-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        onClick={() => handleDayClick(new Date())}
      >
        <PlusCircle size={18} />
        <span>Add Event</span>
      </button>
      
      {isModalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Calendar;