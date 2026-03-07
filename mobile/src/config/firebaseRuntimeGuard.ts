import { FirebaseConfig, FirebaseEnvironment, getFirebaseConfigPlaceholders } from './firebaseConfig';

export type RuntimeMode = 'phase1-mock' | 'phase2-real';

function hasAnyConfiguredFirebaseValue(config: FirebaseConfig): boolean {
  return Object.values(config).some((value) => value.length > 0);
}

function hasAllConfiguredFirebaseValues(config: FirebaseConfig): boolean {
  return Object.values(config).every((value) => value.length > 0);
}

export function assertFirebaseRuntimeSafety(runtimeMode: RuntimeMode, environment: FirebaseEnvironment): FirebaseConfig {
  const config = getFirebaseConfigPlaceholders(environment);

  if (runtimeMode === 'phase1-mock' && hasAnyConfiguredFirebaseValue(config)) {
    throw new Error('Phase 1 mock mode forbids configured Firebase keys. Clear Firebase env values to prevent real Firebase calls.');
  }

  if (runtimeMode === 'phase2-real' && !hasAllConfiguredFirebaseValues(config)) {
    throw new Error('Phase 2 real mode requires all Firebase environment values to be configured.');
  }

  return config;
}

export function resolveRuntimeMode(value: string | undefined): RuntimeMode {
  return value === 'phase2-real' ? 'phase2-real' : 'phase1-mock';
}

export function resolveFirebaseEnvironment(value: string | undefined): FirebaseEnvironment {
  if (value === 'staging' || value === 'production') {
    return value;
  }

  return 'development';
}

export function readRuntimeMode(): RuntimeMode {
  return resolveRuntimeMode(process.env.EXPO_PUBLIC_RUNTIME_MODE);
}

export function readFirebaseEnvironment(): FirebaseEnvironment {
  return resolveFirebaseEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
}