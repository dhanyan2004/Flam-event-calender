import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Trash2, AlertCircle } from 'lucide-react';
import useCalendarStore from '../../store/useCalendarStore';

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

const initialFormState = (date) => ({
  title: '',
  description: '',
  startDate: format(date, 'yyyy-MM-dd'),
  startTime: '09:00',
  endTime: '10:00',
  color: '#3b82f6',
  recurrence: null,
});

const EventModal = ({ date, event, onClose }) => {
  const addEvent = useCalendarStore(state => state.addEvent);
  const updateEvent = useCalendarStore(state => state.updateEvent);
  const deleteEvent = useCalendarStore(state => state.deleteEvent);
  const hasEventConflict = useCalendarStore(state => state.hasEventConflict);
  
  const [formData, setFormData] = useState(
    event ? { ...event } : initialFormState(date)
  );
  
  const [recurrenceType, setRecurrenceType] = useState(
    event?.recurrence?.type || 'none'
  );
  
  const [selectedWeekdays, setSelectedWeekdays] = useState(
    event?.recurrence?.weekdays || []
  );
  
  const [recurrenceInterval, setRecurrenceInterval] = useState(
    event?.recurrence?.interval || 1
  );
  
  const [recurrenceEndType, setRecurrenceEndType] = useState(
    event?.recurrence?.endDate ? 'date' : 
    event?.recurrence?.occurrences ? 'occurrences' : 'never'
  );
  
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    event?.recurrence?.endDate || format(date, 'yyyy-MM-dd')
  );
  
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(
    event?.recurrence?.occurrences || 10
  );
  
  const [hasConflict, setHasConflict] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (!formData.startDate || !formData.startTime || !formData.endTime) return;
    
    const conflict = hasEventConflict(formData);
    setHasConflict(conflict);
  }, [formData, hasEventConflict]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleWeekdayToggle = (day) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    if (recurrenceType === 'weekly' && selectedWeekdays.length === 0) {
      newErrors.weekdays = 'Select at least one day of the week';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    let recurrence = null;
    if (recurrenceType !== 'none') {
      recurrence = {
        type: recurrenceType,
        interval: recurrenceInterval,
      };
      
      if (recurrenceType === 'weekly') {
        recurrence.weekdays = selectedWeekdays;
      }
      
      if (recurrenceEndType === 'date') {
        recurrence.endDate = recurrenceEndDate;
      } else if (recurrenceEndType === 'occurrences') {
        recurrence.occurrences = recurrenceOccurrences;
      }
    }
    
    const eventData = {
      ...formData,
      recurrence
    };
    
    if (event) {
      updateEvent({ ...eventData, id: event.id });
    } else {
      addEvent(eventData);
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    if (event && window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.id);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Event title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.endTime ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Add description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(option => (
                <div 
                  key={option.value}
                  className={`
                    w-8 h-8 rounded-full cursor-pointer transition-all
                    ${formData.color === option.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                  `}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                  title={option.label}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence
            </label>
            <select
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {recurrenceType !== 'none' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Every</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  className="w-16 p-2 border border-gray-300 rounded-md"
                />
                <span className="text-sm">
                  {recurrenceType === 'daily' ? 'day(s)' : 
                   recurrenceType === 'weekly' ? 'week(s)' : 
                   recurrenceType === 'monthly' ? 'month(s)' : 'unit(s)'}
                </span>
              </div>
              
              {recurrenceType === 'weekly' && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Repeat on</p>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`
                          w-8 h-8 rounded-full text-sm font-medium
                          ${selectedWeekdays.includes(index) 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                          transition-colors
                        `}
                        onClick={() => handleWeekdayToggle(index)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {errors.weekdays && (
                    <p className="text-red-500 text-xs mt-1">{errors.weekdays}</p>
                  )}
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ends</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={recurrenceEndType === 'never'}
                      onChange={() => setRecurrenceEndType('never')}
                      className="mr-2"
                    />
                    <span className="text-sm">Never</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={recurrenceEndType === 'date'}
                      onChange={() => setRecurrenceEndType('date')}
                      className="mr-2"
                    />
                    <span className="text-sm">On</span>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="ml-2 p-1 border border-gray-300 rounded-md text-sm"
                      disabled={recurrenceEndType !== 'date'}
                      min={formData.startDate}
                    />
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={recurrenceEndType === 'occurrences'}
                      onChange={() => setRecurrenceEndType('occurrences')}
                      className="mr-2"
                    />
                    <span className="text-sm">After</span>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={recurrenceOccurrences}
                      onChange={(e) => setRecurrenceOccurrences(parseInt(e.target.value) || 1)}
                      className="ml-2 w-16 p-1 border border-gray-300 rounded-md text-sm"
                      disabled={recurrenceEndType !== 'occurrences'}
                    />
                    <span className="ml-2 text-sm">occurrences</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {hasConflict && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 flex items-start">
              <AlertCircle className="text-amber-500 mr-2 shrink-0" size={18} />
              <p className="text-sm text-amber-700">
                This event conflicts with another event at the same time.
              </p>
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            )}
            <div className={`flex gap-2 ${event ? '' : 'ml-auto'}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
              >
                {event ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;