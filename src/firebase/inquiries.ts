import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  salonId?: string;
  createdAt: Timestamp;
}

// Create a new inquiry
export async function createInquiry(inquiryData: Omit<Inquiry, 'id' | 'createdAt'>): Promise<string> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const newInquiry = await addDoc(inquiriesRef, {
      ...inquiryData,
      createdAt: serverTimestamp()
    });
    
    return newInquiry.id;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
}

// Get all inquiries
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Inquiry[];
  } catch (error) {
    console.error('Error getting inquiries:', error);
    throw error;
  }
}

// Get inquiries for a specific salon
export async function getSalonInquiries(salonId: string): Promise<Inquiry[]> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    const q = query(
      inquiriesRef,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filter for salon inquiries client-side
    // This is because we might not have a salonId for all inquiries
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as Inquiry)
      .filter(inquiry => inquiry.salonId === salonId);
  } catch (error) {
    console.error('Error getting salon inquiries:', error);
    throw error;
  }
}

// Get a specific inquiry
export async function getInquiry(inquiryId: string): Promise<Inquiry | null> {
  try {
    const inquiryDoc = await getDoc(doc(db, 'inquiries', inquiryId));
    if (!inquiryDoc.exists()) {
      return null;
    }
    return { 
      id: inquiryDoc.id, 
      ...inquiryDoc.data() 
    } as Inquiry;
  } catch (error) {
    console.error('Error getting inquiry:', error);
    throw error;
  }
} 