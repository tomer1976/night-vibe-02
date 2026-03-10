import { AccountStatus } from '../contracts';

export type AuthLifecycle = 'signed_out' | 'authenticating' | 'authenticated' | 'session_recovery' | 'access_denied';

export type AuthStoreState = {
  accountStatus: AccountStatus;
  isAuthenticated: boolean;
  authLifecycle: AuthLifecycle;
};

type CompleteAuthenticationPayload = {
  accountStatus: AccountStatus;
  isAuthenticated?: boolean;
};

export type AuthStoreAction =
  | { type: 'SET_ACCOUNT_STATUS'; status: AccountStatus }
  | { type: 'SET_AUTHENTICATED'; isAuthenticated: boolean }
  | { type: 'BEGIN_AUTHENTICATION' }
  | { type: 'COMPLETE_AUTHENTICATION'; payload: CompleteAuthenticationPayload }
  | { type: 'ENTER_SESSION_RECOVERY' }
  | { type: 'RESOLVE_SESSION_RECOVERY' }
  | { type: 'DENY_ACCESS'; status: Extract<AccountStatus, 'suspended' | 'banned' | 'deleted'> }
  | { type: 'RESET_AUTH_STATE'; accountStatus?: AccountStatus; isAuthenticated?: boolean };

function lifecycleFromStatus(status: AccountStatus, isAuthenticated: boolean): AuthLifecycle {
  if (!isAuthenticated) {
    return 'signed_out';
  }

  if (status === 'pending_deletion') {
    return 'session_recovery';
  }

  if (status === 'suspended' || status === 'banned' || status === 'deleted') {
    return 'access_denied';
  }

  return 'authenticated';
}

export function createInitialAuthStoreState(initial: {
  accountStatus: AccountStatus;
  isAuthenticated: boolean;
}): AuthStoreState {
  return {
    accountStatus: initial.accountStatus,
    isAuthenticated: initial.isAuthenticated,
    authLifecycle: lifecycleFromStatus(initial.accountStatus, initial.isAuthenticated),
  };
}

export function authStoreReducer(state: AuthStoreState, action: AuthStoreAction): AuthStoreState {
  switch (action.type) {
    case 'SET_ACCOUNT_STATUS': {
      return {
        ...state,
        accountStatus: action.status,
        authLifecycle: lifecycleFromStatus(action.status, state.isAuthenticated),
      };
    }

    case 'SET_AUTHENTICATED': {
      return {
        ...state,
        isAuthenticated: action.isAuthenticated,
        authLifecycle: lifecycleFromStatus(state.accountStatus, action.isAuthenticated),
      };
    }

    case 'BEGIN_AUTHENTICATION': {
      return {
        ...state,
        isAuthenticated: false,
        authLifecycle: 'authenticating',
      };
    }

    case 'COMPLETE_AUTHENTICATION': {
      const nextAuthenticated = action.payload.isAuthenticated ?? true;

      return {
        accountStatus: action.payload.accountStatus,
        isAuthenticated: nextAuthenticated,
        authLifecycle: lifecycleFromStatus(action.payload.accountStatus, nextAuthenticated),
      };
    }

    case 'ENTER_SESSION_RECOVERY': {
      return {
        accountStatus: 'pending_deletion',
        isAuthenticated: true,
        authLifecycle: 'session_recovery',
      };
    }

    case 'RESOLVE_SESSION_RECOVERY': {
      return {
        accountStatus: 'active',
        isAuthenticated: true,
        authLifecycle: 'authenticated',
      };
    }

    case 'DENY_ACCESS': {
      return {
        accountStatus: action.status,
        isAuthenticated: true,
        authLifecycle: 'access_denied',
      };
    }

    case 'RESET_AUTH_STATE': {
      const nextAccountStatus = action.accountStatus ?? 'active';
      const nextAuthenticated = action.isAuthenticated ?? false;

      return {
        accountStatus: nextAccountStatus,
        isAuthenticated: nextAuthenticated,
        authLifecycle: lifecycleFromStatus(nextAccountStatus, nextAuthenticated),
      };
    }

    default:
      return state;
  }
}
