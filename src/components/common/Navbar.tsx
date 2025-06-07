import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from './Button';
import LoginModal from '../auth/LoginModal';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const isAuthenticated = !!currentUser;
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarBackground = transparent && !isScrolled 
    ? 'bg-white/80 backdrop-blur-sm border-b border-white/20' 
    : 'bg-white border-b border-stone-200/60';
  
  const textColor = transparent && !isScrolled 
    ? 'text-stone-900' 
    : 'text-stone-900';
  
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarBackground}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo width={32} height={32} />
                <span className={`ml-3 text-xl font-medium ${textColor}`}>Gentivo</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className={`${textColor} font-light`}>Welcome, {currentUser?.email}</span>
                  <Link to="/admin">
                    <Button variant="secondary" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <Button 
                  variant={transparent && !isScrolled ? "outline" : "primary"} 
                  size="sm" 
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Login
                </Button>
              )}
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${textColor} p-2 rounded-lg hover:bg-stone-100 transition-colors duration-200`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200/60">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-stone-900">
                    Welcome, {currentUser?.email}
                  </div>
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}