import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Footer from '../components/common/Footer';

type BookingStep = 'service' | 'time' | 'info' | 'confirm' | 'success';

// Mock data for a salon
const mockSalon = {
  id: 'sample-salon',
  name: 'Elegance Nail Spa',
  logo: 'https://images.pexels.com/photos/114977/pexels-photo-114977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  services: [
    { id: 'service1', name: 'Classic Manicure', duration: 30, price: 15 },
    { id: 'service2', name: 'Gel Manicure', duration: 45, price: 25 },
    { id: 'service3', name: 'Classic Pedicure', duration: 45, price: 20 },
    { id: 'service4', name: 'Gel Pedicure', duration: 60, price: 30 },
    { id: 'service5', name: 'Nail Art', duration: 30, price: 15 },
    { id: 'service6', name: 'Full Set Acrylic', duration: 90, price: 50 }
  ],
  timeSlots: [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]
};

export default function BookingPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const salon = mockSalon; // In a real app, fetch salon data based on salonId
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
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
  
  const confirmBooking = () => {
    // In a real app, save to Firebase
    console.log('Booking confirmed:', {
      salonId,
      serviceId: selectedService,
      time: selectedTime,
      customer: customerInfo
    });
    
    nextStep();
  };
  
  const selectedServiceDetails = salon.services.find(service => service.id === selectedService);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Salon header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center">
              <img 
                src={salon.logo} 
                alt={salon.name} 
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
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
                  <div className="space-y-3">
                    {salon.services.map(service => (
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
                    {salon.timeSlots.map(time => (
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
                    Your appointment has been booked successfully. We've sent a confirmation to your phone.
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
                    onClick={() => window.location.href = '/'}
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