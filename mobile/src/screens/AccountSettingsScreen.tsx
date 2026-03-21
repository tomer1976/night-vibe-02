import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, BottomNavShell, Button, Card, ListItem, TopBar } from '../components';
import { isMainTabKey, MAIN_TAB_ITEMS, resolveMainTabRouteName } from '../navigation/mainTabs';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useAccountLifecycleState } from '../state';
import { useTheme } from '../theme';
import {
  areAccountSettingsDraftsEqual,
  DEFAULT_ACCOUNT_SETTINGS_DRAFT,
  readAccountSettingsDraftFromParams,
} from './accountSettingsDraft';

const statusToneByValue = {
  active: 'success',
  suspended: 'warning',
  banned: 'danger',
  pending_deletion: 'warning',
  deleted: 'danger',
} as const;

export function AccountSettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { replaceAccountLifecycleDraft, savedDraft: draft } = useAccountLifecycleState();
  const hasSeededFromParamsRef = useRef(false);

  useEffect(() => {
    if (hasSeededFromParamsRef.current) {
      return;
    }

    const typedParams = route.params as { draft?: unknown } | undefined;

    if (!typedParams?.draft) {
      return;
    }

    if (!areAccountSettingsDraftsEqual(draft, DEFAULT_ACCOUNT_SETTINGS_DRAFT)) {
      hasSeededFromParamsRef.current = true;
      return;
    }

    replaceAccountLifecycleDraft(readAccountSettingsDraftFromParams(route.params));
    hasSeededFromParamsRef.current = true;
  }, [draft, replaceAccountLifecycleDraft, route.params]);

  const linkedProviders = draft.linkedAccounts.filter((account) => account.linked).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Manage account status, linked providers, and deletion lifecycle." title="Night Vibe" variant="main-tab" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Account Settings Screen">
          <View style={[styles.row, { marginBottom: theme.spacing.md }]}> 
            <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }]}>Account Status</Text>
            <Badge label={draft.status.replace('_', ' ')} tone={statusToneByValue[draft.status]} />
          </View>

          <Text style={[styles.value, { color: theme.colors.textPrimary, fontSize: theme.typography.body, marginBottom: theme.spacing.xs }]}>
            Linked Providers: {linkedProviders}/{draft.linkedAccounts.length}
          </Text>
          <Text style={[styles.value, { color: theme.colors.textSecondary, fontSize: theme.typography.body }]}>Recovery Window: {draft.recoveryWindowDays} days</Text>
        </Card>

        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.NotificationCenter))}
          subtitle="Review in-app notifications and unread/read transitions"
          title="Notification Center Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.NotificationPreferences))}
          subtitle="Manage notification category preferences"
          title="Notification Preferences Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.LinkedAccounts))}
          subtitle="Link and unlink provider accounts"
          title="Linked Accounts Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.DeleteAccount))}
          subtitle="Request account deletion and start recovery window"
          title="Delete Account Screen"
          trailingText="Open"
        />
        <ListItem
          onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.AccountDeletionRecovery))}
          subtitle="Cancel pending deletion within recovery window"
          title="Account Deletion Recovery Screen"
          trailingText="Open"
        />

        <Button label="Open Profile" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserProfile))} variant="secondary" />
      </View>

      <View style={[styles.bottom, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }]}> 
        <BottomNavShell
          activeKey="settings"
          items={MAIN_TAB_ITEMS}
          onItemPress={(item) => {
            if (!isMainTabKey(item.key)) {
              return;
            }

            const targetRouteName = resolveMainTabRouteName(item.key);

            if (!shouldReplaceRoute(ROUTE_NAMES.AccountSettings, targetRouteName, undefined, undefined)) {
              return;
            }

            navigation.dispatch(StackActions.replace(targetRouteName));
          }}
        />
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
});