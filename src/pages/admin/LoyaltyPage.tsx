import { useState } from 'react';
import { Award, Users, Search, MoreVertical, Settings, Gift, Star } from 'lucide-react';
import Button from '../../components/common/Button';

// Mock data for customer loyalty
const mockCustomers = [
  {
    id: 'customer1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+962 79 123 4567',
    totalBookings: 12,
    totalSpent: 340,
    loyaltyPoints: 450,
    lastVisit: '2025-01-05'
  },
  {
    id: 'customer2',
    name: 'Emma Thompson',
    email: 'emma.t@example.com',
    phone: '+962 79 234 5678',
    totalBookings: 8,
    totalSpent: 220,
    loyaltyPoints: 320,
    lastVisit: '2025-01-10'
  },
  {
    id: 'customer3',
    name: 'Michael Davis',
    email: 'michael.d@example.com',
    phone: '+962 79 345 6789',
    totalBookings: 5,
    totalSpent: 180,
    loyaltyPoints: 200,
    lastVisit: '2025-01-08'
  },
  {
    id: 'customer4',
    name: 'Jessica Williams',
    email: 'jessica.w@example.com',
    phone: '+962 79 456 7890',
    totalBookings: 15,
    totalSpent: 480,
    loyaltyPoints: 600,
    lastVisit: '2025-01-12'
  },
  {
    id: 'customer5',
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '+962 79 567 8901',
    totalBookings: 3,
    totalSpent: 90,
    loyaltyPoints: 90,
    lastVisit: '2024-12-28'
  }
];

// Mock data for loyalty rewards
const mockRewards = [
  {
    id: 'reward1',
    name: 'Free Classic Manicure',
    description: 'Redeem for a free classic manicure service',
    pointsCost: 200,
    isActive: true
  },
  {
    id: 'reward2',
    name: '25% Off Any Service',
    description: 'Get 25% discount on any service of your choice',
    pointsCost: 350,
    isActive: true
  },
  {
    id: 'reward3',
    name: 'Free Nail Art Add-On',
    description: 'Add complimentary nail art to any service',
    pointsCost: 150,
    isActive: true
  },
  {
    id: 'reward4',
    name: 'Luxury Hand Treatment',
    description: 'Enjoy a premium hand treatment with any service',
    pointsCost: 250,
    isActive: false
  }
];

export default function LoyaltyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loyaltySettings, setLoyaltySettings] = useState({
    pointsPerDollar: 10,
    minimumSpendForPoints: 10,
    welcomeBonus: 50
  });
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
        <p className="text-gray-600">Manage customer loyalty points and rewards</p>
      </div>
      
      {/* Loyalty stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockCustomers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Points Issued</h3>
            <div className="p-2 bg-secondary/10 rounded-full">
              <Star className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {mockCustomers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Available Rewards</h3>
            <div className="p-2 bg-primary/10 rounded-full">
              <Gift className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {mockRewards.filter(reward => reward.isActive).length}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer loyalty table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Customer Loyalty</h3>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Search customers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${customer.totalSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{customer.loyaltyPoints}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.lastVisit).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
        
        {/* Loyalty settings and rewards */}
        <div className="space-y-6">
          {/* Loyalty settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Loyalty Settings</h3>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points per $1 spent
                </label>
                <input
                  type="number"
                  value={loyaltySettings.pointsPerDollar}
                  onChange={(e) => setLoyaltySettings({ ...loyaltySettings, pointsPerDollar: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum spend for points ($)
                </label>
                <input
                  type="number"
                  value={loyaltySettings.minimumSpendForPoints}
                  onChange={(e) => setLoyaltySettings({ ...loyaltySettings, minimumSpendForPoints: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome bonus points
                </label>
                <input
                  type="number"
                  value={loyaltySettings.welcomeBonus}
                  onChange={(e) => setLoyaltySettings({ ...loyaltySettings, welcomeBonus: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              
              <Button className="w-full mt-2">
                Save Settings
              </Button>
            </div>
          </div>
          
          {/* Rewards list */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Available Rewards</h3>
              <Button variant="outline" size="sm">
                Add Reward
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`border rounded-lg p-3 ${reward.isActive ? '' : 'opacity-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{reward.name}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{reward.pointsCost} points</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-2">
                        <input
                          type="checkbox"
                          checked={reward.isActive}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </div>
                      <button>
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}