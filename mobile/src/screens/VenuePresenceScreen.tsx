import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, LoadingStateTemplate, TopBar } from '../components';
import { DiscoveryCandidate, VenueSummary } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

type VenuePresenceViewModel = {
  venueId: string;
  venueName: string;
  activeAttendeeCount: number;
  attendees: DiscoveryCandidate[];
};

export function VenuePresenceScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [presenceView, setPresenceView] = useState<VenuePresenceViewModel | null>(null);

  const loadVenuePresence = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const [activeSessionResponse, nearbyVenuesResponse, candidatesResponse] = await Promise.all([
        services.presence.getMyActiveSession(),
        services.venues.getNearbyVenues(),
        services.discovery.getCandidates(),
      ]);

      if (activeSessionResponse.status === 'FAIL') {
        setErrorText(activeSessionResponse.error.message);
        setPresenceView(null);
        return;
      }

      if (nearbyVenuesResponse.status === 'FAIL') {
        setErrorText(nearbyVenuesResponse.error.message);
        setPresenceView(null);
        return;
      }

      if (candidatesResponse.status === 'FAIL') {
        setErrorText(candidatesResponse.error.message);
        setPresenceView(null);
        return;
      }

      if (!activeSessionResponse.data) {
        setPresenceView(null);
        return;
      }

      const activeSession = activeSessionResponse.data;
      const activeVenueSummary: VenueSummary | undefined = nearbyVenuesResponse.data.find(
        (venue) => venue.venueId === activeSession.venueId
      );

      const attendees = candidatesResponse.data.items.filter((candidate) => candidate.venueId === activeSession.venueId);

      setPresenceView({
        venueId: activeSession.venueId,
        venueName: activeVenueSummary?.name ?? activeSession.venueId,
        activeAttendeeCount: activeVenueSummary?.activitySnapshot.checkinCount ?? attendees.length + 1,
        attendees,
      });
    } catch {
      setErrorText('Unable to load venue presence right now. Please retry.');
      setPresenceView(null);
    } finally {
      setIsLoading(false);
    }
  }, [services.discovery, services.presence, services.venues]);

  useEffect(() => {
    void loadVenuePresence();
  }, [loadVenuePresence]);

  const attendeeSummary = useMemo(() => {
    if (!presenceView) {
      return '';
    }

    const visibleCount = presenceView.attendees.length;
    return `${visibleCount} attendee summaries visible in this mock scenario.`;
  }, [presenceView]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Venue presence" title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading active venue attendees from deterministic mock state." title="Fetching Venue Presence" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadVenuePresence()} title="Venue Presence Failed" />
        ) : !presenceView ? (
          <EmptyStateTemplate
            actionLabel="Browse Nearby Venues"
            message="No active session is available, so venue presence cannot be displayed."
            onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))}
            title="No Active Session"
          />
        ) : (
          <Card subtitle={`Venue: ${presenceView.venueName}`} title="Venue Presence Screen">
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Badge label={`Active attendees: ${presenceView.activeAttendeeCount}`} tone="success" />
                <Badge label={`Visible summaries: ${presenceView.attendees.length}`} tone="neutral" />
              </View>

              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{attendeeSummary}</Text>

              {presenceView.attendees.map((attendee) => (
                <ListItem
                  key={attendee.userId}
                  subtitle={`Age ${attendee.age} • Venue ${attendee.venueId}`}
                  title={attendee.displayName}
                  trailingText="Active"
                />
              ))}

              {presenceView.attendees.length === 0 ? (
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  No additional active attendee summaries are available right now.
                </Text>
              ) : null}

              <Button label="Refresh Presence" onPress={() => void loadVenuePresence()} variant="secondary" />
              <Button
                label="Back to Active Session"
                onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ActiveVenueSession))}
                variant="secondary"
              />
            </View>
          </Card>
        )}
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
