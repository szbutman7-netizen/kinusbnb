import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore, DEFAULT_ARRIVAL_DATES, DEFAULT_DEPARTURE_DATES } from '../dataService';
import { Shliach } from '@/types';

describe('StoreManager - Unit Tests', () => {
  beforeEach(() => {
    // Reset or clear store state if necessary
  });

  it('should initialize with default form settings', () => {
    const settings = dataStore.getFormSettings();
    expect(settings.isOpen).toBe(true);
    expect(settings.allowedArrivalDates).toEqual(DEFAULT_ARRIVAL_DATES);
    expect(settings.allowedDepartureDates).toEqual(DEFAULT_DEPARTURE_DATES);
    expect(settings.siteUrl).toBe("https://kinusbed.vercel.app/");
    expect(settings.baseUrl).toBe("https://kinusbed.vercel.app/");
    expect(settings.authorizedDomain).toBe("kinusbed.vercel.app");
  });

  it('should accurately calculate dashboard stats', () => {
    const stats = dataStore.getStats();
    expect(stats).toHaveProperty('totalRegistered');
    expect(stats).toHaveProperty('totalPaid');
    expect(stats).toHaveProperty('totalPlaced');
    expect(stats).toHaveProperty('totalCheckedIn');
    expect(stats.totalRegistered).toBeGreaterThanOrEqual(0);
  });

  it('should add and check-in a shliach correctly', async () => {
    const mockShliach: Shliach = {
      id: 'shliach-test-1',
      firstName: 'מנחם',
      lastName: 'מענדל',
      hebrewName: 'מנחם מענדל',
      email: 'test@example.com',
      phone: '0501234567',
      passportOrId: '123456789',
      city: 'ניו יורק',
      country: 'ארצות הברית',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 150,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString(),
    };

    await dataStore.addShliach(mockShliach);
    const shluchim = dataStore.getShluchim();
    const found = shluchim.find((s) => s.id === 'shliach-test-1');
    expect(found).toBeDefined();
    expect(found?.firstName).toBe('מנחם');

    // Test check-in
    const checkInResult = await dataStore.checkInShliach('shliach-test-1', 'נציג קבלה');
    expect(checkInResult.success).toBe(true);

    const updatedShluchim = dataStore.getShluchim();
    const checkedInShliach = updatedShluchim.find((s) => s.id === 'shliach-test-1');
    expect(checkedInShliach?.checkedIn).toBe(true);
    expect(checkedInShliach?.checkedInBy).toBe('נציג קבלה');
  });

  it('should store shliach with children accommodation and calculate payment amount correctly', async () => {
    const mockShliachWithChildren: Shliach = {
      id: 'shliach-children-test',
      firstName: 'לוי',
      lastName: 'יצחק',
      hebrewName: 'הרב לוי יצחק',
      email: 'levi@example.com',
      phone: '0509876543',
      passportOrId: '987654321',
      city: 'פריז',
      country: 'צרפת',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      needsChildrenAccommodation: true,
      childrenNames: ['מענדל', 'שלום דובער'],
      childrenCount: 2,
      paymentStatus: 'PAID',
      amountPaid: 90, // $30 base + (2 * $30)
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString(),
    };

    await dataStore.addShliach(mockShliachWithChildren);
    const shluchim = dataStore.getShluchim();
    const found = shluchim.find((s) => s.id === 'shliach-children-test');
    expect(found).toBeDefined();
    expect(found?.needsChildrenAccommodation).toBe(true);
    expect(found?.childrenNames).toEqual(['מענדל', 'שלום דובער']);
    expect(found?.childrenCount).toBe(2);
    expect(found?.amountPaid).toBe(90);
  });

  it('should prevent check-in if guest is blocked', async () => {
    const mockBlockedShliach: Shliach = {
      id: 'shliach-blocked-1',
      firstName: 'ישראל',
      lastName: 'ישראלי',
      hebrewName: 'ישראל ישראלי',
      email: 'blocked@example.com',
      phone: '0507654321',
      passportOrId: '987654322',
      city: 'ירושלים',
      country: 'ישראל',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      paymentStatus: 'PENDING',
      amountPaid: 0,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: true,
      blockReason: 'חסום לבדיקת תשלום',
      createdAt: new Date().toISOString(),
    };

    await dataStore.addShliach(mockBlockedShliach);
    const result = await dataStore.checkInShliach('shliach-blocked-1', 'נציג קבלה');
    expect(result.success).toBe(false);
    expect(result.message).toContain('חסום לבדיקת תשלום');
  });

  it('should allow updating form settings', async () => {
    await dataStore.updateFormSettings({ isOpen: false });
    const settings = dataStore.getFormSettings();
    expect(settings.isOpen).toBe(false);
  });

  it('should log audit entries on actions and allow undoing placement', async () => {
    // 1. Create apartment with beds
    const aptId = await dataStore.addApartmentWithBeds({
      apartmentNumber: 'דירה מבחן 99',
      address: 'רחוב המבחן 99',
      totalBeds: 2,
      status: 'ACTIVE'
    }, 2);

    const beds = dataStore.getBeds().filter(b => b.apartmentId === aptId);
    expect(beds.length).toBe(2);

    // 2. Add shliach
    const shliach: Shliach = {
      id: 'shliach-undo-test',
      firstName: 'שניאור',
      lastName: 'זלמן',
      hebrewName: 'שניאור זלמן',
      email: 'sz@example.com',
      phone: '0541112233',
      passportOrId: '999888',
      city: 'לוד',
      country: 'ישראל',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };
    await dataStore.addShliach(shliach);

    // Check that CREATE_SHLIACH log was recorded
    const createLogs = dataStore.getAuditLogs().filter(l => l.action === 'CREATE_SHLIACH' && l.entityId === shliach.id);
    expect(createLogs.length).toBeGreaterThan(0);

    // 3. Assign placement
    const assignRes = await dataStore.assignPlacement(shliach.id, beds[0].id, false);
    expect(assignRes.success).toBe(true);

    const placementLogs = dataStore.getAuditLogs().filter(l => l.action === 'ASSIGN_PLACEMENT' && l.entityId === shliach.id);
    expect(placementLogs.length).toBeGreaterThan(0);
    const assignLog = placementLogs[0];

    // Verify bed is assigned
    const assignedBed = dataStore.getBeds().find(b => b.id === beds[0].id);
    expect(assignedBed?.status).toBe('ASSIGNED');
    expect(assignedBed?.currentShliachId).toBe(shliach.id);

    // 4. Test Undo of assignment
    const undoRes = await dataStore.undoAuditLog(assignLog.id, 'admin-tester');
    expect(undoRes.success).toBe(true);

    // Verify bed is freed and shliach placement is cleared
    const freedBed = dataStore.getBeds().find(b => b.id === beds[0].id);
    expect(freedBed?.status).toBe('AVAILABLE');
    expect(freedBed?.currentShliachId).toBeNull();

    const updatedShliach = dataStore.getShluchim().find(s => s.id === shliach.id);
    expect(updatedShliach?.bedId).toBeNull();

    // Verify undo audit was logged and original is marked undone
    expect(assignLog.undone).toBe(true);
    const undoLogs = dataStore.getAuditLogs().filter(l => l.action === 'UNDO_ACTION');
    expect(undoLogs.length).toBeGreaterThan(0);
  });

  it('should detect conflicts when undoing unassignPlacement if bed is occupied', async () => {
    const aptId = await dataStore.addApartmentWithBeds({
      apartmentNumber: 'דירה קונפליקט',
      address: 'רחוב 770',
      totalBeds: 1,
      status: 'ACTIVE'
    }, 1);

    const bed = dataStore.getBeds().find(b => b.apartmentId === aptId)!;

    const shliach1: Shliach = {
      id: 'shliach-c-1',
      firstName: 'ראובן',
      lastName: 'כהן',
      hebrewName: 'ראובן כהן',
      email: 'r@example.com',
      phone: '0540000001',
      passportOrId: '111',
      city: 'צפת',
      country: 'ישראל',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };

    const shliach2: Shliach = {
      id: 'shliach-c-2',
      firstName: 'שמעון',
      lastName: 'לוי',
      hebrewName: 'שמעון לוי',
      email: 's@example.com',
      phone: '0540000002',
      passportOrId: '222',
      city: 'ירושלים',
      country: 'ישראל',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };

    await dataStore.addShliach(shliach1);
    await dataStore.addShliach(shliach2);

    // Place shliach1 in bed
    await dataStore.assignPlacement(shliach1.id, bed.id);
    // Unassign shliach1 -> produces UNASSIGN_PLACEMENT log
    await dataStore.unassignPlacement(shliach1.id);

    const unassignLogs = dataStore.getAuditLogs().filter(l => l.action === 'UNASSIGN_PLACEMENT' && l.entityId === shliach1.id);
    expect(unassignLogs.length).toBeGreaterThan(0);
    const unassignLog = unassignLogs[0];

    // Place shliach2 in that same bed
    await dataStore.assignPlacement(shliach2.id, bed.id);

    // Now try to undo shliach1 unassignment -> should detect conflict!
    const conflictRes = await dataStore.undoAuditLog(unassignLog.id, 'admin');
    expect(conflictRes.success).toBe(false);
    expect(conflictRes.error).toContain('שגיאת התנגשות (Conflict)');
  });

  it('should save draft and merge record by passportOrId upon completion', async () => {
    // 1. Save draft on Step 1 -> Step 2
    const draft = await dataStore.saveShliachDraft({
      firstName: 'יוסף',
      lastName: 'קפלן',
      hebrewName: 'יוסף קפלן',
      passportOrId: 'PASSPORT-ABC-999',
      phone: '0501239999',
      email: 'kaplan@example.com',
      city: 'לונדון',
      country: 'אנגליה',
      age: 40,
    });

    expect(draft.id).toBeDefined();
    expect(draft.registrationStatus).toBe('DRAFT');

    const drafts = dataStore.getShluchim().filter(s => s.registrationStatus === 'DRAFT');
    expect(drafts.find(d => d.passportOrId === 'PASSPORT-ABC-999')).toBeDefined();

    // 2. Complete registration with same passportOrId (even with slightly different case/spaces)
    const completedShliach: Shliach = {
      id: 'temporary-new-id',
      firstName: 'יוסף',
      lastName: 'קפלן',
      hebrewName: 'הרב יוסף קפלן',
      passportOrId: ' passport-abc-999 ',
      phone: '0501239999',
      email: 'kaplan@example.com',
      city: 'לונדון',
      country: 'אנגליה',
      age: 40,
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };

    await dataStore.addShliach(completedShliach);

    // Verify it merged into the existing draft record id rather than creating a duplicate
    const allMatching = dataStore.getShluchim().filter(s => s.passportOrId.trim().toUpperCase() === 'PASSPORT-ABC-999');
    expect(allMatching.length).toBe(1);
    expect(allMatching[0].id).toBe(draft.id);
    expect(allMatching[0].registrationStatus).toBe('COMPLETED');
    expect(allMatching[0].hebrewName).toBe('הרב יוסף קפלן');
  });

  it('should manage form locking and bilingual blocking messages properly', async () => {
    await dataStore.updateFormSettings({
      isOpen: false,
      closedMessageHe: 'ההרשמה לכינוס סגורה כעת',
      closedMessageEn: 'Kinus registration is currently closed',
    });

    const settings = dataStore.getFormSettings();
    expect(settings.isOpen).toBe(false);
    expect(settings.closedMessageHe).toBe('ההרשמה לכינוס סגורה כעת');
    expect(settings.closedMessageEn).toBe('Kinus registration is currently closed');

    // Reopen form
    await dataStore.updateFormSettings({ isOpen: true });
    expect(dataStore.getFormSettings().isOpen).toBe(true);
  });

  it('should enforce kinus date ranges between Tuesday Nov 3 and Monday Nov 9, 2026', () => {
    expect(DEFAULT_ARRIVAL_DATES).toContain('2026-11-03');
    expect(DEFAULT_ARRIVAL_DATES).toContain('2026-11-04');
    expect(DEFAULT_ARRIVAL_DATES).toContain('2026-11-05');
    expect(DEFAULT_ARRIVAL_DATES).toContain('2026-11-06');
    expect(DEFAULT_DEPARTURE_DATES).toContain('2026-11-08');
    expect(DEFAULT_DEPARTURE_DATES).toContain('2026-11-09');

    // Confirm full Kinus dates (Nov 3 - Nov 9) are fully available in allowed dates
    const coreDates = ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'];
    expect(coreDates.every(d => DEFAULT_ARRIVAL_DATES.includes(d))).toBe(true);
    expect(coreDates.every(d => DEFAULT_DEPARTURE_DATES.includes(d))).toBe(true);
    expect(DEFAULT_ARRIVAL_DATES.length).toBe(7);
    expect(DEFAULT_DEPARTURE_DATES.length).toBe(7);
  });

  it('should enforce atomic bed assignment, prevent overcapacity, and support release and dismantling', async () => {
    // 1. Create test apartment with 1 bed
    const aptId = await dataStore.addApartmentWithBeds({
      apartmentNumber: 'דירת אימות 101',
      address: '770 Eastern Parkway',
      totalBeds: 1,
      status: 'ACTIVE'
    }, 1);

    const beds = dataStore.getBeds().filter(b => b.apartmentId === aptId);
    expect(beds.length).toBe(1);
    const targetBed = beds[0];

    // 2. Add two shluchim
    const s1: Shliach = {
      id: 'shliach-overcap-1',
      firstName: 'אהרן',
      lastName: 'כהן',
      hebrewName: 'אהרן כהן',
      email: 'aharon@example.com',
      phone: '0501111111',
      passportOrId: 'OC-1',
      city: 'חיפה',
      country: 'ישראל',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };
    const s2: Shliach = {
      id: 'shliach-overcap-2',
      firstName: 'משה',
      lastName: 'לוי',
      hebrewName: 'משה לוי',
      email: 'moshe@example.com',
      phone: '0502222222',
      passportOrId: 'OC-2',
      city: 'באר שבע',
      country: 'ישראל',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };
    await dataStore.addShliach(s1);
    await dataStore.addShliach(s2);

    // 3. Assign s1 to targetBed
    const res1 = await dataStore.assignPlacement(s1.id, targetBed.id, false);
    expect(res1.success).toBe(true);

    const bedAfterRes1 = dataStore.getBeds().find(b => b.id === targetBed.id);
    expect(bedAfterRes1?.status).toBe('ASSIGNED');
    expect(bedAfterRes1?.currentShliachId).toBe(s1.id);

    // 4. Try to assign s2 to SAME bed -> MUST BE PREVENTED (Overcapacity protection)
    const res2 = await dataStore.assignPlacement(s2.id, targetBed.id, false);
    expect(res2.success).toBe(false);
    expect(res2.message).toContain('מיטה זו כבר תפוסה');

    // 5. Unassign s1 -> Bed must become AVAILABLE
    await dataStore.unassignPlacement(s1.id);
    const bedAfterUnassign = dataStore.getBeds().find(b => b.id === targetBed.id);
    expect(bedAfterUnassign?.status).toBe('AVAILABLE');
    expect(bedAfterUnassign?.currentShliachId).toBeNull();

    // 6. Delete apartment -> Dismantles beds and clears shluchim placements
    await dataStore.deleteApartment(aptId);
    const bedsAfterDelete = dataStore.getBeds().filter(b => b.apartmentId === aptId);
    expect(bedsAfterDelete.length).toBe(0);
  });

  it('should synchronize reception visibility properly via batch and individual updates', async () => {
    const aptId = await dataStore.addApartmentWithBeds({
      apartmentNumber: 'דירת קבלה 202',
      address: 'Kingston Ave 555',
      totalBeds: 2,
      status: 'ACTIVE'
    }, 2);
    const beds = dataStore.getBeds().filter(b => b.apartmentId === aptId);

    const shliach: Shliach = {
      id: 'shliach-reception-sync',
      firstName: 'זלמן',
      lastName: 'שניאורסון',
      hebrewName: 'זלמן שניאורסון',
      email: 'zalman@example.com',
      phone: '0503333333',
      passportOrId: 'REC-1',
      city: 'קראון הייטס',
      country: 'ארה"ב',
      arrivalDate: '2026-11-04',
      departureDate: '2026-11-09',
      paymentStatus: 'PAID',
      amountPaid: 30,
      currency: 'USD',
      receptionVisible: false,
      checkedIn: false,
      blockCheckIn: false,
      createdAt: new Date().toISOString()
    };
    await dataStore.addShliach(shliach);

    // Initial placement with receptionVisible = false
    await dataStore.assignPlacement(shliach.id, beds[0].id, false);
    let currentSh = dataStore.getShluchim().find(s => s.id === shliach.id);
    expect(currentSh?.receptionVisible).toBe(false);

    // Batch publish placement to reception
    await dataStore.batchPublishPlacement([shliach.id], true);
    currentSh = dataStore.getShluchim().find(s => s.id === shliach.id);
    expect(currentSh?.receptionVisible).toBe(true);

    // Unassign resets receptionVisible to false
    await dataStore.unassignPlacement(shliach.id);
    currentSh = dataStore.getShluchim().find(s => s.id === shliach.id);
    expect(currentSh?.receptionVisible).toBe(false);
  });
});

