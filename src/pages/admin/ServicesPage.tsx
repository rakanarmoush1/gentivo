import { useState, useEffect } from 'react';
import { Plus, X, Search, Check, User, Edit, ToggleLeft, ToggleRight, GripVertical, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { ToastContainer } from '../../components/common/Toast';
import { 
  getSalonServices, 
  getSalonEmployees,
  createService, 
  updateService,
  deleteService, 
  Service as FirestoreService,
  Employee as FirestoreEmployee,
  syncServiceWithEmployees,
  removeServiceFromAllEmployees,
  updateServiceNameForEmployees
} from '../../firebase';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  assignedEmployees: string[];
  isActive?: boolean;
  displayOrder?: number;
}

interface Employee {
  id: string;
  name: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSuggestedModalOpen, setIsSuggestedModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedService, setDraggedService] = useState<Service | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const [newService, setNewService] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    assignedEmployees: [] as string[],
    isActive: true
  });
  
  const [editService, setEditService] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    assignedEmployees: [] as string[],
    isActive: true
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
      const formattedServices = salonServices.map((service, index) => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        description: service.description || '',
        assignedEmployees: service.assignedEmployees || [],
        isActive: service.isActive !== undefined ? service.isActive : true,
        displayOrder: service.displayOrder !== undefined ? service.displayOrder : index
      }));
      
      // Sort by display order
      formattedServices.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
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

  const toggleServiceActive = async (service: Service) => {
    try {
      const newActiveState = !service.isActive;
      await updateService(salonId, service.id, { isActive: newActiveState });
      
      setServices(prev => prev.map(s => 
        s.id === service.id ? { ...s, isActive: newActiveState } : s
      ));
      
      showNotification(
        `Service ${newActiveState ? 'activated' : 'deactivated'} successfully`, 
        'success'
      );
    } catch (error) {
      console.error('Error toggling service active state:', error);
      showNotification('Failed to update service status', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, service: Service) => {
    setDraggedService(service);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetService: Service) => {
    e.preventDefault();
    
    if (!draggedService || draggedService.id === targetService.id) {
      setDraggedService(null);
      return;
    }

    try {
      const newServices = [...services];
      const draggedIndex = newServices.findIndex(s => s.id === draggedService.id);
      const targetIndex = newServices.findIndex(s => s.id === targetService.id);
      
      // Remove dragged service and insert at target position
      const [removed] = newServices.splice(draggedIndex, 1);
      newServices.splice(targetIndex, 0, removed);
      
      // Update display orders
      const updatedServices = newServices.map((service, index) => ({
        ...service,
        displayOrder: index
      }));
      
      setServices(updatedServices);
      
      // Update in Firebase
      const updatePromises = updatedServices.map(service => 
        updateService(salonId, service.id, { displayOrder: service.displayOrder })
      );
      
      await Promise.all(updatePromises);
      showNotification('Service order updated successfully', 'success');
      
    } catch (error) {
      console.error('Error reordering services:', error);
      showNotification('Failed to update service order', 'error');
      // Reload data to reset order
      loadData();
    }
    
    setDraggedService(null);
  };

  const openDeleteModal = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setServiceToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      // Remove service from all employee records first
      await removeServiceFromAllEmployees(salonId, serviceToDelete.name);
      
      // Then delete the service itself
      await deleteService(salonId, serviceToDelete.id);
      
      // Notify other components that service assignments changed
      window.dispatchEvent(new CustomEvent('serviceAssignmentChanged'));
      
      setServices(services.filter(service => service.id !== serviceToDelete.id));
      showNotification('Service deleted successfully and removed from all staff', 'success');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting service:', error);
      showNotification('Failed to delete service', 'error');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value
    }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditService(prev => ({
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
  
  const toggleEditEmployee = (employeeId: string) => {
    setEditService(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId]
    }));
  };
  
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditService({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description,
      assignedEmployees: service.assignedEmployees,
      isActive: service.isActive !== undefined ? service.isActive : true
    });
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingService(null);
    setEditService({ 
      name: '', 
      duration: 30, 
      price: 0, 
      description: '', 
      assignedEmployees: [],
      isActive: true 
    });
  };
  
  const addService = async () => {
    try {
      // Add to Firestore
      const serviceId = await createService(salonId, {
        name: newService.name,
        duration: newService.duration,
        price: newService.price,
        description: newService.description,
        assignedEmployees: newService.assignedEmployees,
        isActive: newService.isActive,
        displayOrder: services.length
      });
      
      // Sync service assignments with employee records
      if (newService.assignedEmployees.length > 0) {
        await syncServiceWithEmployees(
          salonId,
          newService.name,
          newService.assignedEmployees,
          [] // No previous assignments for new service
        );
        
        // Notify other components that service assignments changed
        window.dispatchEvent(new CustomEvent('serviceAssignmentChanged'));
      }
      
      // Update local state
      const newServiceData = { 
        ...newService, 
        id: serviceId,
        displayOrder: services.length
      };
      setServices([...services, newServiceData]);
      setNewService({ 
        name: '', 
        duration: 30, 
        price: 0, 
        description: '', 
        assignedEmployees: [],
        isActive: true
      });
      setIsAddModalOpen(false);
      showNotification('Service added successfully and assigned to staff', 'success');
    } catch (error) {
      console.error('Error adding service:', error);
      showNotification('Failed to add service', 'error');
    }
  };
  
  const addSuggestedService = async (service: Omit<Service, 'id' | 'assignedEmployees' | 'isActive' | 'displayOrder'>) => {
    try {
      // Add to Firestore
      const serviceId = await createService(salonId, {
        name: service.name,
        duration: service.duration,
        price: service.price,
        description: service.description,
        assignedEmployees: [],
        isActive: true,
        displayOrder: services.length
      });
      
      // Note: Suggested services start with no employee assignments
      // Users can assign them later through the edit modal
      
      // Update local state
      const newServiceData = { 
        ...service, 
        id: serviceId, 
        assignedEmployees: [],
        isActive: true,
        displayOrder: services.length
      };
      setServices([...services, newServiceData]);
      setIsSuggestedModalOpen(false);
      showNotification('Service added successfully - assign staff in the edit menu', 'success');
    } catch (error) {
      console.error('Error adding suggested service:', error);
      showNotification('Failed to add service', 'error');
    }
  };
  
  const updateServiceData = async () => {
    if (!editingService) return;
    
    try {
      const oldServiceName = editingService.name;
      const newServiceName = editService.name;
      const nameChanged = oldServiceName !== newServiceName;
      
      // Update in Firestore
      await updateService(salonId, editingService.id, {
        name: editService.name,
        duration: editService.duration,
        price: editService.price,
        description: editService.description,
        assignedEmployees: editService.assignedEmployees,
        isActive: editService.isActive
      });
      
      // Handle service name change
      if (nameChanged) {
        await updateServiceNameForEmployees(
          salonId,
          oldServiceName,
          newServiceName,
          editService.assignedEmployees
        );
      }
      
      // Sync service assignments with employee records
      await syncServiceWithEmployees(
        salonId,
        newServiceName,
        editService.assignedEmployees,
        editingService.assignedEmployees
      );
      
      // Notify other components that service assignments changed
      window.dispatchEvent(new CustomEvent('serviceAssignmentChanged'));
      
      // Update local state
      setServices(services.map(service => 
        service.id === editingService.id 
          ? { ...service, ...editService }
          : service
      ));
      
      closeEditModal();
      showNotification('Service updated successfully and staff assignments synced', 'success');
    } catch (error) {
      console.error('Error updating service:', error);
      showNotification('Failed to update service', 'error');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-300 mx-auto mb-4"></div>
        <p className="text-stone-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="font-light">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-6">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Services</h1>
        <p className="text-stone-600 font-light">Manage your salon's service offerings</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200/60 text-red-800 rounded-xl p-4 mb-6">
          {error}
        </div>
      )}
      
      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400 w-full font-light placeholder:text-stone-400"
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
            <div 
              key={service.id} 
              className={`p-6 transition-colors ${service.isActive ? '' : 'bg-gray-50 opacity-75'}`}
              draggable
              onDragStart={(e) => handleDragStart(e, service)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, service)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="cursor-move text-gray-400 hover:text-gray-600 mt-1">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-medium ${service.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {service.name}
                      </h3>
                      <button
                        onClick={() => toggleServiceActive(service)}
                        className={`transition-colors ${
                          service.isActive 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                        title={service.isActive ? 'Deactivate service' : 'Activate service'}
                      >
                        {service.isActive ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    
                    <p className={`text-sm mt-1 ${service.isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {service.description}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`text-sm ${service.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                        {service.duration} minutes
                      </span>
                      <span className={`text-sm font-medium ${service.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {service.price} JOD
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(service)}
                    className="text-stone-400 hover:text-stone-600 transition-colors duration-200"
                    title="Edit service"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(service)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete service"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {searchQuery ? 'No services match your search' : 'No services found'}
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom service modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service"
        closable={true}
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
            label="Price (JOD)"
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
              className="mt-1 block w-full rounded-lg border-stone-300 focus:border-stone-400 focus:ring focus:ring-stone-300 focus:ring-opacity-50 font-light"
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
                          ? 'border-stone-300 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{employee.name}</span>
                      {newService.assignedEmployees.includes(employee.id) && (
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
            <Button onClick={addService} disabled={!newService.name || !newService.duration || !newService.price}>
              Add Service
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit service modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Service"
        closable={true}
      >
        <div className="space-y-4">
          <Input
            label="Service Name"
            name="name"
            value={editService.name}
            onChange={handleEditInputChange}
            placeholder="Enter service name"
            required
          />
          
          <Input
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={editService.duration}
            onChange={handleEditInputChange}
            placeholder="Enter duration in minutes"
            required
          />
          
          <Input
            label="Price (JOD)"
            name="price"
            type="number"
            value={editService.price}
            onChange={handleEditInputChange}
            placeholder="Enter price"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editService.description}
              onChange={handleEditInputChange}
              rows={3}
              className="mt-1 block w-full rounded-lg border-stone-300 focus:border-stone-400 focus:ring focus:ring-stone-300 focus:ring-opacity-50 font-light"
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
                      onClick={() => toggleEditEmployee(employee.id)}
                      className={`flex items-center justify-between w-full p-2 rounded-md border ${
                        editService.assignedEmployees.includes(employee.id)
                          ? 'border-stone-300 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span>{employee.name}</span>
                      {editService.assignedEmployees.includes(employee.id) && (
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
            <Button onClick={updateServiceData} disabled={!editService.name || !editService.duration || !editService.price}>
              Update Service
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Suggested services modal */}
      <Modal
        isOpen={isSuggestedModalOpen}
        onClose={() => setIsSuggestedModalOpen(false)}
        title="Add from Suggested Services"
        size="lg"
        closable={true}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose from our curated list of popular salon services to quickly add to your offerings.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {suggestedServices.map((service, index) => (
              <div key={index} className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-stone-900">{service.name}</h4>
                  <span className="text-sm font-medium text-stone-600">{service.price} JOD</span>
                </div>
                <p className="text-sm text-stone-600 mb-2">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500">{service.duration} minutes</span>
                  <Button
                    size="sm"
                    onClick={() => addSuggestedService(service)}
                    disabled={services.some(s => s.name === service.name)}
                  >
                    {services.some(s => s.name === service.name) ? 'Added' : 'Add Service'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setIsSuggestedModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Service"
        closable={true}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200/60 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Are you sure you want to delete this service?
              </h4>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. The service "{serviceToDelete?.name}" will be permanently removed.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}