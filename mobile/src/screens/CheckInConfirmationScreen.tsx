import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type CheckInConfirmationRouteParams = {
  venueId?: string;
  venueName?: string;
};

type CheckInScenario = 'in_range_success' | 'out_of_range' | 'location_permission_denied' | 'venue_ineligible';

const scenarioLabels: Record<CheckInScenario, string> = {
  in_range_success: 'In Range Success',
  out_of_range: 'Out of Range',
  location_permission_denied: 'Location Permission Denied',
  venue_ineligible: 'Venue Ineligible',
};

const scenarioDescription: Record<CheckInScenario, string> = {
  in_range_success: 'Simulates an eligible in-range check-in attempt.',
  out_of_range: 'Simulates distance validation denial.',
  location_permission_denied: 'Simulates unavailable or denied location permission.',
  venue_ineligible: 'Simulates target venue not active/not eligible.',
};

export function CheckInConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();

  const typedParams = route.params as CheckInConfirmationRouteParams | undefined;
  const venueId = typedParams?.venueId;
  const venueName = typedParams?.venueName ?? 'Selected Venue';

  const [selectedScenario, setSelectedScenario] = useState<CheckInScenario>('in_range_success');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setResultText(undefined);
    setResultTone('neutral');

    try {
      const response = await services.presence.checkInWithContext(scenarioRequestPayload);

      if (response.status === 'FAIL') {
        setResultTone('danger');
        setResultText(`Check-in denied: ${response.error.code}. ${response.error.message}`);
        return;
      }

      setResultTone('success');
      setResultText(`Check-in succeeded. Session ${response.data.sessionId} opened at ${response.data.checkinTimestamp}.`);
    } catch {
      setResultTone('danger');
      setResultText('Check-in denied: INTERNAL_ERROR.');
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

            {(['in_range_success', 'out_of_range', 'location_permission_denied', 'venue_ineligible'] as CheckInScenario[]).map((scenario) => (
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

            {resultText ? <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{resultText}</Text> : null}

            <Button label="Back to Venue Details" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId }))} variant="secondary" />
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