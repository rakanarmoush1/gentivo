import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword } from 'firebase/auth';
import Button from '../common/Button';

/**
 * A form component that allows users to change their password
 */
export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  
  const validateForm = () => {
    // Reset error and success
    setError('');
    setSuccess(false);
    
    // Validate passwords
    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    try {
      setLoading(true);
      
      // Update the password
      await updatePassword(currentUser, newPassword);
      
      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setSuccess(true);
    } catch (error: any) {
      setError(`Failed to change password: ${error?.message || 'Unknown error'}`);
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 text-sm">
          Password changed successfully!
        </div>
      )}
      
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter current password"
        />
      </div>
      
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter new password"
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Confirm new password"
        />
      </div>
      
      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        Change Password
      </Button>
    </form>
  );
} 