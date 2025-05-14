import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { createBooking, Service, getSalonServices } from '../../firebase';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  onBookingAdded: () => void;
}

export default function AddBookingModal({ 
  isOpen, 
  onClose, 
  salonId,
  onBookingAdded
}: AddBookingModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      loadServices();
      
      // Reset form
      setName('');
      setPhone('');
      setServiceId('');
      setDate('');
      setTime('');
      setError('');
    }
  }, [isOpen, salonId]);
  
  async function loadServices() {
    try {
      setServicesLoading(true);
      const servicesData = await getSalonServices(salonId);
      setServices(servicesData);
      
      // Pre-select the first service if available
      if (servicesData.length > 0 && !serviceId) {
        setServiceId(servicesData[0].id);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setServicesLoading(false);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name || !phone || !serviceId || !date || !time) {
      setError('All fields are required');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the date and time
      const dateTime = new Date(`${date}T${time}`);
      
      if (isNaN(dateTime.getTime())) {
        setError('Invalid date or time format');
        setLoading(false);
        return;
      }
      
      // Get the selected service name
      const selectedService = services.find(s => s.id === serviceId);
      
      if (!selectedService) {
        setError('Selected service not found');
        setLoading(false);
        return;
      }
      
      // Create the booking
      await createBooking(salonId, {
        name,
        phone: phone.replace(/\D/g, ''), // Strip non-digits
        service: selectedService.name,
        time: Timestamp.fromDate(dateTime)
      });
      
      // Close the modal and notify parent
      onClose();
      onBookingAdded();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Booking" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <Input
          label="Customer Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter customer name"
          required
        />
        
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={servicesLoading}
          >
            {servicesLoading ? (
              <option value="">Loading services...</option>
            ) : (
              <>
                <option value="">Select a service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration} mins)
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Today or later
            required
          />
          
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        
        <div className="!mt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Booking
          </Button>
        </div>
      </form>
    </Modal>
  );
} 