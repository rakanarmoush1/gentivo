import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { getSalon, Salon, getSalonServices, Service, createBooking, getSalonEmployees, Employee, getBookingsByDate, Booking } from '../firebase';
import { Timestamp } from 'firebase/firestore';

type BookingStep = 'service' | 'date' | 'time' | 'staff' | 'info' | 'confirm' | 'success';

interface BookingState {
  selectedService: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedStaff: string | null; // 'any' or actual staff ID
  customerInfo: {
    name: string;
    phone: string;
  };
}

// Helper function to extract numeric duration from string or number
const getDurationInMinutes = (duration: string | number): number => {
  if (typeof duration === 'number') {
    return duration;
  }
  
  // Try to extract first number from string (e.g., "30-45" -> 30, "1 hour" -> 60)
  const match = duration.toString().match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    // Handle special cases like "1 hour", "2 hours"
    if (duration.toLowerCase().includes('hour')) {
      return num * 60;
    }
    return num;
  }
  
  // Default fallback
  return 30;
};

export default function BookingPage() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingState, setBookingState] = useState<BookingState>({
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    selectedStaff: null,
    customerInfo: {
      name: '',
      phone: ''
    }
  });

  // Session storage key
  const STORAGE_KEY = `booking_progress_${salonId}`;

  // Load progress from session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && salonId) {
      const savedProgress = sessionStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          setBookingState(prev => ({
            ...prev,
            ...parsed,
            selectedDate: parsed.selectedDate ? new Date(parsed.selectedDate) : null
          }));
          setCurrentStep(parsed.currentStep || 'service');
        } catch (error) {
          console.error('Error loading booking progress:', error);
        }
      }
    }
  }, [salonId]);

  // Save progress to session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && salonId) {
      const progressData = {
        ...bookingState,
        currentStep,
        selectedDate: bookingState.selectedDate?.toISOString() || null
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    }
  }, [bookingState, currentStep, salonId]);

  // Clear session storage on successful booking
  const clearSession = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const steps: { key: BookingStep; title: string; number: number }[] = [
    { key: 'service', title: 'Select Service', number: 1 },
    { key: 'date', title: 'Choose Date', number: 2 },
    { key: 'time', title: 'Choose Time', number: 3 },
    { key: 'staff', title: 'Select Staff', number: 4 },
    { key: 'info', title: 'Your Details', number: 5 },
    { key: 'confirm', title: 'Confirm Booking', number: 6 },
    { key: 'success', title: 'Booking Complete', number: 7 }
  ];

  const currentStepData = steps.find(step => step.key === currentStep);
  const stepNumber = currentStepData?.number || 1;
  const totalSteps = steps.length - 1; // Exclude success step from total

  // Get available days based on business hours
  const getAvailableDays = (): Date[] => {
    if (!salon?.businessHours) return [];
    
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (currentWeekOffset * 7));
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours;
      
      if (salon.businessHours[dayName]?.isOpen) {
        days.push(date);
      }
    }
    
    return days;
  };

  // Generate time slots for a specific day
  const generateTimeSlots = (date: Date): string[] => {
    if (!salon?.businessHours || !date) return [];
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof salon.businessHours;
    const businessHour = salon.businessHours[dayName];
    
    if (!businessHour?.isOpen) return [];
    
    const slots = [];
    const [openHour, openMinute] = businessHour.open.split(':').map(Number);
    const [closeHour, closeMinute] = businessHour.close.split(':').map(Number);
    
    let currentHour = openHour;
    let currentMinute = openMinute;
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }
    
    return slots;
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (timeSlot: string, date: Date, staffId?: string): boolean => {
    if (!bookingState.selectedService || !date) return false;
    
    const serviceData = services.find(s => s.id === bookingState.selectedService);
    if (!serviceData) return false;

    let availableEmployees = employees.filter(employee => 
      employee.services.includes(serviceData.name)
    );

    // If staff is specified and not "any", check only that staff member
    if (staffId && staffId !== 'any') {
      availableEmployees = availableEmployees.filter(emp => emp.id === staffId);
    }
    
    if (availableEmployees.length === 0) return false;
    
    const [hours, minutes] = timeSlot.split(':');
    const slotTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(hours), parseInt(minutes));
    const slotEndTime = new Date(slotTime.getTime() + getDurationInMinutes(serviceData.duration) * 60000);
    
    return availableEmployees.some(employee => {
      const employeeBookings = bookings.filter(booking => {
        const bookingService = services.find(s => s.name === booking.service);
        if (!bookingService) return false;
        
        if (!employee.services.includes(booking.service)) return false;
        
        const bookingTime = booking.time.toDate();
        const bookingEndTime = new Date(bookingTime.getTime() + getDurationInMinutes(bookingService.duration) * 60000);
        
        const bookingDate = new Date(bookingTime.getFullYear(), bookingTime.getMonth(), bookingTime.getDate());
        const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        if (bookingDate.getTime() !== selectedDateOnly.getTime()) return false;
        
        return (slotTime < bookingEndTime && slotEndTime > bookingTime);
      });
      
      return employeeBookings.length === 0;
    });
  };

  // Get available staff for selected service
  const getAvailableStaff = (): Employee[] => {
    if (!bookingState.selectedService) return [];
    
    const serviceData = services.find(s => s.id === bookingState.selectedService);
    if (!serviceData) return [];
    
    return employees.filter(employee => 
      employee.services.includes(serviceData.name)
    );
  };

  useEffect(() => {
    if (salonId) {
      loadSalonData();
    } else {
      setError('No salon ID provided');
      setLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    if (bookingState.selectedDate && salonId) {
      loadBookingsForDate(bookingState.selectedDate);
    }
  }, [bookingState.selectedDate, salonId]);

  async function loadSalonData() {
    try {
      setLoading(true);
      setError('');
      
      if (!salonId) {
        setError('Invalid salon ID');
        return;
      }
      
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

  const navigateToStep = (step: BookingStep, direction: 'forward' | 'backward' = 'forward') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentStep(step);
    
    // Scroll to top when navigating to a new step
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Announce step change for screen readers
    const announcement = direction === 'forward' 
      ? `Moving to ${steps.find(s => s.key === step)?.title}` 
      : `Going back to ${steps.find(s => s.key === step)?.title}`;
    
    if (typeof window !== 'undefined') {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      
      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }
    
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const handleAutoProgression = (nextStep: BookingStep, delay = 350) => {
    setTimeout(() => {
      navigateToStep(nextStep, 'forward');
    }, delay);
  };

  const handleServiceSelect = (serviceId: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedService: serviceId,
      selectedTime: null, // Clear time when service changes
      selectedStaff: null // Clear staff when service changes
    }));
    
    handleAutoProgression('date');
  };

  const handleDateSelect = (date: Date) => {
    setBookingState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: null // Clear time when date changes
    }));
    
    handleAutoProgression('time');
  };

  const handleTimeSelect = (time: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedTime: time
    }));
    
    // Check if staff selection should be skipped based on salon settings
    if (salon?.hideStaffSelection) {
      // Skip staff selection and go directly to info
      setBookingState(prev => ({
        ...prev,
        selectedStaff: 'any' // Default to any available staff
      }));
      handleAutoProgression('info');
    } else {
      handleAutoProgression('staff');
    }
  };

  const handleStaffSelect = (staffId: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedStaff: staffId
    }));
    
    handleAutoProgression('info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingState(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [name]: value
      }
    }));
  };

  const handleBackNavigation = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      navigateToStep(previousStep.key, 'backward');
    } else {
      navigate('/');
    }
  };

  const confirmBooking = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      
      if (!salonId || !bookingState.selectedService || !bookingState.selectedTime || !bookingState.selectedDate) {
        console.error('Missing booking information');
        return;
      }
      
      if (!isTimeSlotAvailable(bookingState.selectedTime, bookingState.selectedDate, bookingState.selectedStaff || undefined)) {
        alert('Sorry, this time slot is no longer available. Please select a different time.');
        return;
      }
      
      const [hours, minutes] = bookingState.selectedTime.split(':');
      const bookingDateTime = new Date(bookingState.selectedDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const selectedServiceData = services.find(s => s.id === bookingState.selectedService);
      
      if (!selectedServiceData) {
        console.error('Selected service not found');
        return;
      }
      
      await createBooking(salonId, {
        name: bookingState.customerInfo.name,
        phone: bookingState.customerInfo.phone,
        service: selectedServiceData.name,
        time: Timestamp.fromDate(bookingDateTime)
      }, { status: 'pending' });
      
      clearSession();
      navigateToStep('success');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorStyles = () => {
    if (!salon) return {};
    
    return {
      primaryColor: salon.brandPrimaryColor || '#4f46e5',
      primaryColorLight: `${salon.brandPrimaryColor || '#4f46e5'}20`,
      secondaryColor: salon.brandSecondaryColor || '#f97316',
      secondaryColorLight: `${salon.brandSecondaryColor || '#f97316'}20`,
    };
  };

  const colors = getColorStyles();

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (salon) {
      document.documentElement.style.setProperty('--primary-color', salon.brandPrimaryColor || '#4f46e5');
      document.documentElement.style.setProperty('--primary-color-light', `${salon.brandPrimaryColor || '#4f46e5'}20`);
    }
    
    return () => {
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--primary-color-light');
    };
  }, [salon]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salon information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
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

  const selectedServiceDetails = services.find(service => service.id === bookingState.selectedService);
  const selectedStaffDetails = employees.find(emp => emp.id === bookingState.selectedStaff);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Progress Bar */}
      {currentStep !== 'success' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleBackNavigation}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="text-center">
                <h1 className="text-lg font-semibold text-gray-900">{currentStepData?.title}</h1>
              </div>
              
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="h-2 rounded-full"
                style={{ backgroundColor: colors.primaryColor }}
                initial={{ width: 0 }}
                animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="min-h-screen"
            style={{ paddingTop: currentStep !== 'success' ? '88px' : '0' }}
          >
            {/* Service Selection Step */}
            {currentStep === 'service' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: colors.primaryColorLight }}
                    >
                      {salon.logoUrl ? (
                        <img 
                          src={salon.logoUrl} 
                          alt={salon.name} 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span style={{ color: colors.primaryColor }} className="text-2xl font-bold">
                          {salon.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{salon.name}</h2>
                    <p className="text-gray-600">Choose your service</p>
                  </div>

                  <div className="space-y-3" role="radiogroup" aria-label="Select a service">
                    {services.map((service) => (
                      <motion.button
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          bookingState.selectedService === service.id
                            ? 'border-current bg-current/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: bookingState.selectedService === service.id ? colors.primaryColor : undefined,
                          backgroundColor: bookingState.selectedService === service.id ? colors.primaryColorLight : undefined
                        }}
                        whileTap={{ scale: 0.98 }}
                        role="radio"
                        aria-checked={bookingState.selectedService === service.id}
                        aria-label={`${service.name}, ${typeof service.price === 'number' ? `${service.price} JOD` : service.price}, ${typeof service.duration === 'number' ? `${service.duration} minutes` : service.duration}`}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                        <p className="text-gray-600">{typeof service.price === 'number' ? `${service.price} JOD` : service.price} • {typeof service.duration === 'number' ? `${service.duration} min` : service.duration}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection Step */}
            {currentStep === 'date' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pick a date</h2>
                    <p className="text-gray-600">{selectedServiceDetails?.name} • {typeof selectedServiceDetails?.duration === 'number' ? `${selectedServiceDetails?.duration} min` : selectedServiceDetails?.duration}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {getAvailableDays().slice(0, 8).map((date) => {
                      const isSelected = bookingState.selectedDate?.toDateString() === date.toDateString();
                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(today.getDate() + 1);
                      
                      const isToday = date.toDateString() === today.toDateString();
                      const isTomorrow = date.toDateString() === tomorrow.toDateString();
                      
                      return (
                        <motion.button
                          key={date.toISOString()}
                          onClick={() => handleDateSelect(date)}
                          className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                            isSelected
                              ? 'border-current bg-current/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            borderColor: isSelected ? colors.primaryColor : undefined,
                            backgroundColor: isSelected ? colors.primaryColorLight : undefined
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="text-sm text-gray-600 mb-1">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.getDate()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {getAvailableDays().length > 8 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Show more dates
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time Selection Step */}
            {currentStep === 'time' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose time</h2>
                    <p className="text-gray-600">
                      {selectedServiceDetails?.name} • {bookingState.selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  {bookingState.selectedDate && (
                    <div className="grid grid-cols-3 gap-3">
                      {generateTimeSlots(bookingState.selectedDate).map((time) => {
                        const isAvailable = isTimeSlotAvailable(time, bookingState.selectedDate!);
                        const isSelected = bookingState.selectedTime === time;
                        
                        return (
                          <motion.button
                            key={time}
                            onClick={() => isAvailable && handleTimeSelect(time)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                              !isAvailable
                                ? 'border-gray-100 bg-gray-50 text-gray-400'
                                : isSelected
                                ? 'border-current bg-current/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{
                              borderColor: isSelected && isAvailable ? colors.primaryColor : undefined,
                              backgroundColor: isSelected && isAvailable ? colors.primaryColorLight : undefined
                            }}
                            whileTap={isAvailable ? { scale: 0.98 } : undefined}
                          >
                            <span className="font-medium">{time}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Selection Step */}
            {currentStep === 'staff' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose staff member</h2>
                    <p className="text-gray-600">
                      {selectedServiceDetails?.name} • {bookingState.selectedDate?.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {bookingState.selectedTime}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Any Staff Option */}
                    <motion.button
                      onClick={() => handleStaffSelect('any')}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        bookingState.selectedStaff === 'any'
                          ? 'border-current bg-current/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: bookingState.selectedStaff === 'any' ? colors.primaryColor : undefined,
                        backgroundColor: bookingState.selectedStaff === 'any' ? colors.primaryColorLight : undefined
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Any Available Staff</h3>
                          <p className="text-gray-600">We'll assign the best available staff member</p>
                        </div>
                      </div>
                    </motion.button>

                    {/* Individual Staff Members */}
                    {getAvailableStaff().map((staff) => (
                      <motion.button
                        key={staff.id}
                        onClick={() => handleStaffSelect(staff.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          bookingState.selectedStaff === staff.id
                            ? 'border-current bg-current/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: bookingState.selectedStaff === staff.id ? colors.primaryColor : undefined,
                          backgroundColor: bookingState.selectedStaff === staff.id ? colors.primaryColorLight : undefined
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {staff.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                            <p className="text-gray-600">
                              {staff.services.length} service{staff.services.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Info Step */}
            {currentStep === 'info' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your details</h2>
                    <p className="text-gray-600">We'll send you a confirmation</p>
                  </div>

                  <div className="space-y-6">
                    <Input
                      label="Full Name"
                      name="name"
                      value={bookingState.customerInfo.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="text-lg"
                    />
                    
                    <Input
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={bookingState.customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      className="text-lg"
                    />

                    <Button
                      onClick={() => {
                        if (bookingState.customerInfo.name && bookingState.customerInfo.phone) {
                          navigateToStep('confirm');
                        } else {
                          alert('Please fill in all required fields');
                        }
                      }}
                      disabled={!bookingState.customerInfo.name || !bookingState.customerInfo.phone}
                      className="w-full h-12 text-lg"
                      style={{ backgroundColor: colors.primaryColor }}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirm' && (
              <div className="p-4 pb-24">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm your booking</h2>
                    <p className="text-gray-600">Please review your appointment details</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-8 mx-auto max-w-sm">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                        <p className="text-lg font-semibold text-gray-900">{selectedServiceDetails?.name}</p>
                        <p className="text-gray-600">{typeof selectedServiceDetails?.price === 'number' ? `${selectedServiceDetails?.price} JOD` : selectedServiceDetails?.price} • {typeof selectedServiceDetails?.duration === 'number' ? `${selectedServiceDetails?.duration} min` : selectedServiceDetails?.duration}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {bookingState.selectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-gray-600">at {bookingState.selectedTime}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Staff</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {bookingState.selectedStaff === 'any' ? 'Any Available Staff' : selectedStaffDetails?.name}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Contact</h3>
                        <p className="text-lg font-semibold text-gray-900">{bookingState.customerInfo.name}</p>
                        <p className="text-gray-600">{bookingState.customerInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl mb-8 mx-auto max-w-sm"
                    style={{ backgroundColor: colors.primaryColorLight }}
                  >
                    <p className="text-sm text-gray-700">
                      By confirming this booking, you agree to our cancellation policy. 
                      Please arrive 5 minutes before your appointment time.
                    </p>
                  </div>

                  <div className="max-w-sm mx-auto">
                    <Button
                      onClick={confirmBooking}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      className="w-full h-12 text-lg"
                      style={{ backgroundColor: colors.primaryColor }}
                    >
                      {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Success Step */}
            {currentStep === 'success' && (
              <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-md mx-auto"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-8">
                    Your appointment has been booked successfully. We've sent a confirmation to your phone.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Service</h3>
                        <p className="font-semibold text-gray-900">{selectedServiceDetails?.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                        <p className="font-semibold text-gray-900">
                          {bookingState.selectedDate?.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {bookingState.selectedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/')}
                    className="w-full h-12 text-lg"
                    style={{ backgroundColor: colors.primaryColor }}
                  >
                    Return to Home
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ARIA Live Region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  );
}