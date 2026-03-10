import { useMemo } from 'react';

import { ROUTE_NAMES } from '../navigation';
import { AppRouteName } from '../navigation/routeGroups';
import { canAccessRoute, resolveRouteWithFallback, SimulatedRoleContext } from '../navigation/roleContextSimulation';
import { useAuthState, useFeatureFlagsState, useOnboardingState, useRoleState } from './AppStateProvider';

export type RouteResolution = {
  requestedRoute: AppRouteName;
  resolvedRoute: AppRouteName;
  isAllowed: boolean;
};

export function useSimulatedRoleContextSelector(): SimulatedRoleContext {
  const { isAuthenticated } = useAuthState();
  const { activeRoleContext, availableRoles } = useRoleState();
  const { isRoleSimulationEnabled } = useFeatureFlagsState();

  return useMemo<SimulatedRoleContext>(
    () => ({
      isAuthenticated: isRoleSimulationEnabled ? isAuthenticated : false,
      activeRoleContext: isRoleSimulationEnabled ? activeRoleContext : null,
      availableRoles: isRoleSimulationEnabled ? availableRoles : [],
    }),
    [activeRoleContext, availableRoles, isAuthenticated, isRoleSimulationEnabled]
  );
}

export function useRouteAccessSelectors() {
  const simulatedRoleContext = useSimulatedRoleContextSelector();
  const { profileCompleted } = useOnboardingState();

  return useMemo(
    () => {
      const isPostOnboardingRoute = (routeName: AppRouteName) =>
        routeName === ROUTE_NAMES.UserGroup ||
        routeName === ROUTE_NAMES.UserProfile ||
        routeName === ROUTE_NAMES.EditProfile ||
        routeName === ROUTE_NAMES.ProfilePhotosManagement ||
        routeName === ROUTE_NAMES.AccountSettings ||
        routeName === ROUTE_NAMES.LinkedAccounts ||
        routeName === ROUTE_NAMES.DeleteAccount ||
        routeName === ROUTE_NAMES.AccountDeletionRecovery;

      const resolveWithOnboardingGate = (routeName: AppRouteName) => {
        const roleResolvedRoute = resolveRouteWithFallback(routeName, simulatedRoleContext);

        if (roleResolvedRoute !== routeName) {
          return roleResolvedRoute;
        }

        if (isPostOnboardingRoute(routeName) && !profileCompleted) {
          return ROUTE_NAMES.ProfileCompletionRequired;
        }

        return routeName;
      };

      return {
        simulatedRoleContext,
        canAccess: (routeName: AppRouteName) => canAccessRoute(routeName, simulatedRoleContext),
        resolve: (routeName: AppRouteName) => resolveWithOnboardingGate(routeName),
        resolveWithAccess: (routeName: AppRouteName): RouteResolution => {
          const resolvedRoute = resolveWithOnboardingGate(routeName);

          return {
            requestedRoute: routeName,
            resolvedRoute,
            isAllowed: resolvedRoute === routeName,
          };
        },
      };
    },
    [profileCompleted, simulatedRoleContext]
  );
}