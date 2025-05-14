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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Salon {
  id: string;
  name: string;
  createdBy: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  logoUrl: string;
  defaultServicesCreated: boolean;
  createdAt: Timestamp;
}

// Get a salon by ID
export async function getSalon(salonId: string): Promise<Salon | null> {
  try {
    const salonDoc = await getDoc(doc(db, 'salons', salonId));
    if (!salonDoc.exists()) {
      return null;
    }
    return { 
      id: salonDoc.id, 
      ...salonDoc.data() 
    } as Salon;
  } catch (error) {
    console.error('Error getting salon:', error);
    throw error;
  }
}

// Create a new salon
export async function createSalon(userId: string, salonData: Partial<Salon>): Promise<string> {
  try {
    // Create a reference to a new document with auto-generated ID
    const salonRef = doc(collection(db, 'salons'));
    
    await setDoc(salonRef, {
      name: salonData.name || 'New Salon',
      createdBy: userId,
      brandPrimaryColor: salonData.brandPrimaryColor || '#4f46e5',
      brandSecondaryColor: salonData.brandSecondaryColor || '#f97316',
      logoUrl: salonData.logoUrl || '',
      defaultServicesCreated: false,
      createdAt: serverTimestamp()
    });
    
    return salonRef.id;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error;
  }
}

// Update salon data
export async function updateSalon(salonId: string, data: Partial<Salon>): Promise<void> {
  try {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error;
  }
}

// Get salons created by a user
export async function getUserSalons(userId: string): Promise<Salon[]> {
  try {
    const q = query(collection(db, 'salons'), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Salon[];
  } catch (error) {
    console.error('Error getting user salons:', error);
    throw error;
  }
} 