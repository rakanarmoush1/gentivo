import { useState, useEffect } from 'react';
import { Search, Filter, Plus, User, Clock, Calendar, Tag, Check, X, Trash, Edit, RotateCcw, Download, ChevronDown, Eye, DollarSign, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { ToastContainer } from '../../components/common/Toast';
import { getSalonBookings, Booking, updateBookingStatus, deleteBooking, getSalonServices, Service, getSalonEmployees, Employee, updateBooking } from '../../firebase';
import { format, parseISO, isValid, isSameDay, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, addDays, isSameMonth, startOfDay, addMinutes } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import AddBookingModal from '../../components/bookings/AddBookingModal';
import EditBookingModal from '../../components/bookings/EditBookingModal';
import RescheduleBookingModal from '../../components/bookings/RescheduleBookingModal';
import ViewBookingModal from '../../components/bookings/ViewBookingModal';

interface BookingsPageProps {
  salonId: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function BookingsPage({ salonId }: BookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  // Calendar specific state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [processingBulkAction, setProcessingBulkAction] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Modal handlers
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleRescheduleBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const closeAllModals = () => {
    setIsEditModalOpen(false);
    setIsRescheduleModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };

  // Load persisted filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem(`booking-filters-${salonId}`);
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setStatusFilter(filters.statusFilter || null);
        setServiceFilter(filters.serviceFilter || null);
        setStaffFilter(filters.staffFilter || null);
        setDateFilter(filters.dateFilter || '');
        setSearchQuery(filters.searchQuery || '');
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, [salonId]);

  // Save filters to localStorage
  useEffect(() => {
    const filters = {
      statusFilter,
      serviceFilter,
      staffFilter,
      dateFilter,
      searchQuery
    };
    localStorage.setItem(`booking-filters-${salonId}`, JSON.stringify(filters));
  }, [statusFilter, serviceFilter, staffFilter, dateFilter, searchQuery, salonId]);
  
  useEffect(() => {
    if (salonId) {
      loadData();
    }
  }, [salonId]);
  
  async function loadData() {
    try {
      setLoading(true);
      setError('');
      
      const [bookingsData, servicesData, employeesData] = await Promise.all([
        getSalonBookings(salonId),
        getSalonServices(salonId),
        getSalonEmployees(salonId)
      ]);
      
      setBookings(bookingsData);
      setServices(servicesData);
      setEmployees(employeesData);
      
      // Clear selected bookings when reloading
      setSelectedBookings([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  }
  
  // Calculate quick stats
  const todayBookings = bookings.filter(booking => isToday(booking.time.toDate()));
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const todayRevenue = todayBookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((total, booking) => {
      const service = services.find(s => s.name === booking.service);
      return total + (service?.price || 0);
    }, 0);

  const filteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter ? booking.status === statusFilter : true;
    
    // Service filter
    const matchesService = serviceFilter ? booking.service === serviceFilter : true;
    
    // Staff filter
    const matchesStaff = staffFilter ? booking.staffAssigned === staffFilter : true;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      const bookingDate = booking.time.toDate();
      const filterDate = parseISO(dateFilter);
      if (isValid(filterDate)) {
        matchesDate = isSameDay(bookingDate, filterDate);
      }
    }
    
    return matchesSearch && matchesStatus && matchesService && matchesStaff && matchesDate;
  });

  // Calendar helper functions
  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  };

  const getBookingsForDay = (day: Date) => {
    return filteredBookings.filter(booking => 
      isSameDay(booking.time.toDate(), day)
    ).sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const getStaffColor = (staffId?: string) => {
    if (!staffId || staffId === 'any') return 'bg-stone-500';
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
    const index = employees.findIndex(emp => emp.id === staffId);
    return colors[index % colors.length] || 'bg-stone-500';
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date, targetHour?: number) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!draggedBooking) return;

    try {
      const newDate = new Date(targetDate);
      if (targetHour !== undefined) {
        newDate.setHours(targetHour, 0, 0, 0);
      } else {
        // Keep original time, just change date
        const originalTime = draggedBooking.time.toDate();
        newDate.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0);
      }

      // Update booking in Firebase - convert Date to Timestamp
      await updateBooking(salonId, draggedBooking.id, {
        time: Timestamp.fromDate(newDate)
      });

      // Reload data to reflect changes
      await loadData();
      showNotification('Booking rescheduled successfully', 'success');
      
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      showNotification('Failed to reschedule booking', 'error');
    }
    
    setDraggedBooking(null);
  };

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(booking => booking.id));
    }
    setSelectAll(!selectAll);
  };

  const performBulkAction = async (action: 'confirm' | 'cancel' | 'delete' | 'export') => {
    if (selectedBookings.length === 0) return;
    
    if (action === 'export') {
      exportToCSV();
      return;
    }
    
    try {
      setProcessingBulkAction(true);
      
      const promises = selectedBookings.map(bookingId => {
        if (action === 'confirm') {
          return updateBookingStatus(salonId, bookingId, 'confirmed');
        } else if (action === 'cancel') {
          return updateBookingStatus(salonId, bookingId, 'cancelled');
        } else {
          return deleteBooking(salonId, bookingId);
        }
      });
      
      await Promise.all(promises);
      await loadData();
      
      // Show success notification
      showNotification(`Successfully ${action === 'confirm' ? 'confirmed' : action === 'cancel' ? 'cancelled' : 'deleted'} ${selectedBookings.length} bookings`, 'success');
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showNotification(`Failed to ${action} selected bookings`, 'error');
    } finally {
      setProcessingBulkAction(false);
      setSelectedBookings([]);
      setSelectAll(false);
    }
  };

  const exportToCSV = () => {
    const selectedBookingData = bookings.filter(booking => selectedBookings.includes(booking.id));
    const csvHeaders = ['Name', 'Phone', 'Service', 'Date', 'Time', 'Status', 'Staff'];
    const csvData = selectedBookingData.map(booking => {
      const staff = booking.staffAssigned === 'any' ? 'Any Available' : employees.find(e => e.id === booking.staffAssigned)?.name || 'Unassigned';
      return [
        booking.name,
        booking.phone,
        booking.service,
        format(booking.time.toDate(), 'yyyy-MM-dd'),
        format(booking.time.toDate(), 'HH:mm'),
        booking.status,
        staff
      ];
    });
    
    const csvContent = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification(`Exported ${selectedBookings.length} bookings to CSV`, 'success');
  };

  const handleQuickAction = async (bookingId: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      const newStatus = action === 'complete' ? 'completed' : action === 'confirm' ? 'confirmed' : 'cancelled';
      await updateBookingStatus(salonId, bookingId, newStatus);
      await loadData();
      
      const messages = {
        confirm: 'Booking confirmed successfully',
        cancel: 'Booking cancelled successfully', 
        complete: 'Booking marked as completed'
      };
      showNotification(messages[action], 'success');
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      showNotification(`Failed to ${action} booking`, 'error');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(salonId, bookingId);
      await loadData();
      showNotification('Booking deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showNotification('Failed to delete booking', 'error');
    }
  };

  const handleCopyPhone = (phone: string) => {
    showNotification('Phone number copied to clipboard', 'info');
  };

  function formatDate(date: Date) {
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
  }
  
  function formatTime(date: Date) {
    return format(date, 'h:mm a');
  }

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setServiceFilter(null);
    setStaffFilter(null);
    setDateFilter('');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get employee name
  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Unassigned';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unassigned';
  };

  // Helper function to get service price
  const getServicePrice = (serviceName: string) => {
    const service = services.find(svc => svc.name === serviceName);
    return service ? service.price : 0;
  };

  return (
    <div className="font-light">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-stone-200/40 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-stone-100 rounded-lg">
              <Calendar className="h-6 w-6 text-stone-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-500">Today's Appointments</p>
              <p className="text-2xl font-light text-stone-900">{todayBookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200/40 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-500">Pending Confirmations</p>
              <p className="text-2xl font-light text-stone-900">{pendingBookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200/40 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-500">Today's Revenue</p>
              <p className="text-2xl font-light text-stone-900">{todayRevenue} JOD</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Bookings</h1>
        <p className="text-stone-600 font-light">Manage your salon appointments and bookings</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200/60 text-red-800 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}
      
      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 w-full font-light placeholder:text-stone-400"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter || 'all'}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 font-light"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 font-light"
          />
          <div className="flex rounded-lg border border-stone-300 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-white text-stone-600 hover:text-stone-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-white text-stone-600 hover:text-stone-900'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Button>
        </div>
      </div>
      
      {/* View Content */}
      {viewMode === 'table' ? (
        // Table View
        <div className="bg-white rounded-xl border border-stone-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-stone-50/50 border-b border-stone-200/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-stone-50/30 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{booking.name}</p>
                        <p className="text-sm text-stone-500 font-light">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-stone-900 font-medium">{booking.service}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-stone-900">{formatDate(booking.time.toDate())}</p>
                        <p className="text-sm text-stone-500 font-light">{formatTime(booking.time.toDate())}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-stone-900">
                        {booking.staffAssigned === 'any' ? 'Any Available' : getEmployeeName(booking.staffAssigned)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-stone-900">{getServicePrice(booking.service)} JOD</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(salonId, booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-700 transition-colors duration-150"
                            title="Confirm booking"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(salonId, booking.id, 'completed')}
                            className="text-blue-600 hover:text-blue-700 transition-colors duration-150"
                            title="Mark as completed"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-stone-600 hover:text-stone-700 transition-colors duration-150"
                          title="Edit booking"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-700 transition-colors duration-150"
                          title="Cancel booking"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-stone-400 mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">No bookings found</h3>
              <p className="text-stone-500 font-light">
                {searchQuery || statusFilter !== 'all' || dateFilter 
                  ? 'No bookings match your current filters.' 
                  : 'No bookings have been made yet.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <div className="bg-white rounded-xl border border-stone-200/40 overflow-hidden">
          {/* Calendar Header */}
          <div className="border-b border-stone-200/60 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-stone-900">
                Week of {format(getWeekDays()[0], 'MMM d')} - {format(getWeekDays()[6], 'MMM d, yyyy')}
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentWeek(new Date())}
                className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b border-stone-200/60">
                <div className="p-4 border-r border-stone-200/60"></div>
                {getWeekDays().map((day, index) => (
                  <div key={index} className="p-4 border-r border-stone-200/60 text-center">
                    <div className="text-xs text-stone-500 uppercase tracking-wider">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-medium mt-1 ${
                      isToday(day) ? 'text-stone-900' : 'text-stone-600'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-stone-200/60">
                  {/* Time label */}
                  <div className="p-4 border-r border-stone-200/60 text-right">
                    <span className="text-sm text-stone-500">
                      {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                    </span>
                  </div>
                  
                  {/* Day columns */}
                  {getWeekDays().map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="relative p-2 border-r border-stone-200/60 min-h-[80px] hover:bg-stone-50/50 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    >
                      {/* Bookings for this time slot */}
                      {getBookingsForDay(day)
                        .filter(booking => {
                          const bookingHour = booking.time.toDate().getHours();
                          return bookingHour === hour;
                        })
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className={`p-2 mb-1 rounded-lg text-xs cursor-pointer transition-all duration-200 ${
                              draggedBooking?.id === booking.id ? 'opacity-50' : ''
                            } ${getStatusColor(booking.status)}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking)}
                            onClick={() => handleViewBooking(booking)}
                            title={`${booking.name} - ${booking.service}`}
                          >
                            <div className="font-medium truncate">{booking.name}</div>
                            <div className="truncate">{booking.service}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className={`w-3 h-3 rounded-full ${getStaffColor(booking.staffAssigned)}`}></div>
                              <span className="truncate text-xs">
                                {booking.staffAssigned === 'any' ? 'Any' : getEmployeeName(booking.staffAssigned)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        salonId={salonId}
        onBookingAdded={loadData}
        closable={true}
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={closeAllModals}
        booking={selectedBooking}
        salonId={salonId}
        services={services}
        employees={employees}
        onBookingUpdated={loadData}
      />

      {/* Reschedule Booking Modal */}
      <RescheduleBookingModal
        isOpen={isRescheduleModalOpen}
        onClose={closeAllModals}
        booking={selectedBooking}
        salonId={salonId}
        onBookingUpdated={loadData}
      />

      {/* View Booking Modal */}
      <ViewBookingModal
        isOpen={isViewModalOpen}
        onClose={closeAllModals}
        booking={selectedBooking}
        salonId={salonId}
        services={services}
        employees={employees}
        onBookingUpdated={loadData}
        onEditBooking={(booking) => {
          closeAllModals();
          handleEditBooking(booking);
        }}
        onRescheduleBooking={(booking) => {
          closeAllModals();
          handleRescheduleBooking(booking);
        }}
        onQuickAction={handleQuickAction}
        onDeleteBooking={handleDeleteBooking}
        onCopyPhone={handleCopyPhone}
      />
    </div>
  );
}