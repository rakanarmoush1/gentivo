import { useState, useEffect } from 'react';
import { Search, Filter, Plus, User, Clock, Calendar, Tag, Check, X, Trash } from 'lucide-react';
import Button from '../../components/common/Button';
import { getSalonBookings, Booking, updateBookingStatus, deleteBooking } from '../../firebase';
import { format } from 'date-fns';
import AddBookingModal from '../../components/bookings/AddBookingModal';
import BookingActions from '../../components/bookings/BookingActions';

interface BookingsPageProps {
  salonId: string;
}

export default function BookingsPage({ salonId }: BookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [processingBulkAction, setProcessingBulkAction] = useState(false);
  
  // Track if we're selecting all visible bookings
  const [selectAll, setSelectAll] = useState(false);
  
  useEffect(() => {
    if (salonId) {
      loadBookings();
    }
  }, [salonId]);
  
  async function loadBookings() {
    try {
      setLoading(true);
      setError('');
      
      const bookingsData = await getSalonBookings(salonId);
      setBookings(bookingsData);
      
      // Clear selected bookings when reloading
      setSelectedBookings([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? booking.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Toggle selection of a single booking
  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };
  
  // Toggle selection of all visible bookings
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Perform bulk action on selected bookings
  const performBulkAction = async (action: 'confirm' | 'cancel' | 'delete') => {
    if (selectedBookings.length === 0) return;
    
    try {
      setProcessingBulkAction(true);
      
      const promises = selectedBookings.map(bookingId => {
        if (action === 'confirm') {
          return updateBookingStatus(salonId, bookingId, 'confirmed');
        } else if (action === 'cancel') {
          return updateBookingStatus(salonId, bookingId, 'cancelled');
        } else {
          // Use the deleteBooking function for delete actions
          return deleteBooking(salonId, bookingId);
        }
      });
      
      await Promise.all(promises);
      
      // Reload bookings after bulk action
      await loadBookings();
      
      // Show success message
      alert(`Successfully ${action === 'confirm' ? 'confirmed' : action === 'cancel' ? 'cancelled' : 'deleted'} ${selectedBookings.length} bookings`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setError(`Failed to ${action} selected bookings`);
    } finally {
      setProcessingBulkAction(false);
      setSelectedBookings([]);
      setSelectAll(false);
    }
  };
  
  function formatBookingDate(timestamp: any) {
    try {
      const date = timestamp.toDate();
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return 'Invalid date';
    }
  }
  
  function formatBookingTime(timestamp: any) {
    try {
      const date = timestamp.toDate();
      return format(date, 'h:mm a');
    } catch (error) {
      return 'Invalid time';
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage and view all your salon bookings</p>
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
              placeholder="Search by customer or service"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-3 md:ml-4">
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none bg-white"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Bulk Actions Bar - show when items are selected */}
      {selectedBookings.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => performBulkAction('confirm')}
              disabled={processingBulkAction}
              className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Confirm All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performBulkAction('cancel')}
              disabled={processingBulkAction}
              className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => performBulkAction('delete')}
              disabled={processingBulkAction}
              className="flex items-center text-gray-600 border-gray-600 hover:bg-gray-100"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete All
            </Button>
          </div>
        </div>
      )}
      
      {/* Bookings table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className={`hover:bg-gray-50 ${selectedBookings.includes(booking.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => toggleBookingSelection(booking.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary/10 rounded-full p-2 mr-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {booking.name}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {booking.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-secondary/10 rounded-full p-2 mr-3">
                          <Tag className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="text-sm text-gray-900">
                          {booking.service}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start flex-col">
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{formatBookingDate(booking.time)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{formatBookingTime(booking.time)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <BookingActions 
                        booking={booking} 
                        salonId={salonId} 
                        onStatusUpdated={loadBookings} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredBookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No bookings found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add a booking
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        salonId={salonId}
        onBookingAdded={loadBookings}
      />
    </div>
  );
}