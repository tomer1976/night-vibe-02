import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type BlockUserRouteParams = {
  targetUserId?: string;
  targetDisplayName?: string;
  matchId?: string;
};

export function BlockUserConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();

  const params = (route.params as BlockUserRouteParams | undefined) ?? {};
  const targetUserId = params.targetUserId;
  const targetDisplayName = params.targetDisplayName ?? 'Selected user';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [resultText, setResultText] = useState<string | undefined>();

  const canConfirm = useMemo(
    () => Boolean(targetUserId) && !isSubmitting && !isBlocked,
    [isBlocked, isSubmitting, targetUserId]
  );

  const handleConfirmBlock = async () => {
    if (!targetUserId || isSubmitting || isBlocked) {
      return;
    }

    setIsSubmitting(true);
    setResultText(undefined);

    try {
      const response = await services.safety.blockUser(targetUserId);

      if (response.status === 'FAIL') {
        setResultText(`Block action failed: ${response.error.code}. ${response.error.message}`);
        return;
      }

      setIsBlocked(true);
      setResultText(
        `User blocked in mock mode. Target ${response.data.targetUserId} is now restricted across discovery and chat.`
      );
    } catch {
      setResultText('Block action failed: INTERNAL_ERROR. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Block user confirmation" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Block User Confirmation Screen" title={`Block ${targetDisplayName}?`}>
          <View style={{ gap: theme.spacing.sm }}>
            {targetUserId ? (
              <Badge label={`Target: ${targetUserId}`} tone="danger" />
            ) : (
              <Text style={{ color: theme.colors.danger, fontSize: theme.typography.bodySmall }}>
                Missing target user context. Reopen this flow from chat or profile preview.
              </Text>
            )}

            {params.matchId ? <Badge label={`Match: ${params.matchId}`} tone="info" /> : null}

            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              This action immediately blocks future chat sends and discovery visibility for this user.
            </Text>

            <Button
              disabled={!canConfirm}
              label={isSubmitting ? 'Blocking...' : isBlocked ? 'User Blocked' : 'Confirm Block'}
              onPress={() => void handleConfirmBlock()}
            />

            {resultText ? (
              <Badge label={isBlocked ? 'Result: Blocked' : 'Result: Failed'} tone={isBlocked ? 'success' : 'danger'} />
            ) : null}
            {resultText ? (
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{resultText}</Text>
            ) : null}

            <Button
              label="Open Chat Threads"
              onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ChatThreads))}
              variant="secondary"
            />
          </View>
        </Card>
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
});
