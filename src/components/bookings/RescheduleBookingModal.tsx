import { useState, useEffect } from 'react';
import { Calendar, Clock, RotateCcw } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Booking, updateBooking } from '../../firebase';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  salonId: string;
  onBookingUpdated: () => void;
}

export default function RescheduleBookingModal({
  isOpen,
  onClose,
  booking,
  salonId,
  onBookingUpdated
}: RescheduleBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots from 9 AM to 6 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Generate next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    return date;
  });

  useEffect(() => {
    if (booking && isOpen) {
      const bookingDate = booking.time.toDate();
      setSelectedDate(format(bookingDate, 'yyyy-MM-dd'));
      setSelectedTime(format(bookingDate, 'HH:mm'));
    }
  }, [booking, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError('');

    try {
      // Combine date and time
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDateTime = new Date(year, month - 1, day, hours, minutes);

      await updateBooking(salonId, booking.id, {
        time: Timestamp.fromDate(newDateTime)
      });

      onBookingUpdated();
      onClose();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to reschedule booking');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!booking) return null;

  const currentDate = booking.time.toDate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reschedule Booking"
      size="lg"
      closable={true}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* Current Booking Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            Current Booking
          </h3>
          <div className="text-sm text-blue-800">
            <p><strong>{booking.name}</strong> - {booking.service}</p>
            <p className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {format(currentDate, 'h:mm a')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Date
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableDates.map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isSelected = selectedDate === dateStr;
                const isToday = isSameDay(date, new Date());
                
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      p-2 text-xs rounded-md border transition-colors text-center
                      ${isSelected 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50'
                      }
                      ${isToday ? 'ring-2 ring-blue-200' : ''}
                    `}
                  >
                    <div className="font-medium">{format(date, 'MMM d')}</div>
                    <div className="text-xs opacity-75">{format(date, 'EEE')}</div>
                    {isToday && <div className="text-xs text-blue-600">Today</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Time
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {timeSlots.map(time => {
                const isSelected = selectedTime === time;
                
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`
                      p-2 text-sm rounded-md border transition-colors
                      ${isSelected 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50'
                      }
                    `}
                  >
                    {format(new Date(`2000-01-01T${time}:00`), 'h:mm a')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date/Time Input as fallback */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter custom date/time:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <Input
                label="Time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {/* New Booking Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">New Booking Time</h4>
              <div className="text-sm text-green-800">
                <p className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(`2000-01-01T${selectedTime}:00`), 'h:mm a')}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedDate || !selectedTime}
            >
              Reschedule Booking
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 