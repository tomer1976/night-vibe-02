export type AccountStatusDraft = 'active' | 'suspended' | 'banned' | 'pending_deletion' | 'deleted';

export type LinkedAccountProvider = 'google' | 'apple' | 'facebook';

export type LinkedAccountDraft = {
  provider: LinkedAccountProvider;
  linked: boolean;
};

export type AccountSettingsDraft = {
  status: AccountStatusDraft;
  deletionRequestedAt: string | null;
  recoveryWindowDays: number;
  linkedAccounts: LinkedAccountDraft[];
};

export const DEFAULT_ACCOUNT_SETTINGS_DRAFT: AccountSettingsDraft = {
  status: 'active',
  deletionRequestedAt: null,
  recoveryWindowDays: 30,
  linkedAccounts: [
    { provider: 'google', linked: true },
    { provider: 'apple', linked: false },
    { provider: 'facebook', linked: false },
  ],
};

export function readAccountSettingsDraftFromParams(params: unknown): AccountSettingsDraft {
  const typedParams = params as { draft?: AccountSettingsDraft } | undefined;

  return {
    ...DEFAULT_ACCOUNT_SETTINGS_DRAFT,
    ...(typedParams?.draft ?? {}),
    linkedAccounts: typedParams?.draft?.linkedAccounts ?? DEFAULT_ACCOUNT_SETTINGS_DRAFT.linkedAccounts,
  };
}