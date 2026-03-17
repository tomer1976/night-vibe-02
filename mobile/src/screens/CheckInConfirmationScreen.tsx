import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiErrorCode } from '../contracts';
import { Badge, Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { usePresenceSessionState } from '../state';
import { useTheme } from '../theme';

type CheckInConfirmationRouteParams = {
  venueId?: string;
  venueName?: string;
};

type CheckInScenario =
  | 'in_range_success'
  | 'out_of_range'
  | 'location_permission_denied'
  | 'stale_location'
  | 'venue_ineligible';

const scenarioLabels: Record<CheckInScenario, string> = {
  in_range_success: 'In Range Success',
  out_of_range: 'Out of Range',
  location_permission_denied: 'Location Permission Denied',
  stale_location: 'Stale Location',
  venue_ineligible: 'Venue Ineligible',
};

const scenarioDescription: Record<CheckInScenario, string> = {
  in_range_success: 'Simulates an eligible in-range check-in attempt.',
  out_of_range: 'Simulates distance validation denial.',
  location_permission_denied: 'Simulates unavailable or denied location permission.',
  stale_location: 'Simulates stale location payload validation denial.',
  venue_ineligible: 'Simulates target venue not active/not eligible.',
};

const deniedMessagingByCode: Record<ApiErrorCode, { title: string; message: string }> = {
  VALIDATION_ERROR: {
    title: 'Check-in blocked: refresh your location',
    message: 'Your location reading is stale. Refresh location and confirm check-in again.',
  },
  UNAUTHORIZED: {
    title: 'Check-in blocked: session expired',
    message: 'Your auth session is no longer valid. Sign in again and retry check-in.',
  },
  PERMISSION_DENIED: {
    title: 'Check-in blocked: location permission is required',
    message: 'Enable location permission to verify venue proximity before check-in.',
  },
  NOT_CHECKED_IN: {
    title: 'Check-in blocked: session state mismatch',
    message: 'Your current session state could not be validated. Refresh and retry.',
  },
  OUT_OF_RANGE: {
    title: 'Check-in blocked: you are out of range',
    message: 'Move closer to this venue and retry once you are within the check-in radius.',
  },
  DUPLICATE_INTERACTION: {
    title: 'Check-in blocked: duplicate request',
    message: 'A similar request was already processed. Wait briefly and refresh session state.',
  },
  CHAT_EXPIRED: {
    title: 'Check-in blocked: session expired',
    message: 'Your active session has expired. Start a fresh check-in attempt.',
  },
  RATE_LIMIT_EXCEEDED: {
    title: 'Check-in blocked: too many attempts',
    message: 'You reached the retry limit. Wait a moment before trying again.',
  },
  ACCESS_DENIED: {
    title: 'Check-in blocked: access denied',
    message: 'Your account does not currently have access to this action.',
  },
  NOT_FOUND: {
    title: 'Check-in blocked: venue is not eligible',
    message: 'This venue is unavailable for check-in in the current mock scenario.',
  },
  CONFLICT: {
    title: 'Check-in blocked: conflicting session state',
    message: 'Your session changed during check-in. Refresh active session state and retry.',
  },
  INTERNAL_ERROR: {
    title: 'Check-in blocked: temporary error',
    message: 'A temporary issue occurred. Retry check-in in a moment.',
  },
};

export function CheckInConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();
  const { applyCheckInResult } = usePresenceSessionState();

  const typedParams = route.params as CheckInConfirmationRouteParams | undefined;
  const venueId = typedParams?.venueId;
  const venueName = typedParams?.venueName ?? 'Selected Venue';

  const [selectedScenario, setSelectedScenario] = useState<CheckInScenario>('in_range_success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultTitle, setResultTitle] = useState<string | undefined>();
  const [resultText, setResultText] = useState<string | undefined>();
  const [resultTone, setResultTone] = useState<'neutral' | 'success' | 'warning' | 'danger'>('neutral');

  const scenarioRequestPayload = useMemo(() => {
    if (!venueId) {
      return null;
    }

    if (selectedScenario === 'in_range_success') {
      return {
        venueId,
        latitude: 32.0853,
        longitude: 34.7818,
      };
    }

    if (selectedScenario === 'out_of_range') {
      return {
        venueId,
        latitude: 32.1501,
        longitude: 34.9201,
      };
    }

    if (selectedScenario === 'location_permission_denied') {
      return {
        venueId,
        latitude: Number.NaN,
        longitude: Number.NaN,
      };
    }

    if (selectedScenario === 'stale_location') {
      return {
        venueId,
        latitude: 32.0853,
        longitude: 34.7818,
        locationCapturedAt: '2026-03-08T10:00:00.000Z',
      };
    }

    return {
      venueId: `${venueId}-ineligible`,
      latitude: 32.0853,
      longitude: 34.7818,
    };
  }, [selectedScenario, venueId]);

  const handleConfirmCheckIn = async () => {
    if (!scenarioRequestPayload || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setResultTitle(undefined);
    setResultText(undefined);
    setResultTone('neutral');

    try {
      const response = await services.presence.checkInWithContext(scenarioRequestPayload);

      if (response.status === 'FAIL') {
        const deniedMessage = deniedMessagingByCode[response.error.code];
        setResultTone('danger');
        setResultTitle(deniedMessage.title);
        setResultText(`${deniedMessage.message} (Reason: ${response.error.code})`);
        return;
      }

      applyCheckInResult(response.data);

      setResultTone('success');
      setResultTitle('Check-in confirmed');
      setResultText(`Check-in succeeded. Session ${response.data.sessionId} opened at ${response.data.checkinTimestamp}.`);
    } catch {
      setResultTone('danger');
      setResultTitle(deniedMessagingByCode.INTERNAL_ERROR.title);
      setResultText(`${deniedMessagingByCode.INTERNAL_ERROR.message} (Reason: INTERNAL_ERROR)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Check-in confirmation" title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
          <Card subtitle={venueId ? `Venue: ${venueName}` : 'Missing venue context'} title="Venue Check-In Confirmation Screen">
            <View style={{ gap: theme.spacing.sm }}>
            {!venueId ? (
              <Text style={{ color: theme.colors.danger, fontSize: theme.typography.bodySmall }}>
                Venue reference is missing. Return to Venue Details and retry.
              </Text>
            ) : null}

            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              Select a deterministic mock scenario for this confirmation attempt.
            </Text>

            {(
              ['in_range_success', 'out_of_range', 'location_permission_denied', 'stale_location', 'venue_ineligible'] as CheckInScenario[]
            ).map((scenario) => (
              <Button
                key={scenario}
                label={scenarioLabels[scenario]}
                onPress={() => setSelectedScenario(scenario)}
                variant={selectedScenario === scenario ? 'primary' : 'secondary'}
              />
            ))}

            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
              {scenarioDescription[selectedScenario]}
            </Text>

            <Button
              disabled={!venueId || isSubmitting}
              label={isSubmitting ? 'Confirming...' : 'Confirm Check-In'}
              onPress={() => void handleConfirmCheckIn()}
            />

            {resultText ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Badge label={resultTone === 'success' ? 'Result: Success' : 'Result: Denied'} tone={resultTone === 'success' ? 'success' : 'danger'} />
              </View>
            ) : null}

            {resultTitle ? <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>{resultTitle}</Text> : null}

            {resultText ? <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{resultText}</Text> : null}

            {resultTone === 'success' ? (
              <Button
                label="Open Venue Page"
                onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId }))}
              />
            ) : null}

              <Button label="Open Venue Details" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId }))} variant="secondary" />
            </View>
          </Card>
        </ScrollView>
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