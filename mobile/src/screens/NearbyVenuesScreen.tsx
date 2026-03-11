import { useCallback, useEffect, useMemo, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VenueSummary } from '../contracts';
import { Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, LoadingStateTemplate, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

const formatCategoryLabel = (category: VenueSummary['category']) => category.replace('_', ' ');

const formatLiveStatusLabel = (status: VenueSummary['activitySnapshot']['liveStatus']) => {
  if (status === 'busy') {
    return 'Busy now';
  }

  if (status === 'steady') {
    return 'Steady now';
  }

  return 'Calm now';
};

export function NearbyVenuesScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [venues, setVenues] = useState<VenueSummary[]>([]);

  const fetchNearbyVenues = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.venues.getNearbyVenues();

      if (response.status === 'FAIL') {
        setErrorText(response.error.message);
        setVenues([]);
        return;
      }

      setVenues(response.data);
    } catch {
      setErrorText('Unable to load nearby venues right now. Please try again.');
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  }, [services.venues]);

  useEffect(() => {
    void fetchNearbyVenues();
  }, [fetchNearbyVenues]);

  const summaryText = useMemo(() => {
    if (venues.length === 0) {
      return 'No nearby active venues in this mock scenario.';
    }

    return `${venues.length} active venues available for check-in.`;
  }, [venues.length]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Nearby venues" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading venue distance and activity snapshot metadata." title="Fetching Nearby Venues" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void fetchNearbyVenues()} title="Venue Discovery Failed" />
        ) : venues.length === 0 ? (
          <EmptyStateTemplate actionLabel="Refresh" message="Try refreshing to rerun deterministic mock discovery." onAction={() => void fetchNearbyVenues()} title="No Nearby Venues" />
        ) : (
          <Card subtitle={summaryText} title="Nearby Venues Screen">
            <View style={{ gap: theme.spacing.md }}>
              {venues.map((venue) => (
                <ListItem
                  key={venue.venueId}
                  subtitle={`${venue.distanceKm.toFixed(2)} km • ${formatCategoryLabel(venue.category)} • ${venue.status} • ${venue.activitySnapshot.checkinCount} active • ${formatLiveStatusLabel(venue.activitySnapshot.liveStatus)}`}
                  title={venue.name}
                  trailingText="Details"
                />
              ))}

              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
                List is mock-backed, deterministic, and sorted by configured mock distance.
              </Text>

              <Button label="Back to User Entry" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))} variant="secondary" />
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
