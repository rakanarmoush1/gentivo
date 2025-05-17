import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import { deleteUserAccount } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface DeleteAccountButtonProps {
  salonId: string;
}

export default function DeleteAccountButton({ salonId }: DeleteAccountButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setConfirmText('');
    setError('');
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConfirmText('');
  };
  
  const handleDeleteAccount = async () => {
    if (!currentUser || confirmText !== 'DELETE') {
      return;
    }
    
    try {
      setIsDeleting(true);
      setError('');
      
      await deleteUserAccount(currentUser.uid, salonId);
      
      // Close the modal
      setIsModalOpen(false);
      
      // Log out user and navigate to home page
      await logout();
      navigate('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <button
        onClick={handleOpenModal}
        className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 border border-red-200 mt-2"
      >
        <Trash className="mr-3 h-5 w-5 flex-shrink-0" />
        Delete Account
      </button>
      
      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Account</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              This will permanently delete your account, salon data, bookings, and all other associated information. This action <strong>cannot be undone</strong>.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="confirmDelete" className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                id="confirmDelete"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="flex items-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 