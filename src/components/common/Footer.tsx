import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center">
            <Scissors className="h-6 w-6 text-primary-light" />
            <span className="ml-2 text-xl font-bold text-white">Gentivo</span>
          </Link>
          <p className="mt-4 text-gray-400 text-sm max-w-2xl">
            Smart booking for nail salons in Jordan. Streamline your salon operations and grow your business.
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Gentivo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}