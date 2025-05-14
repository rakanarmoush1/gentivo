import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  time: Timestamp;
  createdAt: Timestamp;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Get all bookings for a salon
export async function getSalonBookings(salonId: string): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, `salons/${salonId}/bookings`);
    const q = query(bookingsRef, orderBy('time', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting salon bookings:', error);
    throw error;
  }
}

// Get bookings for a specific date
export async function getBookingsByDate(salonId: string, date: Date): Promise<Booking[]> {
  try {
    // Create start and end dates (midnight to midnight)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const bookingsRef = collection(db, `salons/${salonId}/bookings`);
    const q = query(
      bookingsRef,
      where('time', '>=', Timestamp.fromDate(startDate)),
      where('time', '<=', Timestamp.fromDate(endDate)),
      orderBy('time')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings by date:', error);
    throw error;
  }
}

// Get a specific booking
export async function getBooking(salonId: string, bookingId: string): Promise<Booking | null> {
  try {
    const bookingDoc = await getDoc(doc(db, `salons/${salonId}/bookings`, bookingId));
    if (!bookingDoc.exists()) {
      return null;
    }
    return { 
      id: bookingDoc.id, 
      ...bookingDoc.data() 
    } as Booking;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw error;
  }
}

// Create a new booking
export async function createBooking(
  salonId: string, 
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  try {
    const bookingsRef = collection(db, `salons/${salonId}/bookings`);
    const newBooking = await addDoc(bookingsRef, {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Log the notification in the notifications collection
    await addDoc(collection(db, 'notifications/logs'), {
      salonId,
      bookingId: newBooking.id,
      customerName: bookingData.name,
      customerPhone: bookingData.phone,
      messageType: 'booking_created',
      timestamp: serverTimestamp()
    });
    
    return newBooking.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// Update a booking status
export async function updateBookingStatus(
  salonId: string, 
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<void> {
  try {
    const bookingRef = doc(db, `salons/${salonId}/bookings`, bookingId);
    
    // Get the booking to include in notification
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    const bookingData = bookingDoc.data() as Omit<Booking, 'id'>;
    
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    // Log the notification in the notifications collection
    await addDoc(collection(db, 'notifications/logs'), {
      salonId,
      bookingId,
      customerName: bookingData.name,
      customerPhone: bookingData.phone,
      messageType: `booking_${status}`,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
} 