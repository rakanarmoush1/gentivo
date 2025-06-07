import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  Timestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { deleteUser } from 'firebase/auth';

// Types
export interface Salon {
  id: string;
  name: string;
  createdBy: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  logoUrl: string;
  address?: string;
  phone?: string;
  defaultServicesCreated: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  businessHours?: Record<string, { open: string; close: string; isOpen: boolean }>;
  hideStaffSelection?: boolean;
}

// Get a salon by ID
export async function getSalon(salonId: string): Promise<Salon | null> {
  try {
    if (!salonId) return null;
    
    console.log('Getting salon with ID:', salonId);
    const salonDoc = await getDoc(doc(db, 'salons', salonId));
    if (!salonDoc.exists()) {
      console.log('Salon not found');
      return null;
    }
    
    const salonData = { 
      id: salonDoc.id, 
      ...salonDoc.data() 
    } as Salon;
    
    console.log('Salon data:', salonData);
    return salonData;
  } catch (error) {
    console.error('Error getting salon:', error);
    throw error;
  }
}

// Create a new salon
export async function createSalon(userId: string, salonData: Partial<Salon>): Promise<string> {
  try {
    if (!userId) throw new Error('User ID is required to create a salon');
    
    // Create a reference to a new document with auto-generated ID
    const salonRef = doc(collection(db, 'salons'));
    
    const newSalon = {
      name: salonData.name || 'New Salon',
      createdBy: userId,
      brandPrimaryColor: salonData.brandPrimaryColor || '#4f46e5',
      brandSecondaryColor: salonData.brandSecondaryColor || '#f97316',
      logoUrl: salonData.logoUrl || '',
      defaultServicesCreated: false,
      createdAt: serverTimestamp()
    };
    
    console.log('Creating salon:', newSalon);
    await setDoc(salonRef, newSalon);
    
    return salonRef.id;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
}

// Update salon data
export async function updateSalon(salonId: string, data: Partial<Salon>): Promise<void> {
  try {
    if (!salonId) throw new Error('Salon ID is required');
    
    // Remove id from the data to prevent updating it
    const { id, createdAt, ...updateData } = data as any;
    
    console.log('Updating salon:', salonId, 'with data:', updateData);
    
    const salonRef = doc(db, 'salons', salonId);
    
    // Check if salon exists
    const salonDoc = await getDoc(salonRef);
    if (!salonDoc.exists()) {
      throw new Error(`Salon with ID ${salonId} does not exist`);
    }
    
    // Update the salon with the provided data and add updatedAt timestamp
    await updateDoc(salonRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Salon updated successfully');
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error;
  }
}

// Get salons created by a user
export async function getUserSalons(userId: string): Promise<Salon[]> {
  try {
    if (!userId) return [];
    
    console.log('Getting salons for user:', userId);
    const q = query(collection(db, 'salons'), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const salons = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Salon[];
    
    console.log('Found salons:', salons.length);
    return salons;
  } catch (error) {
    console.error('Error getting user salons:', error);
    throw error;
  }
}

// Utility function to create a URL-friendly slug from a salon name
export const slugifySalonName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Interface for salon mappings
export interface SalonMapping {
  slug: string;  // e.g., "salonname"
  salonId: string;  // e.g., "Rqc7SP8BSoR5iHGuzpJJ"
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Update or create a salon mapping for a given salon name and ID
export async function updateSalonMapping(salonName: string, salonId: string): Promise<void> {
  try {
    const slug = slugifySalonName(salonName);
    console.log(`Creating/updating mapping: ${slug} -> ${salonId}`);
    
    await setDoc(doc(db, 'salonMappings', slug), {
      slug,
      salonId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating salon mapping:', error);
    throw error;
  }
}

// Get a salon ID from a slug
export async function getSalonIdFromSlug(slug: string): Promise<string | null> {
  try {
    console.log(`Looking up salon ID for slug: ${slug}`);
    const mappingDoc = await getDoc(doc(db, 'salonMappings', slug));
    
    if (!mappingDoc.exists()) {
      console.log(`No mapping found for slug: ${slug}`);
      return null;
    }
    
    const mapping = mappingDoc.data() as SalonMapping;
    console.log(`Found mapping: ${slug} -> ${mapping.salonId}`);
    return mapping.salonId;
  } catch (error) {
    console.error('Error getting salon ID from slug:', error);
    throw error;
  }
}

// Delete a salon and all its related data
export async function deleteSalon(salonId: string): Promise<void> {
  try {
    if (!salonId) throw new Error('Salon ID is required');
    
    console.log('Deleting salon:', salonId);
    
    // Step 1: Get the salon to check if it exists and get its name for mapping
    const salonRef = doc(db, 'salons', salonId);
    const salonDoc = await getDoc(salonRef);
    
    if (!salonDoc.exists()) {
      throw new Error(`Salon with ID ${salonId} does not exist`);
    }
    
    const salonData = salonDoc.data() as Salon;
    const slug = slugifySalonName(salonData.name);
    
    // Create a batch for deleting related collections
    const batch = writeBatch(db);
    
    // Step 2: Delete all services of the salon
    const servicesQuery = query(collection(db, 'services'), where('salonId', '==', salonId));
    const servicesSnapshot = await getDocs(servicesQuery);
    servicesSnapshot.forEach(serviceDoc => {
      batch.delete(serviceDoc.ref);
    });
    
    // Step 3: Delete all employees of the salon
    const employeesQuery = query(collection(db, 'employees'), where('salonId', '==', salonId));
    const employeesSnapshot = await getDocs(employeesQuery);
    employeesSnapshot.forEach(employeeDoc => {
      batch.delete(employeeDoc.ref);
    });
    
    // Step 4: Delete all bookings of the salon
    const bookingsQuery = query(collection(db, 'bookings'), where('salonId', '==', salonId));
    const bookingsSnapshot = await getDocs(bookingsQuery);
    bookingsSnapshot.forEach(bookingDoc => {
      batch.delete(bookingDoc.ref);
    });
    
    // Step 5: Delete all message templates of the salon
    const templatesQuery = query(collection(db, 'messageTemplates'), where('salonId', '==', salonId));
    const templatesSnapshot = await getDocs(templatesQuery);
    templatesSnapshot.forEach(templateDoc => {
      batch.delete(templateDoc.ref);
    });
    
    // Step 6: Delete the salon mapping
    const mappingRef = doc(db, 'salonMappings', slug);
    const mappingDoc = await getDoc(mappingRef);
    if (mappingDoc.exists()) {
      batch.delete(mappingRef);
    }
    
    // Commit the batch operations
    await batch.commit();
    
    // Step 7: Finally delete the salon itself
    await deleteDoc(salonRef);
    
    console.log('Salon and all related data deleted successfully');
  } catch (error) {
    console.error('Error deleting salon:', error);
    throw error;
  }
}

// Delete a salon and all its related data, plus the user account
export async function deleteUserAccount(userId: string, salonId: string): Promise<void> {
  try {
    if (!userId || !salonId) throw new Error('User ID and Salon ID are required');
    
    console.log('Deleting salon and user account:', salonId, userId);
    
    // Step 1: Delete the salon using the existing function
    await deleteSalon(salonId);
    
    // Step 2: Delete the user from Firestore
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
    
    // Step 3: Delete the Firebase Auth user
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await deleteUser(currentUser);
    } else {
      console.warn('Could not delete the authentication record: current user mismatch');
    }
    
    console.log('User account and salon deleted successfully');
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
} 