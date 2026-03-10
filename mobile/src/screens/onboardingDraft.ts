export type OnboardingDraft = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  photoCount: number;
  bio: string;
  preferredAgeMin: string;
  preferredAgeMax: string;
  preferredGenders: string;
  acceptedTerms: boolean;
};

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  photoCount: 0,
  bio: '',
  preferredAgeMin: '18',
  preferredAgeMax: '35',
  preferredGenders: '',
  acceptedTerms: false,
};

export function readDraftFromParams(params: unknown): OnboardingDraft {
  const typedParams = params as { draft?: OnboardingDraft } | undefined;

  return {
    ...DEFAULT_ONBOARDING_DRAFT,
    ...(typedParams?.draft ?? {}),
  };
}

export function calculateAge(dateOfBirth: string, today = new Date()): number {
  const parsed = new Date(dateOfBirth);

  if (Number.isNaN(parsed.getTime())) {
    return -1;
  }

  let age = today.getFullYear() - parsed.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}
