import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonIdFromSlug } from '../firebase';

export default function BookingByNamePage() {
  const { salonName } = useParams<{ salonName: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function lookupSalonId() {
      if (!salonName) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const salonId = await getSalonIdFromSlug(salonName);
        
        if (salonId) {
          // Redirect to the actual booking page with the salon ID
          navigate(`/booking/${salonId}`, { replace: true });
        } else {
          setError(`Salon "${salonName}" not found.`);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error looking up salon:', err);
        setError('An error occurred while looking up the salon.');
        setLoading(false);
      }
    }

    lookupSalonId();
  }, [salonName, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Looking up salon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // This should rarely be seen as we redirect immediately upon finding the ID
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to booking page...</p>
      </div>
    </div>
  );
} 