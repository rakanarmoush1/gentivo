import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-white">Gentivo</span>
          </Link>
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