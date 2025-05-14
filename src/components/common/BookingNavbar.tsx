import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Scissors } from 'lucide-react';

interface BookingNavbarProps {
  salonName?: string;
}

export default function BookingNavbar({ salonName }: BookingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Add scroll event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10);
    });
  }
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Scissors className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-800">
                {salonName ? `${salonName}` : 'Gentivo'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 