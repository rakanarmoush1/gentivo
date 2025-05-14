// Export Firebase app, auth, and firestore
export { firebaseApp } from './config';
export { auth, db } from './firebase';

// Export salon-related functions
export {
  getSalon,
  createSalon,
  updateSalon,
  getUserSalons,
  type Salon
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

// Export booking-related functions
export {
  getSalonBookings,
  getBookingsByDate,
  getBooking,
  createBooking,
  updateBookingStatus,
  type Booking
} from './bookings';

// Export inquiry-related functions
export {
  createInquiry,
  getInquiries,
  getSalonInquiries,
  getInquiry,
  type Inquiry
} from './inquiries';

// Export utility for salon ID extraction
export { getSalonId } from '../utils/getSalonId'; 