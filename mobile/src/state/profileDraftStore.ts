import { DEFAULT_PROFILE_DRAFT, ProfileDraft } from '../screens/profileDraft';

export type ProfileDraftStoreState = {
  savedDraft: ProfileDraft;
  editingDraft: ProfileDraft;
  isEditing: boolean;
};

export type ProfileDraftStoreAction =
  | { type: 'REPLACE_DRAFT'; draft: ProfileDraft }
  | { type: 'START_EDIT'; draft?: ProfileDraft }
  | { type: 'UPDATE_EDIT_DRAFT'; patch: Partial<ProfileDraft> }
  | { type: 'SAVE_EDIT' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'RESET_DRAFT' };

export function createInitialProfileDraftStoreState(initialDraft: ProfileDraft = DEFAULT_PROFILE_DRAFT): ProfileDraftStoreState {
  return {
    savedDraft: initialDraft,
    editingDraft: initialDraft,
    isEditing: false,
  };
}

export function profileDraftStoreReducer(
  state: ProfileDraftStoreState,
  action: ProfileDraftStoreAction,
): ProfileDraftStoreState {
  switch (action.type) {
    case 'REPLACE_DRAFT': {
      return {
        savedDraft: action.draft,
        editingDraft: action.draft,
        isEditing: false,
      };
    }

    case 'START_EDIT': {
      const draft = action.draft ?? state.savedDraft;

      return {
        ...state,
        editingDraft: draft,
        isEditing: true,
      };
    }

    case 'UPDATE_EDIT_DRAFT': {
      if (!state.isEditing) {
        return state;
      }

      return {
        ...state,
        editingDraft: {
          ...state.editingDraft,
          ...action.patch,
        },
      };
    }

    case 'SAVE_EDIT': {
      if (!state.isEditing) {
        return state;
      }

      return {
        savedDraft: state.editingDraft,
        editingDraft: state.editingDraft,
        isEditing: false,
      };
    }

    case 'CANCEL_EDIT': {
      return {
        ...state,
        editingDraft: state.savedDraft,
        isEditing: false,
      };
    }

    case 'RESET_DRAFT': {
      return createInitialProfileDraftStoreState();
    }

    default:
      return state;
  }
}
