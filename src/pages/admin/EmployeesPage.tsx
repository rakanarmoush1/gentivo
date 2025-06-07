import { useState, useEffect } from 'react';
import { Plus, X, Search, Check, Edit } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { 
  getSalonEmployees, 
  getSalonServices,
  createEmployee, 
  updateEmployee,
  deleteEmployee,
  Service as FirestoreService, 
  Employee as FirestoreEmployee 
} from '../../firebase';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
}

interface Service {
  id: string;
  name: string;
}

interface EmployeesPageProps {
  salonId: string;
}

export default function EmployeesPage({ salonId }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    services: [] as string[]
  });
  
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    services: [] as string[]
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
      
      // Load employees
      const employeeData = await getSalonEmployees(salonId);
      
      setEmployees(employeeData.map(employee => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        services: employee.services
      })));
      
      // Load services for the dropdown selection
      const serviceData = await getSalonServices(salonId);
      
      setServices(serviceData.map(service => ({
        id: service.id,
        name: service.name
      })));
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load employees or services');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditEmployee(prev => ({
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
  
  const toggleEditService = (serviceName: string) => {
    setEditEmployee(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };
  
  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      services: employee.services
    });
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
    setEditEmployee({ name: '', email: '', phone: '', services: [] });
  };
  
  const addEmployee = async () => {
    try {
      // Add to Firestore
      const employeeId = await createEmployee(salonId, {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        services: newEmployee.services
      });
      
      // Update local state
      setEmployees([...employees, { ...newEmployee, id: employeeId }]);
      setNewEmployee({ name: '', email: '', phone: '', services: [] });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };
  
  const removeEmployee = async (id: string) => {
    try {
      // Remove from Firestore
      await deleteEmployee(salonId, id);
      
      // Update local state
    setEmployees(employees.filter(employee => employee.id !== id));
    } catch (error) {
      console.error('Error removing employee:', error);
      alert('Failed to remove employee');
    }
  };
  
  const updateEmployeeData = async () => {
    if (!editingEmployee) return;
    
    try {
      // Update in Firestore
      await updateEmployee(salonId, editingEmployee.id, {
        name: editEmployee.name,
        email: editEmployee.email,
        phone: editEmployee.phone,
        services: editEmployee.services
      });
      
      // Update local state
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...editEmployee }
          : emp
      ));
      
      closeEditModal();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    }
  };
  
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <div className="flex w-full sm:w-auto gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => (
          <div key={employee.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gray-100 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
                {employee.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => openEditModal(employee)}
                  className="p-1 bg-white rounded-full text-gray-400 hover:text-blue-500"
                  title="Edit employee"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeEmployee(employee.id)}
                  className="p-1 bg-white rounded-full text-gray-400 hover:text-red-500"
                  title="Delete employee"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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
        closable={true}
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
              disabled={!newEmployee.name || !newEmployee.email || !newEmployee.phone || newEmployee.services.length === 0}
            >
              Add Employee
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit employee modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Employee"
        closable={true}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={editEmployee.name}
            onChange={handleEditInputChange}
            placeholder="Enter employee name"
            required
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={editEmployee.email}
            onChange={handleEditInputChange}
            placeholder="Enter email address"
            required
          />
          
          <Input
            label="Phone"
            name="phone"
            value={editEmployee.phone}
            onChange={handleEditInputChange}
            placeholder="Enter phone number"
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
                    onClick={() => toggleEditService(service.name)}
                    className={`flex items-center justify-between w-full p-2 rounded-md border ${
                      editEmployee.services.includes(service.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span>{service.name}</span>
                    {editEmployee.services.includes(service.name) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              onClick={updateEmployeeData}
              disabled={!editEmployee.name || !editEmployee.email || !editEmployee.phone || editEmployee.services.length === 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}