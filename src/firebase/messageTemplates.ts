import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface MessageTemplate {
  id: string;
  type: string;
  name: string;
  template: string;
  salonId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Initialize message templates for a new salon
export async function initializeMessageTemplates(salonId: string): Promise<void> {
  try {
    if (!salonId) throw new Error('Salon ID is required');
    
    console.log('Initializing message templates for salon:', salonId);
    
    // Check if templates already exist for this salon
    const templatesRef = collection(db, `salons/${salonId}/messageTemplates`);
    const existingTemplates = await getDocs(templatesRef);
    
    if (!existingTemplates.empty) {
      console.log('Templates already exist for this salon');
      return;
    }
    
    // Create default templates
    const defaultTemplates = [
      {
        type: 'booking_confirmation',
        name: 'Booking Confirmation',
        template: 'Hi {{name}}, your appointment for {{service}} has been confirmed for {{time}}. We look forward to seeing you at our salon!',
        salonId,
        createdAt: serverTimestamp()
      },
      {
        type: 'booking_reminder_12h',
        name: 'Reminder (12 hours before)',
        template: 'Hi {{name}}, this is a reminder that your appointment for {{service}} is tomorrow at {{time}}. Please let us know if you need to reschedule.',
        salonId,
        createdAt: serverTimestamp()
      },
      {
        type: 'booking_reminder_1h',
        name: 'Reminder (1 hour before)',
        template: 'Hi {{name}}, your appointment for {{service}} is in 1 hour at {{time}}. We look forward to seeing you soon!',
        salonId,
        createdAt: serverTimestamp()
      },
      {
        type: 'booking_review',
        name: 'Review Request',
        template: 'Hi {{name}}, thank you for visiting our salon! We hope you enjoyed your {{service}}. We would appreciate if you could take a moment to leave us a review.',
        salonId,
        createdAt: serverTimestamp()
      }
    ];
    
    for (const template of defaultTemplates) {
      const templateRef = doc(templatesRef);
      await setDoc(templateRef, template);
    }
    
    console.log('Default templates created for salon:', salonId);
  } catch (error) {
    console.error('Error initializing message templates:', error);
    throw error;
  }
}

// Get all message templates for a salon
export async function getMessageTemplates(salonId: string): Promise<MessageTemplate[]> {
  try {
    if (!salonId) {
      console.error('Salon ID is required to get message templates');
      return [];
    }
    
    console.log('Getting message templates for salon:', salonId);
    const templatesRef = collection(db, `salons/${salonId}/messageTemplates`);
    const q = query(templatesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const templates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageTemplate[];
    
    console.log('Found templates:', templates.length);
    return templates;
  } catch (error) {
    console.error('Error getting message templates:', error);
    throw error;
  }
}

// Get a template by type for a specific salon
export async function getTemplateByType(salonId: string, type: string): Promise<MessageTemplate | null> {
  try {
    if (!salonId || !type) return null;
    
    console.log('Getting template by type:', type, 'for salon:', salonId);
    const templatesRef = collection(db, `salons/${salonId}/messageTemplates`);
    const q = query(templatesRef, where('type', '==', type), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Template not found');
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as MessageTemplate;
  } catch (error) {
    console.error('Error getting template by type:', error);
    throw error;
  }
}

// Get a specific template
export async function getMessageTemplate(salonId: string, templateId: string): Promise<MessageTemplate | null> {
  try {
    if (!salonId || !templateId) return null;
    
    console.log('Getting template:', templateId, 'for salon:', salonId);
    const templateDoc = await getDoc(doc(db, `salons/${salonId}/messageTemplates`, templateId));
    if (!templateDoc.exists()) {
      console.log('Template not found');
      return null;
    }
    return { 
      id: templateDoc.id, 
      ...templateDoc.data() 
    } as MessageTemplate;
  } catch (error) {
    console.error('Error getting message template:', error);
    throw error;
  }
}

// Update a template
export async function updateMessageTemplate(
  salonId: string,
  templateId: string, 
  template: string
): Promise<void> {
  try {
    if (!salonId || !templateId) throw new Error('Salon ID and Template ID are required');
    
    console.log('Updating template:', templateId, 'for salon:', salonId);
    const templateRef = doc(db, `salons/${salonId}/messageTemplates`, templateId);
    
    // Check if template exists
    const templateDoc = await getDoc(templateRef);
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }
    
    await updateDoc(templateRef, {
      template,
      updatedAt: serverTimestamp()
    });
    
    console.log('Template updated successfully');
  } catch (error) {
    console.error('Error updating message template:', error);
    throw error;
  }
} 