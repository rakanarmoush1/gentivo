import { BarChart, PieChart, TrendingUp, Download, Calendar, Users, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View insights about your salon performance</p>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <div className="p-2 bg-stone-100 rounded-full">
              <Calendar className="h-5 w-5 text-stone-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">247</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              +12.5%
              <TrendingUp className="ml-1 h-3 w-3" />
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">New Customers</h3>
            <div className="p-2 bg-secondary/10 rounded-full">
              <Users className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">64</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              +8.1%
              <TrendingUp className="ml-1 h-3 w-3" />
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Average Booking Value</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">$42.50</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              +5.3%
              <TrendingUp className="ml-1 h-3 w-3" />
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">$10,496</p>
            <p className="ml-2 text-sm text-green-600 flex items-center">
              +18.2%
              <TrendingUp className="ml-1 h-3 w-3" />
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Compared to last month</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bookings by service chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Bookings by Service</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="aspect-[4/3] relative">
            {/* This is a placeholder for a bar chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart className="h-40 w-40 text-gray-300" />
              <p className="absolute text-sm text-gray-600">
                Chart visualization
              </p>
            </div>
            
            {/* Actual data would use a library like Chart.js or Recharts */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="grid grid-cols-6 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-8 bg-stone-600 rounded-t-md"></div>
                  <span className="text-xs mt-1">Gel Mani</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-8 bg-stone-500 rounded-t-md"></div>
                  <span className="text-xs mt-1">Classic Mani</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-40 w-8 bg-stone-400 rounded-t-md"></div>
                  <span className="text-xs mt-1">Gel Pedi</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-28 w-8 bg-stone-300 rounded-t-md"></div>
                  <span className="text-xs mt-1">Classic Pedi</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-8 bg-stone-200 rounded-t-md"></div>
                  <span className="text-xs mt-1">Nail Art</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-8 bg-stone-100 rounded-t-md"></div>
                  <span className="text-xs mt-1">Acrylic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue distribution chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Revenue Distribution</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="aspect-[4/3] relative">
            {/* This is a placeholder for a pie chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <PieChart className="h-40 w-40 text-gray-300" />
              <p className="absolute text-sm text-gray-600">
                Chart visualization
              </p>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-stone-600 mr-2"></div>
                  <span className="text-xs">Gel Manicure (32%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-stone-500 mr-2"></div>
                  <span className="text-xs">Gel Pedicure (24%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-stone-400 mr-2"></div>
                  <span className="text-xs">Full Acrylic (18%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-stone-300 mr-2"></div>
                  <span className="text-xs">Classic Manicure (12%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-stone-200 mr-2"></div>
                  <span className="text-xs">Classic Pedicure (9%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                  <span className="text-xs">Other (5%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Download reports section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Download Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:border-stone-300 transition-colors">
            <h4 className="font-medium mb-1">Monthly Summary</h4>
            <p className="text-sm text-gray-600 mb-3">Comprehensive overview of your salon's performance this month</p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="mr-1 h-4 w-4" />
              Download CSV
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 hover:border-stone-300 transition-colors">
            <h4 className="font-medium mb-1">Customers Report</h4>
            <p className="text-sm text-gray-600 mb-3">List of all customers with booking frequency and preferences</p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="mr-1 h-4 w-4" />
              Download CSV
            </Button>
          </div>
          
          <div className="border rounded-lg p-4 hover:border-stone-300 transition-colors">
            <h4 className="font-medium mb-1">Revenue Analysis</h4>
            <p className="text-sm text-gray-600 mb-3">Detailed breakdown of revenue by service, day, and time</p>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="mr-1 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}