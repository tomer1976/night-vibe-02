import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BottomNavShell, Button, Card, EmptyStateTemplate, ListItem, TopBar } from '../components';
import { AppRouteName, ROUTE_NAMES } from '../navigation/routeGroups';
import { useProfileDraftState } from '../state';
import { useRouteAccessSelectors } from '../state/routeSelectors';
import { useTheme } from '../theme';
import { DEFAULT_ACCOUNT_SETTINGS_DRAFT } from './accountSettingsDraft';
import { areProfileDraftsEqual, DEFAULT_PROFILE_DRAFT, readProfileDraftFromParams } from './profileDraft';

const navItems = [
  { key: 'auth', label: 'Auth' },
  { key: 'user', label: 'User' },
  { key: 'owner', label: 'Owner' },
  { key: 'moderator', label: 'Mod' },
  { key: 'admin', label: 'Admin' },
];

export function UserProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { replaceProfileDraft, savedDraft: draft } = useProfileDraftState();
  const { resolve } = useRouteAccessSelectors();
  const hasSeededFromParamsRef = useRef(false);

  useEffect(() => {
    if (hasSeededFromParamsRef.current) {
      return;
    }

    const typedParams = route.params as { draft?: unknown } | undefined;

    if (!typedParams?.draft) {
      return;
    }

    if (!areProfileDraftsEqual(draft, DEFAULT_PROFILE_DRAFT)) {
      hasSeededFromParamsRef.current = true;
      return;
    }

    replaceProfileDraft(readProfileDraftFromParams(route.params));
    hasSeededFromParamsRef.current = true;
  }, [draft, replaceProfileDraft, route.params]);

  const approvedPhotos = draft.photos.filter((photo) => photo.moderationStatus === 'approved').length;
  const hasProfileContent =
    draft.displayName.trim().length > 0 ||
    draft.bio.trim().length > 0 ||
    draft.preferredGenders.trim().length > 0 ||
    draft.photos.length > 0;

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

    if (safeRoute === ROUTE_NAMES.UnknownRouteFallback) {
      navigation.dispatch(
        StackActions.replace(ROUTE_NAMES.UnknownRouteFallback, {
          requestedRouteName: requestedRoute,
        })
      );

      return;
    }

    navigation.dispatch(StackActions.replace(safeRoute));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="View and manage your mock profile." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {hasProfileContent ? (
          <Card title="User Profile Screen">
            <View style={[styles.row, { marginBottom: theme.spacing.sm }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>Display Name</Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>{draft.displayName}</Text>
            </View>

            <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall, marginBottom: theme.spacing.xs }]}>Bio</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body, marginBottom: theme.spacing.md }]}>{draft.bio}</Text>

            <View style={[styles.badges, { gap: theme.spacing.sm, marginBottom: theme.spacing.md }]}> 
              <Badge label={draft.profileCompleted ? 'Profile Complete' : 'Profile Incomplete'} tone={draft.profileCompleted ? 'success' : 'warning'} />
              <Badge label={`Photos ${approvedPhotos}/${draft.photos.length} approved`} tone="info" />
            </View>

            <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>Preferences</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>Ages {draft.preferredAgeMin}-{draft.preferredAgeMax}</Text>
            <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body }]}>Genders: {draft.preferredGenders}</Text>
          </Card>
        ) : (
          <EmptyStateTemplate
            actionLabel="Complete Profile"
            message="Add your profile details to unlock discovery and matching readiness."
            onAction={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.EditProfile, { draft }))}
            title="Profile is empty"
          />
        )}

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.EditProfile))}
          subtitle="Update name, bio, and preferences"
          title="Edit Profile Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.ProfilePhotosManagement, { draft }))}
          subtitle="Upload/remove photos and moderation states"
          title="Profile Photos Management Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.AccountSettings, { draft: DEFAULT_ACCOUNT_SETTINGS_DRAFT }))}
          subtitle="Manage linked accounts and deletion lifecycle"
          title="Account Settings Screen"
          trailingText="Open"
        />

        <Button label="Back to User Entry" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))} variant="secondary" />
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
  },
  value: {
  },
  badges: {
    flexDirection: 'row',
  },
});