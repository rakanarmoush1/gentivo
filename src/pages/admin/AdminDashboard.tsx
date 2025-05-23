import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Scissors, ChevronRight, Menu, X, PenTool, Palette, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import DeleteAccountButton from '../../components/admin/DeleteAccountButton';
import ChangePasswordForm from '../../components/admin/ChangePasswordForm';
import Logo from '../../components/common/Logo';
import BookingsPage from './BookingsPage';
import BrandingPage from './BrandingPage';
import ServicesPage from './ServicesPage';
import EmployeesPage from './EmployeesPage';
import MessageTemplatesPage from './MessageTemplatesPage';
import SettingsPage from './SettingsPage';
import { getSalonId } from '../../utils/getSalonId';
import { getUserSalons, updateSalon } from '../../firebase';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userSalons, setUserSalons] = useState<{id: string, name: string}[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      loadUserSalons();
    }
  }, [currentUser]);
  
  async function loadUserSalons() {
    try {
      if (!currentUser) return;
      
      const salons = await getUserSalons(currentUser.uid);
      
      if (salons.length > 0) {
        setUserSalons(salons.map(salon => ({ id: salon.id, name: salon.name })));
        
        // Get the salon ID from the URL if available, otherwise use the first salon
        const urlSalonId = getSalonId();
        const salonToUse = urlSalonId && salons.some(s => s.id === urlSalonId) 
          ? urlSalonId 
          : salons[0].id;
          
        setSelectedSalonId(salonToUse);
      }
    } catch (error) {
      console.error('Error loading user salons:', error);
    }
  }
  
  async function handleSalonChange(salonId: string) {
    setSelectedSalonId(salonId);
    
    // Force reload current page to update data
    const currentPath = location.pathname;
    
    // Trigger a small delay to ensure state updates before navigation
    setTimeout(() => {
      navigate(currentPath, { replace: true });
    }, 100);
  }
  
  const navigation = [
    { name: 'Bookings', path: '/admin', icon: Calendar },
    { name: 'Services', path: '/admin/services', icon: Scissors },
    { name: 'Staff', path: '/admin/employees', icon: Users },
    { name: 'Salon Branding', path: '/admin/branding', icon: Palette },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
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
            <Logo width={24} height={24} />
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
                <Logo width={32} height={32} />
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
                <p className="text-sm font-medium text-gray-700">{currentUser?.email}</p>
                {userSalons.length > 0 && (
                  <select
                    value={selectedSalonId}
                    onChange={(e) => handleSalonChange(e.target.value)}
                    className="mt-1 text-xs text-gray-500 bg-transparent border-none"
                  >
                    {userSalons.map(salon => (
                      <option key={salon.id} value={salon.id}>{salon.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <LogOut className="h-5 w-5" />
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
                <Logo width={32} height={32} />
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
                <p className="text-sm font-medium text-gray-700">{currentUser?.email}</p>
                {userSalons.length > 0 && (
                  <select
                    value={selectedSalonId}
                    onChange={(e) => handleSalonChange(e.target.value)}
                    className="mt-1 text-xs text-gray-500 bg-transparent border-none"
                  >
                    {userSalons.map(salon => (
                      <option key={salon.id} value={salon.id}>{salon.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <LogOut className="h-5 w-5" />
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
                  {location.pathname === '/admin/services' && <span className="font-medium text-gray-900">Services</span>}
                  {location.pathname === '/admin/employees' && <span className="font-medium text-gray-900">Staff</span>}
                  {location.pathname === '/admin/branding' && <span className="font-medium text-gray-900">Salon Branding</span>}
                  {location.pathname === '/admin/settings' && <span className="font-medium text-gray-900">Settings</span>}
                </div>
                
                {/* Salon booking preview button */}
                {selectedSalonId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/booking/${selectedSalonId}`, '_blank', 'noopener,noreferrer')}
                    className="ml-auto"
                  >
                    Preview Booking Page
                  </Button>
                )}
              </div>
              
              {/* Page content */}
              <Routes>
                <Route path="/" element={<BookingsPage salonId={selectedSalonId} />} />
                <Route path="/services" element={<ServicesPage salonId={selectedSalonId} />} />
                <Route path="/employees" element={<EmployeesPage salonId={selectedSalonId} />} />
                <Route path="/messages" element={<MessageTemplatesPage salonId={selectedSalonId} />} />
                <Route path="/branding" element={<BrandingPage salonId={selectedSalonId} />} />
                <Route path="/settings" element={<SettingsPage salonId={selectedSalonId} />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}