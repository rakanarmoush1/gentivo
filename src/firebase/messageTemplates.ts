import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
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
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Get all message templates
export async function getMessageTemplates(): Promise<MessageTemplate[]> {
  try {
    const templatesRef = collection(db, 'messageTemplates');
    const q = query(templatesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageTemplate[];
  } catch (error) {
    console.error('Error getting message templates:', error);
    throw error;
  }
}

// Get a template by type
export async function getTemplateByType(type: string): Promise<MessageTemplate | null> {
  try {
    const templatesRef = collection(db, 'messageTemplates');
    const q = query(templatesRef, where('type', '==', type), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
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
export async function getMessageTemplate(templateId: string): Promise<MessageTemplate | null> {
  try {
    const templateDoc = await getDoc(doc(db, 'messageTemplates', templateId));
    if (!templateDoc.exists()) {
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
  templateId: string, 
  template: string
): Promise<void> {
  try {
    const templateRef = doc(db, 'messageTemplates', templateId);
    await updateDoc(templateRef, {
      template,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating message template:', error);
    throw error;
  }
} 