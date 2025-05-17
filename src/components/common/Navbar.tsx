import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Add scroll event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10);
    });
  }
  
  const navbarBackground = transparent 
    ? isScrolled ? 'bg-white shadow-md' : 'bg-transparent' 
    : 'bg-white shadow-sm';
  
  const textColor = transparent && !isScrolled ? 'text-white' : 'text-gray-800';
  
  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarBackground}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo width={32} height={32} />
                <span className={`ml-2 text-xl font-bold ${textColor}`}>Gentivo</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className={`${textColor}`}>Welcome, {currentUser?.name}</span>
                  <Link to="/admin">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
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
                className={`${textColor} p-2`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium">
                    Welcome, {currentUser?.name}
                  </div>
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-base font-medium text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700"
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
                  className="block w-full text-left px-3 py-2 text-base font-medium text-primary"
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