import { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

// Suggested services that can be quickly added
const suggestedServices = [
  { name: 'Classic Manicure', duration: 30, price: 15, description: 'Basic nail care and polish' },
  { name: 'Gel Manicure', duration: 45, price: 25, description: 'Long-lasting gel polish application' },
  { name: 'Classic Pedicure', duration: 45, price: 20, description: 'Foot care and regular polish' },
  { name: 'Gel Pedicure', duration: 60, price: 30, description: 'Foot care with gel polish' },
  { name: 'Nail Art', duration: 30, price: 15, description: 'Custom nail designs' },
  { name: 'Full Set Acrylic', duration: 90, price: 50, description: 'Full acrylic nail application' }
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Classic Manicure', duration: 30, price: 15, description: 'Basic nail care and polish' },
    { id: '2', name: 'Gel Manicure', duration: 45, price: 25, description: 'Long-lasting gel polish application' }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestedModalOpen, setIsSuggestedModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value
    }));
  };
  
  const addService = () => {
    const id = (services.length + 1).toString();
    setServices([...services, { ...newService, id }]);
    setNewService({ name: '', duration: 30, price: 0, description: '' });
    setIsAddModalOpen(false);
  };
  
  const addSuggestedService = (service: Omit<Service, 'id'>) => {
    const id = (services.length + 1).toString();
    setServices([...services, { ...service, id }]);
  };
  
  const deleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };
  
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Manage your salon's service offerings</p>
      </div>
      
      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-full"
            placeholder="Search services"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSuggestedModalOpen(true)}>
            Add from Suggested
          </Button>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-5 w-5 mr-1" />
            Add Custom Service
          </Button>
        </div>
      </div>
      
      {/* Services list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredServices.map(service => (
            <div key={service.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{service.duration} minutes</span>
                    <span className="text-sm font-medium text-gray-900">${service.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteService(service.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No services found
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom service modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service"
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            name="name"
            value={newService.name}
            onChange={handleInputChange}
            placeholder="Enter service name"
            required
          />
          
          <Input
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={newService.duration}
            onChange={handleInputChange}
            placeholder="Enter duration in minutes"
            required
          />
          
          <Input
            label="Price ($)"
            name="price"
            type="number"
            value={newService.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              placeholder="Enter service description"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addService} disabled={!newService.name || !newService.duration || !newService.price}>
              Add Service
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Add from suggested modal */}
      <Modal
        isOpen={isSuggestedModalOpen}
        onClose={() => setIsSuggestedModalOpen(false)}
        title="Add from Suggested Services"
      >
        <div className="space-y-4">
          {suggestedServices.map((service, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
              onClick={() => {
                addSuggestedService(service);
                setIsSuggestedModalOpen(false);
              }}
            >
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-600">{service.duration} minutes</span>
                <span className="text-sm font-medium text-gray-900">${service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}