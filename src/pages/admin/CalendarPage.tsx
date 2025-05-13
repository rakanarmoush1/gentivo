import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../components/common/Button';

// Mock data for calendar events
const mockEvents = [
  {
    id: 'event1',
    title: 'Sarah Johnson - Gel Manicure',
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 15, 10, 45),
    status: 'confirmed'
  },
  {
    id: 'event2',
    title: 'Emma Thompson - Classic Pedicure',
    start: new Date(2025, 0, 15, 11, 30),
    end: new Date(2025, 0, 15, 12, 15),
    status: 'confirmed'
  },
  {
    id: 'event3',
    title: 'Michael Davis - Full Set Acrylic',
    start: new Date(2025, 0, 15, 14, 0),
    end: new Date(2025, 0, 15, 15, 30),
    status: 'pending'
  },
  {
    id: 'event4',
    title: 'Jessica Williams - Nail Art',
    start: new Date(2025, 0, 16, 9, 30),
    end: new Date(2025, 0, 16, 10, 0),
    status: 'confirmed'
  }
];

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week for first day of month
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Filter events for the currently displayed month
  const eventsInMonth = mockEvents.filter(event => {
    return event.start.getMonth() === currentMonth && event.start.getFullYear() === currentYear;
  });
  
  // Group events by day
  const eventsByDay: Record<number, typeof mockEvents> = {};
  eventsInMonth.forEach(event => {
    const day = event.start.getDate();
    if (!eventsByDay[day]) {
      eventsByDay[day] = [];
    }
    eventsByDay[day].push(event);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">View and manage your appointments</p>
      </div>
      
      {/* Calendar controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevMonth} 
              className="p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth} 
              className="p-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={view === 'month' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button 
              variant={view === 'week' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button 
              variant={view === 'day' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>
      
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar header */}
        <div className="grid grid-cols-7 border-b">
          {dayNames.map(day => (
            <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 grid-rows-6 h-[600px]">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`border-b border-r p-1 overflow-hidden relative ${
                day === null ? 'bg-gray-50' : ''
              } ${
                day === new Date().getDate() && 
                currentMonth === new Date().getMonth() && 
                currentYear === new Date().getFullYear() 
                  ? 'bg-primary/5' 
                  : ''
              }`}
            >
              {day !== null && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() && 
                      currentYear === new Date().getFullYear() 
                        ? 'text-primary' 
                        : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    {eventsByDay[day] && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {eventsByDay[day].length}
                      </span>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto h-[80px]">
                    {eventsByDay[day]?.map(event => (
                      <div 
                        key={event.id} 
                        className={`px-2 py-1 mb-1 text-xs rounded ${
                          event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <div className="font-medium truncate">
                          {event.start.getHours()}:
                          {event.start.getMinutes().toString().padStart(2, '0')}
                        </div>
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}