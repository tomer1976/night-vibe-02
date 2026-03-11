import { RuntimeMode } from './firebaseRuntimeGuard';

export type AdapterMode = 'mock' | 'firebase';

export type AdapterPlaceholderConfig = {
  authAdapterMode: AdapterMode;
  profileAdapterMode: AdapterMode;
  venuesAdapterMode: AdapterMode;
  presenceAdapterMode: AdapterMode;
};

function readEnvVariable(variableName: string): string {
  return (process.env[variableName] ?? '').trim();
}

export function resolveAdapterMode(value: string | undefined): AdapterMode {
  return value === 'firebase' ? 'firebase' : 'mock';
}

export function readAuthAdapterMode(): AdapterMode {
  return resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_AUTH_ADAPTER'));
}

export function readProfileAdapterMode(): AdapterMode {
  return resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_PROFILE_ADAPTER'));
}

export function readAdapterPlaceholderConfig(): AdapterPlaceholderConfig {
  return {
    authAdapterMode: readAuthAdapterMode(),
    profileAdapterMode: readProfileAdapterMode(),
    venuesAdapterMode: resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_VENUES_ADAPTER')),
    presenceAdapterMode: resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_PRESENCE_ADAPTER')),
  };
}

export function assertPhase1AdapterSafety(runtimeMode: RuntimeMode, adapterConfig: AdapterPlaceholderConfig): void {
  if (
    runtimeMode === 'phase1-mock' &&
    (
      adapterConfig.authAdapterMode !== 'mock' ||
      adapterConfig.profileAdapterMode !== 'mock' ||
      adapterConfig.venuesAdapterMode !== 'mock' ||
      adapterConfig.presenceAdapterMode !== 'mock'
    )
  ) {
    throw new Error(
      'Phase 1 mock mode requires mock auth/profile/venues/presence adapters. Set EXPO_PUBLIC_AUTH_ADAPTER, EXPO_PUBLIC_PROFILE_ADAPTER, EXPO_PUBLIC_VENUES_ADAPTER, and EXPO_PUBLIC_PRESENCE_ADAPTER to mock.'
    );
  }
}
