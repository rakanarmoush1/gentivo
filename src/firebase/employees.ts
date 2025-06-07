import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Get all employees for a salon
export async function getSalonEmployees(salonId: string): Promise<Employee[]> {
  try {
    const employeesRef = collection(db, `salons/${salonId}/employees`);
    const q = query(employeesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Employee[];
  } catch (error) {
    console.error('Error getting salon employees:', error);
    throw error;
  }
}

// Get a specific employee
export async function getEmployee(salonId: string, employeeId: string): Promise<Employee | null> {
  try {
    const employeeDoc = await getDoc(doc(db, `salons/${salonId}/employees`, employeeId));
    if (!employeeDoc.exists()) {
      return null;
    }
    return { 
      id: employeeDoc.id, 
      ...employeeDoc.data() 
    } as Employee;
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
}

// Create a new employee
export async function createEmployee(
  salonId: string, 
  employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const employeesRef = collection(db, `salons/${salonId}/employees`);
    const newEmployee = await addDoc(employeesRef, {
      ...employeeData,
      createdAt: serverTimestamp()
    });
    
    return newEmployee.id;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

// Update an employee
export async function updateEmployee(
  salonId: string, 
  employeeId: string, 
  data: Partial<Omit<Employee, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const employeeRef = doc(db, `salons/${salonId}/employees`, employeeId);
    await updateDoc(employeeRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

// Delete an employee
export async function deleteEmployee(salonId: string, employeeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, `salons/${salonId}/employees`, employeeId));
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}

// Helper function to add service to employee's service list
export async function addServiceToEmployee(
  salonId: string, 
  employeeId: string, 
  serviceName: string
): Promise<void> {
  try {
    const employee = await getEmployee(salonId, employeeId);
    if (!employee) return;
    
    if (!employee.services.includes(serviceName)) {
      const updatedServices = [...employee.services, serviceName];
      await updateEmployee(salonId, employeeId, { services: updatedServices });
    }
  } catch (error) {
    console.error('Error adding service to employee:', error);
    throw error;
  }
}

// Helper function to remove service from employee's service list
export async function removeServiceFromEmployee(
  salonId: string, 
  employeeId: string, 
  serviceName: string
): Promise<void> {
  try {
    const employee = await getEmployee(salonId, employeeId);
    if (!employee) return;
    
    const updatedServices = employee.services.filter(service => service !== serviceName);
    await updateEmployee(salonId, employeeId, { services: updatedServices });
  } catch (error) {
    console.error('Error removing service from employee:', error);
    throw error;
  }
}

// Helper function to sync service assignments with employee records
export async function syncServiceWithEmployees(
  salonId: string,
  serviceName: string,
  assignedEmployeeIds: string[],
  previouslyAssignedEmployeeIds: string[] = []
): Promise<void> {
  try {
    // Add service to newly assigned employees
    const employeesToAdd = assignedEmployeeIds.filter(id => !previouslyAssignedEmployeeIds.includes(id));
    const addPromises = employeesToAdd.map(employeeId => 
      addServiceToEmployee(salonId, employeeId, serviceName)
    );
    
    // Remove service from employees who are no longer assigned
    const employeesToRemove = previouslyAssignedEmployeeIds.filter(id => !assignedEmployeeIds.includes(id));
    const removePromises = employeesToRemove.map(employeeId => 
      removeServiceFromEmployee(salonId, employeeId, serviceName)
    );
    
    await Promise.all([...addPromises, ...removePromises]);
  } catch (error) {
    console.error('Error syncing service with employees:', error);
    throw error;
  }
}

// Helper function to remove a service from all employees when service is deleted
export async function removeServiceFromAllEmployees(
  salonId: string,
  serviceName: string
): Promise<void> {
  try {
    const employees = await getSalonEmployees(salonId);
    const promises = employees
      .filter(employee => employee.services.includes(serviceName))
      .map(employee => removeServiceFromEmployee(salonId, employee.id, serviceName));
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error removing service from all employees:', error);
    throw error;
  }
}

// Helper function to update employee service names when service name changes
export async function updateServiceNameForEmployees(
  salonId: string,
  oldServiceName: string,
  newServiceName: string,
  assignedEmployeeIds: string[]
): Promise<void> {
  try {
    const promises = assignedEmployeeIds.map(async (employeeId) => {
      const employee = await getEmployee(salonId, employeeId);
      if (!employee) return;
      
      const serviceIndex = employee.services.indexOf(oldServiceName);
      if (serviceIndex !== -1) {
        const updatedServices = [...employee.services];
        updatedServices[serviceIndex] = newServiceName;
        await updateEmployee(salonId, employeeId, { services: updatedServices });
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error updating service name for employees:', error);
    throw error;
  }
} 