import { useState, useEffect } from 'react';
import { Plus, X, Search, Check, User } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { 
  getSalonServices, 
  getSalonEmployees,
  createService, 
  deleteService, 
  Service as FirestoreService,
  Employee as FirestoreEmployee 
} from '../../firebase';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  assignedEmployees: string[];
}

interface Employee {
  id: string;
  name: string;
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

interface ServicesPageProps {
  salonId: string;
}

export default function ServicesPage({ salonId }: ServicesPageProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestedModalOpen, setIsSuggestedModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    assignedEmployees: [] as string[]
  });
  
  useEffect(() => {
    if (salonId) {
      loadData();
    }
  }, [salonId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load both services and employees
      const [salonServices, salonEmployees] = await Promise.all([
        getSalonServices(salonId),
        getSalonEmployees(salonId)
      ]);
      
      // Map Firestore service objects to our local service format
      const formattedServices = salonServices.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        description: service.description || '',
        assignedEmployees: service.assignedEmployees || []
      }));
      
      // Map employees to a simpler format for selection
      const formattedEmployees = salonEmployees.map(employee => ({
        id: employee.id,
        name: employee.name
      }));
      
      setServices(formattedServices);
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load services or employees');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value
    }));
  };
  
  const toggleEmployee = (employeeId: string) => {
    setNewService(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId]
    }));
  };
  
  const addService = async () => {
    try {
      // Add to Firestore
      const serviceId = await createService(salonId, {
        name: newService.name,
        duration: newService.duration,
        price: newService.price,
        description: newService.description,
        assignedEmployees: newService.assignedEmployees
      });
      
      // Update local state
      setServices([...services, { ...newService, id: serviceId }]);
      setNewService({ 
        name: '', 
        duration: 30, 
        price: 0, 
        description: '', 
        assignedEmployees: [] 
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    }
  };
  
  const addSuggestedService = async (service: Omit<Service, 'id' | 'assignedEmployees'>) => {
    try {
      // Add to Firestore
      const serviceId = await createService(salonId, {
        name: service.name,
        duration: service.duration,
        price: service.price,
        description: service.description,
        assignedEmployees: []
      });
      
      // Update local state
      setServices([...services, { ...service, id: serviceId, assignedEmployees: [] }]);
      setIsSuggestedModalOpen(false);
    } catch (error) {
      console.error('Error adding suggested service:', error);
      alert('Failed to add service');
    }
  };
  
  const removeService = async (id: string) => {
    try {
      // Remove from Firestore
      await deleteService(salonId, id);
      
      // Update local state
      setServices(services.filter(service => service.id !== id));
    } catch (error) {
      console.error('Error removing service:', error);
      alert('Failed to remove service');
    }
  };
  
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Helper function to get employee names from IDs
  const getEmployeeNames = (employeeIds: string[]): string[] => {
    return employeeIds.map(id => {
      const employee = employees.find(emp => emp.id === id);
      return employee ? employee.name : '';
    }).filter(Boolean);
  };
  
  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="text-gray-600">Manage your salon's service offerings</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      
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
                  
                  {service.assignedEmployees && service.assignedEmployees.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Assigned Staff:</h4>
                      <div className="flex flex-wrap gap-1">
                        {getEmployeeNames(service.assignedEmployees).map((name, i) => (
                          <span key={i} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <User className="h-3 w-3 mr-1" />
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeService(service.id)}
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Employees
            </label>
            {employees.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No employees available. Add employees first.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {employees.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => toggleEmployee(employee.id)}
                      className={`flex items-center justify-between w-full p-2 rounded-md border ${
                        newService.assignedEmployees.includes(employee.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <span>{employee.name}</span>
                      {newService.assignedEmployees.includes(employee.id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              onClick={() => addSuggestedService(service)}
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