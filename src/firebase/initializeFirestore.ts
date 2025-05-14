import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { initializeMessageTemplates } from './messageTemplates';

/**
 * Initializes Firestore collections if they don't exist
 * This ensures we have the base structure in place
 */
export async function initializeFirestore(userId: string): Promise<void> {
  try {
    console.log('Initializing Firestore for user:', userId);
    
    // Check if the user exists in Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      console.log('Creating user document');
      await setDoc(userRef, {
        uid: userId,
        role: 'salon',
        createdAt: serverTimestamp()
      });
    }

    // Check if salons collection exists for this user
    const salonsQuery = query(
      collection(db, 'salons'),
      where('createdBy', '==', userId),
      limit(1)
    );
    const salonsSnapshot = await getDocs(salonsQuery);
    let salonId: string;

    // Create default salon if none exists for this user
    if (salonsSnapshot.empty) {
      console.log('Creating default salon for user');
      const salonRef = doc(collection(db, 'salons'));
      salonId = salonRef.id;
      
      await setDoc(salonRef, {
        name: 'Your Salon',
        createdBy: userId,
        brandPrimaryColor: '#4f46e5',
        brandSecondaryColor: '#f97316',
        logoUrl: '',
        defaultServicesCreated: false,
        createdAt: serverTimestamp()
      });
      
      // Create the basic collections for this salon
      
      // Services collection (sub-collection of salon)
      const servicesRef = collection(db, `salons/${salonId}/services`);
      
      const defaultServices = [
        { name: 'Manicure', duration: 30, price: 25 },
        { name: 'Pedicure', duration: 45, price: 35 },
        { name: 'Nail Polish', duration: 15, price: 15 },
        { name: 'Full Set', duration: 60, price: 50 }
      ];
      
      console.log('Creating default services');
      for (const service of defaultServices) {
        await setDoc(doc(servicesRef), {
          ...service,
          createdAt: serverTimestamp()
        });
      }
      
      // Update salon to mark default services as created
      await setDoc(doc(db, 'salons', salonId), {
        defaultServicesCreated: true
      }, { merge: true });
      
      // Explicitly create bookings collection (sub-collection of salon)
      const bookingsRef = collection(db, `salons/${salonId}/bookings`);
      // Add a sample booking to ensure the collection exists
      const sampleBookingRef = doc(bookingsRef);
      await setDoc(sampleBookingRef, {
        name: 'Sample Client',
        phone: '555-123-4567',
        service: 'Manicure',
        time: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // tomorrow
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Initialize message templates for this salon
      await initializeMessageTemplates(salonId);
    } else {
      // Get the existing salon for this user
      salonId = salonsSnapshot.docs[0].id;
      
      // Initialize message templates for this salon
      await initializeMessageTemplates(salonId);
    }

    // Initialize inquiries collection if it doesn't exist
    collection(db, 'inquiries');
    
    // Initialize notifications logs collection if it doesn't exist
    collection(db, 'notifications/logs');

    console.log('Firestore initialization complete');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
} 