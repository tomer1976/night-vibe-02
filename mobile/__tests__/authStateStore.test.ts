import { authStoreReducer, createInitialAuthStoreState } from '../src/state/authStateStore';

describe('authStateStore', () => {
  it('initializes lifecycle based on auth and account status', () => {
    const activeAuthenticated = createInitialAuthStoreState({
      accountStatus: 'active',
      isAuthenticated: true,
    });

    const pendingDeletionAuthenticated = createInitialAuthStoreState({
      accountStatus: 'pending_deletion',
      isAuthenticated: true,
    });

    const signedOut = createInitialAuthStoreState({
      accountStatus: 'active',
      isAuthenticated: false,
    });

    expect(activeAuthenticated.authLifecycle).toBe('authenticated');
    expect(pendingDeletionAuthenticated.authLifecycle).toBe('session_recovery');
    expect(signedOut.authLifecycle).toBe('signed_out');
  });

  it('handles authentication flow transitions', () => {
    const initialState = createInitialAuthStoreState({
      accountStatus: 'active',
      isAuthenticated: false,
    });

    const authenticatingState = authStoreReducer(initialState, { type: 'BEGIN_AUTHENTICATION' });
    const suspendedState = authStoreReducer(authenticatingState, {
      type: 'COMPLETE_AUTHENTICATION',
      payload: { accountStatus: 'suspended' },
    });

    expect(authenticatingState.authLifecycle).toBe('authenticating');
    expect(authenticatingState.isAuthenticated).toBe(false);
    expect(suspendedState.authLifecycle).toBe('access_denied');
    expect(suspendedState.isAuthenticated).toBe(true);
    expect(suspendedState.accountStatus).toBe('suspended');
  });

  it('handles session recovery transitions', () => {
    const initialState = createInitialAuthStoreState({
      accountStatus: 'active',
      isAuthenticated: false,
    });

    const recoveryState = authStoreReducer(initialState, { type: 'ENTER_SESSION_RECOVERY' });
    const resolvedState = authStoreReducer(recoveryState, { type: 'RESOLVE_SESSION_RECOVERY' });

    expect(recoveryState.accountStatus).toBe('pending_deletion');
    expect(recoveryState.authLifecycle).toBe('session_recovery');
    expect(resolvedState.accountStatus).toBe('active');
    expect(resolvedState.authLifecycle).toBe('authenticated');
  });

  it('supports reset to explicit state', () => {
    const initialState = createInitialAuthStoreState({
      accountStatus: 'banned',
      isAuthenticated: true,
    });

    const resetState = authStoreReducer(initialState, {
      type: 'RESET_AUTH_STATE',
      accountStatus: 'active',
      isAuthenticated: false,
    });

    expect(resetState.accountStatus).toBe('active');
    expect(resetState.isAuthenticated).toBe(false);
    expect(resetState.authLifecycle).toBe('signed_out');
  });
});
