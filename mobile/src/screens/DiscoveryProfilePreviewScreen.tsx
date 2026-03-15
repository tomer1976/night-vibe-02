import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, TopBar } from '../components';
import { DiscoveryCandidate } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import {
  createInitialInteractionQueueStoreState,
  interactionQueueStoreReducer,
  selectCanSubmitInteraction,
} from '../state/interactionQueueStore';
import { selectSameVenueDiscoveryEligibility, usePresenceSessionState } from '../state';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';
import {
  hideMatch,
  markPotentialLiked,
  markPotentialUnliked,
  readVenuePeopleInteractionSnapshot,
  unhidePotential,
} from './venuePeopleInteractionState';

type ProfileSource = 'potential' | 'match';

type DiscoveryProfilePreviewRouteParams = {
  venueId: string;
  source: ProfileSource;
  userId: string;
  displayName: string;
  age: number;
  gender: DiscoveryCandidate['gender'];
  profilePhotoUrl: string;
  matchId?: string;
};

type InteractionFeedbackState = {
  kind: 'loading' | 'success' | 'duplicate' | 'failure';
  message: string;
};

function shouldOpenMatchConfirmation(result: {
  interaction: 'LIKE' | 'PASS';
  decision: 'created' | 'idempotent_replay';
  matchCreated: boolean;
  matchId?: string;
}) {
  return (
    result.interaction === 'LIKE' &&
    result.decision === 'created' &&
    result.matchCreated === true &&
    typeof result.matchId === 'string' &&
    result.matchId.length > 0
  );
}

const formatGenderLabel = (gender: DiscoveryCandidate['gender']) => gender.replace('_', ' ');

export function DiscoveryProfilePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();
  const { activeSession, setSessionSnapshot } = usePresenceSessionState();

  const params = route.params as DiscoveryProfilePreviewRouteParams;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<InteractionFeedbackState | undefined>();
  const [isPotentialLikedOverride, setIsPotentialLikedOverride] = useState<boolean | null>(null);
  const [isPresenceSynced, setIsPresenceSynced] = useState(false);
  const likeSubmissionInFlightRef = useRef(false);
  const [interactionQueueState, dispatchInteractionQueue] = useReducer(
    interactionQueueStoreReducer,
    createInitialInteractionQueueStoreState()
  );

  const venueSnapshot = useMemo(
    () => readVenuePeopleInteractionSnapshot(params.venueId),
    [params.venueId]
  );

  const isPotentialLiked = useMemo(
    () => isPotentialLikedOverride ?? venueSnapshot.likedPotentialUserIds.includes(params.userId),
    [isPotentialLikedOverride, params.userId, venueSnapshot.likedPotentialUserIds]
  );

  const sameVenueEligibility = useMemo(
    () => selectSameVenueDiscoveryEligibility(activeSession, params.venueId),
    [activeSession, params.venueId]
  );

  useEffect(() => {
    let isMounted = true;

    const syncPresenceSnapshot = async () => {
      const sessionResponse = await services.presence.getMyActiveSession();

      if (sessionResponse.status === 'SUCCESS') {
        setSessionSnapshot(sessionResponse.data, undefined, new Date().toISOString());
      }

      if (isMounted) {
        setIsPresenceSynced(true);
      }
    };

    void syncPresenceSnapshot();

    return () => {
      isMounted = false;
    };
  }, [services.presence, setSessionSnapshot]);

  useEffect(() => {
    if (!isPresenceSynced) {
      return;
    }

    if (!sameVenueEligibility.isEligible) {
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues));
    }
  }, [isPresenceSynced, navigation, sameVenueEligibility.isEligible]);

  const goBackToVenue = useCallback(() => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId: params.venueId }));
  }, [navigation, params.venueId]);

  const submitPotentialLike = useCallback(async () => {
    if (likeSubmissionInFlightRef.current) {
      setFeedback({
        kind: 'duplicate',
        message: 'Duplicate interaction detected for actor-target-venue-session scope.',
      });
      return;
    }

    const request = {
      targetUserId: params.userId,
      venueId: params.venueId,
      idempotencyKey: `profile-like-${params.userId}`,
    } as const;

    const canSubmit = selectCanSubmitInteraction(interactionQueueState, request, 'LIKE');

    if (!canSubmit) {
      setFeedback({
        kind: 'duplicate',
        message: 'Duplicate interaction detected for actor-target-venue-session scope.',
      });
      return;
    }

    likeSubmissionInFlightRef.current = true;

    dispatchInteractionQueue({
      type: 'BEGIN_INTERACTION',
      request,
      action: 'LIKE',
    });

    setFeedback({ kind: 'loading', message: 'Processing interaction…' });
    setIsSubmitting(true);

    try {
      const response = await services.interactions.likeUser(request);

      if (response.status === 'FAIL') {
        const isDuplicate = response.error.code === 'DUPLICATE_INTERACTION';
        dispatchInteractionQueue({
          type: 'COMPLETE_INTERACTION',
          request,
          action: 'LIKE',
          outcome: isDuplicate ? 'duplicate' : 'failure',
          errorCode: response.error.code,
        });
        setFeedback({
          kind: isDuplicate ? 'duplicate' : 'failure',
          message: response.error.message,
        });
        return;
      }

      dispatchInteractionQueue({
        type: 'COMPLETE_INTERACTION',
        request,
        action: 'LIKE',
        outcome: response.data.decision === 'idempotent_replay' ? 'idempotent_replay' : 'created',
        result: response.data,
      });

      markPotentialLiked(params.venueId, params.userId);
      setIsPotentialLikedOverride(true);
      setFeedback({ kind: 'success', message: `Liked ${params.displayName}.` });

      if (shouldOpenMatchConfirmation(response.data)) {
        navigation.dispatch(
          StackActions.push(ROUTE_NAMES.MatchConfirmation, {
            venueId: params.venueId,
            matchId: response.data.matchId,
            displayName: params.displayName,
            age: params.age,
            gender: params.gender,
            profilePhotoUrl: params.profilePhotoUrl,
          })
        );
      }
    } catch {
      dispatchInteractionQueue({
        type: 'COMPLETE_INTERACTION',
        request,
        action: 'LIKE',
        outcome: 'failure',
        errorCode: 'INTERNAL_ERROR',
      });
      setFeedback({ kind: 'failure', message: 'Unable to submit like right now. Please retry.' });
    } finally {
      likeSubmissionInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }, [interactionQueueState, navigation, params.age, params.displayName, params.gender, params.profilePhotoUrl, params.userId, params.venueId, services.interactions]);

  const submitPotentialUnlike = useCallback(async () => {
    setFeedback({ kind: 'loading', message: 'Processing interaction…' });
    setIsSubmitting(true);

    try {
      markPotentialUnliked(params.venueId, params.userId);
      setIsPotentialLikedOverride(false);
      setFeedback({ kind: 'success', message: `Removed like for ${params.displayName}.` });
    } finally {
      setIsSubmitting(false);
    }
  }, [params.displayName, params.userId, params.venueId]);

  const submitUnmatch = useCallback(async () => {
    if (!params.matchId) {
      setFeedback({ kind: 'failure', message: 'Match reference is missing for unmatch action.' });
      return;
    }

    setFeedback({ kind: 'loading', message: 'Processing interaction…' });
    setIsSubmitting(true);

    try {
      hideMatch(params.venueId, params.matchId);
      markPotentialUnliked(params.venueId, params.userId);
      unhidePotential(params.venueId, {
        userId: params.userId,
        displayName: params.displayName,
        age: params.age,
        gender: params.gender,
        profilePhotoUrl: params.profilePhotoUrl,
        venueId: params.venueId,
      });
      setFeedback({ kind: 'success', message: `Unmatched ${params.displayName}.` });
      goBackToVenue();
    } finally {
      setIsSubmitting(false);
    }
  }, [goBackToVenue, params.age, params.displayName, params.gender, params.matchId, params.profilePhotoUrl, params.userId, params.venueId]);

  const feedbackColorByKind: Record<InteractionFeedbackState['kind'], string> = {
    loading: theme.colors.info,
    success: theme.colors.success,
    duplicate: theme.colors.warning,
    failure: theme.colors.danger,
  };

  const profileStateLabel = params.source === 'potential' ? 'Profile State: Potential Candidate' : 'Profile State: Match';
  const interactionStateLabel = params.source === 'potential'
    ? isPotentialLiked
      ? 'Interaction State: Liked'
      : 'Interaction State: Not Liked'
    : 'Interaction State: Matched';
  const eligibilityLabel = sameVenueEligibility.label;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Discovery profile" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
          <Card subtitle={params.source === 'potential' ? 'Potential Match Profile' : 'Match Profile'} title="Discovery Profile Preview Screen">
            <View style={{ gap: theme.spacing.sm }}>
              <Image source={resolveUserPhotoSource({ profilePhotoUrl: params.profilePhotoUrl })} style={[styles.previewPhoto, { borderRadius: theme.radius.sm }]} />
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{params.displayName}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                {params.age} • {formatGenderLabel(params.gender)}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                <Badge label={eligibilityLabel} tone="success" />
                <Badge label={profileStateLabel} tone="info" />
                <Badge label={interactionStateLabel} tone="neutral" />
              </View>

              {feedback ? (
                <Text
                  style={{
                    color: feedbackColorByKind[feedback.kind],
                    fontSize: theme.typography.bodySmall,
                  }}
                >
                  {feedback.message}
                </Text>
              ) : null}

              {params.source === 'potential' ? (
                <>
                  <Button
                    disabled={isSubmitting}
                    label={isSubmitting ? 'Submitting…' : isPotentialLiked ? 'Unlike' : 'Like'}
                    onPress={() => void (isPotentialLiked ? submitPotentialUnlike() : submitPotentialLike())}
                  />
                </>
              ) : (
                <Button
                  disabled={isSubmitting}
                  label={isSubmitting ? 'Submitting…' : 'Unmatch'}
                  onPress={() => void submitUnmatch()}
                />
              )}

              <Button label="Back to Venue" onPress={goBackToVenue} variant="secondary" />
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
  previewPhoto: {
    width: '100%',
    height: 220,
  },
});
