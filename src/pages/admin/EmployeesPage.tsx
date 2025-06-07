import { useState, useEffect } from 'react';
import { Plus, X, Search, Check, Edit, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { 
  getSalonEmployees, 
  getSalonServices,
  getSalonBookings,
  createEmployee, 
  updateEmployee,
  deleteEmployee,
  Service as FirestoreService, 
  Employee as FirestoreEmployee,
  Booking
} from '../../firebase';
import { isToday } from 'date-fns';

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

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface EmployeesPageProps {
  salonId: string;
}

export default function EmployeesPage({ salonId }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
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

  // Add effect to reload data when services might have changed
  useEffect(() => {
    const handleServiceSync = () => {
      loadData();
    };

    // Listen for custom events from service updates
    window.addEventListener('serviceAssignmentChanged', handleServiceSync);
    
    return () => {
      window.removeEventListener('serviceAssignmentChanged', handleServiceSync);
    };
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load employees, services, and bookings
      const [employeeData, serviceData, bookingData] = await Promise.all([
        getSalonEmployees(salonId),
        getSalonServices(salonId),
        getSalonBookings(salonId)
      ]);
      
      setEmployees(employeeData.map(employee => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        services: employee.services
      })));
      
      setServices(serviceData.map(service => ({
        id: service.id,
        name: service.name
      })));
      
      setBookings(bookingData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load employees or services');
    } finally {
      setLoading(false);
    }
  };

  // Get today's appointments for a specific employee
  const getTodayAppointments = (employeeId: string): number => {
    return bookings.filter(booking => {
      const isBookingToday = isToday(booking.time.toDate());
      const isAssignedToEmployee = booking.staffAssigned === employeeId || 
        (booking.staffAssigned === 'any' && employees.find(emp => emp.id === employeeId)?.services.includes(booking.service));
      return isBookingToday && isAssignedToEmployee && booking.status !== 'cancelled';
    }).length;
  };

  // Get working hours for today (simplified - you can enhance this with actual business hours)
  const getWorkingHours = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple logic - you can enhance this with actual salon business hours
    if (currentHour >= 9 && currentHour < 18) {
      return "Working now (9:00 AM - 6:00 PM)";
    } else if (currentHour < 9) {
      return "Starts at 9:00 AM";
    } else {
      return "Finished for today";
    }
  };

  const openDeleteModal = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setEmployeeToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployee(salonId, employeeToDelete.id);
      setEmployees(employees.filter(employee => employee.id !== employeeToDelete.id));
      showNotification('Employee deleted successfully', 'success');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showNotification('Failed to delete employee', 'error');
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
      showNotification('Employee added successfully', 'success');
    } catch (error) {
      console.error('Error adding employee:', error);
      showNotification('Failed to add employee', 'error');
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
      showNotification('Employee updated successfully', 'success');
    } catch (error) {
      console.error('Error updating employee:', error);
      showNotification('Failed to update employee', 'error');
    }
  };
  
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-300 mx-auto mb-4"></div>
        <p className="text-stone-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-light">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-stone-900 mb-2">Staff</h1>
          <p className="text-stone-600 font-light">Manage your salon's staff members</p>
        </div>
        <div className="flex w-full sm:w-auto gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type="search"
              placeholder="Search staff..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200/60 text-red-800 rounded-xl p-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(employee => {
          const todayAppointments = getTodayAppointments(employee.id);
          const workingHours = getWorkingHours();
          
          return (
            <div key={employee.id} className="bg-white rounded-xl border border-stone-200/40 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 bg-gradient-to-br from-stone-100/80 to-stone-200/60 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white shadow-lg text-stone-600 flex items-center justify-center text-3xl font-medium">
                  {employee.name.substring(0, 1).toUpperCase()}
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => openEditModal(employee)}
                    className="p-1 bg-white rounded-full text-stone-400 hover:text-stone-600 shadow-sm transition-colors duration-200"
                    title="Edit employee"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(employee)}
                    className="p-1 bg-white rounded-full text-stone-400 hover:text-red-500 shadow-sm transition-colors duration-200"
                    title="Delete employee"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-1">{employee.name}</h3>
                <p className="text-sm text-stone-500 mb-1 font-light">{employee.email}</p>
                <p className="text-sm text-stone-500 mb-4 font-light">{employee.phone}</p>
                
                {/* Today's Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-stone-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-stone-600 mr-2" />
                      <div>
                        <p className="text-xs text-stone-600 font-medium">Today's Appointments</p>
                        <p className="text-lg font-medium text-stone-900">{todayAppointments}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-stone-600 mr-2" />
                      <div>
                        <p className="text-xs text-stone-600 font-medium">Availability</p>
                        <p className="text-xs text-stone-800 font-medium">{workingHours}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Services */}
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-2">Services ({employee.services.length})</h4>
                  {employee.services.length === 0 ? (
                    <div className="text-sm text-stone-500 italic bg-stone-50 p-2 rounded font-light">
                      No services assigned yet. Assign services in the Services page.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {employee.services.slice(0, 3).map(service => {
                        // Find the actual service data to get additional info
                        const serviceData = services.find(s => s.name === service);
                        return (
                          <span
                            key={service}
                            className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium"
                            title={serviceData ? `${serviceData.name}` : service}
                          >
                            {service}
                          </span>
                        );
                      })}
                      {employee.services.length > 3 && (
                        <span 
                          className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium"
                          title={`Additional services: ${employee.services.slice(3).join(', ')}`}
                        >
                          +{employee.services.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <Search className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'No staff match your search criteria.' : 'Add your first staff member to get started.'}
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      )}
      
      {/* Add employee modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Staff Member"
        closable={true}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={newEmployee.name}
            onChange={handleInputChange}
            placeholder="Enter staff member name"
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
              Assign Services
            </label>
            {services.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No services available. Add services first.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {services.map(service => (
                  <div
                    key={service.id}
                    className="flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => toggleService(service.name)}
                      className={`flex items-center justify-between w-full p-2 rounded-md border transition-colors ${
                        newEmployee.services.includes(service.name)
                          ? 'border-stone-300 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{service.name}</span>
                      {newEmployee.services.includes(service.name) && (
                        <Check className="h-5 w-5 text-stone-600" />
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
            <Button
              onClick={addEmployee}
              disabled={!newEmployee.name || !newEmployee.email || !newEmployee.phone || newEmployee.services.length === 0}
            >
              Add Staff Member
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit employee modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Staff Member"
        closable={true}
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={editEmployee.name}
            onChange={handleEditInputChange}
            placeholder="Enter staff member name"
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
              Assign Services
            </label>
            {services.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No services available. Add services first.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                {services.map(service => (
                  <div
                    key={service.id}
                    className="flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => toggleEditService(service.name)}
                      className={`flex items-center justify-between w-full p-2 rounded-md border transition-colors ${
                        editEmployee.services.includes(service.name)
                          ? 'border-stone-300 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{service.name}</span>
                      {editEmployee.services.includes(service.name) && (
                        <Check className="h-5 w-5 text-stone-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Staff Member"
        closable={true}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200/60 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Are you sure you want to delete this staff member?
              </h4>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. "{employeeToDelete?.name}" will be permanently removed from your staff.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Staff Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}