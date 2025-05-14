import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';
import BookingNavbar from '../components/common/BookingNavbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Footer from '../components/common/Footer';
import { getSalon, Salon, getSalonServices, Service, createBooking } from '../firebase';
import { Timestamp } from 'firebase/firestore';

type BookingStep = 'service' | 'time' | 'info' | 'confirm' | 'success';

export default function BookingPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  // Generate time slots from 9 AM to 6 PM every 30 minutes
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  useEffect(() => {
    if (salonId) {
      loadSalonData();
    } else {
      setError('No salon ID provided');
      setLoading(false);
    }
  }, [salonId]);
  
  async function loadSalonData() {
    try {
      setLoading(true);
      setError('');
      
      if (!salonId) {
        setError('Invalid salon ID');
        return;
      }
      
      // Load salon details
      const salonData = await getSalon(salonId);
      if (!salonData) {
        setError('Salon not found');
        setLoading(false);
        return;
      }
      
      setSalon(salonData);
      
      // Load salon services
      const servicesData = await getSalonServices(salonId);
      setServices(servicesData);
      
    } catch (error) {
      console.error('Error loading salon data:', error);
      setError('Failed to load salon data');
    } finally {
      setLoading(false);
    }
  }
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const nextStep = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('time');
        break;
      case 'time':
        setCurrentStep('info');
        break;
      case 'info':
        setCurrentStep('confirm');
        break;
      case 'confirm':
        setCurrentStep('success');
        break;
      default:
        break;
    }
  };
  
  const prevStep = () => {
    switch (currentStep) {
      case 'time':
        setCurrentStep('service');
        break;
      case 'info':
        setCurrentStep('time');
        break;
      case 'confirm':
        setCurrentStep('info');
        break;
      default:
        break;
    }
  };
  
  const confirmBooking = async () => {
    try {
      if (!salonId || !selectedService || !selectedTime) {
        console.error('Missing booking information');
        return;
      }
      
      // Get today's date and combine with selected time
      const today = new Date();
      const [hours, minutes] = selectedTime.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Get the selected service name
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      if (!selectedServiceData) {
        console.error('Selected service not found');
        return;
      }
      
      // Create the booking
      await createBooking(salonId, {
        name: customerInfo.name,
        phone: customerInfo.phone,
        service: selectedServiceData.name,
        time: Timestamp.fromDate(today)
      });
      
      // Proceed to success step
      nextStep();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };
  
  const selectedServiceDetails = services.find(service => service.id === selectedService);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading salon information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!salon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Salon Not Found</h2>
          <p className="text-gray-700 mb-4">The salon you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <BookingNavbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Salon header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center">
              <div className="w-16 h-16 rounded-full mr-4 flex items-center justify-center bg-primary/10">
                {salon.logoUrl ? (
                  <img 
                    src={salon.logoUrl} 
                    alt={salon.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary text-xl font-bold">
                    {salon.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
                <p className="text-gray-600">Book your appointment</p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${currentStep === 'service' || currentStep === 'time' || currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep === 'service' || currentStep === 'time' || currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Service</span>
                </div>
                
                <div className="flex-grow mx-2 h-0.5 bg-gray-200"></div>
                
                <div className={`flex items-center ${currentStep === 'time' || currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep === 'time' || currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Time</span>
                </div>
                
                <div className="flex-grow mx-2 h-0.5 bg-gray-200"></div>
                
                <div className={`flex items-center ${currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep === 'info' || currentStep === 'confirm' || currentStep === 'success' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Info</span>
                </div>
                
                <div className="flex-grow mx-2 h-0.5 bg-gray-200"></div>
                
                <div className={`flex items-center ${currentStep === 'confirm' || currentStep === 'success' ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep === 'confirm' || currentStep === 'success' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                    4
                  </div>
                  <span className="ml-2 text-sm font-medium">Confirm</span>
                </div>
              </div>
            </div>
            
            {/* Step content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Service selection step */}
              {currentStep === 'service' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
                  {services.length === 0 ? (
                    <div className="text-center p-6">
                      <p className="text-gray-500 mb-4">No services available for this salon.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {services.map(service => (
                        <div 
                          key={service.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedService === service.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-900">{service.name}</h3>
                              <p className="text-sm text-gray-600">{service.duration} minutes</p>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-gray-900">${service.price}</span>
                              <ChevronRight className="ml-2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Button 
                      onClick={nextStep} 
                      disabled={!selectedService}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Time selection step */}
              {currentStep === 'time' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Time</h2>
                  <p className="text-gray-600 mb-4">
                    {selectedServiceDetails?.name} • {selectedServiceDetails?.duration} minutes • ${selectedServiceDetails?.price}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map(time => (
                      <div 
                        key={time}
                        className={`border rounded-lg py-3 px-4 text-center cursor-pointer transition-all duration-200 ${selectedTime === time ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <span className="font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      disabled={!selectedTime}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Customer info step */}
              {currentStep === 'info' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                    
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      disabled={!customerInfo.name || !customerInfo.phone}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Confirmation step */}
              {currentStep === 'confirm' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Your Booking</h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Salon</h3>
                        <p className="text-gray-900">{salon.name}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Service</h3>
                        <p className="text-gray-900">{selectedServiceDetails?.name}</p>
                        <p className="text-sm text-gray-600">${selectedServiceDetails?.price} • {selectedServiceDetails?.duration} min</p>
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                        <p className="text-gray-900">Today at {selectedTime}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Your Information</h3>
                        <p className="text-gray-900">{customerInfo.name}</p>
                        <p className="text-gray-600">{customerInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        By confirming this booking, you agree to our cancellation policy. 
                        Please arrive 5 minutes before your appointment time.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={confirmBooking}
                      className="flex-1"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Success step */}
              {currentStep === 'success' && (
                <div className="text-center py-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-6">
                    Your appointment has been confirmed. We've sent a confirmation to your phone.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-gray-500">Service</h3>
                      <p className="text-gray-900">{selectedServiceDetails?.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                      <p className="text-gray-900">Today at {selectedTime}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}