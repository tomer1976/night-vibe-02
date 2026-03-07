import { getFirebaseConfigPlaceholders } from '../src/config/firebaseConfig';

describe('firebaseConfig placeholders', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns empty placeholders when variables are not set', () => {
    const config = getFirebaseConfigPlaceholders('development');

    expect(config).toEqual({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
  });

  it('reads development placeholder values', () => {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY_DEV = 'dev-key';
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV = 'dev-auth';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_DEV = 'dev-project';
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV = 'dev-bucket';
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV = 'dev-sender';
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID_DEV = 'dev-app';

    expect(getFirebaseConfigPlaceholders('development')).toEqual({
      apiKey: 'dev-key',
      authDomain: 'dev-auth',
      projectId: 'dev-project',
      storageBucket: 'dev-bucket',
      messagingSenderId: 'dev-sender',
      appId: 'dev-app',
    });
  });

  it('reads staging and production placeholder values', () => {
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_STAGING = 'staging-project';
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_PROD = 'prod-project';

    expect(getFirebaseConfigPlaceholders('staging').projectId).toBe('staging-project');
    expect(getFirebaseConfigPlaceholders('production').projectId).toBe('prod-project');
  });
});