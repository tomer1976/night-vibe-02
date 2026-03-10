export type ProfilePhotoModerationStatus = 'pending' | 'approved' | 'rejected';

export type ProfilePhotoDraft = {
  photoId: string;
  url: string;
  moderationStatus: ProfilePhotoModerationStatus;
};

export type ProfileDraft = {
  displayName: string;
  bio: string;
  preferredAgeMin: string;
  preferredAgeMax: string;
  preferredGenders: string;
  profileCompleted: boolean;
  photos: ProfilePhotoDraft[];
};

export const DEFAULT_PROFILE_DRAFT: ProfileDraft = {
  displayName: 'Alex',
  bio: 'Live music, late-night coffee, and rooftop views.',
  preferredAgeMin: '24',
  preferredAgeMax: '35',
  preferredGenders: 'female,male',
  profileCompleted: true,
  photos: [
    {
      photoId: 'photo-1',
      url: 'mock://photo/1',
      moderationStatus: 'approved',
    },
    {
      photoId: 'photo-2',
      url: 'mock://photo/2',
      moderationStatus: 'pending',
    },
  ],
};

export function readProfileDraftFromParams(params: unknown): ProfileDraft {
  const typedParams = params as { draft?: ProfileDraft } | undefined;

  return {
    ...DEFAULT_PROFILE_DRAFT,
    ...(typedParams?.draft ?? {}),
    photos: typedParams?.draft?.photos ?? DEFAULT_PROFILE_DRAFT.photos,
  };
}