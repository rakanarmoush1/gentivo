import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, ChevronRight, Menu, X, PenTool, Palette, LogOut, Settings as SettingsIcon } from 'lucide-react';
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
import { getUserSalons, updateSalon, getSalon, type Salon } from '../../firebase';

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userSalons, setUserSalons] = useState<{id: string, name: string}[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to homepage
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  useEffect(() => {
    if (currentUser) {
      loadUserSalons();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedSalonId) {
      loadCurrentSalon();
    }
  }, [selectedSalonId]);
  
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

  async function loadCurrentSalon() {
    try {
      if (!selectedSalonId) return;
      
      const salon = await getSalon(selectedSalonId);
      setCurrentSalon(salon);
    } catch (error) {
      console.error('Error loading current salon:', error);
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
    { name: 'Services', path: '/admin/services', icon: SettingsIcon },
    { name: 'Staff', path: '/admin/employees', icon: Users },
    { name: 'Salon Branding', path: '/admin/branding', icon: Palette },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const renderSalonBranding = (size: 'small' | 'large' = 'small') => {
    const logoSize = size === 'large' ? 32 : 24;
    const textSize = size === 'large' ? 'text-xl' : 'text-lg';
    
    return (
      <div className="flex items-center">
        {currentSalon?.logoUrl ? (
          <img 
            src={currentSalon.logoUrl} 
            alt={`${currentSalon.name} logo`}
            className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full object-cover`}
          />
        ) : (
          <div 
            className={`${size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full flex items-center justify-center`}
            style={{ backgroundColor: currentSalon?.brandPrimaryColor || '#0c0a09' }}
          >
            <span className="text-white font-medium text-sm">
              {currentSalon?.name?.substring(0, 2).toUpperCase() || 'SA'}
            </span>
          </div>
        )}
        <span className={`ml-3 ${textSize} font-medium text-stone-900`}>
          {currentSalon?.name || 'Your Salon'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50/30 flex font-light">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white border-b border-stone-200/60">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2 rounded-lg p-1"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-4">
            {renderSalonBranding('small')}
          </div>
        </div>
      </div>

      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 flex transform ease-in-out duration-300 lg:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-stone-200/60">
          <div className="flex-1 overflow-y-auto pt-16 pb-4">
            <div className="flex-shrink-0 flex items-center px-6 mb-8">
              {renderSalonBranding('large')}
            </div>
            
            <nav className="mt-5 px-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
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
          
          <div className="flex-shrink-0 p-4 border-t border-stone-200/60">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-stone-900">{currentUser?.email}</p>
                {userSalons.length > 0 && (
                  <select
                    value={selectedSalonId}
                    onChange={(e) => handleSalonChange(e.target.value)}
                    className="mt-1 text-xs text-stone-500 bg-transparent border-none font-light"
                  >
                    {userSalons.map(salon => (
                      <option key={salon.id} value={salon.id}>{salon.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors duration-200"
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
          <div className="flex flex-col flex-grow h-0 border-r border-stone-200/60 pt-6 pb-4 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              {renderSalonBranding('large')}
            </div>
            
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
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
          
          <div className="flex-shrink-0 p-4 border-t border-stone-200/60 bg-white">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-stone-900">{currentUser?.email}</p>
                {userSalons.length > 0 && (
                  <select
                    value={selectedSalonId}
                    onChange={(e) => handleSalonChange(e.target.value)}
                    className="mt-1 text-xs text-stone-500 bg-transparent border-none font-light"
                  >
                    {userSalons.map(salon => (
                      <option key={salon.id} value={salon.id}>{salon.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors duration-200"
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
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center mb-8">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-stone-500 font-light">
                  <span>Dashboard</span>
                  <ChevronRight className="mx-2 h-4 w-4" />
                  {location.pathname === '/admin' && <span className="font-medium text-stone-900">Bookings</span>}
                  {location.pathname === '/admin/services' && <span className="font-medium text-stone-900">Services</span>}
                  {location.pathname === '/admin/employees' && <span className="font-medium text-stone-900">Staff</span>}
                  {location.pathname === '/admin/branding' && <span className="font-medium text-stone-900">Salon Branding</span>}
                  {location.pathname === '/admin/settings' && <span className="font-medium text-stone-900">Settings</span>}
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