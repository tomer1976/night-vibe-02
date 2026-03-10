import {
  AccountSettingsDraft,
  DEFAULT_ACCOUNT_SETTINGS_DRAFT,
  LinkedAccountDraft,
  LinkedAccountProvider,
} from '../screens/accountSettingsDraft';

export type AccountLifecycleStoreState = {
  savedDraft: AccountSettingsDraft;
  editingLinkedAccounts: LinkedAccountDraft[];
  isEditingLinkedAccounts: boolean;
};

export type AccountLifecycleStoreAction =
  | { type: 'REPLACE_DRAFT'; draft: AccountSettingsDraft }
  | { type: 'START_LINKED_ACCOUNTS_EDIT' }
  | { type: 'TOGGLE_LINKED_PROVIDER'; provider: LinkedAccountProvider }
  | { type: 'SAVE_LINKED_ACCOUNTS_EDIT' }
  | { type: 'CANCEL_LINKED_ACCOUNTS_EDIT' }
  | { type: 'REQUEST_DELETION'; requestedAtIso: string }
  | { type: 'RECOVER_ACCOUNT' }
  | { type: 'RESET_ACCOUNT_LIFECYCLE' };

export function createInitialAccountLifecycleStoreState(
  initialDraft: AccountSettingsDraft = DEFAULT_ACCOUNT_SETTINGS_DRAFT,
): AccountLifecycleStoreState {
  return {
    savedDraft: initialDraft,
    editingLinkedAccounts: initialDraft.linkedAccounts,
    isEditingLinkedAccounts: false,
  };
}

export function accountLifecycleStoreReducer(
  state: AccountLifecycleStoreState,
  action: AccountLifecycleStoreAction,
): AccountLifecycleStoreState {
  switch (action.type) {
    case 'REPLACE_DRAFT': {
      return {
        savedDraft: action.draft,
        editingLinkedAccounts: action.draft.linkedAccounts,
        isEditingLinkedAccounts: false,
      };
    }

    case 'START_LINKED_ACCOUNTS_EDIT': {
      return {
        ...state,
        editingLinkedAccounts: state.savedDraft.linkedAccounts,
        isEditingLinkedAccounts: true,
      };
    }

    case 'TOGGLE_LINKED_PROVIDER': {
      if (!state.isEditingLinkedAccounts) {
        return state;
      }

      return {
        ...state,
        editingLinkedAccounts: state.editingLinkedAccounts.map((account) =>
          account.provider === action.provider
            ? {
                ...account,
                linked: !account.linked,
              }
            : account,
        ),
      };
    }

    case 'SAVE_LINKED_ACCOUNTS_EDIT': {
      if (!state.isEditingLinkedAccounts) {
        return state;
      }

      return {
        savedDraft: {
          ...state.savedDraft,
          linkedAccounts: state.editingLinkedAccounts,
        },
        editingLinkedAccounts: state.editingLinkedAccounts,
        isEditingLinkedAccounts: false,
      };
    }

    case 'CANCEL_LINKED_ACCOUNTS_EDIT': {
      return {
        ...state,
        editingLinkedAccounts: state.savedDraft.linkedAccounts,
        isEditingLinkedAccounts: false,
      };
    }

    case 'REQUEST_DELETION': {
      return {
        ...state,
        savedDraft: {
          ...state.savedDraft,
          status: 'pending_deletion',
          deletionRequestedAt: action.requestedAtIso,
        },
      };
    }

    case 'RECOVER_ACCOUNT': {
      return {
        ...state,
        savedDraft: {
          ...state.savedDraft,
          status: 'active',
          deletionRequestedAt: null,
        },
      };
    }

    case 'RESET_ACCOUNT_LIFECYCLE': {
      return createInitialAccountLifecycleStoreState();
    }

    default:
      return state;
  }
}
