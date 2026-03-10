import {
  createInitialProfileDraftStoreState,
  profileDraftStoreReducer,
} from '../src/state/profileDraftStore';

describe('profileDraftStore', () => {
  it('starts editing from saved draft and saves updates', () => {
    const initialState = createInitialProfileDraftStoreState();
    const editingState = profileDraftStoreReducer(initialState, { type: 'START_EDIT' });
    const updatedEditingState = profileDraftStoreReducer(editingState, {
      type: 'UPDATE_EDIT_DRAFT',
      patch: {
        displayName: 'Noa',
      },
    });
    const savedState = profileDraftStoreReducer(updatedEditingState, { type: 'SAVE_EDIT' });

    expect(savedState.isEditing).toBe(false);
    expect(savedState.savedDraft.displayName).toBe('Noa');
    expect(savedState.editingDraft.displayName).toBe('Noa');
  });

  it('cancels edits and restores saved draft', () => {
    const initialState = createInitialProfileDraftStoreState();
    const editingState = profileDraftStoreReducer(initialState, { type: 'START_EDIT' });
    const updatedEditingState = profileDraftStoreReducer(editingState, {
      type: 'UPDATE_EDIT_DRAFT',
      patch: {
        bio: 'Unsaved bio update',
      },
    });
    const cancelledState = profileDraftStoreReducer(updatedEditingState, { type: 'CANCEL_EDIT' });

    expect(cancelledState.isEditing).toBe(false);
    expect(cancelledState.savedDraft.bio).toBe(initialState.savedDraft.bio);
    expect(cancelledState.editingDraft.bio).toBe(initialState.savedDraft.bio);
  });

  it('ignores edit patch updates when not editing', () => {
    const initialState = createInitialProfileDraftStoreState();
    const updatedState = profileDraftStoreReducer(initialState, {
      type: 'UPDATE_EDIT_DRAFT',
      patch: {
        preferredGenders: 'female',
      },
    });

    expect(updatedState).toEqual(initialState);
  });
});
