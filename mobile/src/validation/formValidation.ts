import { calculateAge } from '../screens/onboardingDraft';

export const PROFILE_BIO_MIN_LENGTH = 10;
export const PROFILE_BIO_MAX_LENGTH = 300;

export function validateMinLength(value: string, minLength: number, message: string): string | undefined {
  if (value.trim().length < minLength) {
    return message;
  }

  return undefined;
}

export function validateBioLength(value: string): string | undefined {
  const normalizedValue = value.trim();

  if (normalizedValue.length < PROFILE_BIO_MIN_LENGTH || normalizedValue.length > PROFILE_BIO_MAX_LENGTH) {
    return `Bio must be between ${PROFILE_BIO_MIN_LENGTH} and ${PROFILE_BIO_MAX_LENGTH} characters.`;
  }

  return undefined;
}

export function validateAdultDateOfBirth(value: string): string | undefined {
  const age = calculateAge(value.trim());

  if (age < 18) {
    return 'You must be at least 18 years old. Use YYYY-MM-DD format.';
  }

  return undefined;
}

export function validateAgeRange(minAgeValue: string, maxAgeValue: string): string | undefined {
  const minAge = Number(minAgeValue);
  const maxAge = Number(maxAgeValue);

  if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 18 || maxAge < minAge) {
    return 'Use valid ages where min is at least 18 and max is not lower than min.';
  }

  return undefined;
}

export function normalizePreferredGenders(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function validatePreferredGenders(value: string): string | undefined {
  if (normalizePreferredGenders(value).length === 0) {
    return 'Provide at least one preferred gender.';
  }

  return undefined;
}

export function validateDeletionConfirmationToken(value: string, expectedToken: string): string | undefined {
  if (value.trim().toUpperCase() !== expectedToken.trim().toUpperCase()) {
    return `Type ${expectedToken.toUpperCase()} to confirm account deletion request.`;
  }

  return undefined;
}