import { Shliach, Apartment, Bed, UserProfile, EmailTemplate } from "@/types";

export const INITIAL_SHLUCHIM: Shliach[] = [
  {
    id: "shliach-1",
    firstName: "מנחם מענדל",
    lastName: "רובין",
    hebrewName: "הרב מנחם מענדל רובין",
    email: "rubin@chabadparis.fr",
    phone: "+33612345678",
    country: "צרפת",
    city: "פריז",
    passportOrId: "FR9876543",
    arrivalDate: "2026-11-18",
    arrivalTime: "14:00",
    departureDate: "2026-11-23",
    departureTime: "11:00",
    preferredRoommates: "לוי סגל",
    specialRequests: "קומה נמוכה אם אפשר",
    paymentStatus: "PAID",
    amountPaid: 180,
    currency: "USD",
    apartmentId: "apt-1",
    apartmentName: "דירה 1 - מונטגומרי 740",
    apartmentAddress: "740 Montgomery St, Brooklyn, NY",
    bedId: "bed-1-1",
    bedNumber: 1,
    receptionVisible: true,
    checkedIn: true,
    checkedInAt: "2026-11-18T14:30:00Z",
    checkedInBy: "דייל יוסי",
    blockCheckIn: false,
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "shliach-2",
    firstName: "יוסף יצחק",
    lastName: "גרינברג",
    hebrewName: "הרב יוסף יצחק גרינברג",
    email: "greenberg@chabadalaska.org",
    phone: "+19075551234",
    country: "ארה״ב",
    state: "אלסקה",
    city: "אנקורג'",
    passportOrId: "US123456789",
    arrivalDate: "2026-11-19",
    arrivalTime: "10:30",
    departureDate: "2026-11-23",
    departureTime: "18:00",
    preferredRoommates: "",
    specialRequests: "",
    paymentStatus: "PAID",
    amountPaid: 180,
    currency: "USD",
    apartmentId: "apt-1",
    apartmentName: "דירה 1 - מונטגומרי 740",
    apartmentAddress: "740 Montgomery St, Brooklyn, NY",
    bedId: "bed-1-2",
    bedNumber: 2,
    receptionVisible: true,
    checkedIn: false,
    blockCheckIn: false,
    createdAt: "2026-10-02T12:00:00Z",
  },
  {
    id: "shliach-3",
    firstName: "שניאור זלמן",
    lastName: "ליברמן",
    hebrewName: "הרב שניאור זלמן ליברמן",
    email: "liberman@chabadhk.org",
    phone: "+85298765432",
    country: "הונג קונג",
    city: "הונג קונג",
    passportOrId: "HK8877665",
    arrivalDate: "2026-11-18",
    arrivalTime: "18:00",
    departureDate: "2026-11-24",
    departureTime: "12:00",
    preferredRoommates: "",
    specialRequests: "",
    paymentStatus: "PAID",
    amountPaid: 180,
    currency: "USD",
    apartmentId: null,
    bedId: null,
    receptionVisible: false,
    checkedIn: false,
    blockCheckIn: false,
    createdAt: "2026-10-03T15:00:00Z",
  },
  {
    id: "shliach-4",
    firstName: "שלום דובער",
    lastName: "וולף",
    hebrewName: "הרב שלום דובער וולף",
    email: "wolf@chabadodessa.ua",
    phone: "+380501112233",
    country: "אוקראינה",
    city: "אודסה",
    passportOrId: "UA9988776",
    arrivalDate: "2026-11-19",
    departureDate: "2026-11-23",
    preferredRoommates: "אהרן פרידמן",
    paymentStatus: "PENDING",
    amountPaid: 0,
    currency: "USD",
    apartmentId: null,
    bedId: null,
    receptionVisible: false,
    checkedIn: false,
    blockCheckIn: true,
    blockReason: "טרם הוסדר תשלום - להפנות למשרד הגזברות",
    adminNotes: "הבטיח להסדיר במזומן בכניסה",
    createdAt: "2026-10-04T09:00:00Z",
  },
  {
    id: "shliach-5",
    firstName: "חיים",
    lastName: "ברוד",
    hebrewName: "הרב חיים ברוד",
    email: "brod@chabadmexico.com",
    phone: "+525512345678",
    country: "מקסיקו",
    city: "פלייה דל כרמן",
    passportOrId: "MX5544332",
    arrivalDate: "2026-11-18",
    departureDate: "2026-11-23",
    paymentStatus: "PAID",
    amountPaid: 180,
    currency: "USD",
    apartmentId: "apt-2",
    apartmentName: "דירה 2 - קינגסטון 788",
    apartmentAddress: "788 Kingston Ave, Brooklyn, NY",
    bedId: "bed-2-1",
    bedNumber: 1,
    receptionVisible: false, // not yet visible to reception
    checkedIn: false,
    blockCheckIn: false,
    createdAt: "2026-10-05T11:00:00Z",
  }
];

export const INITIAL_APARTMENTS: Apartment[] = [
  {
    id: "apt-1",
    apartmentNumber: "דירה 1 - מונטגומרי 740",
    address: "740 Montgomery St, Apt 2B, Brooklyn, NY 11213",
    wazeUrl: "https://waze.com/ul?q=740+Montgomery+St+Brooklyn",
    entryCode: "קוד דלת: 7701#",
    floor: "קומה 2",
    hasElevator: false,
    totalBeds: 6,
    managerName: "יוסף סגל",
    managerPhone: "718-555-0101",
    status: "ACTIVE",
    scheduledClosureDate: "2026-11-24",
    createdAt: "2026-10-01T08:00:00Z"
  },
  {
    id: "apt-2",
    apartmentNumber: "דירה 2 - קינגסטון 788",
    address: "788 Kingston Ave, Apt 1A, Brooklyn, NY 11213",
    wazeUrl: "https://waze.com/ul?q=788+Kingston+Ave+Brooklyn",
    entryCode: "מפתח בתיבת מנעול: 1902",
    floor: "קומת קרקע",
    hasElevator: false,
    totalBeds: 8,
    managerName: "שמואל כהן",
    managerPhone: "718-555-0102",
    status: "ACTIVE",
    scheduledClosureDate: "2026-11-24",
    createdAt: "2026-10-01T08:00:00Z"
  },
  {
    id: "apt-3",
    apartmentNumber: "דירה 3 - איסטרן פארקווי 680",
    address: "680 Eastern Pkwy, Apt 4C, Brooklyn, NY 11213",
    wazeUrl: "https://waze.com/ul?q=680+Eastern+Pkwy+Brooklyn",
    entryCode: "קוד אינטרקום: 1234",
    floor: "קומה 4",
    hasElevator: true,
    totalBeds: 5,
    managerName: "מענדי קליין",
    managerPhone: "718-555-0103",
    status: "ACTIVE",
    scheduledClosureDate: "2026-11-24",
    createdAt: "2026-10-02T08:00:00Z"
  }
];

export const INITIAL_BEDS: Bed[] = [
  // Apt 1 (6 beds)
  { id: "bed-1-1", apartmentId: "apt-1", bedNumber: 1, roomName: "חדר 1", status: "ASSIGNED", currentShliachId: "shliach-1", currentShliachName: "הרב מנחם מענדל רובין" },
  { id: "bed-1-2", apartmentId: "apt-1", bedNumber: 2, roomName: "חדר 1", status: "ASSIGNED", currentShliachId: "shliach-2", currentShliachName: "הרב יוסף יצחק גרינברג" },
  { id: "bed-1-3", apartmentId: "apt-1", bedNumber: 3, roomName: "חדר 2", status: "AVAILABLE" },
  { id: "bed-1-4", apartmentId: "apt-1", bedNumber: 4, roomName: "חדר 2", status: "AVAILABLE" },
  { id: "bed-1-5", apartmentId: "apt-1", bedNumber: 5, roomName: "חדר 3", status: "RESERVED" },
  { id: "bed-1-6", apartmentId: "apt-1", bedNumber: 6, roomName: "חדר 3", status: "AVAILABLE" },

  // Apt 2 (8 beds)
  { id: "bed-2-1", apartmentId: "apt-2", bedNumber: 1, roomName: "חדר שינה A", status: "ASSIGNED", currentShliachId: "shliach-5", currentShliachName: "הרב חיים ברוד" },
  { id: "bed-2-2", apartmentId: "apt-2", bedNumber: 2, roomName: "חדר שינה A", status: "AVAILABLE" },
  { id: "bed-2-3", apartmentId: "apt-2", bedNumber: 3, roomName: "חדר שינה B", status: "AVAILABLE" },
  { id: "bed-2-4", apartmentId: "apt-2", bedNumber: 4, roomName: "חדר שינה B", status: "AVAILABLE" },
  { id: "bed-2-5", apartmentId: "apt-2", bedNumber: 5, roomName: "חדר שינה C", status: "AVAILABLE" },
  { id: "bed-2-6", apartmentId: "apt-2", bedNumber: 6, roomName: "חדר שינה C", status: "AVAILABLE" },
  { id: "bed-2-7", apartmentId: "apt-2", bedNumber: 7, roomName: "סלון", status: "AVAILABLE" },
  { id: "bed-2-8", apartmentId: "apt-2", bedNumber: 8, roomName: "סלון", status: "AVAILABLE" },

  // Apt 3 (5 beds)
  { id: "bed-3-1", apartmentId: "apt-3", bedNumber: 1, roomName: "חדר 1", status: "AVAILABLE" },
  { id: "bed-3-2", apartmentId: "apt-3", bedNumber: 2, roomName: "חדר 1", status: "AVAILABLE" },
  { id: "bed-3-3", apartmentId: "apt-3", bedNumber: 3, roomName: "חדר 2", status: "AVAILABLE" },
  { id: "bed-3-4", apartmentId: "apt-3", bedNumber: 4, roomName: "חדר 2", status: "AVAILABLE" },
  { id: "bed-3-5", apartmentId: "apt-3", bedNumber: 5, roomName: "חדר 2", status: "AVAILABLE" },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "user-szbutman7",
    email: "szbutman7@gmail.com",
    displayName: "זלמן בוטמן (מנהל ראשי)",
    role: "SUPER_ADMIN",
    isActive: true,
    screenAccess: {
      shluchim: "EDIT",
      apartments: "EDIT",
      placement: "EDIT",
      reception: "EDIT",
      emails: "EDIT",
      users: "EDIT",
    }
  },
  {
    id: "user-superadmin",
    email: "admin@kinus.org",
    displayName: "מנהל ראשי",
    role: "SUPER_ADMIN",
    isActive: true,
    screenAccess: {
      shluchim: "EDIT",
      apartments: "EDIT",
      placement: "EDIT",
      reception: "EDIT",
      emails: "EDIT",
      users: "EDIT",
    }
  },
  {
    id: "user-placement",
    email: "housing@kinus.org",
    displayName: "מנהל שיבוץ ודירות",
    role: "HOUSING_MANAGER",
    isActive: true,
    screenAccess: {
      shluchim: "EDIT",
      apartments: "EDIT",
      placement: "EDIT",
      reception: "VIEW",
      emails: "VIEW",
      users: "NONE",
    }
  },
  {
    id: "user-reception",
    email: "desk@kinus.org",
    displayName: "דייל עמדת קבלה",
    role: "RECEPTION_STAFF",
    isActive: true,
    screenAccess: {
      shluchim: "VIEW",
      apartments: "VIEW",
      placement: "NONE",
      reception: "EDIT",
      emails: "NONE",
      users: "NONE",
    }
  }
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "template-registration-confirmation",
    name: "אישור הרשמה וקבלה לתשלום",
    subject: "אישור הרשמה לכינוס השלוחים תשפ״ז",
    htmlContent: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <div style="text-align: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #1E3A8A; margin: 0;">כינוס השלוחים העולמי</h2>
    <p style="color: #555; margin: 4px 0 0 0;">אישור הרשמה ולינה</p>
  </div>
  
  <p>שלום עליכם כבוד <strong>{shliach_name}</strong>, שליח כ״ק אדמו״ר ב{city},</p>
  <p>שמחים לאשר את קבלת הרשמתכם ללינה בימי כינוס השלוחים העולמי.</p>
  
  <div style="background-color: #f8fafc; border-right: 4px solid #1E3A8A; padding: 12px 16px; margin: 20px 0;">
    <p style="margin: 4px 0;"><strong>תאריך הגעה:</strong> {arrival_date}</p>
    <p style="margin: 4px 0;"><strong>תאריך עזיבה:</strong> {departure_date}</p>
    <p style="margin: 4px 0;"><strong>סטטוס תשלום:</strong> שולם בהצלחה ($180)</p>
  </div>
  
  <p>פרטי הדירה והמיטה המשובצת יישלחו לקראת הכינוס וימתינו לכם בעמדת הקבלה.</p>
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://kinusbed.vercel.app/" style="background-color: #1E3A8A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">כניסה למערכת הכינוס: kinusbed.vercel.app</a>
  </div>
  <p>בברכת הצלחה רבה בשליחות הקדושה ולהתראות בחצרות קדשנו,</p>
  <p><strong>ועד הכינוס - מחלקת אירוח ולינה</strong></p>
</div>`,
    createdAt: "2026-10-01T00:00:00Z"
  },
  {
    id: "template-placement-notice",
    name: "הודעת שיבוץ דירה ומיטה",
    subject: "פרטי הדירה והמיטה שלך לכינוס השלוחים",
    htmlContent: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <div style="text-align: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #1E3A8A; margin: 0;">כינוס השלוחים העולמי</h2>
    <p style="color: #555; margin: 4px 0 0 0;">פרטי שיבוץ לינה</p>
  </div>
  
  <p>שלום עליכם כבוד <strong>{shliach_name}</strong>,</p>
  <p>הושלם שיבוצכם לקראת ימי הכינוס. להלן פרטי הדירה והמיטה:</p>
  
  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1e40af;">{apartment_name}</h3>
    <p style="margin: 6px 0;"><strong>כתובת:</strong> {apartment_address}</p>
    <p style="margin: 6px 0;"><strong>מיטה מספר:</strong> {bed_number}</p>
    <p style="margin: 6px 0;"><strong>קוד כניסה / מפתח:</strong> {entry_code}</p>
  </div>
  
  <div style="text-align: center; margin: 20px 0;">
    <a href="https://kinusbed.vercel.app/" style="background-color: #1E3A8A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">מעבר לאתר הרשמי: kinusbed.vercel.app</a>
  </div>
  <p>אנא שמרו על הסדר והניקיון בדירה למען כלל השלוחים.</p>
  <p>בברכת הצלחה רבה ולהתראות בקרוב,</p>
  <p><strong>ועד הכינוס</strong></p>
</div>`,
    createdAt: "2026-10-01T00:00:00Z"
  }
];
