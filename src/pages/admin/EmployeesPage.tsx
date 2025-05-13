import { useState } from 'react';
import { Plus, X, Search, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  image: string;
}

interface Service {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@gentivo.ai',
      phone: '+962 79 123 4567',
      services: ['Classic Manicure', 'Gel Manicure'],
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    }
  ]);
  
  const [services] = useState<Service[]>([
    { id: '1', name: 'Classic Manicure' },
    { id: '2', name: 'Gel Manicure' },
    { id: '3', name: 'Classic Pedicure' },
    { id: '4', name: 'Gel Pedicure' },
    { id: '5', name: 'Nail Art' },
    { id: '6', name: 'Full Set Acrylic' }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    services: [] as string[],
    image: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleService = (serviceName: string) => {
    setNewEmployee(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };
  
  const addEmployee = () => {
    const id = (employees.length + 1).toString();
    setEmployees([...employees, { ...newEmployee, id }]);
    setNewEmployee({ name: '', email: '', phone: '', services: [], image: '' });
    setIsAddModalOpen(false);
  };
  
  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(employee => employee.id !== id));
  };
  
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-600">Manage your salon's staff and their services</p>
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
            placeholder="Search employees"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-5 w-5 mr-1" />
          Add Employee
        </Button>
      </div>
      
      {/* Employees grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48">
              <img
                src={employee.image}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => deleteEmployee(employee.id)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.email}</p>
              <p className="text-sm text-gray-500">{employee.phone}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {employee.services.map(service => (
                    <span
                      key={service}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
      
      {/* Add employee modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={newEmployee.name}
            onChange={handleInputChange}
            placeholder="Enter employee name"
            required
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={newEmployee.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
          
          <Input
            label="Phone"
            name="phone"
            value={newEmployee.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
          
          <Input
            label="Profile Image URL"
            name="image"
            value={newEmployee.image}
            onChange={handleInputChange}
            placeholder="Enter image URL"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            <div className="space-y-2">
              {services.map(service => (
                <div
                  key={service.id}
                  className="flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => toggleService(service.name)}
                    className={`flex items-center justify-between w-full p-2 rounded-md border ${
                      newEmployee.services.includes(service.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span>{service.name}</span>
                    {newEmployee.services.includes(service.name) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={addEmployee}
              disabled={!newEmployee.name || !newEmployee.email || !newEmployee.phone || !newEmployee.image || newEmployee.services.length === 0}
            >
              Add Employee
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}