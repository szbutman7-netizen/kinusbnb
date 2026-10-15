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
});

