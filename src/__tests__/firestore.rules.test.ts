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
});
