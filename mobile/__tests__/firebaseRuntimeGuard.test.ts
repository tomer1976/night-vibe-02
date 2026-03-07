import {
  assertFirebaseRuntimeSafety,
  resolveFirebaseEnvironment,
  resolveRuntimeMode,
} from '../src/config/firebaseRuntimeGuard';

describe('firebase runtime guard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_FIREBASE_API_KEY_DEV;
    delete process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV;
    delete process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID_DEV;
    delete process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV;
    delete process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV;
    delete process.env.EXPO_PUBLIC_FIREBASE_APP_ID_DEV;
    delete process.env.EXPO_PUBLIC_RUNTIME_MODE;
    delete process.env.EXPO_PUBLIC_APP_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows phase1 mock mode with empty firebase values', () => {
    expect(() => assertFirebaseRuntimeSafety('phase1-mock', 'development')).not.toThrow();
  });

  it('blocks phase1 mock mode when firebase values are configured', () => {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY_DEV = 'real-key';

    expect(() => assertFirebaseRuntimeSafety('phase1-mock', 'development')).toThrow(
      'Phase 1 mock mode forbids configured Firebase keys'
    );
  });

  it('blocks phase2 real mode when values are incomplete', () => {
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY_DEV = 'dev-key';

    expect(() => assertFirebaseRuntimeSafety('phase2-real', 'development')).toThrow(
      'Phase 2 real mode requires all Firebase environment values to be configured.'
    );
  });

  it('resolves runtime mode and firebase environment values', () => {
    expect(resolveRuntimeMode('phase2-real')).toBe('phase2-real');
    expect(resolveRuntimeMode(undefined)).toBe('phase1-mock');
    expect(resolveFirebaseEnvironment('production')).toBe('production');
    expect(resolveFirebaseEnvironment(undefined)).toBe('development');
  });
});