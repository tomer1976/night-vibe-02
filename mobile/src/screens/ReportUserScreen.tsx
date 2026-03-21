import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, Input, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type ReportUserRouteParams = {
  targetUserId?: string;
  targetDisplayName?: string;
  matchId?: string;
};

type ReportReason = 'harassment' | 'spam' | 'fake_profile' | 'inappropriate_behavior' | 'other';

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  harassment: 'Harassment',
  spam: 'Spam',
  fake_profile: 'Fake Profile',
  inappropriate_behavior: 'Inappropriate Behavior',
  other: 'Other',
};

const REPORT_REASONS: ReportReason[] = ['harassment', 'spam', 'fake_profile', 'inappropriate_behavior', 'other'];

export function ReportUserScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();

  const params = (route.params as ReportUserRouteParams | undefined) ?? {};
  const targetUserId = params.targetUserId;
  const targetDisplayName = params.targetDisplayName ?? 'Selected user';
  const [selectedReason, setSelectedReason] = useState<ReportReason>('harassment');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultText, setResultText] = useState<string | undefined>();
  const [resultTone, setResultTone] = useState<'success' | 'danger' | undefined>();

  const canSubmit = useMemo(() => Boolean(targetUserId) && !isSubmitting, [isSubmitting, targetUserId]);

  const handleSubmitReport = async () => {
    if (!targetUserId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setResultText(undefined);
    setResultTone(undefined);

    try {
      const reason = selectedReason;
      const response = await services.safety.reportUser(targetUserId, reason);

      if (response.status === 'FAIL') {
        setResultTone('danger');
        setResultText(`Report submission failed: ${response.error.code}. ${response.error.message}`);
        return;
      }

      setResultTone('success');
      setResultText(
        `Report submitted in mock mode. Report ID: ${response.data.reportId}. Status: ${response.data.status}.`
      );
      setDescription('');
    } catch {
      setResultTone('danger');
      setResultText('Report submission failed: INTERNAL_ERROR. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Safety report submission" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="Report User Screen" title={`Report ${targetDisplayName}`}>
          <View style={{ gap: theme.spacing.sm }}>
            {targetUserId ? (
              <Badge label={`Target: ${targetUserId}`} tone="warning" />
            ) : (
              <Text style={{ color: theme.colors.danger, fontSize: theme.typography.bodySmall }}>
                Missing target user context. Reopen this flow from chat or profile preview.
              </Text>
            )}

            {params.matchId ? <Badge label={`Match: ${params.matchId}`} tone="info" /> : null}

            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              Select one reason and submit a deterministic mock report.
            </Text>

            {REPORT_REASONS.map((reason) => (
              <Button
                key={reason}
                label={REPORT_REASON_LABELS[reason]}
                onPress={() => setSelectedReason(reason)}
                variant={selectedReason === reason ? 'primary' : 'secondary'}
              />
            ))}

            <Input
              helperText="Optional context for Sprint-05 mock evidence."
              label="Description"
              multiline
              onChangeText={setDescription}
              placeholder="Describe what happened (optional)"
              value={description}
            />

            <Button
              disabled={!canSubmit}
              label={isSubmitting ? 'Submitting...' : 'Submit Report'}
              onPress={() => void handleSubmitReport()}
            />

            {resultText && resultTone ? (
              <Badge label={resultTone === 'success' ? 'Result: Submitted' : 'Result: Failed'} tone={resultTone} />
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
