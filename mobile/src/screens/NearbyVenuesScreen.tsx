import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VenueSummary } from '../contracts';
import { Badge, BottomNavShell, Button, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { isMainTabKey, MAIN_TAB_ITEMS, resolveMainTabRouteName } from '../navigation/mainTabs';
import { shouldReplaceRoute } from '../navigation/replaceRouteGuard';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { usePresenceSessionState, useVenueDiscoveryState } from '../state';
import { useTheme } from '../theme';
import { formatLiveStatusLabel, formatVenueStatusLabel, toLiveStatusTone, toVenueStatusTone } from './venueStatusPresentation';
import { resolveVenuePhotoSource } from './venuePhotoSource';

const formatCategoryLabel = (category: VenueSummary['category']) => category.replace('_', ' ');

export function NearbyVenuesScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();
  const { clearCachedVenues, setCachedVenues, visibleVenues } = useVenueDiscoveryState();
  const { activeSession, setSessionSnapshot } = usePresenceSessionState();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [activeVenueActionId, setActiveVenueActionId] = useState<string | null>(null);
  const suppressNextCardPressRef = useRef(false);

  const syncPresenceSnapshot = useCallback(async () => {
    const [sessionResponse, transitionResponse] = await Promise.all([
      services.presence.getMyActiveSession(),
      services.presence.getStateTransitions(),
    ]);

    if (sessionResponse.status === 'SUCCESS' && transitionResponse.status === 'SUCCESS') {
      setSessionSnapshot(sessionResponse.data, transitionResponse.data, new Date().toISOString());
    }
  }, [services.presence, setSessionSnapshot]);

  const fetchNearbyVenues = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.venues.getNearbyVenues();

      if (response.status === 'FAIL') {
        setErrorText(response.error.message);
        clearCachedVenues();
        return;
      }

      setCachedVenues(response.data);
    } catch {
      setErrorText('Unable to load nearby venues right now. Please try again.');
      clearCachedVenues();
    } finally {
      setIsLoading(false);
    }
  }, [clearCachedVenues, services.venues, setCachedVenues]);

  useEffect(() => {
    void fetchNearbyVenues();
  }, [fetchNearbyVenues]);

  useEffect(() => {
    void syncPresenceSnapshot();
  }, [syncPresenceSnapshot]);

  const summaryText = useMemo(() => {
    if (visibleVenues.length === 0) {
      return 'No nearby active venues in this mock scenario.';
    }

    return `${visibleVenues.length} active venues available for check-in.`;
  }, [visibleVenues.length]);

  const openVenueDetails = useCallback(
    (venueId: string) => {
      navigation.dispatch(StackActions.push(ROUTE_NAMES.VenueDetails, { venueId }));
    },
    [navigation]
  );

  const performVenueAction = useCallback(
    async (venue: VenueSummary) => {
      if (activeVenueActionId) {
        return;
      }

      setActiveVenueActionId(venue.venueId);

      try {
        if (activeSession?.status === 'active' && activeSession.venueId !== venue.venueId) {
          setErrorText('Check out from your current venue before checking in to another venue.');
          return;
        }

        if (activeSession?.status === 'active' && activeSession.venueId === venue.venueId) {
          const checkoutResponse = await services.presence.checkOut(activeSession.sessionId);

          if (checkoutResponse.status === 'FAIL') {
            setErrorText(checkoutResponse.error.message);
            return;
          }
        } else {
          navigation.dispatch(
            StackActions.push(ROUTE_NAMES.CheckInConfirmation, {
              venueId: venue.venueId,
              venueName: venue.name,
            })
          );
          return;
        }

        await syncPresenceSnapshot();
      } catch {
        setErrorText('Unable to update venue session right now. Please retry.');
      } finally {
        setActiveVenueActionId(null);
      }
    },
    [activeSession, activeVenueActionId, navigation, services.presence, syncPresenceSnapshot]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Nearby venues" title="Night Vibe" variant="main-tab" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading venue distance and activity snapshot metadata." title="Fetching Nearby Venues" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void fetchNearbyVenues()} title="Venue Discovery Failed" />
        ) : visibleVenues.length === 0 ? (
          <EmptyStateTemplate actionLabel="Refresh" message="Try refreshing to rerun deterministic mock discovery." onAction={() => void fetchNearbyVenues()} title="No Nearby Venues" />
        ) : (
          <ScrollView
            contentContainerStyle={{
              gap: theme.spacing.md,
              paddingBottom: theme.spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Card subtitle={summaryText} title="Nearby Venues Screen">
              <View style={{ gap: theme.spacing.md }}>
                {visibleVenues.map((venue) => {
                  const isCheckedIntoVenue = activeSession?.status === 'active' && activeSession.venueId === venue.venueId;
                  const isCheckedIntoAnotherVenue = activeSession?.status === 'active' && activeSession.venueId !== venue.venueId;
                  const isBusy = activeVenueActionId === venue.venueId;
                  const isVenueActionDisabled = isBusy || isCheckedIntoAnotherVenue;

                  return (
                    <Pressable
                      accessibilityRole={isCheckedIntoVenue ? 'button' : undefined}
                      disabled={!isCheckedIntoVenue}
                      key={venue.venueId}
                      onPress={() => {
                        if (suppressNextCardPressRef.current) {
                          suppressNextCardPressRef.current = false;
                          return;
                        }

                        openVenueDetails(venue.venueId);
                      }}
                      style={({ pressed }) => ({ opacity: isCheckedIntoVenue && pressed ? 0.92 : 1 })}
                    >
                      <Card subtitle={`Category: ${formatCategoryLabel(venue.category)}`} title={venue.name}>
                        <View style={{ gap: theme.spacing.sm }}>
                          <View style={{ gap: theme.spacing.sm }}>
                            <Image source={resolveVenuePhotoSource(venue)} style={[styles.venuePhoto, { borderRadius: theme.radius.sm }]} />

                            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                              <Badge label={`Status: ${formatVenueStatusLabel(venue.status)}`} tone={toVenueStatusTone(venue.status)} />
                              <Badge
                                label={`Live: ${formatLiveStatusLabel(venue.activitySnapshot.liveStatus)}`}
                                tone={toLiveStatusTone(venue.activitySnapshot.liveStatus)}
                              />
                              {isCheckedIntoVenue ? <Badge label="You are checked in" tone="success" /> : null}
                            </View>

                            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                              Distance: {venue.distanceKm.toFixed(2)} km
                            </Text>
                            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                              Activity: {venue.activitySnapshot.checkinCount} active attendees
                            </Text>
                          </View>

                        <Button
                          disabled={isVenueActionDisabled}
                          label={isBusy ? 'Updating…' : isCheckedIntoVenue ? 'Checkout' : 'Check-In'}
                          onPress={() => {
                            suppressNextCardPressRef.current = true;
                            void performVenueAction(venue);
                          }}
                        />

                        {isCheckedIntoAnotherVenue ? (
                          <Text style={{ color: theme.colors.warning, fontSize: theme.typography.bodySmall }}>
                            Check out from your current venue before checking in here.
                          </Text>
                        ) : null}
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}

                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
                  List is mock-backed, deterministic, and sorted by configured mock distance.
                </Text>

                <Button label="Open User Entry" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))} variant="secondary" />
              </View>
            </Card>
          </ScrollView>
        )}
      </View>

      <View style={[styles.bottom, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }]}> 
        <BottomNavShell
          activeKey="venues"
          items={MAIN_TAB_ITEMS}
          onItemPress={(item) => {
            if (!isMainTabKey(item.key)) {
              return;
            }

            const targetRouteName = resolveMainTabRouteName(item.key);

            if (!shouldReplaceRoute(ROUTE_NAMES.NearbyVenues, targetRouteName, undefined, undefined)) {
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
  venuePhoto: {
    width: '100%',
    height: 140,
  },
});
