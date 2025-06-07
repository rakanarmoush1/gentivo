import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  staffAssigned?: string; // Employee ID or 'any' for any available staff
  paymentStatus?: 'paid' | 'unpaid';
}

// Get all bookings for a salon
export async function getSalonBookings(salonId: string): Promise<Booking[]> {
  try {
    if (!salonId) return [];
    
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
    if (!salonId) return [];
    
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
    if (!salonId || !bookingId) return null;
    
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
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>,
  options?: { status?: 'pending' | 'confirmed' | 'cancelled' }
): Promise<string> {
  try {
    if (!salonId) throw new Error('Salon ID is required');
    
    console.log('Creating booking for salon:', salonId, 'with data:', bookingData);
    
    // Ensure the salon exists first
    const salonRef = doc(db, 'salons', salonId);
    const salonDoc = await getDoc(salonRef);
    
    if (!salonDoc.exists()) {
      throw new Error(`Salon with ID ${salonId} does not exist`);
    }
    
    // Create the booking document
    const bookingsRef = collection(db, `salons/${salonId}/bookings`);
    
    const bookingToCreate = {
      ...bookingData,
      status: options?.status || 'confirmed', // Default to confirmed unless specified
      createdAt: serverTimestamp()
    };
    
    // Use doc + setDoc instead of addDoc to avoid potential issues
    const newBookingRef = doc(bookingsRef);
    await setDoc(newBookingRef, bookingToCreate);
    
    // Log the notification
    try {
      const notificationData = {
        salonId,
        bookingId: newBookingRef.id,
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
        messageType: 'booking_created',
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'notifications', 'logs'), notificationData);
    } catch (notificationError) {
      console.error('Error creating notification log:', notificationError);
      // Continue even if notification fails
    }
    
    return newBookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// Update a booking status
export async function updateBookingStatus(
  salonId: string, 
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  try {
    if (!salonId || !bookingId) throw new Error('Salon ID and Booking ID are required');
    
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
    try {
      await addDoc(collection(db, 'notifications/logs'), {
        salonId,
        bookingId,
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
        messageType: `booking_${status}`,
        timestamp: serverTimestamp()
      });
    } catch (notificationError) {
      console.error('Error creating notification log:', notificationError);
      // Continue even if notification fails
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

// Delete a booking
export async function deleteBooking(salonId: string, bookingId: string): Promise<void> {
  try {
    if (!salonId || !bookingId) throw new Error('Salon ID and Booking ID are required');
    
    console.log(`Deleting booking ${bookingId} from salon ${salonId}`);
    
    const bookingRef = doc(db, `salons/${salonId}/bookings`, bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    // Delete the booking
    await deleteDoc(bookingRef);
    
    console.log(`Booking ${bookingId} successfully deleted`);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

// Update a booking's details (for rescheduling, etc.)
export async function updateBooking(
  salonId: string, 
  bookingId: string, 
  data: Partial<Omit<Booking, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    if (!salonId || !bookingId) throw new Error('Salon ID and Booking ID are required');
    
    const bookingRef = doc(db, `salons/${salonId}/bookings`, bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      throw new Error('Booking not found');
    }
    
    await updateDoc(bookingRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
} 