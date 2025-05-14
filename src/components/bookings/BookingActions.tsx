import { useState } from 'react';
import { ChevronDown, Check, X, MessageSquare, Clock } from 'lucide-react';
import { Booking, updateBookingStatus } from '../../firebase';

interface BookingActionsProps {
  booking: Booking;
  salonId: string;
  onStatusUpdated: () => void;
}

export default function BookingActions({ booking, salonId, onStatusUpdated }: BookingActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  async function handleUpdateStatus(status: 'confirmed' | 'cancelled') {
    try {
      setLoading(true);
      await updateBookingStatus(salonId, booking.id, status);
      setOpen(false);
      onStatusUpdated();
    } catch (error) {
      console.error(`Error updating booking to ${status}:`, error);
      alert(`Failed to update booking status to ${status}`);
    } finally {
      setLoading(false);
    }
  }
  
  // Don't show dropdown for already confirmed or cancelled bookings
  if (booking.status !== 'pending') {
    return (
      <div className="flex items-center">
        {booking.status === 'confirmed' ? (
          <span className="inline-flex items-center text-sm text-green-600">
            <Check size={16} className="mr-1" />
            Confirmed
          </span>
        ) : (
          <span className="inline-flex items-center text-sm text-red-600">
            <X size={16} className="mr-1" />
            Cancelled
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center justify-between w-24 px-3 py-1 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span>Actions</span>
        <ChevronDown size={16} />
      </button>
      
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
          <div className="py-1">
            <button
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={loading}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              <Check size={16} className="mr-2 text-green-500" />
              Confirm Booking
            </button>
            <button
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={loading}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              <X size={16} className="mr-2 text-red-500" />
              Cancel Booking
            </button>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                // This would integrate with a SMS service
                alert('Send reminder feature will be implemented in the future');
              }}
              disabled={loading}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare size={16} className="mr-2 text-blue-500" />
              Send Manual Reminder
            </button>
            <button
              onClick={() => {
                setOpen(false);
                // This would integrate with rescheduling functionality
                alert('Reschedule feature will be implemented in the future');
              }}
              disabled={loading}
              className="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              <Clock size={16} className="mr-2 text-yellow-500" />
              Reschedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 