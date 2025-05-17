import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', closable = true }: ModalProps) {
  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const modalWidth = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
          onClick={closable ? onClose : undefined}
          aria-hidden="true"
        ></div>
        
        {/* Modal */}
        <div 
          className={`relative bg-white rounded-lg shadow-xl ${modalWidth[size]} w-full p-6 transform transition-all`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            {closable && (
              <button 
                type="button" 
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400" 
                onClick={onClose}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
          
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}