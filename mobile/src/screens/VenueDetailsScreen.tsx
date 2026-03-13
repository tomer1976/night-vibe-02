import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { DiscoveryCandidate, MatchRecord, VenueSummary } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { selectCheckInEligibilityDisplayState, usePresenceSessionState } from '../state';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';
import { formatLiveStatusLabel, formatVenueStatusLabel, toVenueStatusTone } from './venueStatusPresentation';
import { resolveVenuePhotoSource } from './venuePhotoSource';

type VenueDetailsRouteParams = {
  venueId?: string;
};

type VenuePeopleTab = 'potential_matches' | 'matches';

const formatCategoryLabel = (category: VenueSummary['category']) => category.replaceAll('_', ' ');
const formatGenderLabel = (gender: DiscoveryCandidate['gender']) => gender.replace('_', ' ');

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
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isSubmittingInteraction, setIsSubmittingInteraction] = useState(false);
  const [interactionFeedback, setInteractionFeedback] = useState<string | undefined>();

  const syncPresenceSnapshot = useCallback(async () => {
    const [sessionResponse, transitionResponse] = await Promise.all([
      services.presence.getMyActiveSession(),
      services.presence.getStateTransitions(),
    ]);

    if (sessionResponse.status === 'SUCCESS' && transitionResponse.status === 'SUCCESS') {
      setSessionSnapshot(sessionResponse.data, transitionResponse.data, new Date().toISOString());
    }
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
        setSelectedCandidateId(null);
        setPotentialMatchesError(candidatesResponse.error.message);
      } else {
        const venueScopedCandidates = candidatesResponse.data.items.filter((candidate) => candidate.venueId === venue.venueId);
        setPotentialMatches(venueScopedCandidates);

        if (venueScopedCandidates.length === 0) {
          setSelectedCandidateId(null);
        } else {
          const selectedStillExists = venueScopedCandidates.some((candidate) => candidate.userId === selectedCandidateId);

          if (!selectedStillExists) {
            setSelectedCandidateId(venueScopedCandidates[0].userId);
          }
        }
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
  }, [isCheckedIntoViewedVenue, selectedCandidateId, services.discovery, services.match, venue]);

  useEffect(() => {
    void loadVenuePeople();
  }, [loadVenuePeople]);

  const selectedCandidate = useMemo(
    () => potentialMatches.find((candidate) => candidate.userId === selectedCandidateId) ?? null,
    [potentialMatches, selectedCandidateId]
  );

  const removeCandidateFromList = useCallback((targetUserId: string) => {
    setPotentialMatches((currentMatches) => {
      const nextMatches = currentMatches.filter((candidate) => candidate.userId !== targetUserId);

      if (nextMatches.length === 0) {
        setSelectedCandidateId(null);
      } else if (selectedCandidateId === targetUserId) {
        setSelectedCandidateId(nextMatches[0].userId);
      }

      return nextMatches;
    });
  }, [selectedCandidateId]);

  const submitInteraction = useCallback(
    async (action: 'like' | 'pass') => {
      if (!venue || !selectedCandidate || isSubmittingInteraction) {
        return;
      }

      setInteractionFeedback(undefined);
      setIsSubmittingInteraction(true);

      try {
        const request = {
          targetUserId: selectedCandidate.userId,
          venueId: venue.venueId,
          idempotencyKey: `venue-details-${venue.venueId}-${action}-${selectedCandidate.userId}`,
        };

        const response =
          action === 'like'
            ? await services.interactions.likeUser(request)
            : await services.interactions.passUser(request);

        if (response.status === 'FAIL') {
          setInteractionFeedback(response.error.message);
          return;
        }

        setInteractionFeedback(
          action === 'like'
            ? `Liked ${selectedCandidate.displayName}.`
            : `Passed on ${selectedCandidate.displayName}.`
        );
        removeCandidateFromList(selectedCandidate.userId);
      } catch {
        setInteractionFeedback('Unable to submit interaction right now. Please retry.');
      } finally {
        setIsSubmittingInteraction(false);
      }
    },
    [isSubmittingInteraction, removeCandidateFromList, selectedCandidate, services.interactions, venue]
  );

  const handleVenueAction = useCallback(async () => {
    if (!venue || isSubmittingAction) {
      return;
    }

    setActionFeedback(undefined);
    setIsSubmittingAction(true);

    try {
      if (activeSession?.status === 'active' && activeSession.venueId === venue.venueId) {
        const checkoutResponse = await services.presence.checkOut(activeSession.sessionId);

        if (checkoutResponse.status === 'FAIL') {
          setActionFeedback(checkoutResponse.error.message);
          return;
        }

        setActionFeedback('Checkout completed. You are no longer checked into this venue.');
      } else {
        const checkinResponse = await services.presence.checkIn(venue.venueId);

        if (checkinResponse.status === 'FAIL') {
          setActionFeedback(checkinResponse.error.message);
          return;
        }

        setActionFeedback('Check-in completed. You are now checked into this venue.');
      }

      await syncPresenceSnapshot();
      await loadVenuePeople();
    } catch {
      setActionFeedback('Unable to update venue session right now. Please retry.');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [activeSession, isSubmittingAction, loadVenuePeople, services.presence, syncPresenceSnapshot, venue]);

  const venueActionLabel = useMemo(() => {
    if (!venue) {
      return 'Check-In';
    }

    if (venue.status !== 'active') {
      return 'Check-In Unavailable';
    }

    if (activeSession?.status === 'active' && activeSession.venueId === venue.venueId) {
      return 'Checkout';
    }

    if (activeSession?.status === 'active') {
      return 'Switch Venue Check-In';
    }

    return 'Check-In';
  }, [activeSession, venue]);

  const isVenueActionDisabled = useMemo(() => {
    if (!venue || isSubmittingAction) {
      return true;
    }

    return venue.status !== 'active';
  }, [isSubmittingAction, venue]);

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
                      accessibilityRole="button"
                      onPress={() => setActivePeopleTab('potential_matches')}
                      style={{
                        flex: 1,
                        borderRadius: theme.radius.sm,
                        borderWidth: 1,
                        borderColor: activePeopleTab === 'potential_matches' ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                        backgroundColor: activePeopleTab === 'potential_matches' ? theme.colors.backgroundSecondary : 'transparent',
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>Potential Matches</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setActivePeopleTab('matches')}
                      style={{
                        flex: 1,
                        borderRadius: theme.radius.sm,
                        borderWidth: 1,
                        borderColor: activePeopleTab === 'matches' ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                        backgroundColor: activePeopleTab === 'matches' ? theme.colors.backgroundSecondary : 'transparent',
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>Matches</Text>
                    </Pressable>
                  </View>

                  {!isCheckedIntoViewedVenue ? (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                      Check in to this venue to see people here.
                    </Text>
                  ) : activePeopleTab === 'potential_matches' ? (
                    isLoadingPotentialMatches ? (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Loading potential matches...</Text>
                    ) : potentialMatchesError ? (
                      <Text style={{ color: theme.colors.warning, fontSize: theme.typography.bodySmall }}>{potentialMatchesError}</Text>
                    ) : potentialMatches.length === 0 ? (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                        No potential matches are available in this venue right now.
                      </Text>
                    ) : (
                      <View style={{ gap: theme.spacing.sm }}>
                        {selectedCandidate ? (
                          <Card subtitle={`Venue: ${selectedCandidate.venueId}`} title="Discovery Profile Preview">
                            <View style={{ gap: theme.spacing.sm }}>
                              <Image source={resolveUserPhotoSource(selectedCandidate)} style={[styles.previewPhoto, { borderRadius: theme.radius.sm }]} />
                              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{selectedCandidate.displayName}</Text>
                              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                                {selectedCandidate.age} • {formatGenderLabel(selectedCandidate.gender)}
                              </Text>

                              {interactionFeedback ? (
                                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{interactionFeedback}</Text>
                              ) : null}

                              <Button
                                disabled={isSubmittingInteraction}
                                label={isSubmittingInteraction ? 'Submitting…' : 'Like'}
                                onPress={() => void submitInteraction('like')}
                              />
                              <Button
                                disabled={isSubmittingInteraction}
                                label={isSubmittingInteraction ? 'Submitting…' : 'Pass'}
                                onPress={() => void submitInteraction('pass')}
                                variant="secondary"
                              />
                            </View>
                          </Card>
                        ) : null}

                        {potentialMatches.map((candidate) => (
                          <Pressable
                            accessibilityRole="button"
                            key={candidate.userId}
                            onPress={() => setSelectedCandidateId(candidate.userId)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: theme.spacing.sm,
                              borderRadius: theme.radius.sm,
                              borderWidth: 1,
                              borderColor:
                                selectedCandidateId === candidate.userId ? theme.colors.accentPrimary : theme.colors.backgroundSecondary,
                              backgroundColor: theme.colors.backgroundSecondary,
                              paddingHorizontal: theme.spacing.md,
                              paddingVertical: theme.spacing.sm,
                            }}
                          >
                            <Image source={resolveUserPhotoSource(candidate)} style={{ width: 36, height: 36, borderRadius: 18 }} />
                            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.bodySmall }}>
                              {candidate.displayName} • {candidate.age} • {formatGenderLabel(candidate.gender)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )
                  ) : isLoadingMatches ? (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Loading matches...</Text>
                  ) : matchesError ? (
                    <Text style={{ color: theme.colors.warning, fontSize: theme.typography.bodySmall }}>{matchesError}</Text>
                  ) : matches.length === 0 ? (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                      No matches are available in this venue right now.
                    </Text>
                  ) : (
                    matches.map((match) => (
                      <View
                        key={match.matchId}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: theme.spacing.sm,
                          borderRadius: theme.radius.sm,
                          backgroundColor: theme.colors.backgroundSecondary,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                        }}
                      >
                        <Image
                          source={resolveUserPhotoSource(match.counterpart)}
                          style={{ width: 36, height: 36, borderRadius: 18 }}
                        />
                        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.bodySmall }}>
                          {match.counterpart.displayName} • {match.counterpart.age} • {formatGenderLabel(match.counterpart.gender)}
                        </Text>
                      </View>
                    ))
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
  previewPhoto: {
    width: '100%',
    height: 180,
  },
});