import { useState } from 'react';
import { Upload, Plus, Minus, Palette, Image, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export default function BrandingPage() {
  const [salonInfo, setSalonInfo] = useState({
    name: 'Elegance Nail Spa',
    logo: 'https://images.pexels.com/photos/114977/pexels-photo-114977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    address: '123 Rainbow St, Amman, Jordan',
    phone: '+962 79 123 4567',
    primaryColor: '#F9A8D4',
    accentColor: '#5EEAD4'
  });
  
  const [services, setServices] = useState<Service[]>([
    { id: 'service1', name: 'Classic Manicure', duration: 30, price: 15 },
    { id: 'service2', name: 'Gel Manicure', duration: 45, price: 25 },
    { id: 'service3', name: 'Classic Pedicure', duration: 45, price: 20 },
    { id: 'service4', name: 'Gel Pedicure', duration: 60, price: 30 },
    { id: 'service5', name: 'Nail Art', duration: 30, price: 15 },
    { id: 'service6', name: 'Full Set Acrylic', duration: 90, price: 50 }
  ]);
  
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', isOpen: true },
    tuesday: { open: '09:00', close: '18:00', isOpen: true },
    wednesday: { open: '09:00', close: '18:00', isOpen: true },
    thursday: { open: '09:00', close: '18:00', isOpen: true },
    friday: { open: '09:00', close: '18:00', isOpen: true },
    saturday: { open: '10:00', close: '16:00', isOpen: true },
    sunday: { open: '10:00', close: '16:00', isOpen: false }
  });
  
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    duration: 30,
    price: 0
  });
  
  const [bookingUrl, setBookingUrl] = useState('elegance.gentivo.ai');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalonInfo({
      ...salonInfo,
      [name]: value
    });
  };
  
  const handleNewServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: name === 'name' ? value : Number(value)
    });
  };
  
  const addService = () => {
    if (newService.name && newService.duration > 0 && newService.price > 0) {
      const newId = `service${services.length + 1}`;
      setServices([...services, { ...newService, id: newId }]);
      setNewService({ name: '', duration: 30, price: 0 });
    }
  };
  
  const removeService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
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
  
  const saveChanges = () => {
    // In a real app, save to Firebase
    console.log('Salon info:', salonInfo);
    console.log('Services:', services);
    console.log('Business hours:', businessHours);
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salon Branding</h1>
        <p className="text-gray-600">Customize your salon's appearance and services</p>
      </div>
      
      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-center">
          <Check className="h-5 w-5 mr-2 text-green-600" />
          <span>Your changes have been saved successfully!</span>
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
              <div className="flex items-center">
                {salonInfo.logo && (
                  <img 
                    src={salonInfo.logo} 
                    alt="Salon Logo" 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                )}
                <div className="flex-grow">
                  <Input
                    name="logo"
                    value={salonInfo.logo}
                    onChange={handleInfoChange}
                    placeholder="Enter logo URL or upload"
                  />
                </div>
                <button className="ml-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Upload className="h-5 w-5 text-gray-500" />
                </button>
              </div>
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
                  <div 
                    className="w-8 h-8 rounded mr-2 border shadow-sm" 
                    style={{ backgroundColor: salonInfo.primaryColor }}
                  ></div>
                  <Input
                    name="primaryColor"
                    type="text"
                    value={salonInfo.primaryColor}
                    onChange={handleInfoChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded mr-2 border shadow-sm" 
                    style={{ backgroundColor: salonInfo.accentColor }}
                  ></div>
                  <Input
                    name="accentColor"
                    type="text"
                    value={salonInfo.accentColor}
                    onChange={handleInfoChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking URL and Preview */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Booking URL</h2>
            
            <div className="space-y-4">
              <Input
                label="Custom Booking URL"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                helperText="This is the URL customers will use to book appointments"
              />
              
              <div className="pt-2">
                <Button className="w-full">
                  Generate Booking Page
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Salon Preview</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <div className="bg-white p-3 rounded-full">
                  <Image className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{salonInfo.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{salonInfo.address}</p>
                <Button 
                  className="w-full text-sm" 
                  size="sm"
                  style={{ backgroundColor: salonInfo.primaryColor }}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services */}
        <div className="md:col-span-3 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Services</h2>
          
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center border rounded-md p-3">
                <div className="flex-grow">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-600">
                    {service.duration} min • ${service.price}
                  </div>
                </div>
                <button 
                  onClick={() => removeService(service.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            <div className="border rounded-md p-3 border-dashed">
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <input
                    name="name"
                    value={newService.name}
                    onChange={handleNewServiceChange}
                    placeholder="Service name"
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </div>
                <div>
                  <input
                    name="duration"
                    type="number"
                    value={newService.duration || ''}
                    onChange={handleNewServiceChange}
                    placeholder="Min"
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </div>
                <div>
                  <input
                    name="price"
                    type="number"
                    value={newService.price || ''}
                    onChange={handleNewServiceChange}
                    placeholder="Price"
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={addService}
                    className="p-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Business Hours */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Business Hours</h2>
          
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
      
      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="mr-3">
          Cancel
        </Button>
        <Button onClick={saveChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}