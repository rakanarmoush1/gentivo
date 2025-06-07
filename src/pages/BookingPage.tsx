import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, Clock, Calendar, User, Scissors, ChevronLeft } from 'lucide-react';
import BookingNavbar from '../components/common/BookingNavbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Footer from '../components/common/Footer';
import Modal from '../components/common/Modal';
import SalonLogoHeader from '../components/booking/SalonLogoHeader';
import { getSalon, Salon, getSalonServices, Service, createBooking, getSalonEmployees, Employee, getBookingsByDate, Booking } from '../firebase';
import { Timestamp } from 'firebase/firestore';

type BookingStep = 'service' | 'time' | 'info' | 'confirm' | 'success';

export default function BookingPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // For navigating weeks
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  // Get available days based on business hours (next 28 days from current week offset)
  const getAvailableDays = (): Date[] => {
    if (!salon?.businessHours) return [];
    
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (currentWeekOffset * 7)); // Start from current week offset
    
    for (let i = 0; i < 28; i++) { // Show 4 weeks worth of days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours;
      
      // Only include days when the salon is open
      if (salon.businessHours[dayName]?.isOpen) {
        days.push(date);
      }
    }
    
    return days;
  };
  
  // Get days for the current week view (7 days)
  const getCurrentWeekDays = (): Date[] => {
    return getAvailableDays().slice(0, 7);
  };
  
  // Generate time slots based on business hours for a specific day
  const generateTimeSlots = (date: Date): string[] => {
    if (!salon?.businessHours || !date) return [];
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours;
    const businessHour = salon.businessHours[dayName];
    
    if (!businessHour?.isOpen) return [];
    
    const slots = [];
    const [openHour, openMinute] = businessHour.open.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.close.split(':').map(Number);
    
    // Start from opening time
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
      
      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };
  
  // Check if a time slot is available for the selected service on the selected date
  const isTimeSlotAvailable = (timeSlot: string, date: Date): boolean => {
    if (!selectedService || !date) return false;
    
    // Get the selected service details
    const serviceData = services.find(s => s.id === selectedService);
    if (!serviceData) return false;
    
    // Find employees who can perform this service
    const availableEmployees = employees.filter(employee => 
      employee.services.includes(serviceData.name)
    );
    
    if (availableEmployees.length === 0) return false;
    
    // Create a date object for the selected time slot on the selected date
    const [hours, minutes] = timeSlot.split(':');
    const slotTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(hours), parseInt(minutes));
    const slotEndTime = new Date(slotTime.getTime() + serviceData.duration * 60000); // Add service duration
    
    // Check if any employee is available during this time slot
    return availableEmployees.some(employee => {
      // Check if this employee has any conflicting bookings
      const employeeBookings = bookings.filter(booking => {
        // Find the service for this booking to check duration
        const bookingService = services.find(s => s.name === booking.service);
        if (!bookingService) return false;
        
        // Check if the employee can perform this booked service
        if (!employee.services.includes(booking.service)) return false;
        
        // Get booking time and end time
        const bookingTime = booking.time.toDate();
        const bookingEndTime = new Date(bookingTime.getTime() + bookingService.duration * 60000);
        
        // Check if booking is on the same date
        const bookingDate = new Date(bookingTime.getFullYear(), bookingTime.getMonth(), bookingTime.getDate());
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (bookingDate.getTime() !== selectedDateOnly.getTime()) return false;
        
        // Check for time overlap
        return (slotTime < bookingEndTime && slotEndTime > bookingTime);
      });
      
      // Employee is available if they have no conflicting bookings
      return employeeBookings.length === 0;
    });
  };
  
  useEffect(() => {
    if (salonId) {
      loadSalonData();
    } else {
      setError('No salon ID provided');
      setLoading(false);
    }
  }, [salonId]);
  
  // Load bookings for the selected date when date changes
  useEffect(() => {
    if (selectedDate && salonId) {
      loadBookingsForDate(selectedDate);
    }
  }, [selectedDate, salonId]);
  
  // Open service modal when page loads
  useEffect(() => {
    if (!loading && !error && salon) {
      setServiceModalOpen(true);
    }
  }, [loading, error, salon]);
  
  async function loadSalonData() {
    try {
      setLoading(true);
      setError('');
      
      if (!salonId) {
        setError('Invalid salon ID');
        return;
      }
      
      // Load salon details, services, and employees
      const [salonData, servicesData, employeesData] = await Promise.all([
        getSalon(salonId),
        getSalonServices(salonId),
        getSalonEmployees(salonId)
      ]);
      
      if (!salonData) {
        setError('Salon not found');
        setLoading(false);
        return;
      }
      
      setSalon(salonData);
      setServices(servicesData);
      setEmployees(employeesData);
      
    } catch (error) {
      console.error('Error loading salon data:', error);
      setError('Failed to load salon data');
    } finally {
      setLoading(false);
    }
  }
  
  async function loadBookingsForDate(date: Date) {
    try {
      if (!salonId) return;
      const bookingsData = await getBookingsByDate(salonId, date);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings for date:', error);
    }
  }
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    
    // Clear selected time if it's no longer available for the new service
    if (selectedTime) {
      // Temporarily set the service to check availability
      const oldService = selectedService;
      
      // Check if the currently selected time is still available for the new service
      // We need to manually check since state hasn't updated yet
      const serviceData = services.find(s => s.id === serviceId);
      if (serviceData) {
        const availableEmployees = employees.filter(employee => 
          employee.services.includes(serviceData.name)
        );
        
        if (availableEmployees.length === 0) {
          setSelectedTime(null);
        } else {
          // Check time availability with the new service
          const today = new Date();
          const [hours, minutes] = selectedTime.split(':');
          const slotTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
          const slotEndTime = new Date(slotTime.getTime() + serviceData.duration * 60000);
          
          const isStillAvailable = availableEmployees.some(employee => {
            const employeeBookings = bookings.filter(booking => {
              const bookingService = services.find(s => s.name === booking.service);
              if (!bookingService) return false;
              
              if (!employee.services.includes(booking.service)) return false;
              
              const bookingTime = booking.time.toDate();
              const bookingEndTime = new Date(bookingTime.getTime() + bookingService.duration * 60000);
              
              return (slotTime < bookingEndTime && slotEndTime > bookingTime);
            });
            
            return employeeBookings.length === 0;
          });
          
          if (!isStillAvailable) {
            setSelectedTime(null);
          }
        }
      }
    }
  };
  
  const handleTimeSelect = (time: string) => {
    // Only allow selection if the time slot is available
    if (selectedDate && isTimeSlotAvailable(time, selectedDate!)) {
      setSelectedTime(time);
    }
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
        setServiceModalOpen(false);
        setCurrentStep('time');
        setTimeModalOpen(true);
        break;
      case 'time':
        setTimeModalOpen(false);
        setCurrentStep('info');
        setInfoModalOpen(true);
        break;
      case 'info':
        setInfoModalOpen(false);
        setCurrentStep('confirm');
        setConfirmModalOpen(true);
        break;
      case 'confirm':
        setConfirmModalOpen(false);
        setCurrentStep('success');
        setSuccessModalOpen(true);
        break;
      default:
        break;
    }
  };
  
  const prevStep = () => {
    switch (currentStep) {
      case 'time':
        setTimeModalOpen(false);
        setCurrentStep('service');
        setServiceModalOpen(true);
        break;
      case 'info':
        setInfoModalOpen(false);
        setCurrentStep('time');
        setTimeModalOpen(true);
        break;
      case 'confirm':
        setConfirmModalOpen(false);
        setCurrentStep('info');
        setInfoModalOpen(true);
        break;
      default:
        break;
    }
  };
  
  const confirmBooking = async () => {
    try {
      if (!salonId || !selectedService || !selectedTime || !selectedDate) {
        console.error('Missing booking information');
        return;
      }
      
      // Double-check availability before booking
      if (!isTimeSlotAvailable(selectedTime, selectedDate!)) {
        alert('Sorry, this time slot is no longer available. Please select a different time.');
        return;
      }
      
      // Get the selected date and combine with selected time
      const [hours, minutes] = selectedTime.split(':');
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Get the selected service name
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      if (!selectedServiceData) {
        console.error('Selected service not found');
        return;
      }
      
      // Create the booking with status 'pending' instead of default 'confirmed'
      await createBooking(salonId, {
        name: customerInfo.name,
        phone: customerInfo.phone,
        service: selectedServiceData.name,
        time: Timestamp.fromDate(bookingDateTime)
      }, { status: 'pending' });
      
      // Proceed to success step
      nextStep();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };
  
  const selectedServiceDetails = services.find(service => service.id === selectedService);
  
  // Add styling with salon colors
  const getColorStyles = () => {
    if (!salon) return {};
    
    return {
      primaryColor: salon.brandPrimaryColor || '#4f46e5',
      primaryColorLight: `${salon.brandPrimaryColor}20` || '#4f46e520', // 20% opacity
      secondaryColor: salon.brandSecondaryColor || '#f97316',
      secondaryColorLight: `${salon.brandSecondaryColor}20` || '#f9731620', // 20% opacity
    };
  };
  
  const colors = getColorStyles();
  
  // Create CSS variables for colors to use throughout the component
  useEffect(() => {
    if (salon) {
      document.documentElement.style.setProperty('--primary-color', salon.brandPrimaryColor || '#4f46e5');
      document.documentElement.style.setProperty('--primary-color-light', `${salon.brandPrimaryColor}20` || '#4f46e520');
      document.documentElement.style.setProperty('--secondary-color', salon.brandSecondaryColor || '#f97316');
      document.documentElement.style.setProperty('--secondary-color-light', `${salon.brandSecondaryColor}20` || '#f9731620');
    }
    
    return () => {
      // Clean up by resetting the variables when component unmounts
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--primary-color-light');
      document.documentElement.style.removeProperty('--secondary-color');
      document.documentElement.style.removeProperty('--secondary-color-light');
    };
  }, [salon]);
  
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
      <BookingNavbar salonName={salon.name} />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Salon header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center">
              <div 
                className="w-16 h-16 rounded-full mr-4 flex items-center justify-center" 
                style={{ backgroundColor: `${colors.primaryColorLight}` }}
              >
                {salon.logoUrl ? (
              <img 
                    src={salon.logoUrl} 
                alt={salon.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span style={{ color: colors.primaryColor }} className="text-xl font-bold">
                    {salon.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{salon.name}</h1>
                <p className="text-gray-600">Book your appointment</p>
              </div>
            </div>
            
            {/* Booking summary card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Booking</h2>
              
              <div className="space-y-6">
                {/* Service section */}
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${selectedService ? 'bg-primary/5 border-primary/30' : 'border-gray-200'}`}
                  style={{ 
                    backgroundColor: selectedService ? colors.primaryColorLight : undefined,
                    borderColor: selectedService ? colors.primaryColor : undefined 
                  }}
                  onClick={() => setServiceModalOpen(true)}
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-primary/10 mr-4" style={{ backgroundColor: colors.primaryColorLight }}>
                      <Scissors className="h-5 w-5" style={{ color: colors.primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-500">Service</h3>
                      {selectedService ? (
                        <div>
                          <p className="font-medium text-gray-900">{selectedServiceDetails?.name}</p>
                          <p className="text-sm text-gray-600">{selectedServiceDetails?.price} JOD • {selectedServiceDetails?.duration} min</p>
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-400">Click to select a service</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                  </div>
                </div>
                
                {/* Time section */}
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${selectedTime && selectedDate ? 'bg-primary/5 border-primary/30' : 'border-gray-200'}`}
                  style={{ 
                    backgroundColor: selectedTime && selectedDate ? colors.primaryColorLight : undefined,
                    borderColor: selectedTime && selectedDate ? colors.primaryColor : undefined 
                  }}
                  onClick={() => {
                    if (selectedService) {
                      setTimeModalOpen(true);
                    } else {
                      alert('Please select a service first');
                      setServiceModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-primary/10 mr-4" style={{ backgroundColor: colors.primaryColorLight }}>
                      <Clock className="h-5 w-5" style={{ color: colors.primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                      {selectedTime && selectedDate ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">at {selectedTime}</p>
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-400">Click to select date and time</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                  </div>
                </div>
                
                {/* Customer info section */}
                <div 
                  className={`p-4 rounded-lg border cursor-pointer ${customerInfo.name && customerInfo.phone ? 'bg-primary/5 border-primary/30' : 'border-gray-200'}`}
                  style={{ 
                    backgroundColor: customerInfo.name && customerInfo.phone ? colors.primaryColorLight : undefined,
                    borderColor: customerInfo.name && customerInfo.phone ? colors.primaryColor : undefined 
                  }}
                  onClick={() => {
                    if (selectedService && selectedDate && selectedTime) {
                      setInfoModalOpen(true);
                    } else {
                      alert('Please select a service, date and time first');
                      if (!selectedService) {
                        setServiceModalOpen(true);
                      } else if (!selectedDate || !selectedTime) {
                        setTimeModalOpen(true);
                      }
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-primary/10 mr-4" style={{ backgroundColor: colors.primaryColorLight }}>
                      <User className="h-5 w-5" style={{ color: colors.primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-500">Your Information</h3>
                      {customerInfo.name && customerInfo.phone ? (
                        <div>
                          <p className="font-medium text-gray-900">{customerInfo.name}</p>
                          <p className="text-sm text-gray-600">{customerInfo.phone}</p>
                  </div>
                      ) : (
                        <p className="text-sm italic text-gray-400">Click to enter your details</p>
                      )}
                </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  onClick={() => {
                    if (selectedService && selectedDate && selectedTime && customerInfo.name && customerInfo.phone) {
                      setConfirmModalOpen(true);
                    } else {
                      if (!selectedService) {
                        alert('Please select a service first');
                        setServiceModalOpen(true);
                      } else if (!selectedDate || !selectedTime) {
                        alert('Please select date and time first');
                        setTimeModalOpen(true);
                      } else {
                        alert('Please enter your contact information');
                        setInfoModalOpen(true);
                      }
                    }
                  }}
                  className="w-full"
                  disabled={!selectedService || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone}
                  style={{ backgroundColor: colors.primaryColor }}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Service Selection Modal */}
      <Modal 
        isOpen={serviceModalOpen} 
        onClose={() => {}}
        title="Select a Service"
        closable={false}
      >
        <SalonLogoHeader 
          logoUrl={salon.logoUrl} 
          salonName={salon.name}
          primaryColor={colors.primaryColor}
          primaryColorLight={colors.primaryColorLight}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {services.map(service => (
            <div 
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedService === service.id ? 'bg-primary/5' : 'border-gray-200 hover:border-primary/50'
              }`}
              style={{ 
                borderColor: selectedService === service.id ? colors.primaryColor : undefined,
                backgroundColor: selectedService === service.id ? colors.primaryColorLight : undefined
              }}
              onClick={() => handleServiceSelect(service.id)}
            >
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-500">{service.price} JOD • {service.duration} min</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              if (selectedService) {
                nextStep();
              } else {
                alert('Please select a service to continue');
              }
            }}
            disabled={!selectedService}
            style={{ backgroundColor: colors.primaryColor }}
          >
            Continue
          </Button>
        </div>
      </Modal>
      
      {/* Time Selection Modal */}
      <Modal 
        isOpen={timeModalOpen} 
        onClose={() => {}}
        title="Select Date & Time"
        closable={false}
      >
        <SalonLogoHeader 
          logoUrl={salon.logoUrl} 
          salonName={salon.name}
          primaryColor={colors.primaryColor}
          primaryColorLight={colors.primaryColorLight}
        />
        
        <p className="text-gray-600 mb-6">
          {selectedServiceDetails?.name} • {selectedServiceDetails?.duration} minutes • {selectedServiceDetails?.price} JOD
        </p>
        
        {/* Day Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Select a Date</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentWeekOffset(Math.max(0, currentWeekOffset - 1))}
                disabled={currentWeekOffset === 0}
                className={`p-1 rounded-full ${
                  currentWeekOffset === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500 px-2">
                {currentWeekOffset === 0 ? 'This Week' : `${currentWeekOffset + 1} Week${currentWeekOffset > 0 ? 's' : ''} Ahead`}
              </span>
              <button
                onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                disabled={currentWeekOffset >= 8} // Limit to 8 weeks in the future
                className={`p-1 rounded-full ${
                  currentWeekOffset >= 8 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {getCurrentWeekDays().map(date => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={date.toISOString()}
                  className={`border rounded-lg p-3 text-center cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  style={{ 
                    borderColor: isSelected ? colors.primaryColor : undefined,
                    backgroundColor: isSelected ? colors.primaryColorLight : undefined
                  }}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null); // Clear selected time when date changes
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="font-medium text-gray-900">
                    {isToday ? 'Today' : date.getDate()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Select a Time for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {generateTimeSlots(selectedDate).map(time => {
                const isAvailable = isTimeSlotAvailable(time, selectedDate!);
                const isSelected = selectedTime === time;
                
                return (
                  <div 
                    key={time}
                    className={`border rounded-lg py-3 px-4 text-center transition-all duration-200 ${
                      !isAvailable 
                        ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50' 
                        : isSelected 
                        ? 'bg-primary/5 cursor-pointer' 
                        : 'border-gray-200 hover:border-primary/50 cursor-pointer'
                    }`}
                    style={{ 
                      borderColor: isSelected && isAvailable ? colors.primaryColor : undefined,
                      backgroundColor: isSelected && isAvailable ? colors.primaryColorLight : undefined
                    }}
                    onClick={() => isAvailable && handleTimeSelect(time)}
                    title={!isAvailable ? 'No staff available at this time' : undefined}
                  >
                    <span className={`font-medium ${!isAvailable ? 'text-gray-400' : ''}`}>
                      {time}
                    </span>
                    {!isAvailable && (
                      <div className="text-xs text-gray-400 mt-1">
                        Unavailable
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {!selectedDate && (
          <div className="text-center py-8 text-gray-500">
            Please select a date first
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={prevStep}
            style={{ borderColor: colors.primaryColor, color: colors.primaryColor }}
          >
            Back
          </Button>
          <Button 
            onClick={() => {
              if (selectedDate && selectedTime) {
                nextStep();
              } else {
                alert('Please select both date and time to continue');
              }
            }}
            disabled={!selectedDate || !selectedTime}
            style={{ backgroundColor: colors.primaryColor }}
          >
            Continue
          </Button>
        </div>
      </Modal>
      
      {/* Customer Info Modal */}
      <Modal 
        isOpen={infoModalOpen} 
        onClose={() => {}}
        title="Your Information"
        closable={false}
      >
        <SalonLogoHeader 
          logoUrl={salon.logoUrl} 
          salonName={salon.name}
          primaryColor={colors.primaryColor}
          primaryColorLight={colors.primaryColorLight}
        />
        
        <div className="space-y-4 mb-6">
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
        
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              if (customerInfo.name && customerInfo.phone) {
                nextStep();
              } else {
                alert('Please fill in all required fields');
              }
            }}
            disabled={!customerInfo.name || !customerInfo.phone}
            style={{ backgroundColor: colors.primaryColor }}
          >
            Continue
          </Button>
        </div>
      </Modal>
      
      {/* Confirmation Modal */}
      <Modal 
        isOpen={confirmModalOpen} 
        onClose={() => {}}
        title="Confirm Your Booking"
        closable={false}
      >
        <SalonLogoHeader 
          logoUrl={salon.logoUrl} 
          salonName={salon.name}
          primaryColor={colors.primaryColor}
          primaryColorLight={colors.primaryColorLight}
        />
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-500">Salon</h3>
              <p className="text-gray-900">{salon.name}</p>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-500">Service</h3>
              <p className="text-gray-900">{selectedServiceDetails?.name}</p>
              <p className="text-sm text-gray-600">{selectedServiceDetails?.price} JOD • {selectedServiceDetails?.duration} min</p>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="text-gray-900">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Your Information</h3>
              <p className="text-gray-900">{customerInfo.name}</p>
              <p className="text-gray-600">{customerInfo.phone}</p>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg" style={{ 
            backgroundColor: colors.primaryColorLight,
            borderColor: colors.primaryColor 
          }}>
            <p className="text-sm text-gray-700">
              By confirming this booking, you agree to our cancellation policy. 
              Please arrive 5 minutes before your appointment time.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={confirmBooking}
            style={{ backgroundColor: colors.primaryColor }}
          >
            Confirm Booking
          </Button>
        </div>
      </Modal>
      
      {/* Success Modal */}
      <Modal 
        isOpen={successModalOpen} 
        onClose={() => {}}
        title="Booking Confirmed!"
        closable={false}
      >
        <SalonLogoHeader 
          logoUrl={salon.logoUrl} 
          salonName={salon.name}
          primaryColor={colors.primaryColor}
          primaryColorLight={colors.primaryColorLight}
        />
        
        <div className="text-center py-4 mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
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
              <p className="text-gray-900">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            style={{ backgroundColor: colors.primaryColor }}
          >
            Return to Home
          </Button>
        </div>
      </Modal>
      
      <Footer />
    </div>
  );
}