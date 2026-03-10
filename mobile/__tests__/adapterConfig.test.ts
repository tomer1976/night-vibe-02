import {
  assertPhase1AdapterSafety,
  readAdapterPlaceholderConfig,
  readAuthAdapterMode,
  readProfileAdapterMode,
  resolveAdapterMode,
} from '../src/config/adapterConfig';

describe('adapter placeholder config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_AUTH_ADAPTER;
    delete process.env.EXPO_PUBLIC_PROFILE_ADAPTER;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults adapter modes to mock when unset or unknown', () => {
    expect(resolveAdapterMode(undefined)).toBe('mock');
    expect(resolveAdapterMode('unknown')).toBe('mock');
    expect(readAuthAdapterMode()).toBe('mock');
    expect(readProfileAdapterMode()).toBe('mock');
    expect(readAdapterPlaceholderConfig()).toEqual({
      authAdapterMode: 'mock',
      profileAdapterMode: 'mock',
    });
  });

  it('reads firebase adapter placeholders from env when explicitly set', () => {
    process.env.EXPO_PUBLIC_AUTH_ADAPTER = 'firebase';
    process.env.EXPO_PUBLIC_PROFILE_ADAPTER = 'firebase';

    expect(readAdapterPlaceholderConfig()).toEqual({
      authAdapterMode: 'firebase',
      profileAdapterMode: 'firebase',
    });
  });

  it('blocks firebase auth/profile adapter placeholders in phase1 mock mode', () => {
    expect(() =>
      assertPhase1AdapterSafety('phase1-mock', {
        authAdapterMode: 'firebase',
        profileAdapterMode: 'mock',
      })
    ).toThrow('Phase 1 mock mode requires mock auth/profile adapters.');
  });

  it('allows firebase placeholders outside phase1 mock mode', () => {
    expect(() =>
      assertPhase1AdapterSafety('phase2-real', {
        authAdapterMode: 'firebase',
        profileAdapterMode: 'firebase',
      })
    ).not.toThrow();
  });
});
