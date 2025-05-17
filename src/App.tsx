import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingPage from './pages/BookingPage';
import BookingByNamePage from './pages/BookingByNamePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import TestFileUpload from './TestFileUpload';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/booking/:salonId" element={<BookingPage />} />
          <Route path="/booking/name/:salonName" element={<BookingByNamePage />} />
          <Route path="/test-upload" element={<TestFileUpload />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;