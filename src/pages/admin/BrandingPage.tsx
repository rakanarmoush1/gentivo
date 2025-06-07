import { useState, useEffect, useRef } from 'react';
import { Upload, Palette, Image as ImageIcon, Check, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ImageUploader from '../../components/common/ImageUploader';
import LoadingStatus from '../../components/common/LoadingStatus';
import StorageDebugger from '../../components/admin/StorageDebugger';
import FirebaseStorageStatus from '../../components/admin/FirebaseStorageStatus';
import { getSalon, updateSalon, updateSalonMapping, slugifySalonName } from '../../firebase';
import { checkFirestoreConnection, checkStorageConnection } from '../../firebase/debug';
import { diagnoseFirebaseStorage } from '../../utils/firebaseDiagnostic';
import { testFirebaseStorage } from '../../utils/firebaseStorageTest';
import SimpleImageUploader from '../../components/simple/SimpleImageUploader';

interface BrandingPageProps {
  salonId: string;
}

export default function BrandingPage({ salonId }: BrandingPageProps) {
  const [salonInfo, setSalonInfo] = useState({
    name: '',
    logoUrl: '',
    address: '',
    phone: '',
    brandPrimaryColor: '#4f46e5',
    brandSecondaryColor: '#f97316',
    hideStaffSelection: false
  });
  
  const [loading, setLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '10:00', close: '16:00', isOpen: true },
    sunday: { open: '10:00', close: '16:00', isOpen: false }
  });
  
  const [bookingUrl, setBookingUrl] = useState('');
  
  // Add a new state for tracking loading phase
  const [loadingPhase, setLoadingPhase] = useState<string>('initializing');
  
  // Auto-save timeout ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save effect for salon info
  useEffect(() => {
    if (!hasLoadedInitialData || !salonId) return;

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set a new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        setError('');
        
        await updateSalon(salonId, {
          name: salonInfo.name,
          logoUrl: salonInfo.logoUrl,
          address: salonInfo.address,
          phone: salonInfo.phone,
          brandPrimaryColor: salonInfo.brandPrimaryColor,
          brandSecondaryColor: salonInfo.brandSecondaryColor,
          hideStaffSelection: salonInfo.hideStaffSelection
        });

        // Update salon name mapping if name changed
        if (salonInfo.name) {
          await updateSalonMapping(salonInfo.name, salonId);
        }
        
      } catch (error) {
        console.error('Auto-save error:', error);
        setError(`Auto-save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setAutoSaving(false);
      }
    }, 1000); // 1 second debounce

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [salonInfo, salonId, hasLoadedInitialData]);

  // Auto-save effect for business hours
  useEffect(() => {
    if (!hasLoadedInitialData || !salonId) return;

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set a new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        setError('');
        
        await updateSalon(salonId, {
          businessHours: businessHours
        });
        
      } catch (error) {
        console.error('Auto-save error:', error);
        setError(`Auto-save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setAutoSaving(false);
      }
    }, 1000); // 1 second debounce

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [businessHours, salonId, hasLoadedInitialData]);
  
  useEffect(() => {
    if (salonId) {
      loadSalonData();
    }
  }, [salonId]);
  
  async function loadSalonData() {
    try {
      setLoading(true);
      setError('');
      setLoadingPhase('initializing');
      setHasLoadedInitialData(false);
      
      // Check Firestore connection first (this is critical)
      setLoadingPhase('checking database connection');
      const firestoreConnected = await checkFirestoreConnection(5000);
      if (!firestoreConnected) {
        setError('Unable to connect to database. Please check your internet connection and refresh the page.');
        setLoading(false);
        return;
      }
      
      // Check if salonId is valid
      if (!salonId) {
        setError('Invalid salon ID');
        setLoading(false);
        return;
      }
      
      // Get salon info
      setLoadingPhase('loading salon information');
      let salon;
      try {
        salon = await getSalon(salonId);
        if (!salon) {
          console.error('BrandingPage: Salon not found for ID:', salonId);
          setError('Salon not found');
          setLoading(false);
          return;
        }
      } catch (salonError) {
        console.error('BrandingPage: Error fetching salon:', salonError);
        setError('Error loading salon information. Please try again.');
        setLoading(false);
        return;
      }
      
      // Update UI with salon data
      setSalonInfo({
        name: salon.name || '',
        logoUrl: salon.logoUrl || '',
        address: salon.address || '',
        phone: salon.phone || '',
        brandPrimaryColor: salon.brandPrimaryColor || '#4f46e5',
        brandSecondaryColor: salon.brandSecondaryColor || '#f97316',
        hideStaffSelection: salon.hideStaffSelection || false
      });
      
      // Load business hours if they exist
      if (salon.businessHours) {
        setBusinessHours(prev => ({
          ...prev,
          ...salon.businessHours
        }));
      }
      
      // Generate a proper URL-friendly name for the salon domain
      setLoadingPhase('preparing salon information');
      const slugifiedName = slugifySalonName(salon.name);
      setBookingUrl(`${slugifiedName}.gentivo.ai`);
      
      // Update the salon name mapping in Firestore (don't block on this)
      updateSalonMapping(salon.name, salonId).catch(err => {
        console.error('BrandingPage: Error updating salon mapping:', err);
      });
      
      // Check storage connection in the background (non-blocking)
      setLoadingPhase('finalizing');
      checkStorageConnection(3000).then(storageConnected => {
        if (!storageConnected) {
          console.warn('BrandingPage: Firebase Storage connection test failed. Image uploads may not work.');
        }
      });
      
      // Mark that initial data has been loaded
      setHasLoadedInitialData(true);
      
    } catch (error) {
      console.error('BrandingPage: Error loading salon data:', error);
      setError('Failed to load salon data. Please refresh the page and try again.');
    } finally {
      setLoadingPhase('complete');
      setLoading(false);
    }
  }
  
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setSalonInfo({
      ...salonInfo,
      [name]: newValue
    });
    
    // Update booking URL when salon name changes
    if (name === 'name') {
      const slugifiedName = slugifySalonName(value);
      setBookingUrl(`${slugifiedName}.gentivo.ai`);
      
      // Update the mapping in Firestore when name changes
      // No need to await this operation
      updateSalonMapping(value, salonId).catch(err => {
        console.error('Error updating salon mapping:', err);
      });
    }
  };
  
  const handleBusinessHoursChange = (
    day: keyof typeof businessHours, 
    field: 'open' | 'close' | 'isOpen', 
    value: string | boolean
  ) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    });
  };
  
  // Reset state on component unmount to prevent state persistence
  useEffect(() => {
    return () => {
      setSavingChanges(false);
      setSavedSuccess(false);
      setError('');
    };
  }, []);
  
  const handleLogoUploadSuccess = async (downloadUrl: string) => {
    try {
      setError('');
      setSavingChanges(true);
      
      // Update the salon info in state
      setSalonInfo(prev => ({
        ...prev,
        logoUrl: downloadUrl
      }));
      
      // Update the Firestore document with the image URL
      await updateSalon(salonId, { logoUrl: downloadUrl });
      
      // Show success message
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving logo URL:', error);
      setError(`Failed to save logo URL: ${error?.message || 'Unknown error'}`);
    } finally {
      setSavingChanges(false);
    }
  };
  
  const handleLogoUploadError = (errorMessage: string) => {
    setError(`Upload error: ${errorMessage}`);
  };
  
  const testStorage = async () => {
    try {
      setError('');
      setSavingChanges(true);
      
      const result = await testFirebaseStorage();
      
      if (result.success) {
        setSavedSuccess(true);
        setError(`Firebase Storage test successful! Test URL: ${result.url}`);
        setTimeout(() => setSavedSuccess(false), 5000);
      } else {
        setError(`Firebase Storage test failed: ${result.error}`);
      }
    } catch (error) {
      setError(`Firebase Storage test error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSavingChanges(false);
    }
  };
  
  const saveChanges = async () => {
    if (!salonId) return;
    
    try {
      setSavingChanges(true);
      setError('');
      
      // Clear any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Update salon info in Firestore
      await updateSalon(salonId, {
        name: salonInfo.name,
        logoUrl: salonInfo.logoUrl,
        address: salonInfo.address,
        phone: salonInfo.phone,
        brandPrimaryColor: salonInfo.brandPrimaryColor,
        brandSecondaryColor: salonInfo.brandSecondaryColor,
        businessHours: businessHours,
        hideStaffSelection: salonInfo.hideStaffSelection
      });
      
      // Update the salon name mapping
      await updateSalonMapping(salonInfo.name, salonId);
      
      // Show success message
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingChanges(false);
    }
  };
  
  const generateBookingLink = () => {
    // Copy the booking URL to clipboard with https:// prefix
    navigator.clipboard.writeText(`https://${bookingUrl}`);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 2000);
  };
  
  const previewBookingPage = () => {
    // Open the booking page in a new tab
    window.open(`/booking/${salonId}`, '_blank', 'noopener,noreferrer');
  };
  
  if (loading) {
    return (
      <div className="py-12 max-w-3xl mx-auto">
        <LoadingStatus 
          message={`Loading salon branding (${loadingPhase})`} 
          showDetails={true} 
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-6">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={() => loadSalonData()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  if (!salonId) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No salon selected</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salon Branding</h1>
        <p className="text-gray-600">Customize your salon's appearance and business hours</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      
      {error && error.includes('storage') && <FirebaseStorageStatus />}
      
      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-center">
          <Check className="h-5 w-5 mr-2 text-green-600" />
          <span>Your changes have been saved successfully!</span>
        </div>
      )}
      
      {autoSaving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span>Auto-saving changes...</span>
        </div>
      )}
      
      {error && error.includes('upload') && (
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testStorage} 
            loading={savingChanges}
          >
            Test Storage Connection
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            This will attempt to upload a test file to Firebase Storage to verify connectivity.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Salon Information */}
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Salon Information</h2>
          
          <div className="space-y-4">
            <Input
              label="Salon Name"
              name="name"
              value={salonInfo.name}
              onChange={handleInfoChange}
              placeholder="Enter salon name"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salon Logo
              </label>
              <SimpleImageUploader
                folder={`salons/${salonId}`}
                currentImageUrl={salonInfo.logoUrl}
                buttonLabel="Upload Logo"
                onImageUploaded={handleLogoUploadSuccess}
              />
            </div>
            
            <Input
              label="Address"
              name="address"
              value={salonInfo.address}
              onChange={handleInfoChange}
              placeholder="Enter salon address"
            />
            
            <Input
              label="Phone Number"
              name="phone"
              value={salonInfo.phone}
              onChange={handleInfoChange}
              placeholder="Enter phone number"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="brandPrimaryColor"
                    value={salonInfo.brandPrimaryColor}
                    onChange={handleInfoChange}
                    className="w-8 h-8 rounded mr-2 border shadow-sm cursor-pointer"
                  />
                  <Input
                    name="brandPrimaryColor"
                    type="text"
                    value={salonInfo.brandPrimaryColor}
                    onChange={handleInfoChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="brandSecondaryColor"
                    value={salonInfo.brandSecondaryColor}
                    onChange={handleInfoChange}
                    className="w-8 h-8 rounded mr-2 border shadow-sm cursor-pointer"
                  />
                  <Input
                    name="brandSecondaryColor"
                    type="text"
                    value={salonInfo.brandSecondaryColor}
                    onChange={handleInfoChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Booking Options */}
            <div className="pt-4 border-t">
              <h3 className="text-md font-medium text-gray-900 mb-3">Booking Options</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hideStaffSelection"
                    id="hideStaffSelection"
                    checked={salonInfo.hideStaffSelection}
                    onChange={handleInfoChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="hideStaffSelection" className="ml-2 block text-sm text-gray-700">
                    Hide staff selection step in booking flow
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  When enabled, customers will not be able to choose a specific staff member and will be automatically assigned to any available staff.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking URL and Preview */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Booking URL</h2>
            
            <div className="space-y-4">
              <div className="relative">
              <Input
                label="Custom Booking URL"
                value={bookingUrl}
                  disabled
                  helperText="This is your booking URL based on your salon ID"
                />
                {showLinkCopied && (
                  <div className="absolute right-0 -bottom-6 text-xs text-green-600">
                    Link copied to clipboard!
                  </div>
                )}
                <button 
                  onClick={generateBookingLink}
                  className="absolute right-2 top-7 p-1 text-gray-400 hover:text-gray-600"
                  title="Copy booking URL"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
              </div>
              
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Button 
                  onClick={generateBookingLink} 
                  className="w-full"
                >
                  Copy Booking URL
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={previewBookingPage}
                >
                  Preview Booking
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Salon Preview</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="h-32 flex items-center justify-center" 
                style={{ 
                  background: `linear-gradient(to right, ${salonInfo.brandPrimaryColor}, ${salonInfo.brandSecondaryColor})` 
                }}
              >
                <div className="bg-white p-3 rounded-full">
                  {salonInfo.logoUrl ? (
                    <img 
                      src={salonInfo.logoUrl} 
                      alt="Logo" 
                      className="h-10 w-10 object-cover rounded-full" 
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10" style={{ color: salonInfo.brandPrimaryColor }} />
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{salonInfo.name || 'Your Salon'}</h3>
                <p className="text-sm text-gray-600 mb-3">{salonInfo.address || 'Your Address'}</p>
                <Button 
                  className="w-full text-sm" 
                  size="sm"
                  style={{ backgroundColor: salonInfo.brandPrimaryColor }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Hours - Full Width Section */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
          
          <div className="max-w-2xl">
            <div className="space-y-3">
              {(Object.keys(businessHours) as Array<keyof typeof businessHours>).map(day => (
                <div key={day} className="flex items-center py-1 border-b">
                  <div className="w-24 font-medium capitalize">{day}</div>
                  <div className="flex items-center space-x-2 flex-grow">
                    <select
                      value={businessHours[day].open}
                      onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                      disabled={!businessHours[day].isOpen}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </option>
                      ))}
                    </select>
                    <span>to</span>
                    <select
                      value={businessHours[day].close}
                      onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                      disabled={!businessHours[day].isOpen}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={businessHours[day].isOpen}
                      onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Auto-save enabled - changes are saved automatically
          </span>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={loadSalonData}
          >
            Reset Changes
          </Button>
          <Button 
            onClick={saveChanges}
            loading={savingChanges}
            disabled={autoSaving}
          >
            Save Now
          </Button>
        </div>
      </div>
    </div>
  );
}