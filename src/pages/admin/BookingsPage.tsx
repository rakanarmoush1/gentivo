import { useState } from 'react';
import { Search, Filter, MoreVertical, User, Clock, Calendar, Tag } from 'lucide-react';
import Button from '../../components/common/Button';

// Mock data for bookings
const mockBookings = [
  {
    id: 'booking1',
    customer: 'Sarah Johnson',
    service: 'Gel Manicure',
    date: 'Today',
    time: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: 'booking2',
    customer: 'Emma Thompson',
    service: 'Classic Pedicure',
    date: 'Today',
    time: '11:30 AM',
    status: 'confirmed'
  },
  {
    id: 'booking3',
    customer: 'Michael Davis',
    service: 'Full Set Acrylic',
    date: 'Today',
    time: '2:00 PM',
    status: 'pending'
  },
  {
    id: 'booking4',
    customer: 'Jessica Williams',
    service: 'Nail Art',
    date: 'Tomorrow',
    time: '9:30 AM',
    status: 'confirmed'
  },
  {
    id: 'booking5',
    customer: 'David Miller',
    service: 'Classic Manicure',
    date: 'Tomorrow',
    time: '1:00 PM',
    status: 'confirmed'
  }
];

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? booking.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600">Manage and view all your salon bookings</p>
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
                <option value="canceled">Canceled</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              This Week
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bookings table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-full p-2 mr-3">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {booking.customer}
                      </span>
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
                        <span className="text-sm text-gray-900">{booking.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{booking.time}</span>
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
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}