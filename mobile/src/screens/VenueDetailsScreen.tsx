import { StackActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, DiscoveryCandidateCard, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { DiscoveryCandidate, MatchRecord, VenueSummary } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { selectCheckInEligibilityDisplayState, usePresenceSessionState } from '../state';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';
import { readVenuePeopleInteractionSnapshot } from './venuePeopleInteractionState';
import { formatLiveStatusLabel, formatVenueStatusLabel, toVenueStatusTone } from './venueStatusPresentation';
import { resolveVenuePhotoSource } from './venuePhotoSource';

type VenueDetailsRouteParams = {
  venueId?: string;
};

type VenuePeopleTab = 'potential_matches' | 'matches';
type DiscoveryFallbackReason = 'ineligible_state' | 'feed_exhausted';

const formatCategoryLabel = (category: VenueSummary['category']) => category.replaceAll('_', ' ');
const formatGenderLabel = (gender: DiscoveryCandidate['gender']) => gender.replace('_', ' ');
const formatMatchStatusLabel = (status: MatchRecord['status']) => status.replace('_', ' ');

const toMatchStatusTone = (status: MatchRecord['status']): 'success' | 'warning' | 'danger' => {
  if (status === 'matched') {
    return 'success';
  }

  if (status === 'expired') {
    return 'warning';
  }

  return 'danger';
};

export function VenueDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();
  const { activeSession, setSessionSnapshot } = usePresenceSessionState();

  const typedParams = route.params as VenueDetailsRouteParams | undefined;
  const venueId = typedParams?.venueId;

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isPresenceSynced, setIsPresenceSynced] = useState(false);
  const [venue, setVenue] = useState<VenueSummary | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | undefined>();
  const [isLoadingPotentialMatches, setIsLoadingPotentialMatches] = useState(false);
  const [potentialMatchesError, setPotentialMatchesError] = useState<string | undefined>();
  const [potentialMatches, setPotentialMatches] = useState<DiscoveryCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | undefined>();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [activePeopleTab, setActivePeopleTab] = useState<VenuePeopleTab>('potential_matches');
  const [interactionStateVersion, setInteractionStateVersion] = useState(0);

  const syncPresenceSnapshot = useCallback(async () => {
    const [sessionResponse, transitionResponse] = await Promise.all([
      services.presence.getMyActiveSession(),
      services.presence.getStateTransitions(),
    ]);

    if (sessionResponse.status === 'SUCCESS' && transitionResponse.status === 'SUCCESS') {
      setSessionSnapshot(sessionResponse.data, transitionResponse.data, new Date().toISOString());
    }

    setIsPresenceSynced(true);
  }, [services.presence, setSessionSnapshot]);

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

  useEffect(() => {
    void syncPresenceSnapshot();
  }, [syncPresenceSnapshot]);

  useEffect(() => {
    if (!venueId || !isPresenceSynced) {
      return;
    }

    const isCheckedIntoVenue = activeSession?.status === 'active' && activeSession.venueId === venueId;

    if (!isCheckedIntoVenue) {
      navigation.dispatch(
        StackActions.replace(ROUTE_NAMES.DiscoveryFallback, {
          reason: 'ineligible_state',
          venueId,
        })
      );
    }
  }, [activeSession, isPresenceSynced, navigation, venueId]);

  const checkInEligibilityDisplay = useMemo(
    () => selectCheckInEligibilityDisplayState(venue, activeSession),
    [activeSession, venue]
  );

  const isCheckedIntoViewedVenue = useMemo(
    () => Boolean(venue && activeSession?.status === 'active' && activeSession.venueId === venue.venueId),
    [activeSession, venue]
  );

  const loadVenuePeople = useCallback(async () => {
    if (!venue) {
      setPotentialMatches([]);
      setPotentialMatchesError(undefined);
      setMatches([]);
      setMatchesError(undefined);
      return;
    }

    if (!isCheckedIntoViewedVenue) {
      setPotentialMatches([]);
      setPotentialMatchesError(undefined);
      setMatches([]);
      setMatchesError(undefined);
      return;
    }

    setIsLoadingPotentialMatches(true);
    setIsLoadingMatches(true);
    setPotentialMatchesError(undefined);
    setMatchesError(undefined);

    try {
      const [candidatesResponse, matchesResponse] = await Promise.all([
        services.discovery.getCandidates(),
        services.match.getMatches(),
      ]);

      if (candidatesResponse.status === 'FAIL') {
        setPotentialMatches([]);
        setPotentialMatchesError(candidatesResponse.error.message);
      } else {
        const venueScopedCandidates = candidatesResponse.data.items.filter((candidate) => candidate.venueId === venue.venueId);
        setPotentialMatches(venueScopedCandidates);
      }

      if (matchesResponse.status === 'FAIL') {
        setMatches([]);
        setMatchesError(matchesResponse.error.message);
      } else {
        const venueScopedMatches = matchesResponse.data.filter((match) => match.venueId === venue.venueId);
        setMatches(venueScopedMatches);
      }
    } catch {
      setPotentialMatches([]);
      setPotentialMatchesError('Unable to load potential matches right now. Please retry.');
      setMatches([]);
      setMatchesError('Unable to load matches right now. Please retry.');
    } finally {
      setIsLoadingPotentialMatches(false);
      setIsLoadingMatches(false);
    }
  }, [isCheckedIntoViewedVenue, services.discovery, services.match, venue]);

  useEffect(() => {
    void loadVenuePeople();
  }, [loadVenuePeople]);

  useFocusEffect(
    useCallback(() => {
      void loadVenuePeople();
      setInteractionStateVersion((version) => version + 1);
    }, [loadVenuePeople])
  );

  const interactionSnapshot = useMemo(() => {
    const version = interactionStateVersion;
    void version;

    if (!venue) {
      return {
        dismissedPotentialUserIds: [] as string[],
        likedPotentialUserIds: [] as string[],
        hiddenMatchIds: [] as string[],
        returnedPotentials: [] as DiscoveryCandidate[],
      };
    }

    return readVenuePeopleInteractionSnapshot(venue.venueId);
  }, [interactionStateVersion, venue]);

  const visiblePotentialMatches = useMemo(() => {
    const byUserId = new Map<string, DiscoveryCandidate>();

    for (const candidate of potentialMatches) {
      byUserId.set(candidate.userId, candidate);
    }

    for (const candidate of interactionSnapshot.returnedPotentials) {
      byUserId.set(candidate.userId, candidate);
    }

    return [...byUserId.values()].filter(
      (candidate) => !interactionSnapshot.dismissedPotentialUserIds.includes(candidate.userId)
    );
  }, [interactionSnapshot.dismissedPotentialUserIds, interactionSnapshot.returnedPotentials, potentialMatches]);

  const visibleMatches = useMemo(
    () => matches.filter((match) => !interactionSnapshot.hiddenMatchIds.includes(match.matchId)),
    [interactionSnapshot.hiddenMatchIds, matches]
  );

  const handleVenueAction = useCallback(async () => {
    if (!venue || isSubmittingAction) {
      return;
    }

    setActionFeedback(undefined);
    setIsSubmittingAction(true);

    try {
      if (!(activeSession?.status === 'active' && activeSession.venueId === venue.venueId)) {
        navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues));
        return;
      }

      const checkoutResponse = await services.presence.checkOut(activeSession.sessionId);

      if (checkoutResponse.status === 'FAIL') {
        setActionFeedback(checkoutResponse.error.message);
        return;
      }

      await syncPresenceSnapshot();
      await loadVenuePeople();
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues));
    } catch {
      setActionFeedback('Unable to update venue session right now. Please retry.');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [activeSession, isSubmittingAction, loadVenuePeople, navigation, services.presence, syncPresenceSnapshot, venue]);

  const venueActionLabel = 'Checkout';

  const isVenueActionDisabled = useMemo(() => {
    if (!venue || isSubmittingAction) {
      return true;
    }

    return venue.status !== 'active' || !(activeSession?.status === 'active' && activeSession.venueId === venue.venueId);
  }, [activeSession, isSubmittingAction, venue]);

  const openDiscoveryFallback = useCallback(
    (reason: DiscoveryFallbackReason) => {
      navigation.dispatch(
        StackActions.push(ROUTE_NAMES.DiscoveryFallback, {
          reason,
          venueId: venue?.venueId,
        })
      );
    },
    [navigation, venue?.venueId]
  );

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
          <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
            <Card subtitle={`${venue.distanceKm.toFixed(2)} km away`} title="Venue Details Screen">
              <View style={{ gap: theme.spacing.sm }}>
                <Image source={resolveVenuePhotoSource(venue)} style={[styles.venuePhoto, { borderRadius: theme.radius.sm }]} />

                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{venue.name}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Category: {formatCategoryLabel(venue.category)}</Text>
                {venue.addressText ? (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Address: {venue.addressText}</Text>
                ) : null}
                {venue.description ? (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{venue.description}</Text>
                ) : null}
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  Activity: {venue.activitySnapshot.checkinCount} active • {formatLiveStatusLabel(venue.activitySnapshot.liveStatus)}
                </Text>

                <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                  <Badge label={`Status: ${formatVenueStatusLabel(venue.status)}`} tone={toVenueStatusTone(venue.status)} />
                  {activeSession?.status === 'active' && activeSession.venueId === venue.venueId ? <Badge label="You are checked in" tone="success" /> : null}
                </View>

                {checkInEligibilityDisplay.helperMessage && !isCheckedIntoViewedVenue ? (
                  <Text style={{ color: theme.colors.warning, fontSize: theme.typography.bodySmall }}>
                    {checkInEligibilityDisplay.helperMessage}
                  </Text>
                ) : null}

                {actionFeedback ? (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{actionFeedback}</Text>
                ) : null}

                <Button disabled={isVenueActionDisabled} label={isSubmittingAction ? 'Updating…' : venueActionLabel} onPress={() => void handleVenueAction()} />

                <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                    <Pressable
                      accessibilityLabel="Potential Matches tab"
                      accessibilityRole="button"
                      accessibilityState={{ selected: activePeopleTab === 'potential_matches' }}
                      onPress={() => setActivePeopleTab('potential_matches')}
                      style={{
                        flex: 1,
                        borderRadius: theme.radius.sm,
                        borderWidth: 1,
                        borderColor: activePeopleTab === 'potential_matches' ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                        backgroundColor:
                          activePeopleTab === 'potential_matches' ? theme.colors.backgroundSecondary : theme.colors.backgroundPrimary,
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>Potential Matches</Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Matches tab"
                      accessibilityRole="button"
                      accessibilityState={{ selected: activePeopleTab === 'matches' }}
                      onPress={() => setActivePeopleTab('matches')}
                      style={{
                        flex: 1,
                        borderRadius: theme.radius.sm,
                        borderWidth: 1,
                        borderColor: activePeopleTab === 'matches' ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                        backgroundColor: activePeopleTab === 'matches' ? theme.colors.backgroundSecondary : theme.colors.backgroundPrimary,
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>Matches</Text>
                    </Pressable>
                  </View>

                  {!isCheckedIntoViewedVenue ? (
                    <EmptyStateTemplate
                      actionLabel="Open Discovery Fallback"
                      message="Check in to this venue to load discovery candidates and matches."
                      onAction={() => openDiscoveryFallback('ineligible_state')}
                      title="Discovery Requires Active Session"
                    />
                  ) : activePeopleTab === 'potential_matches' ? (
                    isLoadingPotentialMatches ? (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Loading potential matches...</Text>
                    ) : potentialMatchesError ? (
                      <ErrorStateTemplate
                        actionLabel="Retry"
                        message={potentialMatchesError}
                        onAction={() => void loadVenuePeople()}
                        title="Potential Matches Failed"
                      />
                    ) : potentialMatches.length === 0 ? (
                      <EmptyStateTemplate
                        actionLabel="Open Discovery Fallback"
                        message="No potential matches are available in this venue right now."
                        onAction={() => openDiscoveryFallback('feed_exhausted')}
                        title="No Potential Matches"
                      />
                    ) : (
                      visiblePotentialMatches.length === 0 ? (
                        <EmptyStateTemplate
                          actionLabel="Open Discovery Fallback"
                          message="No potential matches are available in this venue right now."
                          onAction={() => openDiscoveryFallback('feed_exhausted')}
                          title="No Potential Matches"
                        />
                      ) : (
                        <View style={{ gap: theme.spacing.sm }}>
                          {visiblePotentialMatches.map((candidate) => {
                            const isLiked = interactionSnapshot.likedPotentialUserIds.includes(candidate.userId);

                            return (
                              <DiscoveryCandidateCard
                                actionLabel="View profile"
                                imageSource={resolveUserPhotoSource(candidate)}
                                key={candidate.userId}
                                onPress={() => {
                                  navigation.dispatch(
                                    StackActions.push(ROUTE_NAMES.DiscoveryProfilePreview, {
                                      venueId: candidate.venueId,
                                      source: 'potential',
                                      userId: candidate.userId,
                                      displayName: candidate.displayName,
                                      age: candidate.age,
                                      gender: candidate.gender,
                                      profilePhotoUrl: candidate.profilePhotoUrl,
                                    })
                                  );
                                }}
                                statusLabel={isLiked ? 'Liked' : undefined}
                                title={`${candidate.displayName} • ${candidate.age} • ${formatGenderLabel(candidate.gender)}`}
                              />
                            );
                          })}
                        </View>
                      )
                    )
                  ) : isLoadingMatches ? (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Loading matches...</Text>
                  ) : matchesError ? (
                    <ErrorStateTemplate
                      actionLabel="Retry"
                      message={matchesError}
                      onAction={() => void loadVenuePeople()}
                      title="Matches Failed"
                    />
                  ) : matches.length === 0 ? (
                    <EmptyStateTemplate
                      actionLabel="Open Discovery Fallback"
                      message="No matches are available in this venue right now."
                      onAction={() => openDiscoveryFallback('feed_exhausted')}
                      title="No Matches"
                    />
                  ) : (
                    visibleMatches.length === 0 ? (
                      <EmptyStateTemplate
                        actionLabel="Open Discovery Fallback"
                        message="No matches are available in this venue right now."
                        onAction={() => openDiscoveryFallback('feed_exhausted')}
                        title="No Matches"
                      />
                    ) : (
                      <View style={{ gap: theme.spacing.sm }}>
                        {visibleMatches.map((match) => {
                          return (
                            <DiscoveryCandidateCard
                              actionLabel="View profile"
                              imageSource={resolveUserPhotoSource(match.counterpart)}
                              key={match.matchId}
                              onPress={() => {
                                navigation.dispatch(
                                  StackActions.push(ROUTE_NAMES.DiscoveryProfilePreview, {
                                    venueId: match.venueId,
                                    source: 'match',
                                    userId: match.counterpart.userId,
                                    displayName: match.counterpart.displayName,
                                    age: match.counterpart.age,
                                    gender: match.counterpart.gender,
                                    profilePhotoUrl: match.counterpart.profilePhotoUrl,
                                    matchId: match.matchId,
                                  })
                                );
                              }}
                              statusLabel={`Match Status: ${formatMatchStatusLabel(match.status)}`}
                              statusTone={toMatchStatusTone(match.status)}
                              title={`${match.counterpart.displayName} • ${match.counterpart.age} • ${formatGenderLabel(match.counterpart.gender)}`}
                            />
                          );
                        })}
                      </View>
                    )
                  )}

                </View>

                <Button label="Back to Nearby Venues" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))} variant="secondary" />
              </View>
            </Card>
          </ScrollView>
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
  venuePhoto: {
    width: '100%',
    height: 180,
  },
});