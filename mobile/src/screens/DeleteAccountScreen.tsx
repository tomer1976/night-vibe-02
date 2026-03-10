import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Input, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { validateDeletionConfirmationToken } from '../validation/formValidation';
import { readAccountSettingsDraftFromParams } from './accountSettingsDraft';

const DELETE_CONFIRMATION_TOKEN = 'DELETE';

export function DeleteAccountScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const draft = readAccountSettingsDraftFromParams(route.params);

  const [confirmationToken, setConfirmationToken] = useState('');
  const [tokenError, setTokenError] = useState<string | undefined>();

  const requestDeletion = () => {
    const nextTokenError = validateDeletionConfirmationToken(confirmationToken, DELETE_CONFIRMATION_TOKEN);

    if (nextTokenError) {
      setTokenError(nextTokenError);
      return;
    }

    setTokenError(undefined);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.AccountDeletionRecovery, {
        draft: {
          ...draft,
          status: 'pending_deletion',
          deletionRequestedAt: new Date().toISOString(),
        },
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Start mock pending-deletion lifecycle with a confirmation token." title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card title="Delete Account Screen">
          <Text style={[styles.body, { color: theme.colors.textPrimary, marginBottom: theme.spacing.md }]}>This moves account status to pending deletion and starts a {draft.recoveryWindowDays}-day recovery window.</Text>
          <Input
            errorText={tokenError}
            label="Confirmation token"
            onChangeText={setConfirmationToken}
            placeholder="Type DELETE"
            testID="delete-account-confirmation-token"
            value={confirmationToken}
          />
        </Card>

        <View style={[styles.actions, { gap: theme.spacing.md }]}> 
          <Button label="Request Deletion" onPress={requestDeletion} variant="destructive" />
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
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
  },
});