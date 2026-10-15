import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  collection,
  onSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Shliach, 
  Apartment, 
  Bed, 
  UserProfile, 
  EmailTemplate, 
  EmailLog, 
  DashboardStats,
  FormSettings,
  ContactMessage,
  AuditLogEntry
} from "@/types";
import { 
  INITIAL_SHLUCHIM, 
  INITIAL_APARTMENTS, 
  INITIAL_BEDS, 
  INITIAL_USERS, 
  INITIAL_EMAIL_TEMPLATES 
} from "./mockData";

export const DEFAULT_ARRIVAL_DATES = ["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"];
export const DEFAULT_DEPARTURE_DATES = ["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"];
export const OFFICIAL_DOMAIN = "https://kinusbed.vercel.app/";
export const AUTHORIZED_DOMAIN = "kinusbed.vercel.app";

// In-Memory & LocalStorage Cache fallback
class StoreManager {
  private shluchim: Shliach[] = [];
  private apartments: Apartment[] = [];
  private beds: Bed[] = [];
  private users: UserProfile[] = [];
  private templates: EmailTemplate[] = [];
  private emailLogs: EmailLog[] = [];
  private contactMessages: ContactMessage[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private formSettings: FormSettings = { 
    isOpen: true,
    allowedArrivalDates: [...DEFAULT_ARRIVAL_DATES],
    allowedDepartureDates: [...DEFAULT_DEPARTURE_DATES],
    siteUrl: OFFICIAL_DOMAIN,
    baseUrl: OFFICIAL_DOMAIN,
    authorizedDomain: AUTHORIZED_DOMAIN
  };
  
  private listeners: Set<() => void> = new Set();
  private isFirebaseConnected = false;

  constructor() {
    this.initData();
    this.initFirestoreSync();
  }

  private initData() {
    if (typeof window !== "undefined") {
      const storedShluchim = localStorage.getItem("kinus_shluchim");
      const storedApts = localStorage.getItem("kinus_apartments");
      const storedBeds = localStorage.getItem("kinus_beds");
      const storedUsers = localStorage.getItem("kinus_users");
      const storedTemplates = localStorage.getItem("kinus_templates");
      const storedLogs = localStorage.getItem("kinus_logs");
      const storedFormSettings = localStorage.getItem("kinus_form_settings");
      const storedMessages = localStorage.getItem("kinus_contact_messages");
      const storedAuditLogs = localStorage.getItem("kinus_audit_logs");

      this.shluchim = storedShluchim ? JSON.parse(storedShluchim) : INITIAL_SHLUCHIM;
      this.apartments = storedApts ? JSON.parse(storedApts) : INITIAL_APARTMENTS;
      this.beds = storedBeds ? JSON.parse(storedBeds) : INITIAL_BEDS;
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];
      this.auditLogs = storedAuditLogs ? JSON.parse(storedAuditLogs) : [];

      // Failsafe: ensure primary super admin szbutman7@gmail.com is always present and active
      const primaryEmail = "szbutman7@gmail.com";
      const existingSuper = this.users.find(u => u.email.toLowerCase() === primaryEmail);
      if (!existingSuper) {
        this.users.unshift({
          id: "user-szbutman7",
          email: primaryEmail,
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
        });
        localStorage.setItem("kinus_users", JSON.stringify(this.users));
      } else if (existingSuper.role !== "SUPER_ADMIN" || !existingSuper.isActive) {
        existingSuper.role = "SUPER_ADMIN";
        existingSuper.isActive = true;
        existingSuper.screenAccess = {
          shluchim: "EDIT",
          apartments: "EDIT",
          placement: "EDIT",
          reception: "EDIT",
          emails: "EDIT",
          users: "EDIT",
        };
        localStorage.setItem("kinus_users", JSON.stringify(this.users));
      }

      this.templates = storedTemplates ? JSON.parse(storedTemplates) : [...INITIAL_EMAIL_TEMPLATES];
      // Ensure default registration confirmation template is always updated to the latest luxury design
      const regTmplIdx = this.templates.findIndex(t => t.id === "template-registration-confirmation");
      const defaultRegTmpl = INITIAL_EMAIL_TEMPLATES.find(t => t.id === "template-registration-confirmation");
      if (defaultRegTmpl) {
        if (regTmplIdx === -1) {
          this.templates.unshift(defaultRegTmpl);
        } else if (!this.templates[regTmplIdx].htmlContent.includes("https://kinusbed.vercel.app/assets/kinus-emblem.svg")) {
          // If stored template is the old design, upgrade it to the new design
          this.templates[regTmplIdx] = { ...defaultRegTmpl };
        }
      }
      this.emailLogs = storedLogs ? JSON.parse(storedLogs) : [];
      this.contactMessages = storedMessages ? JSON.parse(storedMessages) : [];
      
      const parsedSettings = storedFormSettings ? JSON.parse(storedFormSettings) : null;
      this.formSettings = {
        isOpen: parsedSettings?.isOpen ?? true,
        sendConfirmationEmail: parsedSettings?.sendConfirmationEmail ?? true,
        closedMessageHe: parsedSettings?.closedMessageHe || "",
        closedMessageEn: parsedSettings?.closedMessageEn || "",
        allowedArrivalDates: parsedSettings?.allowedArrivalDates || [...DEFAULT_ARRIVAL_DATES],
        allowedDepartureDates: parsedSettings?.allowedDepartureDates || [...DEFAULT_DEPARTURE_DATES],
        siteUrl: parsedSettings?.siteUrl || OFFICIAL_DOMAIN,
        baseUrl: parsedSettings?.baseUrl || OFFICIAL_DOMAIN,
        authorizedDomain: parsedSettings?.authorizedDomain || AUTHORIZED_DOMAIN,
        updatedAt: parsedSettings?.updatedAt,
        updatedBy: parsedSettings?.updatedBy
      };
    } else {
      this.shluchim = [...INITIAL_SHLUCHIM];
      this.apartments = [...INITIAL_APARTMENTS];
      this.beds = [...INITIAL_BEDS];
      this.users = [...INITIAL_USERS];
      this.templates = [...INITIAL_EMAIL_TEMPLATES];
      this.emailLogs = [];
      this.contactMessages = [];
      this.formSettings = { 
        isOpen: true,
        sendConfirmationEmail: true,
        allowedArrivalDates: [...DEFAULT_ARRIVAL_DATES],
        allowedDepartureDates: [...DEFAULT_DEPARTURE_DATES],
        siteUrl: OFFICIAL_DOMAIN,
        baseUrl: OFFICIAL_DOMAIN,
        authorizedDomain: AUTHORIZED_DOMAIN
      };
    }
  }

  private initFirestoreSync() {
    if (typeof window === "undefined") return;
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        const shluchimCol = collection(db, "shluchim");
        onSnapshot(shluchimCol, (snapshot) => {
          if (!snapshot.empty) {
            const cloudShluchim: Shliach[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              cloudShluchim.push({
                ...(d as any),
                id: docSnap.id,
              } as Shliach);
            });
            if (cloudShluchim.length > 0) {
              this.shluchim = cloudShluchim;
              this.isFirebaseConnected = true;
              if (typeof window !== "undefined") {
                localStorage.setItem("kinus_shluchim", JSON.stringify(this.shluchim));
              }
              this.notify();
            }
          }
        }, (err) => {
          console.warn("Firestore shluchim real-time sync notice (using local cache):", err);
        });
      }
    } catch (e) {
      console.warn("Firestore sync init exception:", e);
    }
  }

  public normalizePassportOrId(val?: string): string {
    if (!val) return "";
    return val.trim().toLowerCase().replace(/[^a-z0-9]/gi, "");
  }

  public findShliachByPassportOrId(val?: string): Shliach | undefined {
    const clean = this.normalizePassportOrId(val);
    if (!clean) return undefined;
    return this.shluchim.find(s => this.normalizePassportOrId(s.passportOrId) === clean);
  }

  private persist() {
    if (typeof window !== "undefined") {
      localStorage.setItem("kinus_shluchim", JSON.stringify(this.shluchim));
      localStorage.setItem("kinus_apartments", JSON.stringify(this.apartments));
      localStorage.setItem("kinus_beds", JSON.stringify(this.beds));
      localStorage.setItem("kinus_users", JSON.stringify(this.users));
      localStorage.setItem("kinus_templates", JSON.stringify(this.templates));
      localStorage.setItem("kinus_logs", JSON.stringify(this.emailLogs));
      localStorage.setItem("kinus_form_settings", JSON.stringify(this.formSettings));
      localStorage.setItem("kinus_contact_messages", JSON.stringify(this.contactMessages));
      localStorage.setItem("kinus_audit_logs", JSON.stringify(this.auditLogs));
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

  public getAuditLogs(): AuditLogEntry[] {
    const seen = new Set<string>();
    return this.auditLogs.filter(l => {
      if (!l || !l.id || seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });
  }

  public getEffectiveActor(actor?: { id?: string; displayName?: string; email?: string }) {
    if (actor && (actor.id || actor.displayName || actor.email)) {
      return {
        id: actor.id || "admin",
        displayName: actor.displayName || actor.email || "משתמש מערכת",
        email: actor.email || ""
      };
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kinus_auth_user");
        if (saved) {
          const u = JSON.parse(saved);
          return {
            id: u.id || "admin",
            displayName: u.displayName || u.email || "משתמש מערכת",
            email: u.email || ""
          };
        }
      } catch {
        // ignore
      }
    }
    return { id: "admin", displayName: "משתמש מערכת", email: "" };
  }

  public logAudit(
    action: string,
    entity: string,
    entityId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    before: Record<string, any> | null = null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    after: Record<string, any> | null = null,
    description?: string,
    actionHebrew?: string,
    actor?: { id?: string; displayName?: string; email?: string }
  ): AuditLogEntry {
    const defaultHebrewMap: Record<string, string> = {
      'CREATE_SHLIACH': 'רישום שליח חדש',
      'UPDATE_SHLIACH': 'עדכון פרטי שליח',
      'DELETE_SHLIACH': 'מחיקת שליח',
      'ASSIGN_PLACEMENT': 'שיבוץ לדירה ומיטה',
      'UNASSIGN_PLACEMENT': 'ביטול שיבוץ',
      'TOGGLE_CHECKIN': 'עמדת קבלה (Check-In)',
      'TOGGLE_BLOCK': 'חסימת / שחרור קליטה',
      'CREATE_APARTMENT': 'הוספת דירה',
      'UPDATE_APARTMENT': 'עדכון דירה',
      'DELETE_APARTMENT': 'מחיקת דירה',
      'UPDATE_BED_STATUS': 'עדכון סטטוס מיטה',
      'SET_BED_RESERVED': 'שמירת / שחרור מיטה',
      'BATCH_PUBLISH_PLACEMENT': 'פרסום שיבוץ מרוכז',
      'CREATE_USER': 'הוספת משתמש מורשה',
      'UPDATE_USER': 'עדכון משתמש מורשה',
      'DELETE_USER': 'הסרת משתמש מורשה',
      'UPDATE_SETTINGS': 'עדכון הגדרות מערכת',
      'RESET_ALL_DATA': 'איפוס מוחלט של נתונים',
      'UNDO_ACTION': 'ביטול פעולה'
    };

    const actionTitle = actionHebrew || defaultHebrewMap[action] || action;
    const finalDescription = description || `${actionTitle}: ${entity} #${entityId}`;
    const actorInfo = this.getEffectiveActor(actor);

    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: actorInfo.id,
      userDisplayName: actorInfo.displayName,
      userEmail: actorInfo.email,
      action,
      actionHebrew: actionTitle,
      description: finalDescription,
      entity,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : null,
      after: after ? JSON.parse(JSON.stringify(after)) : null,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 2000) {
      this.auditLogs = this.auditLogs.slice(0, 2000);
    }
    this.persist();

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        setDoc(doc(db, "auditLog", newLog.id), newLog).catch(e => {
          console.warn("Firestore audit log write error:", e);
        });
      }
    } catch (e) {
      console.warn("Firestore audit log error:", e);
    }

    return newLog;
  }

  public async undoAuditLog(
    logId: string, 
    actorUserId?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const log = this.auditLogs.find(l => l.id === logId);
    if (!log) {
      return { success: false, error: 'רשומת יומן השינויים לא נמצאה' };
    }

    if (log.undone) {
      return { success: false, error: 'פעולה זו כבר בוטלה (שוחזרה) בעבר.' };
    }

    const markAsUndone = async () => {
      log.undone = true;
      this.persist();
      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          await updateDoc(doc(db, 'auditLog', logId), { undone: true });
        }
      } catch (e) {
        console.warn('Could not persist undone status on audit log document:', e);
      }
    };

    const effectiveActor = this.getEffectiveActor(actorUserId ? { id: actorUserId } : undefined);

    try {
      // 1. Undo ASSIGN_PLACEMENT -> free bed and unassign shliach
      if (log.action === 'ASSIGN_PLACEMENT') {
        const shliachId = log.entityId;
        const shliach = this.shluchim.find(s => s.id === shliachId);
        if (!shliach) {
          return { success: false, error: 'השליח אינו קיים עוד במערכת' };
        }

        const bedId = log.after?.bedId;
        if (bedId && shliach.bedId !== bedId) {
          return {
            success: false,
            error: `שגיאת התנגשות (Conflict): שיבוץ השליח ${shliach.firstName} ${shliach.lastName} כבר שונה או בוטל לאחר פעולה זו.`
          };
        }

        await this.unassignPlacement(shliach.id);
        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          shliach.id,
          null,
          null,
          `ביטול פעולה: בוטל שיבוץ דירה עבור ${shliach.firstName} ${shliach.lastName} והמיטה פונתה`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `שיבוץ הדירה של ${shliach.firstName} ${shliach.lastName} בוטל והמיטה פונתה בהצלחה` };
      }

      // 2. Undo UNASSIGN_PLACEMENT -> restore shliach back to bed
      if (log.action === 'UNASSIGN_PLACEMENT') {
        const prev = log.before;
        if (!prev || !prev.bedId) {
          return { success: false, error: 'נתוני השיבוץ המקוריים אינם מלאים ברשומה זו' };
        }

        const shliach = this.shluchim.find(s => s.id === log.entityId);
        if (!shliach) {
          return { success: false, error: 'השליח אינו קיים עוד במערכת.' };
        }

        const bed = this.beds.find(b => b.id === prev.bedId);
        if (!bed) {
          return { success: false, error: 'המיטה המקורית אינה קיימת עוד במערכת.' };
        }

        const apt = this.apartments.find(a => a.id === (prev.apartmentId || bed.apartmentId));

        // Conflict check: is bed currently occupied by another person?
        if (bed.status === 'ASSIGNED' && bed.currentShliachId && bed.currentShliachId !== shliach.id) {
          const occupant = this.shluchim.find(s => s.id === bed.currentShliachId);
          const occupantName = occupant ? `${occupant.firstName} ${occupant.lastName}` : (bed.currentShliachName || 'שליח אחר');
          return {
            success: false,
            error: `שגיאת התנגשות (Conflict): לא ניתן לבטל את פעולת השחרור מכיוון שמיטה ${bed.bedNumber} ב${apt?.apartmentNumber || 'דירה'} כבר נתפסה ע״י ${occupantName}. יש לפנות את המיטה תחילה כדי להחזיר את השיבוץ.`
          };
        }

        // Conflict check: is shliach already placed elsewhere?
        if (shliach.bedId && shliach.bedId !== bed.id) {
          return {
            success: false,
            error: `שגיאת התנגשות: השליח ${shliach.firstName} ${shliach.lastName} כבר שובץ בינתיים לדירה אחרת (${shliach.apartmentName || ''} מיטה ${shliach.bedNumber}). יש לבטל את שיבוצו החדש תחילה.`
          };
        }

        const res = await this.assignPlacement(shliach.id, bed.id, prev.receptionVisible ?? false);
        if (!res.success) {
          return { success: false, error: res.message || 'שגיאה בהחזרת השיבוץ' };
        }

        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          shliach.id,
          null,
          { restoredBedId: bed.id },
          `ביטול פעולה: שוחזר שיבוץ עבור ${shliach.firstName} ${shliach.lastName} ל${apt?.apartmentNumber || 'הדירה'}, מיטה ${bed.bedNumber}`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `השיבוץ של ${shliach.firstName} ${shliach.lastName} ל${apt?.apartmentNumber || 'דירה'} מיטה ${bed.bedNumber} שוחזר בהצלחה` };
      }

      // 3. Undo TOGGLE_CHECKIN
      if (log.action === 'TOGGLE_CHECKIN') {
        const shliach = this.shluchim.find(s => s.id === log.entityId);
        if (!shliach) return { success: false, error: 'השליח לא נמצא' };

        const targetCheckedIn = log.before?.checkedIn ?? false;
        await this.updateShliach(shliach.id, {
          checkedIn: targetCheckedIn,
          checkedInAt: targetCheckedIn ? (log.before?.checkedInAt || new Date().toISOString()) : undefined,
          checkedInBy: targetCheckedIn ? (log.before?.checkedInBy || 'מערכת') : undefined
        });

        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          shliach.id,
          null,
          { checkedIn: targetCheckedIn },
          `ביטול פעולה: שוחזר סטטוס קבלה (Check-In) עבור ${shliach.firstName} ${shliach.lastName} ל-${targetCheckedIn ? 'נקלט' : 'טרם נקלט'}`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `סטטוס קבלה עבור ${shliach.firstName} ${shliach.lastName} שוחזר בהצלחה` };
      }

      // 4. Undo TOGGLE_BLOCK
      if (log.action === 'TOGGLE_BLOCK') {
        const shliach = this.shluchim.find(s => s.id === log.entityId);
        if (!shliach) return { success: false, error: 'השליח לא נמצא' };

        const targetBlock = log.before?.blockCheckIn ?? false;
        const targetReason = log.before?.blockReason ?? '';

        await this.updateShliach(shliach.id, {
          blockCheckIn: targetBlock,
          blockReason: targetReason
        });

        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          shliach.id,
          null,
          { blockCheckIn: targetBlock },
          `ביטול פעולה: שוחזר סטטוס חסימה עבור ${shliach.firstName} ${shliach.lastName}`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `סטטוס חסימת קבלה עבור ${shliach.firstName} ${shliach.lastName} שוחזר בהצלחה` };
      }

      // 5. Undo UPDATE_SHLIACH
      if (log.action === 'UPDATE_SHLIACH' && log.before) {
        const shliach = this.shluchim.find(s => s.id === log.entityId);
        if (!shliach) return { success: false, error: 'השליח לא נמצא' };

        await this.updateShliach(shliach.id, log.before);
        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          shliach.id,
          null,
          null,
          `ביטול פעולה: שוחזרו פרטי ${shliach.firstName} ${shliach.lastName} למצב הקודם`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `פרטי ${shliach.firstName} ${shliach.lastName} שוחזרו בהצלחה` };
      }

      // 6. Undo UPDATE_APARTMENT
      if (log.action === 'UPDATE_APARTMENT' && log.before) {
        const apt = this.apartments.find(a => a.id === log.entityId);
        if (!apt) return { success: false, error: 'הדירה לא נמצאה' };

        await this.updateApartment(apt.id, log.before);
        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Apartment',
          apt.id,
          null,
          null,
          `ביטול פעולה: שוחזרו פרטי דירה ${apt.apartmentNumber}`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `פרטי דירה ${apt.apartmentNumber} שוחזרו בהצלחה` };
      }

      // 7. Undo DELETE_SHLIACH
      if (log.action === 'DELETE_SHLIACH' && log.before) {
        const restored: Shliach = {
          ...log.before,
          id: log.entityId,
          apartmentId: null,
          apartmentName: undefined,
          apartmentAddress: undefined,
          bedId: null,
          bedNumber: undefined,
          receptionVisible: false,
          updatedAt: new Date().toISOString()
        } as Shliach;

        await this.addShliach(restored);
        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'Shliach',
          restored.id,
          null,
          null,
          `ביטול פעולה: שוחזר השליח ${restored.firstName} ${restored.lastName} שנמחק (ללא שיבוץ דירה)`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `השליח ${restored.firstName} ${restored.lastName} שוחזר בהצלחה` };
      }

      // 8. Undo UPDATE_USER
      if (log.action === 'UPDATE_USER' && log.before) {
        const u = this.users.find(usr => usr.id === log.entityId);
        if (!u) return { success: false, error: 'המשתמש לא נמצא' };

        await this.updateUser(u.id, log.before);
        await markAsUndone();

        this.logAudit(
          'UNDO_ACTION',
          'UserProfile',
          u.id,
          null,
          null,
          `ביטול פעולה: שוחזרו פרטי והרשאות ${u.displayName}`,
          'ביטול פעולה',
          effectiveActor
        );

        return { success: true, message: `פרטי ${u.displayName} שוחזרו בהצלחה` };
      }

      return { success: false, error: 'לא הוגדר מנגנון ביטול עבור סוג פעולה זה' };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'שגיאה בעת ביצוע שחזור הפעולה';
      return { success: false, error: errMsg };
    }
  }

  public getFormSettings(): FormSettings {
    return { ...this.formSettings };
  }

  public async updateFormSettings(settings: Partial<FormSettings>): Promise<void> {
    const before = { ...this.formSettings };
    this.formSettings = {
      ...this.formSettings,
      ...settings,
      siteUrl: settings.siteUrl || this.formSettings.siteUrl || OFFICIAL_DOMAIN,
      baseUrl: settings.baseUrl || this.formSettings.baseUrl || OFFICIAL_DOMAIN,
      authorizedDomain: settings.authorizedDomain || this.formSettings.authorizedDomain || AUTHORIZED_DOMAIN,
      updatedAt: new Date().toISOString()
    };
    this.persist();

    this.logAudit(
      'UPDATE_SETTINGS',
      'Settings',
      'registrationForm',
      before,
      this.formSettings,
      `עדכון הגדרות מערכת וטופס הרשמה`,
      'עדכון הגדרות'
    );

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await setDoc(doc(db, "settings", "registrationForm"), this.formSettings, { merge: true });
        await setDoc(doc(db, "settings", "system"), {
          officialDomain: OFFICIAL_DOMAIN,
          authorizedDomain: AUTHORIZED_DOMAIN,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore updateFormSettings fallback to local:", e);
    }
  }

  public getStats(): DashboardStats {
    const drafts = this.shluchim.filter(s => s.registrationStatus === 'DRAFT');
    const completed = this.shluchim.filter(s => s.registrationStatus !== 'DRAFT');
    const totalRegistered = completed.length;
    const totalDrafts = drafts.length;
    const totalPaid = completed.filter(s => s.paymentStatus === 'PAID').length;
    const totalPlaced = completed.filter(s => s.apartmentId && s.bedId).length;
    const totalCheckedIn = completed.filter(s => s.checkedIn).length;
    const totalApartments = this.apartments.length;
    const totalBeds = this.beds.length;
    const availableBeds = this.beds.filter(b => b.status === 'AVAILABLE').length;
    const blockedGuests = completed.filter(s => s.blockCheckIn).length;

    return {
      totalRegistered,
      totalDrafts,
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
  public async saveShliachDraft(draft: Partial<Shliach>): Promise<Shliach> {
    const cleanId = this.normalizePassportOrId(draft.passportOrId);
    const existing = cleanId ? this.findShliachByPassportOrId(cleanId) : undefined;
    const now = new Date().toISOString();
    let savedShliach: Shliach;

    if (existing) {
      savedShliach = {
        ...existing,
        ...draft,
        registrationStatus: existing.registrationStatus === 'COMPLETED' ? 'COMPLETED' : 'DRAFT',
        updatedAt: now
      };
      const idx = this.shluchim.findIndex(s => s.id === existing.id);
      if (idx !== -1) {
        this.shluchim[idx] = savedShliach;
      }
    } else {
      const newId = draft.id || ("shliach-" + Date.now());
      savedShliach = {
        id: newId,
        firstName: draft.firstName || "",
        lastName: draft.lastName || "",
        hebrewName: draft.hebrewName || `${draft.firstName || ""} ${draft.lastName || ""}`.trim() || "טיוטה",
        email: draft.email || "",
        phone: draft.phone || "",
        country: draft.country || "לא צוין",
        city: draft.city || "לא צוין",
        passportOrId: draft.passportOrId || "",
        age: draft.age ? Number(draft.age) : undefined,
        arrivalDate: draft.arrivalDate || "2026-11-03",
        arrivalTime: draft.arrivalTime || "12:00",
        departureDate: draft.departureDate || "2026-11-10",
        departureTime: draft.departureTime || "12:00",
        preferredRoommates: draft.preferredRoommates || "",
        specialRequests: draft.specialRequests || "",
        needsChildrenAccommodation: draft.needsChildrenAccommodation || false,
        childrenNames: draft.childrenNames || [],
        childrenCount: draft.childrenCount || 0,
        paymentStatus: draft.paymentStatus || "PENDING",
        amountPaid: draft.amountPaid || 0,
        currency: "USD",
        receptionVisible: false,
        checkedIn: false,
        blockCheckIn: false,
        registrationStatus: 'DRAFT',
        createdAt: now,
        updatedAt: now
      };
      this.shluchim.unshift(savedShliach);
    }

    this.persist();

    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await setDoc(doc(db, "shluchim", savedShliach.id), savedShliach, { merge: true });
          break;
        } catch (e) {
          if (attempt === 2) {
            console.warn("Firestore sync fallback for draft after retries:", e);
          } else {
            await new Promise(r => setTimeout(r, 400));
          }
        }
      }
    }

    return savedShliach;
  }

  public async addShliach(shliach: Shliach, options?: { requireServerSync?: boolean }): Promise<void> {
    const cleanId = this.normalizePassportOrId(shliach.passportOrId);
    const existing = cleanId ? this.findShliachByPassportOrId(cleanId) : undefined;
    
    shliach.registrationStatus = 'COMPLETED';
    const now = new Date().toISOString();

    if (existing) {
      shliach.id = existing.id;
      shliach.createdAt = existing.createdAt || now;
      shliach.updatedAt = now;
      const idx = this.shluchim.findIndex(s => s.id === existing.id);
      if (idx !== -1) {
        this.shluchim[idx] = { ...existing, ...shliach };
      } else {
        this.shluchim.unshift(shliach);
      }
    } else {
      shliach.createdAt = shliach.createdAt || now;
      this.shluchim.unshift(shliach);
    }

    this.persist();

    this.logAudit(
      existing ? 'UPDATE_SHLIACH' : 'CREATE_SHLIACH',
      'Shliach',
      shliach.id,
      existing || null,
      shliach,
      `רישום שליח: ${shliach.firstName} ${shliach.lastName}`,
      'הוספת נרשם'
    );

    // Firestore commit with retry logic
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      let lastError: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await setDoc(doc(db, "shluchim", shliach.id), shliach, { merge: true });
          lastError = null;
          break;
        } catch (e) {
          lastError = e;
          console.warn(`Firestore sync attempt ${attempt} failed:`, e);
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, attempt * 500));
          }
        }
      }

      if (lastError) {
        if (options?.requireServerSync) {
          console.error("Firestore sync failed completely after 3 attempts during registration submission:", lastError);
          throw new Error("SERVER_SYNC_FAILED");
        } else {
          console.warn("Firestore sync fallback to local store:", lastError);
        }
      }
    }
  }

  public async updateShliach(id: string, updates: Partial<Shliach>): Promise<void> {
    const idx = this.shluchim.findIndex(s => s.id === id);
    if (idx !== -1) {
      const before = { ...this.shluchim[idx] };
      this.shluchim[idx] = { ...this.shluchim[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();

      this.logAudit(
        'UPDATE_SHLIACH',
        'Shliach',
        id,
        before,
        this.shluchim[idx],
        `עדכון פרטי שליח: ${this.shluchim[idx].firstName} ${this.shluchim[idx].lastName}`,
        'עדכון נרשם'
      );
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
    const shliach = this.shluchim.find(s => s.id === id);
    const before = shliach ? { blockCheckIn: shliach.blockCheckIn, blockReason: shliach.blockReason } : null;

    await this.updateShliach(id, {
      blockCheckIn: block,
      blockReason: block ? (reason || "חסום להגעה לפי הוראת הנהלה") : ""
    });

    if (shliach) {
      this.logAudit(
        'TOGGLE_BLOCK',
        'Shliach',
        id,
        before,
        { blockCheckIn: block, blockReason: reason },
        `${block ? 'חסימת' : 'שחרור'} קליטה עבור ${shliach.firstName} ${shliach.lastName}`,
        'חסימת קבלה'
      );
    }
  }

  public async deleteShliach(id: string): Promise<void> {
    const target = this.shluchim.find(s => s.id === id);
    const before = target ? { ...target } : null;

    // 1. Unassign from bed if currently placed
    await this.unassignPlacement(id);

    // 2. Remove from shluchim list
    this.shluchim = this.shluchim.filter(s => s.id !== id);
    this.persist();

    if (target) {
      this.logAudit(
        'DELETE_SHLIACH',
        'Shliach',
        id,
        before,
        null,
        `מחיקת שליח מהמערכת: ${target.firstName} ${target.lastName}`,
        'מחיקת נרשם'
      );
    }

    // 3. Firestore deletion
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await deleteDoc(doc(db, "shluchim", id));
      }
    } catch (e) {
      console.warn("Firestore deleteShliach fallback:", e);
    }
  }

  public async resetAllData(passcode: string): Promise<{ success: boolean; message: string }> {
    if (passcode !== "7676") {
      return { success: false, message: "קוד ניהול שגוי. הפעולה בוטלה." };
    }

    // 1. Reset shluchim
    const existingShluchimIds = this.shluchim.map(s => s.id);
    this.shluchim = [];

    // 2. Reset all beds to available and clear placements
    this.beds = this.beds.map(b => ({
      ...b,
      status: "AVAILABLE",
      currentShliachId: null,
      currentShliachName: null
    }));

    // 3. Clear logs and contact messages
    this.emailLogs = [];
    this.contactMessages = [];

    this.logAudit(
      'RESET_ALL_DATA',
      'System',
      'ALL',
      null,
      null,
      'איפוס מוחלט של נתוני השלוחים, המיטות ולוגי המערכת',
      'איפוס נתונים'
    );

    this.persist();

    // 4. Firestore wipe where applicable
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        // Delete shluchim documents in chunks/batches
        for (const id of existingShluchimIds) {
          try {
            await deleteDoc(doc(db, "shluchim", id));
          } catch (err) {
            console.warn(`Failed deleting shliach ${id} from Firestore:`, err);
          }
        }

        // Reset beds in Firestore
        for (const b of this.beds) {
          try {
            await updateDoc(doc(db, "beds", b.id), {
              status: "AVAILABLE",
              currentShliachId: null,
              currentShliachName: null
            });
          } catch (err) {
            console.warn(`Failed resetting bed ${b.id} in Firestore:`, err);
          }
        }
      }
    } catch (e) {
      console.warn("Firestore resetAllData error:", e);
    }

    return { success: true, message: "כל הנתונים אופסו ונמחקו בהצלחה!" };
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

    const before = {
      checkedIn: shliach.checkedIn,
      checkedInAt: shliach.checkedInAt,
      checkedInBy: shliach.checkedInBy
    };

    await this.updateShliach(id, {
      checkedIn: true,
      checkedInAt: new Date().toISOString(),
      checkedInBy: staffName
    });

    this.logAudit(
      'TOGGLE_CHECKIN',
      'Shliach',
      id,
      before,
      { checkedIn: true, checkedInBy: staffName },
      `קליטה (Check-In) עבור ${shliach.firstName} ${shliach.lastName} ע"י ${staffName}`,
      'עמדת קבלה',
      { displayName: staffName }
    );

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

    this.logAudit(
      'CREATE_APARTMENT',
      'Apartment',
      aptId,
      null,
      newApartment,
      `הוספת דירה חדשה: ${newApartment.apartmentNumber} (${bedCount} מיטות)`,
      'הוספת דירה'
    );

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
      const before = { ...this.apartments[idx] };
      this.apartments[idx] = { ...this.apartments[idx], ...updates };
      this.persist();

      this.logAudit(
        'UPDATE_APARTMENT',
        'Apartment',
        id,
        before,
        this.apartments[idx],
        `עדכון פרטי דירה: ${this.apartments[idx].apartmentNumber}`,
        'עדכון דירה'
      );
    }
  }

  public async deleteApartment(id: string): Promise<void> {
    const apt = this.apartments.find(a => a.id === id);
    const before = apt ? { ...apt } : null;

    // Release assigned shluchim first
    const affectedShluchim = this.shluchim.filter(s => s.apartmentId === id);
    for (const sh of affectedShluchim) {
      await this.unassignPlacement(sh.id);
    }

    this.apartments = this.apartments.filter(a => a.id !== id);
    this.beds = this.beds.filter(b => b.apartmentId !== id);
    this.persist();

    if (apt) {
      this.logAudit(
        'DELETE_APARTMENT',
        'Apartment',
        id,
        before,
        null,
        `מחיקת דירה: ${apt.apartmentNumber}`,
        'מחיקת דירה'
      );
    }
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

    const before = {
      apartmentId: shliach.apartmentId,
      apartmentName: shliach.apartmentName,
      bedId: shliach.bedId,
      bedNumber: shliach.bedNumber,
      receptionVisible: shliach.receptionVisible
    };

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

    this.logAudit(
      'ASSIGN_PLACEMENT',
      'Shliach',
      shliach.id,
      before,
      { apartmentId: bed.apartmentId, bedId: bed.id, bedNumber: bed.bedNumber, apartmentName: aptName },
      `שיבוץ לדירה: ${shliach.firstName} ${shliach.lastName} -> ${aptName}, מיטה ${bed.bedNumber}`,
      'שיבוץ דירה'
    );

    return { success: true, message: "השיבוץ בוצע בהצלחה!" };
  }

  public async unassignPlacement(shliachId: string): Promise<void> {
    const shliach = this.shluchim.find(s => s.id === shliachId);
    if (!shliach) return;

    const before = {
      apartmentId: shliach.apartmentId,
      apartmentName: shliach.apartmentName,
      bedId: shliach.bedId,
      bedNumber: shliach.bedNumber,
      receptionVisible: shliach.receptionVisible
    };

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

    if (before.bedId) {
      this.logAudit(
        'UNASSIGN_PLACEMENT',
        'Shliach',
        shliach.id,
        before,
        null,
        `ביטול שיבוץ: שוחרר שיבוץ עבור ${shliach.firstName} ${shliach.lastName} מ-${before.apartmentName || 'דירה'} מיטה ${before.bedNumber}`,
        'ביטול שיבוץ'
      );
    }
  }

  public async setBedReserved(bedId: string, reserved: boolean): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) return;

    const prevStatus = bed.status;
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

    this.logAudit(
      'SET_BED_RESERVED',
      'Bed',
      bedId,
      { status: prevStatus },
      { status: bed.status },
      `${reserved ? 'שמירת' : 'שחרור שמירת'} מיטה ${bed.bedNumber}`,
      'סטטוס מיטה'
    );
  }

  public async batchPublishPlacement(shliachIds: string[], visible: boolean): Promise<void> {
    for (const id of shliachIds) {
      const sh = this.shluchim.find(s => s.id === id);
      if (sh) {
        sh.receptionVisible = visible;
      }
    }
    this.persist();

    this.logAudit(
      'BATCH_PUBLISH_PLACEMENT',
      'Placement',
      `${shliachIds.length}-items`,
      null,
      { count: shliachIds.length, visible },
      `${visible ? 'פרסום' : 'הסתרת'} שיבוצים עבור ${shliachIds.length} שלוחים`,
      'פרסום שיבוץ'
    );
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
  public async addUser(user: UserProfile): Promise<void> {
    this.users.push(user);
    this.persist();

    this.logAudit(
      'CREATE_USER',
      'UserProfile',
      user.id,
      null,
      user,
      `הוספת משתמש מורשה חדש: ${user.displayName} (${user.email})`,
      'הוספת משתמש'
    );

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await setDoc(doc(db, "users", user.id), user);
      }
    } catch (e) {
      console.warn("Firestore addUser fallback:", e);
    }
  }

  public async updateUser(id: string, updates: Partial<UserProfile>): Promise<void> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const before = { ...this.users[idx] };
      this.users[idx] = { ...this.users[idx], ...updates };
      this.persist();

      this.logAudit(
        'UPDATE_USER',
        'UserProfile',
        id,
        before,
        this.users[idx],
        `עדכון פרטי משתמש: ${this.users[idx].displayName}`,
        'עדכון משתמש'
      );

      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          await updateDoc(doc(db, "users", id), updates);
        }
      } catch (e) {
        console.warn("Firestore updateUser fallback:", e);
      }
    }
  }

  public async deleteUser(id: string): Promise<void> {
    const target = this.users.find(u => u.id === id);
    const before = target ? { ...target } : null;

    this.users = this.users.filter(u => u.id !== id);
    this.persist();

    if (target) {
      this.logAudit(
        'DELETE_USER',
        'UserProfile',
        id,
        before,
        null,
        `מחיקת משתמש מורשה: ${target.displayName}`,
        'מחיקת משתמש'
      );
    }

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await deleteDoc(doc(db, "users", id));
      }
    } catch (e) {
      console.warn("Firestore deleteUser fallback:", e);
    }
  }

  // --- Contact Messages ---
  public getContactMessages(): ContactMessage[] {
    return [...this.contactMessages];
  }

  public async addContactMessage(msg: Omit<ContactMessage, "id" | "createdAt" | "status">): Promise<void> {
    const newMessage: ContactMessage = {
      ...msg,
      id: "msg-" + Date.now(),
      status: "NEW",
      createdAt: new Date().toISOString()
    };
    this.contactMessages.unshift(newMessage);
    this.persist();

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await setDoc(doc(db, "contactMessages", newMessage.id), newMessage);
      }
    } catch (e) {
      console.warn("Firestore contact message fallback to local:", e);
    }
  }

  public async replyContactMessage(id: string, replyText: string, staffName: string): Promise<void> {
    const idx = this.contactMessages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.contactMessages[idx] = {
        ...this.contactMessages[idx],
        status: "REPLIED",
        reply: replyText,
        repliedAt: new Date().toISOString(),
        repliedBy: staffName
      };
      this.persist();

      // Log email that will be sent
      this.addEmailLog({
        recipientEmail: this.contactMessages[idx].email,
        recipientName: this.contactMessages[idx].name,
        subject: `מענה לפנייתך באתר כינוס השלוחים: ${this.contactMessages[idx].subject}`,
        status: "SENT",
        bodyPreview: replyText.substring(0, 80)
      });

      try {
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          await updateDoc(doc(db, "contactMessages", id), {
            status: "REPLIED",
            reply: replyText,
            repliedAt: new Date().toISOString(),
            repliedBy: staffName
          });
        }
      } catch (e) {
        console.warn("Firestore contact message reply fallback:", e);
      }
    }
  }

  public async deleteContactMessage(id: string): Promise<void> {
    this.contactMessages = this.contactMessages.filter(m => m.id !== id);
    this.persist();

    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        await deleteDoc(doc(db, "contactMessages", id));
      }
    } catch (e) {
      console.warn("Firestore delete contact message fallback:", e);
    }
  }
}

export const dataStore = new StoreManager();
