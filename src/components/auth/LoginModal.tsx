import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      onClose();
      navigate('/admin');
    }
  }, [isAuthenticated, loading, navigate, onClose]);

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Login" 
      size="sm"
      closable={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200/60 text-red-800 p-3 rounded-lg text-sm">
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
        
        <div className="!mt-6">
          <Button 
            type="submit" 
            className="w-full" 
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}