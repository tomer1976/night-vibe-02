import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, InlineErrorMessage, ListItem, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { LinkedAccountProvider, readAccountSettingsDraftFromParams } from './accountSettingsDraft';

export function LinkedAccountsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readAccountSettingsDraftFromParams(route.params);

  const [linkedAccounts, setLinkedAccounts] = useState(draft.linkedAccounts);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const linkedCount = useMemo(() => linkedAccounts.filter((account) => account.linked).length, [linkedAccounts]);

  const toggleProvider = (provider: LinkedAccountProvider) => {
    const target = linkedAccounts.find((account) => account.provider === provider);

    if (!target) {
      return;
    }

    if (target.linked && linkedCount <= 1) {
      setErrorMessage('At least one provider must remain linked.');
      return;
    }

    setErrorMessage(undefined);
    setLinkedAccounts((previous) =>
      previous.map((account) =>
        account.provider === provider
          ? {
              ...account,
              linked: !account.linked,
            }
          : account
      )
    );
  };

  const saveLinkedAccounts = () => {
    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.AccountSettings, {
        draft: {
          ...draft,
          linkedAccounts,
        },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Mock provider link and unlink outcomes." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Linked Accounts Screen">
          <Text style={[styles.meta, { color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall, marginBottom: theme.spacing.md }]}>Linked providers: {linkedCount}</Text>

          <View style={[styles.items, { gap: theme.spacing.sm }]}> 
            {linkedAccounts.map((account) => (
              <ListItem
                key={account.provider}
                onPress={() => toggleProvider(account.provider)}
                subtitle={account.linked ? 'Linked to this account' : 'Not linked'}
                title={`${account.provider.charAt(0).toUpperCase()}${account.provider.slice(1)} Provider`}
                trailingText={account.linked ? 'Unlink' : 'Link'}
              />
            ))}
          </View>

          <InlineErrorMessage message={errorMessage} />
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md }]}> 
          <Button label="Save" onPress={saveLinkedAccounts} />
          <Button label="Cancel" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.AccountSettings, { draft }))} variant="secondary" />
        </View>
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
  items: {
    width: '100%',
  },
  meta: {
  },
  actions: {
    width: '100%',
  },
});