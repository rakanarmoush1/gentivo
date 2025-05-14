import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Initializes Firestore collections if they don't exist
 * This ensures we have the base structure in place
 */
export async function initializeFirestore(userId: string): Promise<void> {
  try {
    // Check if the user exists in Firestore
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: userId,
        role: 'salon',
        createdAt: serverTimestamp()
      });
    }

    // Check if salons collection exists
    const salonsRef = collection(db, 'salons');
    const salonsQuery = query(salonsRef, limit(1));
    const salonsSnapshot = await getDocs(salonsQuery);

    // Create default salon if none exists for this user
    if (salonsSnapshot.empty) {
      const salonRef = doc(collection(db, 'salons'));
      
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
      const servicesRef = collection(db, `salons/${salonRef.id}/services`);
      
      const defaultServices = [
        { name: 'Manicure', duration: 30, price: 25 },
        { name: 'Pedicure', duration: 45, price: 35 },
        { name: 'Nail Polish', duration: 15, price: 15 },
        { name: 'Full Set', duration: 60, price: 50 }
      ];
      
      for (const service of defaultServices) {
        await setDoc(doc(servicesRef), {
          ...service,
          createdAt: serverTimestamp()
        });
      }
      
      // Update salon to mark default services as created
      await setDoc(doc(db, 'salons', salonRef.id), {
        defaultServicesCreated: true
      }, { merge: true });
      
      // Create empty bookings collection (sub-collection of salon)
      collection(db, `salons/${salonRef.id}/bookings`);
    }

    // Initialize notification templates collection if it doesn't exist
    const templatesRef = collection(db, 'messageTemplates');
    const templatesQuery = query(templatesRef, limit(1));
    const templatesSnapshot = await getDocs(templatesQuery);

    if (templatesSnapshot.empty) {
      // Create default templates
      const defaultTemplates = [
        {
          type: 'booking_confirmation',
          name: 'Booking Confirmation',
          template: 'Hi {{name}}, your appointment for {{service}} has been confirmed for {{time}}. We look forward to seeing you at our salon!',
          createdAt: serverTimestamp()
        },
        {
          type: 'booking_reminder_12h',
          name: 'Reminder (12 hours before)',
          template: 'Hi {{name}}, this is a reminder that your appointment for {{service}} is tomorrow at {{time}}. Please let us know if you need to reschedule.',
          createdAt: serverTimestamp()
        },
        {
          type: 'booking_reminder_1h',
          name: 'Reminder (1 hour before)',
          template: 'Hi {{name}}, your appointment for {{service}} is in 1 hour at {{time}}. We look forward to seeing you soon!',
          createdAt: serverTimestamp()
        },
        {
          type: 'booking_review',
          name: 'Review Request',
          template: 'Hi {{name}}, thank you for visiting our salon! We hope you enjoyed your {{service}}. We would appreciate if you could take a moment to leave us a review.',
          createdAt: serverTimestamp()
        }
      ];

      for (const template of defaultTemplates) {
        await setDoc(doc(templatesRef), template);
      }
    }

    // Initialize inquiries collection if it doesn't exist
    collection(db, 'inquiries');
    
    // Initialize notifications logs collection if it doesn't exist
    collection(db, 'notifications/logs');

  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
} 