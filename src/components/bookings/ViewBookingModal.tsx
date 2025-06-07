import { useState } from 'react';
import { User, Calendar, Clock, Tag, Phone, MapPin, CheckCircle, XCircle, AlertCircle, Edit, RotateCcw, Trash, Copy, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Booking, Service, Employee, updateBookingStatus, deleteBooking } from '../../firebase';
import { format, isPast, isSameDay } from 'date-fns';

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  salonId: string;
  services: Service[];
  employees: Employee[];
  onBookingUpdated: () => void;
  onEditBooking: (booking: Booking) => void;
  onRescheduleBooking: (booking: Booking) => void;
  onQuickAction?: (bookingId: string, action: 'confirm' | 'cancel' | 'complete') => Promise<void>;
  onDeleteBooking?: (bookingId: string) => Promise<void>;
  onCopyPhone?: (phone: string) => void;
}

export default function ViewBookingModal({
  isOpen,
  onClose,
  booking,
  salonId,
  services,
  employees,
  onBookingUpdated,
  onEditBooking,
  onRescheduleBooking,
  onQuickAction,
  onDeleteBooking,
  onCopyPhone
}: ViewBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!booking) return null;

  const service = services.find(s => s.name === booking.service);
  const assignedStaff = booking.staffAssigned === 'any' 
    ? 'Any Available Staff' 
    : employees.find(e => e.id === booking.staffAssigned)?.name || 'Unassigned';

  const bookingDate = booking.time.toDate();
  const isBookingPast = isPast(bookingDate);
  const isBookingToday = isSameDay(bookingDate, new Date());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = () => {
    switch (booking.status) {
      case 'pending':
        return 'This booking is awaiting confirmation';
      case 'confirmed':
        return isBookingToday ? 'Appointment is today!' : isBookingPast ? 'This appointment has passed' : 'Booking is confirmed';
      case 'cancelled':
        return 'This booking has been cancelled';
      case 'completed':
        return 'This appointment has been completed';
      default:
        return '';
    }
  };

  const canConfirm = booking.status === 'pending';
  const canComplete = booking.status === 'confirmed' && (isBookingToday || isBookingPast);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canEdit = booking.status !== 'completed';
  const canReschedule = booking.status === 'pending' || booking.status === 'confirmed';

  const handleQuickAction = async (action: 'confirm' | 'cancel' | 'complete') => {
    if (onQuickAction) {
      setActionLoading(action);
      try {
        await onQuickAction(booking.id, action);
        onBookingUpdated();
      } catch (error) {
        console.error(`Error ${action}ing booking:`, error);
        setError(`Failed to ${action} booking. Please try again.`);
      } finally {
        setActionLoading(null);
      }
    } else {
      // Fallback to local implementation
      setActionLoading(action);
      setError('');

      try {
        const newStatus = action === 'complete' ? 'completed' : action === 'confirm' ? 'confirmed' : 'cancelled';
        await updateBookingStatus(salonId, booking.id, newStatus);
        onBookingUpdated();
      } catch (error) {
        console.error(`Error ${action}ing booking:`, error);
        setError(`Failed to ${action} booking. Please try again.`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDelete = async () => {
    if (onDeleteBooking) {
      setLoading(true);
      try {
        await onDeleteBooking(booking.id);
        onClose();
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Failed to delete booking. Please try again.');
        setShowDeleteConfirm(false);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback to local implementation
      setLoading(true);
      setError('');

      try {
        await deleteBooking(salonId, booking.id);
        onBookingUpdated();
        onClose();
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Failed to delete booking. Please try again.');
        setShowDeleteConfirm(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    onEditBooking(booking);
  };

  const handleReschedule = () => {
    onRescheduleBooking(booking);
  };

  const copyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(booking.phone);
      if (onCopyPhone) {
        onCopyPhone(booking.phone);
      }
    } catch (error) {
      console.error('Failed to copy phone number:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Basic phone number formatting - can be enhanced based on region
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      size="lg"
      closable={true}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Status Header */}
        <div className={`p-4 rounded-lg ${
          booking.status === 'confirmed' ? 'bg-green-50 border border-green-200' :
          booking.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
          booking.status === 'cancelled' ? 'bg-red-50 border border-red-200' :
          booking.status === 'completed' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(booking.status)}
              <div>
                <h3 className="font-medium text-gray-900">Booking #{booking.id.slice(-8)}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Created {format(booking.createdAt.toDate(), 'MMM d, yyyy')}</p>
              <p className="text-xs">at {format(booking.createdAt.toDate(), 'h:mm a')}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{getStatusMessage()}</p>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium">{booking.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <a 
                  href={`tel:${booking.phone}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {formatPhoneNumber(booking.phone)}
                </a>
              </div>
              <button
                onClick={copyPhoneNumber}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy phone number"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Service Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{booking.service}</span>
              {service && (
                <span className="text-lg font-semibold text-primary">{service.price} JOD</span>
              )}
            </div>
            {service && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Duration: {service.duration} minutes</span>
                <span>Service ID: {service.id.slice(-6)}</span>
              </div>
            )}
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span>Staff: <span className="font-medium">{assignedStaff}</span></span>
            </div>
            {service?.description && (
              <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                <p className="font-medium mb-1">Service Description:</p>
                <p>{service.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Appointment Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium">{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
              {isBookingToday && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="font-medium">{format(bookingDate, 'h:mm a')}</span>
            </div>
            {service && (
              <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                <div className="flex justify-between">
                  <span>Start time:</span>
                  <span className="font-medium">{format(bookingDate, 'h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span>End time:</span>
                  <span className="font-medium">{format(new Date(bookingDate.getTime() + service.duration * 60000), 'h:mm a')}</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span>Total duration:</span>
                  <span className="font-medium">{service.duration} minutes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-6">
          <div className="flex flex-wrap gap-3">
            {/* Status Change Actions */}
            {canConfirm && (
              <Button
                size="sm"
                onClick={() => handleQuickAction('confirm')}
                loading={actionLoading === 'confirm'}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirm Booking
              </Button>
            )}
            
            {canComplete && (
              <Button
                size="sm"
                onClick={() => handleQuickAction('complete')}
                loading={actionLoading === 'complete'}
                disabled={actionLoading !== null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction('cancel')}
                loading={actionLoading === 'cancel'}
                disabled={actionLoading !== null}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel Booking
              </Button>
            )}

            {/* Edit Actions */}
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                disabled={loading || actionLoading !== null}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Details
              </Button>
            )}

            {canReschedule && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReschedule}
                disabled={loading || actionLoading !== null}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
            )}

            {/* Delete Action */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || actionLoading !== null}
              className="text-red-600 border-red-600 hover:bg-red-50 ml-auto"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Confirm Deletion</h4>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to delete this booking for <strong>{booking.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  loading={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Booking
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || actionLoading !== null}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
} 