// Export Firebase app, auth, and firestore
export { firebaseApp } from './config';
export { auth, db, storage } from './firebase';

// Export initialization function
export { initializeFirestore } from './initializeFirestore';

// Export salon-related functions
export {
  getSalon,
  createSalon,
  updateSalon,
  getUserSalons,
  slugifySalonName,
  updateSalonMapping,
  getSalonIdFromSlug,
  deleteSalon,
  deleteUserAccount,
  type Salon,
  type SalonMapping
} from './salons';

// Export service-related functions
export {
  getSalonServices,
  getService,
  createService,
  updateService,
  deleteService,
  createDefaultServices,
  type Service
} from './services';

// Export employee-related functions
export {
  getSalonEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addServiceToEmployee,
  removeServiceFromEmployee,
  syncServiceWithEmployees,
  removeServiceFromAllEmployees,
  updateServiceNameForEmployees,
  type Employee
} from './employees';

// Export booking-related functions
export {
  getSalonBookings,
  getBookingsByDate,
  getBooking,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  type Booking
} from './bookings';

// Export message template functions
export {
  getMessageTemplates,
  getTemplateByType,
  getMessageTemplate,
  updateMessageTemplate,
  type MessageTemplate
} from './messageTemplates';

// Export utility for salon ID extraction
export { getSalonId } from '../utils/getSalonId'; 