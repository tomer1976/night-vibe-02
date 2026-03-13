import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavShell, Button, Card, ListItem, TopBar } from '../components';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { useAuthState } from '../state';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { useTheme } from '../theme';
import { DEFAULT_PROFILE_DRAFT } from './profileDraft';

const navItems = [
  { key: 'auth', label: 'Auth' },
  { key: 'user', label: 'User' },
  { key: 'owner', label: 'Owner' },
  { key: 'moderator', label: 'Mod' },
  { key: 'admin', label: 'Admin' },
];

export function UserEntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { resetAuthState } = useAuthState();
  const { resolve } = useRouteAccessSelectors();

  const routeNameFromNavKey = (key: string): AppRouteName | null => {
    if (key === 'auth') {
      return ROUTE_NAMES.AuthGroup;
    }

    if (key === 'user') {
      return ROUTE_NAMES.UserGroup;
    }

    if (key === 'owner') {
      return ROUTE_NAMES.OwnerGroup;
    }

    if (key === 'moderator') {
      return ROUTE_NAMES.ModeratorGroup;
    }

    if (key === 'admin') {
      return ROUTE_NAMES.AdminGroup;
    }

    return null;
  };

  const handleItemPress = (item: { key: string }) => {
    const requestedRoute = routeNameFromNavKey(item.key);

    if (!requestedRoute) {
      return;
    }

    const safeRoute = resolve(requestedRoute);
    const currentRouteName = ROUTE_NAMES.UserGroup;

    if (safeRoute === ROUTE_NAMES.UnknownRouteFallback) {
      const targetParams = { requestedRouteName: requestedRoute };

      if (!shouldReplaceRoute(currentRouteName, ROUTE_NAMES.UnknownRouteFallback, undefined, targetParams)) {
        return;
      }

      navigation.dispatch(
        StackActions.replace(ROUTE_NAMES.UnknownRouteFallback, {
          requestedRouteName: requestedRoute,
        })
      );

      return;
    }

    if (!shouldReplaceRoute(currentRouteName, safeRoute, undefined, undefined)) {
      return;
    }

    navigation.dispatch(StackActions.replace(safeRoute));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Regular user route group shell." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Mock auth/onboarding complete. Continue to profile flows." title="User Entry">
          <ListItem
            onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.NearbyVenues))}
            subtitle="Browse nearby venues with category, status, and activity metadata"
            title="Nearby Venues Screen"
            trailingText="Open"
          />
          <ListItem
            onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.UserDiscoveryFeed))}
            subtitle="Review deterministic same-venue discovery candidates in feed order"
            title="User Discovery Feed Screen"
            trailingText="Open"
          />
          <ListItem
            onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.UserProfile, { draft: DEFAULT_PROFILE_DRAFT }))}
            subtitle="View profile details and completion status"
            title="User Profile Screen"
            trailingText="Open"
          />
          <View style={{ marginTop: theme.spacing.md }}>
            <Button
              label="Reset to Login"
              variant="secondary"
              onPress={() => {
                resetAuthState('active', false);
                navigation.dispatch(StackActions.replace(ROUTE_NAMES.Welcome));
              }}
            />
          </View>
        </Card>
      </View>

      <View style={[styles.bottom, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }]}> 
        <BottomNavShell activeKey="user" items={navItems} onItemPress={handleItemPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottom: {
    width: '100%',
  },
});