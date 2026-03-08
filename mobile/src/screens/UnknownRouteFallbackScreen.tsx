import { AppRouteName, ROUTE_NAMES } from '../navigation';
import { ShellEntryScreen } from './ShellEntryScreen';
import { useRoute } from '@react-navigation/native';

type ShellRouteContext = 'auth' | 'user' | 'owner' | 'moderator' | 'admin' | 'none';

type UnknownRouteFallbackScreenProps = {
  subtitle?: string;
  requestedRouteName?: AppRouteName;
};

type UnknownRouteFallbackParams = {
  requestedRouteName?: AppRouteName;
};

function mapRouteNameToContext(routeName?: AppRouteName): ShellRouteContext {
  if (routeName === ROUTE_NAMES.AuthGroup) {
    return 'auth';
  }

  if (routeName === ROUTE_NAMES.UserGroup) {
    return 'user';
  }

  if (routeName === ROUTE_NAMES.OwnerGroup) {
    return 'owner';
  }

  if (routeName === ROUTE_NAMES.ModeratorGroup) {
    return 'moderator';
  }

  if (routeName === ROUTE_NAMES.AdminGroup) {
    return 'admin';
  }

  return 'none';
}

export function UnknownRouteFallbackScreen({ subtitle, requestedRouteName }: UnknownRouteFallbackScreenProps) {
  const route = useRoute();
  const routeParams = route.params as UnknownRouteFallbackParams | undefined;
  const effectiveRequestedRouteName = requestedRouteName ?? routeParams?.requestedRouteName;

  return (
    <ShellEntryScreen
      routeContext={mapRouteNameToContext(effectiveRequestedRouteName)}
      stateTemplate="error"
      subtitle={subtitle ?? 'Fallback route for invalid navigation context.'}
      title="Unknown Route"
    />
  );
}