import { RuntimeMode } from './firebaseRuntimeGuard';

export type AdapterMode = 'mock' | 'firebase';

export type AdapterPlaceholderConfig = {
  authAdapterMode: AdapterMode;
  profileAdapterMode: AdapterMode;
  venuesAdapterMode: AdapterMode;
  presenceAdapterMode: AdapterMode;
  discoveryAdapterMode: AdapterMode;
  interactionsAdapterMode: AdapterMode;
  matchAdapterMode: AdapterMode;
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
    discoveryAdapterMode: resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_DISCOVERY_ADAPTER')),
    interactionsAdapterMode: resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_INTERACTIONS_ADAPTER')),
    matchAdapterMode: resolveAdapterMode(readEnvVariable('EXPO_PUBLIC_MATCH_ADAPTER')),
  };
}

export function assertPhase1AdapterSafety(runtimeMode: RuntimeMode, adapterConfig: AdapterPlaceholderConfig): void {
  if (
    runtimeMode === 'phase1-mock' &&
    (
      adapterConfig.authAdapterMode !== 'mock' ||
      adapterConfig.profileAdapterMode !== 'mock' ||
      adapterConfig.venuesAdapterMode !== 'mock' ||
      adapterConfig.presenceAdapterMode !== 'mock' ||
      adapterConfig.discoveryAdapterMode !== 'mock' ||
      adapterConfig.interactionsAdapterMode !== 'mock' ||
      adapterConfig.matchAdapterMode !== 'mock'
    )
  ) {
    throw new Error(
      'Phase 1 mock mode requires mock auth/profile/venues/presence/discovery/interactions/match adapters. Set EXPO_PUBLIC_AUTH_ADAPTER, EXPO_PUBLIC_PROFILE_ADAPTER, EXPO_PUBLIC_VENUES_ADAPTER, EXPO_PUBLIC_PRESENCE_ADAPTER, EXPO_PUBLIC_DISCOVERY_ADAPTER, EXPO_PUBLIC_INTERACTIONS_ADAPTER, and EXPO_PUBLIC_MATCH_ADAPTER to mock.'
    );
  }
}
