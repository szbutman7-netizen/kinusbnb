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

  it('should prevent check-in if guest is blocked', async () => {
    const mockBlockedShliach: Shliach = {
      id: 'shliach-blocked-1',
      firstName: 'ישראל',
      lastName: 'ישראלי',
      hebrewName: 'ישראל ישראלי',
      email: 'blocked@example.com',
      phone: '0507654321',
      passportOrId: '987654321',
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
});
