export type FirebaseEnvironment = 'development' | 'staging' | 'production';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const ENV_SUFFIX_BY_ENVIRONMENT: Record<FirebaseEnvironment, 'DEV' | 'STAGING' | 'PROD'> = {
  development: 'DEV',
  staging: 'STAGING',
  production: 'PROD',
};

function readEnvVariable(variableName: string): string {
  return (process.env[variableName] ?? '').trim();
}

export function getFirebaseConfigPlaceholders(environment: FirebaseEnvironment): FirebaseConfig {
  const suffix = ENV_SUFFIX_BY_ENVIRONMENT[environment];

  return {
    apiKey: readEnvVariable(`EXPO_PUBLIC_FIREBASE_API_KEY_${suffix}`),
    authDomain: readEnvVariable(`EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN_${suffix}`),
    projectId: readEnvVariable(`EXPO_PUBLIC_FIREBASE_PROJECT_ID_${suffix}`),
    storageBucket: readEnvVariable(`EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET_${suffix}`),
    messagingSenderId: readEnvVariable(`EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_${suffix}`),
    appId: readEnvVariable(`EXPO_PUBLIC_FIREBASE_APP_ID_${suffix}`),
  };
}