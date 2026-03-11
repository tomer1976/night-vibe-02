import { AppRouteName, ROUTE_NAMES } from './routeGroups';

type RouteParams = Record<string, unknown> | undefined;

type FallbackRouteParams = {
  requestedRouteName?: AppRouteName;
};

export function shouldReplaceRoute(
  currentRouteName: AppRouteName,
  targetRouteName: AppRouteName,
  currentRouteParams?: RouteParams,
  targetRouteParams?: RouteParams
) {
  if (currentRouteName !== targetRouteName) {
    return true;
  }

  if (targetRouteName !== ROUTE_NAMES.UnknownRouteFallback) {
    return false;
  }

  const currentRequestedRoute = (currentRouteParams as FallbackRouteParams | undefined)?.requestedRouteName;
  const targetRequestedRoute = (targetRouteParams as FallbackRouteParams | undefined)?.requestedRouteName;

  return currentRequestedRoute !== targetRequestedRoute;
}
