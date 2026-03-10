import {
  accountLifecycleStoreReducer,
  createInitialAccountLifecycleStoreState,
} from '../src/state/accountLifecycleStore';

describe('accountLifecycleStore', () => {
  it('saves linked account edits', () => {
    const initialState = createInitialAccountLifecycleStoreState();
    const editingState = accountLifecycleStoreReducer(initialState, { type: 'START_LINKED_ACCOUNTS_EDIT' });
    const toggledState = accountLifecycleStoreReducer(editingState, {
      type: 'TOGGLE_LINKED_PROVIDER',
      provider: 'apple',
    });
    const savedState = accountLifecycleStoreReducer(toggledState, { type: 'SAVE_LINKED_ACCOUNTS_EDIT' });

    expect(savedState.isEditingLinkedAccounts).toBe(false);
    expect(savedState.savedDraft.linkedAccounts.find((account) => account.provider === 'apple')?.linked).toBe(true);
  });

  it('cancels linked account edits and restores saved linked state', () => {
    const initialState = createInitialAccountLifecycleStoreState();
    const editingState = accountLifecycleStoreReducer(initialState, { type: 'START_LINKED_ACCOUNTS_EDIT' });
    const toggledState = accountLifecycleStoreReducer(editingState, {
      type: 'TOGGLE_LINKED_PROVIDER',
      provider: 'apple',
    });
    const cancelledState = accountLifecycleStoreReducer(toggledState, { type: 'CANCEL_LINKED_ACCOUNTS_EDIT' });

    expect(cancelledState.isEditingLinkedAccounts).toBe(false);
    expect(cancelledState.savedDraft.linkedAccounts.find((account) => account.provider === 'apple')?.linked).toBe(false);
    expect(cancelledState.editingLinkedAccounts.find((account) => account.provider === 'apple')?.linked).toBe(false);
  });

  it('applies request deletion and recover transitions', () => {
    const initialState = createInitialAccountLifecycleStoreState();
    const pendingDeletionState = accountLifecycleStoreReducer(initialState, {
      type: 'REQUEST_DELETION',
      requestedAtIso: '2026-03-11T00:00:00.000Z',
    });
    const recoveredState = accountLifecycleStoreReducer(pendingDeletionState, { type: 'RECOVER_ACCOUNT' });

    expect(pendingDeletionState.savedDraft.status).toBe('pending_deletion');
    expect(pendingDeletionState.savedDraft.deletionRequestedAt).toBe('2026-03-11T00:00:00.000Z');
    expect(recoveredState.savedDraft.status).toBe('active');
    expect(recoveredState.savedDraft.deletionRequestedAt).toBeNull();
  });
});
