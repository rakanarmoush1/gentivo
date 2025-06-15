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
export interface Service {
  id: string;
  name: string;
  duration: string | number; // in minutes - can be string like "30-45" or number
  price: string | number; // can be string like "25-30" or number
  description?: string;
  assignedEmployees?: string[]; // Add assigned employees
  isActive?: boolean; // Service active/inactive status
  displayOrder?: number; // Order for display/drag-and-drop
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Get all services for a salon
export async function getSalonServices(salonId: string): Promise<Service[]> {
  try {
    const servicesRef = collection(db, `salons/${salonId}/services`);
    const q = query(servicesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[];
  } catch (error) {
    console.error('Error getting salon services:', error);
    throw error;
  }
}

// Get a specific service
export async function getService(salonId: string, serviceId: string): Promise<Service | null> {
  try {
    const serviceDoc = await getDoc(doc(db, `salons/${salonId}/services`, serviceId));
    if (!serviceDoc.exists()) {
      return null;
    }
    return { 
      id: serviceDoc.id, 
      ...serviceDoc.data() 
    } as Service;
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
}

// Create a new service
export async function createService(salonId: string, serviceData: Omit<Service, 'id' | 'createdAt'>): Promise<string> {
  try {
    const servicesRef = collection(db, `salons/${salonId}/services`);
    const newService = await addDoc(servicesRef, {
      ...serviceData,
      createdAt: serverTimestamp()
    });
    
    return newService.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

// Update a service
export async function updateService(
  salonId: string, 
  serviceId: string, 
  data: Partial<Omit<Service, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const serviceRef = doc(db, `salons/${salonId}/services`, serviceId);
    await updateDoc(serviceRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

// Delete a service
export async function deleteService(salonId: string, serviceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, `salons/${salonId}/services`, serviceId));
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// Create default services for a new salon
export async function createDefaultServices(salonId: string): Promise<void> {
  try {
    const defaultServices = [
      { name: 'Manicure', duration: 30, price: 25 },
      { name: 'Pedicure', duration: 45, price: 35 },
      { name: 'Nail Polish', duration: 15, price: 15 },
      { name: 'Full Set', duration: 60, price: 50 },
      { name: 'Gel Manicure', duration: 45, price: 35 },
      { name: 'Gel Pedicure', duration: 60, price: 45 },
    ];
    
    const servicesRef = collection(db, `salons/${salonId}/services`);
    
    // Create a batch of services
    const promises = defaultServices.map(service => 
      addDoc(servicesRef, {
        ...service,
        createdAt: serverTimestamp()
      })
    );
    
    await Promise.all(promises);
    
    // Update the salon to mark default services as created
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      defaultServicesCreated: true
    });
  } catch (error) {
    console.error('Error creating default services:', error);
    throw error;
  }
} 