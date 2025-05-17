import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUser } from 'firebase/auth';
import Button from '../common/Button';

interface DeleteAccountButtonProps {
  onDelete?: () => void;
}

/**
 * A button component that allows users to delete their account with confirmation
 */
export default function DeleteAccountButton({ onDelete }: DeleteAccountButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, signOut } = useAuth();
  
  const handleShowConfirmation = () => {
    setShowConfirmation(true);
    setConfirmText('');
    setError('');
  };
  
  const handleCloseModal = () => {
    setShowConfirmation(false);
    setConfirmText('');
    setError('');
  };
  
  const handleDeleteAccount = async () => {
    if (!currentUser) {
      setError('You must be logged in to delete your account');
      return;
    }
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Delete the user account
      await deleteUser(currentUser);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
      
      // Sign out the user
      await signOut();
      
      // Close the modal
      setShowConfirmation(false);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(`Failed to delete account: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant="danger"
        onClick={handleShowConfirmation}
        className="w-full"
      >
        Delete Account
      </Button>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
            
            <p className="text-gray-700 mb-4">
              This action <span className="font-bold">cannot be undone</span>. 
              All your data will be permanently deleted.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="DELETE"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                loading={loading}
                disabled={loading || confirmText !== 'DELETE'}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 