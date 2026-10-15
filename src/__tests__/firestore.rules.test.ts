import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import net from 'net';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment | null = null;
let isEmulatorRunning = false;

function checkPort(port: number, host: string): Promise<boolean> {
  return new Promise((res) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.on('connect', () => {
      socket.destroy();
      res(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      res(false);
    });
    socket.on('error', () => {
      res(false);
    });
    socket.connect(port, host);
  });
}

describe('Firestore Security Rules - Integration Tests', () => {
  beforeAll(async () => {
    isEmulatorRunning = await checkPort(8080, '127.0.0.1');

    if (!isEmulatorRunning) {
      console.warn(
        '\n[NOTICE] Firestore emulator is not running on 127.0.0.1:8080. Skipping live emulator rules tests.\nTo run live rules tests, start the emulator: `firebase emulators:start --only firestore`'
      );
      return;
    }

    const rulesPath = resolve(__dirname, '../../firestore.rules');
    const rules = readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'kinus-test-project',
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('should allow public creation of valid shliach registration', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('shliach-123');

    const validData = {
      firstName: 'מנחם',
      lastName: 'מענדל',
      email: 'shliach@example.com',
      phone: '0501234567',
      city: 'ניו יורק',
      country: 'ארצות הברית',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      checkedIn: false,
      blockCheckIn: false,
      receptionVisible: false,
    };

    await expect(shliachRef.set(validData)).resolves.not.toThrow();
  });

  it('should DENY public creation if attempting to self-assign apartment or bed', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('shliach-hack');

    const maliciousData = {
      firstName: 'מנחם',
      lastName: 'מענדל',
      email: 'shliach@example.com',
      phone: '0501234567',
      city: 'ניו יורק',
      country: 'ארצות הברית',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      apartmentId: 'apt-vip-1',
      bedId: 'bed-vip-1',
    };

    await expect(shliachRef.set(maliciousData)).rejects.toThrow();
  });

  it('should DENY unauthenticated user from listing all shluchim', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shluchimCollection = unauthenticatedDb.collection('shluchim');

    await expect(shluchimCollection.get()).rejects.toThrow();
  });

  it('should DENY unauthenticated access to apartments collection', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const aptsRef = unauthenticatedDb.collection('apartments');

    await expect(aptsRef.get()).rejects.toThrow();
  });

  it('should DENY unauthenticated access to auditLog collection', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const auditLogRef = unauthenticatedDb.collection('auditLog');

    await expect(auditLogRef.get()).rejects.toThrow();
  });

  it('should allow public creation with valid optional age and DRAFT status', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('draft-123');

    const draftData = {
      firstName: 'לוי',
      lastName: 'יצחק',
      email: 'levi@example.com',
      phone: '0509876543',
      city: 'ירושלים',
      country: 'ישראל',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      age: 25,
      registrationStatus: 'DRAFT',
      checkedIn: false,
      blockCheckIn: false,
      receptionVisible: false,
    };

    await expect(shliachRef.set(draftData)).resolves.not.toThrow();
  });

  it('should DENY public creation with invalid age (< 18 or > 120)', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('draft-invalid-age');

    const invalidAgeData = {
      firstName: 'לוי',
      lastName: 'יצחק',
      email: 'levi@example.com',
      phone: '0509876543',
      city: 'ירושלים',
      country: 'ישראל',
      arrivalDate: '2026-11-05',
      departureDate: '2026-11-09',
      age: 15, // Under 18
      registrationStatus: 'DRAFT',
      checkedIn: false,
      blockCheckIn: false,
      receptionVisible: false,
    };

    await expect(shliachRef.set(invalidAgeData)).rejects.toThrow();
  });

  it('should allow public update from DRAFT to COMPLETED', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    // Seed draft as admin
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('shluchim').doc('shliach-draft-to-comp').set({
        firstName: 'שמואל',
        lastName: 'קמינצקי',
        email: 'shmuel@example.com',
        phone: '0501112233',
        city: 'דניפרו',
        country: 'אוקראינה',
        arrivalDate: '2026-11-05',
        departureDate: '2026-11-09',
        registrationStatus: 'DRAFT',
        checkedIn: false,
        blockCheckIn: false,
        receptionVisible: false,
      });
    });

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('shliach-draft-to-comp');

    await expect(
      shliachRef.update({
        registrationStatus: 'COMPLETED',
        age: 40,
      })
    ).resolves.not.toThrow();
  });

  it('should DENY public update on an already COMPLETED registration', async ({ skip }) => {
    if (!isEmulatorRunning || !testEnv) {
      return skip();
    }

    // Seed completed record
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await adminDb.collection('shluchim').doc('shliach-completed').set({
        firstName: 'יוסף',
        lastName: 'כהן',
        email: 'yosef@example.com',
        phone: '0502223344',
        city: 'תל אביב',
        country: 'ישראל',
        arrivalDate: '2026-11-05',
        departureDate: '2026-11-09',
        registrationStatus: 'COMPLETED',
        checkedIn: false,
        blockCheckIn: false,
        receptionVisible: false,
      });
    });

    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const shliachRef = unauthenticatedDb.collection('shluchim').doc('shliach-completed');

    await expect(
      shliachRef.update({
        phone: '0509999999',
      })
    ).rejects.toThrow();
  });
});
