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