import { useMemo } from 'react';

import { AppRouteName, canAccessRoute, resolveRouteWithFallback, SimulatedRoleContext } from '../navigation';
import { useAuthState, useFeatureFlagsState, useRoleState } from './AppStateProvider';

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

  return useMemo(
    () => ({
      simulatedRoleContext,
      canAccess: (routeName: AppRouteName) => canAccessRoute(routeName, simulatedRoleContext),
      resolve: (routeName: AppRouteName) => resolveRouteWithFallback(routeName, simulatedRoleContext),
      resolveWithAccess: (routeName: AppRouteName): RouteResolution => {
        const resolvedRoute = resolveRouteWithFallback(routeName, simulatedRoleContext);

        return {
          requestedRoute: routeName,
          resolvedRoute,
          isAllowed: resolvedRoute === routeName,
        };
      },
    }),
    [simulatedRoleContext]
  );
}