import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordForm from '../../components/admin/ChangePasswordForm';
import DeleteAccountButton from '../../components/admin/DeleteAccountButton';

interface SettingsPageProps {
  salonId: string;
}

/**
 * Settings page that allows users to manage their account settings
 * Including changing password and deleting account
 */
export default function SettingsPage({ salonId }: SettingsPageProps) {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="font-medium">{currentUser?.email || 'Not available'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Account Created</p>
            <p className="font-medium">
              {(currentUser as any)?.metadata?.creationTime ? 
                new Date((currentUser as any).metadata.creationTime).toLocaleDateString() : 
                'Not available'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Sign In</p>
            <p className="font-medium">
              {(currentUser as any)?.metadata?.lastSignInTime ? 
                new Date((currentUser as any).metadata.lastSignInTime).toLocaleDateString() : 
                'Not available'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Change Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Password Settings</h2>
          <ChangePasswordForm />
        </div>
        
        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
          <div className="border border-red-200 rounded-md p-4 bg-red-50">
            <h3 className="font-medium mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All your data, including salon settings, 
              appointments, and customer information will be permanently deleted.
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  );
} 