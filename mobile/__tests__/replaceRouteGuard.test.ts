import { shouldReplaceRoute } from '../src/navigation/replaceRouteGuard';
import { ROUTE_NAMES } from '../src/navigation/routeGroups';

describe('replace route guard', () => {
  it('allows replacing when target route differs from current route', () => {
    expect(shouldReplaceRoute(ROUTE_NAMES.UserGroup, ROUTE_NAMES.OwnerGroup)).toBe(true);
  });

  it('blocks replacing when target route equals current route', () => {
    expect(shouldReplaceRoute(ROUTE_NAMES.UserGroup, ROUTE_NAMES.UserGroup)).toBe(false);
  });

  it('blocks unknown fallback replace when requested route context is unchanged', () => {
    expect(
      shouldReplaceRoute(
        ROUTE_NAMES.UnknownRouteFallback,
        ROUTE_NAMES.UnknownRouteFallback,
        { requestedRouteName: ROUTE_NAMES.OwnerGroup },
        { requestedRouteName: ROUTE_NAMES.OwnerGroup }
      )
    ).toBe(false);
  });

  it('allows unknown fallback replace when requested route context changes', () => {
    expect(
      shouldReplaceRoute(
        ROUTE_NAMES.UnknownRouteFallback,
        ROUTE_NAMES.UnknownRouteFallback,
        { requestedRouteName: ROUTE_NAMES.OwnerGroup },
        { requestedRouteName: ROUTE_NAMES.AdminGroup }
      )
    ).toBe(true);
  });
});
