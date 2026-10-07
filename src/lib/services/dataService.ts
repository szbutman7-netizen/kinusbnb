import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Shliach, 
  Apartment, 
  Bed, 
  UserProfile, 
  EmailTemplate, 
  EmailLog, 
  DashboardStats 
} from "@/types";
import { 
  INITIAL_SHLUCHIM, 
  INITIAL_APARTMENTS, 
  INITIAL_BEDS, 
  INITIAL_USERS, 
  INITIAL_EMAIL_TEMPLATES 
} from "./mockData";

// In-Memory & LocalStorage Cache fallback
class StoreManager {
  private shluchim: Shliach[] = [];
  private apartments: Apartment[] = [];
  private beds: Bed[] = [];
  private users: UserProfile[] = [];
  private templates: EmailTemplate[] = [];
  private emailLogs: EmailLog[] = [];
  
  private listeners: Set<() => void> = new Set();
  private isFirebaseConnected = false;

  constructor() {
    this.initData();
  }

  private initData() {
    if (typeof window !== "undefined") {
      const storedShluchim = localStorage.getItem("kinus_shluchim");
      const storedApts = localStorage.getItem("kinus_apartments");
      const storedBeds = localStorage.getItem("kinus_beds");
      const storedUsers = localStorage.getItem("kinus_users");
      const storedTemplates = localStorage.getItem("kinus_templates");
      const storedLogs = localStorage.getItem("kinus_logs");

      this.shluchim = storedShluchim ? JSON.parse(storedShluchim) : INITIAL_SHLUCHIM;
      this.apartments = storedApts ? JSON.parse(storedApts) : INITIAL_APARTMENTS;
      this.beds = storedBeds ? JSON.parse(storedBeds) : INITIAL_BEDS;
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
      this.templates = storedTemplates ? JSON.parse(storedTemplates) : INITIAL_EMAIL_TEMPLATES;
      this.emailLogs = storedLogs ? JSON.parse(storedLogs) : [];
    } else {
      this.shluchim = [...INITIAL_SHLUCHIM];
      this.apartments = [...INITIAL_APARTMENTS];
      this.beds = [...INITIAL_BEDS];
      this.users = [...INITIAL_USERS];
      this.templates = [...INITIAL_EMAIL_TEMPLATES];
      this.emailLogs = [];
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      localStorage.setItem("kinus_shluchim", JSON.stringify(this.shluchim));
      localStorage.setItem("kinus_apartments", JSON.stringify(this.apartments));
      localStorage.setItem("kinus_beds", JSON.stringify(this.beds));
      localStorage.setItem("kinus_users", JSON.stringify(this.users));
      localStorage.setItem("kinus_templates", JSON.stringify(this.templates));
      localStorage.setItem("kinus_logs", JSON.stringify(this.emailLogs));
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Getters ---
  public getShluchim(): Shliach[] {
    return [...this.shluchim];
  }

  public getApartments(): Apartment[] {
    return [...this.apartments];
  }

  public getBeds(): Bed[] {
    return [...this.beds];
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getTemplates(): EmailTemplate[] {
    return [...this.templates];
  }

  public getEmailLogs(): EmailLog[] {
    return [...this.emailLogs];
  }

  public getStats(): DashboardStats {
    const totalRegistered = this.shluchim.length;
    const totalPaid = this.shluchim.filter(s => s.paymentStatus === 'PAID').length;
    const totalPlaced = this.shluchim.filter(s => s.apartmentId && s.bedId).length;
    const totalCheckedIn = this.shluchim.filter(s => s.checkedIn).length;
    const totalApartments = this.apartments.length;
    const totalBeds = this.beds.length;
    const availableBeds = this.beds.filter(b => b.status === 'AVAILABLE').length;
    const blockedGuests = this.shluchim.filter(s => s.blockCheckIn).length;

    return {
      totalRegistered,
      totalPaid,
      totalPlaced,
      totalCheckedIn,
      totalApartments,
      totalBeds,
      availableBeds,
      blockedGuests
    };
  }

  // --- Shluchim Actions ---
  public async addShliach(shliach: Shliach): Promise<void> {
    this.shluchim.unshift(shliach);
    this.persist();

    // Firestore attempt
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await setDoc(doc(db, "shluchim", shliach.id), shliach);
      }
    } catch (e) {
      console.warn("Firestore sync fallback to local:", e);
    }
  }

  public async updateShliach(id: string, updates: Partial<Shliach>): Promise<void> {
    const idx = this.shluchim.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.shluchim[idx] = { ...this.shluchim[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
    }

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await updateDoc(doc(db, "shluchim", id), {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Firestore update fallback to local:", e);
    }
  }

  public async toggleBlockCheckIn(id: string, block: boolean, reason?: string): Promise<void> {
    await this.updateShliach(id, {
      blockCheckIn: block,
      blockReason: block ? (reason || "חסום להגעה לפי הוראת הנהלה") : ""
    });
  }

  // --- Reception Check-in Action ---
  public async checkInShliach(id: string, staffName: string): Promise<{ success: boolean; message: string }> {
    const shliach = this.shluchim.find(s => s.id === id);
    if (!shliach) {
      return { success: false, message: "השליח לא נמצא במערכת" };
    }

    if (shliach.blockCheckIn) {
      return { 
        success: false, 
        message: `קליטה חסומה! סיבה: ${shliach.blockReason || "נא להפנות למשרד ההנהלה"}` 
      };
    }

    await this.updateShliach(id, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffName
    });

    return { success: true, message: "צ'ק-אין בוצע בהצלחה!" };
  }

  // --- Apartment & Beds Actions ---
  public async addApartmentWithBeds(apt: Omit<Apartment, "id">, bedCount: number): Promise<string> {
    const aptId = "apt-" + Date.now();
    const newApartment: Apartment = {
      ...apt,
      id: aptId,
      totalBeds: bedCount,
      createdAt: new Date().toISOString()
    };

    const newBeds: Bed[] = [];
    for (let i = 1; i <= bedCount; i++) {
      newBeds.push({
        id: `bed-${aptId}-${i}`,
        apartmentId: aptId,
        bedNumber: i,
        roomName: `חדר ${Math.ceil(i / 2)}`,
        status: "AVAILABLE"
      });
    }

    this.apartments.push(newApartment);
    this.beds.push(...newBeds);
    this.persist();

    // Firestore batch attempt
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        const batch = writeBatch(db);
        const aptRef = doc(db, "apartments", aptId);
        batch.set(aptRef, newApartment);

        for (const bed of newBeds) {
          const bedRef = doc(db, "beds", bed.id);
          batch.set(bedRef, bed);
        }
        await batch.commit();
      }
    } catch (e) {
      console.warn("Firestore batch fallback to local:", e);
    }

    return aptId;
  }

  public async updateApartment(id: string, updates: Partial<Apartment>): Promise<void> {
    const idx = this.apartments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.apartments[idx] = { ...this.apartments[idx], ...updates };
      this.persist();
    }
  }

  public async deleteApartment(id: string): Promise<void> {
    // Release assigned shluchim first
    const affectedShluchim = this.shluchim.filter(s => s.apartmentId === id);
    for (const sh of affectedShluchim) {
      await this.unassignPlacement(sh.id);
    }

    this.apartments = this.apartments.filter(a => a.id !== id);
    this.beds = this.beds.filter(b => b.apartmentId !== id);
    this.persist();
  }

  // --- Placement Atomic Actions ---
  public async assignPlacement(
    shliachId: string, 
    bedId: string, 
    receptionVisible: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const shliach = this.shluchim.find(s => s.id === shliachId);
    const bed = this.beds.find(b => b.id === bedId);

    if (!shliach || !bed) {
      return { success: false, message: "נתוני שליח או מיטה אינם תקינים" };
    }

    if (bed.status === 'ASSIGNED' && bed.currentShliachId !== shliachId) {
      return { success: false, message: "מיטה זו כבר תפוסה על ידי שליח אחר" };
    }

    const apt = this.apartments.find(a => a.id === bed.apartmentId);
    const aptName = apt ? apt.apartmentNumber : "דירה";
    const aptAddress = apt ? apt.address : "";

    // If shliach was already in another bed, free it
    if (shliach.bedId && shliach.bedId !== bedId) {
      const prevBed = this.beds.find(b => b.id === shliach.bedId);
      if (prevBed) {
        prevBed.status = 'AVAILABLE';
        prevBed.currentShliachId = null;
        prevBed.currentShliachName = null;
      }
    }

    // Atomic update
    bed.status = 'ASSIGNED';
    bed.currentShliachId = shliach.id;
    bed.currentShliachName = `${shliach.firstName} ${shliach.lastName}`;

    shliach.apartmentId = bed.apartmentId;
    shliach.apartmentName = aptName;
    shliach.apartmentAddress = aptAddress;
    shliach.bedId = bed.id;
    shliach.bedNumber = bed.bedNumber;
    shliach.receptionVisible = receptionVisible;

    this.persist();
    return { success: true, message: "השיבוץ בוצע בהצלחה!" };
  }

  public async unassignPlacement(shliachId: string): Promise<void> {
    const shliach = this.shluchim.find(s => s.id === shliachId);
    if (!shliach) return;

    if (shliach.bedId) {
      const bed = this.beds.find(b => b.id === shliach.bedId);
      if (bed) {
        bed.status = 'AVAILABLE';
        bed.currentShliachId = null;
        bed.currentShliachName = null;
      }
    }

    shliach.apartmentId = null;
    shliach.apartmentName = undefined;
    shliach.apartmentAddress = undefined;
    shliach.bedId = null;
    shliach.bedNumber = undefined;
    shliach.receptionVisible = false;

    this.persist();
  }

  public async setBedReserved(bedId: string, reserved: boolean): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) return;

    if (reserved) {
      if (bed.status === 'AVAILABLE') {
        bed.status = 'RESERVED';
      }
    } else {
      if (bed.status === 'RESERVED') {
        bed.status = 'AVAILABLE';
      }
    }
    this.persist();
  }

  public async batchPublishPlacement(shliachIds: string[], visible: boolean): Promise<void> {
    for (const id of shliachIds) {
      const sh = this.shluchim.find(s => s.id === id);
      if (sh) {
        sh.receptionVisible = visible;
      }
    }
    this.persist();
  }

  // --- Email Logs & Templates ---
  public addEmailLog(log: Omit<EmailLog, "id" | "sentAt">): void {
    const newLog: EmailLog = {
      ...log,
      id: "log-" + Date.now(),
      sentAt: new Date().toISOString()
    };
    this.emailLogs.unshift(newLog);
    this.persist();
  }

  public saveTemplate(template: EmailTemplate): void {
    const idx = this.templates.findIndex(t => t.id === template.id);
    if (idx !== -1) {
      this.templates[idx] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      this.templates.push({ ...template, createdAt: new Date().toISOString() });
    }
    this.persist();
  }

  // --- User Profiles ---
  public addUser(user: UserProfile): void {
    this.users.push(user);
    this.persist();
  }

  public updateUser(id: string, updates: Partial<UserProfile>): void {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      this.persist();
    }
  }

  public deleteUser(id: string): void {
    this.users = this.users.filter(u => u.id !== id);
    this.persist();
  }
}

export const dataStore = new StoreManager();
