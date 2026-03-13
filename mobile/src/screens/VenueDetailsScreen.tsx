import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { VenueSummary } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { selectCheckInEligibilityDisplayState, usePresenceSessionState } from '../state';
import { useTheme } from '../theme';
import { formatLiveStatusLabel, formatVenueStatusLabel, toVenueStatusTone } from './venueStatusPresentation';

type VenueDetailsRouteParams = {
  venueId?: string;
};

const formatCategoryLabel = (category: VenueSummary['category']) => category.replaceAll('_', ' ');

export function VenueDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();
  const { activeSession } = usePresenceSessionState();

  const typedParams = route.params as VenueDetailsRouteParams | undefined;
  const venueId = typedParams?.venueId;

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [venue, setVenue] = useState<VenueSummary | null>(null);

  const loadVenueDetails = useCallback(async () => {
    if (!venueId) {
      setErrorText('Venue reference is missing. Please reopen venue details from Nearby Venues.');
      setVenue(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.venues.getNearbyVenues();

      if (response.status === 'FAIL') {
        setErrorText(response.error.message);
        setVenue(null);
        return;
      }

      const selectedVenue = response.data.find((candidate) => candidate.venueId === venueId) ?? null;

      if (!selectedVenue) {
        setErrorText('Venue no longer exists in this mock dataset. Refresh and try another venue.');
        setVenue(null);
        return;
      }

      setVenue(selectedVenue);
    } catch {
      setErrorText('Unable to load venue details right now. Please try again.');
      setVenue(null);
    } finally {
      setIsLoading(false);
    }
  }, [services.venues, venueId]);

  useEffect(() => {
    void loadVenueDetails();
  }, [loadVenueDetails]);

  const checkInEligibilityDisplay = useMemo(
    () => selectCheckInEligibilityDisplayState(venue, activeSession),
    [activeSession, venue]
  );

  const handleCheckInEntry = useCallback(() => {
    if (!venue || !checkInEligibilityDisplay.canAttemptCheckIn) {
      return;
    }

    navigation.dispatch(
      StackActions.push(ROUTE_NAMES.CheckInConfirmation, {
        venueId: venue.venueId,
        venueName: venue.name,
      })
    );
  }, [checkInEligibilityDisplay.canAttemptCheckIn, navigation, venue]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Venue details" title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading venue details and check-in eligibility." title="Fetching Venue Details" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadVenueDetails()} title="Venue Details Failed" />
        ) : venue ? (
          <Card subtitle={`${venue.distanceKm.toFixed(2)} km away`} title="Venue Details Screen">
            <View style={{ gap: theme.spacing.sm }}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{venue.name}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Category: {formatCategoryLabel(venue.category)}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                Activity: {venue.activitySnapshot.checkinCount} active • {formatLiveStatusLabel(venue.activitySnapshot.liveStatus)}
              </Text>

              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Badge label={`Status: ${formatVenueStatusLabel(venue.status)}`} tone={toVenueStatusTone(venue.status)} />
              </View>

              {checkInEligibilityDisplay.helperMessage ? (
                <Text style={{ color: theme.colors.warning, fontSize: theme.typography.bodySmall }}>
                  {checkInEligibilityDisplay.helperMessage}
                </Text>
              ) : null}

              <Button
                disabled={!checkInEligibilityDisplay.canAttemptCheckIn}
                label={checkInEligibilityDisplay.buttonLabel}
                onPress={() => void handleCheckInEntry()}
              />

              <Button label="Back to Nearby Venues" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))} variant="secondary" />
            </View>
          </Card>
        ) : null}
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