export type PaymentStatus = 'PAID' | 'PENDING' | 'EXEMPT' | 'FAILED';
export type BedStatus = 'AVAILABLE' | 'ASSIGNED' | 'RESERVED';
export type ApartmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HOUSING_MANAGER' | 'RECEPTION_STAFF';
export type ScreenAccessLevel = 'NONE' | 'VIEW' | 'EDIT';

export interface ScreenPermissions {
  shluchim: ScreenAccessLevel;
  apartments: ScreenAccessLevel;
  placement: ScreenAccessLevel;
  reception: ScreenAccessLevel;
  emails: ScreenAccessLevel;
  users: ScreenAccessLevel;
  settings?: ScreenAccessLevel;
  messages?: ScreenAccessLevel;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  screenAccess: ScreenPermissions;
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Shliach {
  id: string;
  // Personal & Shlichus details
  firstName: string;
  lastName: string;
  hebrewName: string;
  email: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  passportOrId: string;
  
  // Dates & Requests
  arrivalDate: string; // ISO date or YYYY-MM-DD
  arrivalTime?: string;
  departureDate: string;
  departureTime?: string;
  preferredRoommates?: string;
  specialRequests?: string;

  // Payment
  paymentStatus: PaymentStatus;
  amountPaid: number;
  currency: string;
  stripePaymentIntentId?: string;
  paidAt?: string;

  // Placement & Accommodation
  apartmentId?: string | null;
  apartmentName?: string;
  apartmentAddress?: string;
  bedId?: string | null;
  bedNumber?: number;
  receptionVisible: boolean; // whether placement details are published to reception/guest

  // Check-In & Admin Flags
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  blockCheckIn: boolean; // stops check-in, requires management attention
  blockReason?: string;
  adminNotes?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface Apartment {
  id: string;
  apartmentNumber: string; // e.g. "דירה 12 - קינגסטון 770"
  address: string;
  wazeUrl?: string;
  entryCode?: string;
  floor?: string;
  hasElevator?: boolean;
  totalBeds: number;
  managerName?: string;
  managerPhone?: string;
  mapImageUrl?: string;
  scheduledClosureDate?: string;
  status: ApartmentStatus;
  createdAt?: string;
}

export interface Bed {
  id: string;
  apartmentId: string;
  bedNumber: number;
  roomName?: string;
  status: BedStatus;
  currentShliachId?: string | null;
  currentShliachName?: string | null;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateName?: string;
  bodyPreview?: string;
  sentAt: string;
  sentBy?: string;
  status: 'SENT' | 'FAILED';
  errorMessage?: string;
}

export interface DashboardStats {
  totalRegistered: number;
  totalPaid: number;
  totalPlaced: number;
  totalCheckedIn: number;
  totalApartments: number;
  totalBeds: number;
  availableBeds: number;
  blockedGuests: number;
}

export interface FormSettings {
  isOpen: boolean;
  closedMessageHe?: string;
  closedMessageEn?: string;
  allowedArrivalDates?: string[];
  allowedDepartureDates?: string[];
  siteUrl?: string;
  baseUrl?: string;
  authorizedDomain?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  reply?: string;
  replyText?: string;
  repliedAt?: string;
  repliedBy?: string;
}
