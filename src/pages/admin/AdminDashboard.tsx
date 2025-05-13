import { useState } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Scissors, Calendar, Users, Settings, ChevronRight, Menu, X, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import BookingsPage from './BookingsPage';
import CalendarPage from './CalendarPage';
import BrandingPage from './BrandingPage';
import ServicesPage from './ServicesPage';
import EmployeesPage from './EmployeesPage';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Bookings', path: '/admin', icon: Calendar },
    { name: 'Calendar', path: '/admin/calendar', icon: Users },
    { name: 'Services', path: '/admin/services', icon: Settings },
    { name: 'Employees', path: '/admin/employees', icon: UserPlus },
    { name: 'Salon Branding', path: '/admin/branding', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-4 flex items-center">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-bold">Gentivo</span>
          </div>
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 flex transform ease-in-out duration-300 lg:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="flex-1 overflow-y-auto pt-16 pb-4">
            <div className="flex-shrink-0 flex items-center px-6 mb-6">
              <Link to="/" className="flex items-center">
                <Scissors className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Gentivo</span>
              </Link>
            </div>
            
            <nav className="mt-5 px-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  end={item.path === '/admin'}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="opacity-25 w-14 flex-shrink-0" onClick={() => setIsSidebarOpen(false)}></div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow h-0 border-r border-gray-200 pt-6 pb-4 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-6">
              <Link to="/" className="flex items-center">
                <Scissors className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">Gentivo</span>
              </Link>
            </div>
            
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  end={item.path === '/admin'}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pt-16 lg:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-6">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500">
                  <span>Dashboard</span>
                  <ChevronRight className="mx-2 h-4 w-4" />
                  {location.pathname === '/admin' && <span className="font-medium text-gray-900">Bookings</span>}
                  {location.pathname === '/admin/calendar' && <span className="font-medium text-gray-900">Calendar</span>}
                  {location.pathname === '/admin/services' && <span className="font-medium text-gray-900">Services</span>}
                  {location.pathname === '/admin/employees' && <span className="font-medium text-gray-900">Employees</span>}
                  {location.pathname === '/admin/branding' && <span className="font-medium text-gray-900">Salon Branding</span>}
                </div>
                
                {/* Salon booking preview button */}
                <Link to="/booking/sample-salon" className="ml-auto">
                  <Button variant="outline" size="sm">
                    View Booking Page
                  </Button>
                </Link>
              </div>
              
              {/* Page content */}
              <Routes>
                <Route path="/" element={<BookingsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/branding" element={<BrandingPage />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}