import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      onClose();
      navigate('/admin');
    } catch (error) {
      setError('Invalid email or password');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        
        <div className="!mt-6">
          <Button 
            type="submit" 
            className="w-full" 
            loading={loading}
          >
            Login
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials:</p>
          <p>Email: admin@gentivo.ai</p>
          <p>Password: password</p>
        </div>
      </form>
    </Modal>
  );
}