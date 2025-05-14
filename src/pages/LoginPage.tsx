import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/admin');
    }
  }, [isAuthenticated, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // Navigation will happen in the useEffect above
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
            setError('Invalid email or password');
            break;
          case 'auth/user-not-found':
            setError('No user found with this email');
            break;
          case 'auth/wrong-password':
            setError('Invalid password');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed login attempts. Please try again later');
            break;
          default:
            setError(`Failed to log in: ${error.code}`);
            console.error('Auth error:', error);
        }
      } else {
        setError('An unexpected error occurred');
        console.error('Unknown error:', error);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Scissors className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to Gentivo
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            
            <div>
              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Demo credentials:</p>
              <p>Email: admin@gentivo.ai</p>
              <p>Password: password</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}