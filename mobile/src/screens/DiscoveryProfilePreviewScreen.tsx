import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { DiscoveryCandidate } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';
import {
  dismissPotential,
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

const formatGenderLabel = (gender: DiscoveryCandidate['gender']) => gender.replace('_', ' ');

export function DiscoveryProfilePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const services = useServiceLocator();

  const params = route.params as DiscoveryProfilePreviewRouteParams;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | undefined>();
  const [isPotentialLikedOverride, setIsPotentialLikedOverride] = useState<boolean | null>(null);

  const venueSnapshot = useMemo(
    () => readVenuePeopleInteractionSnapshot(params.venueId),
    [params.venueId]
  );

  const isPotentialLiked = useMemo(
    () => isPotentialLikedOverride ?? venueSnapshot.likedPotentialUserIds.includes(params.userId),
    [isPotentialLikedOverride, params.userId, venueSnapshot.likedPotentialUserIds]
  );

  const goBackToVenue = useCallback(() => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId: params.venueId }));
  }, [navigation, params.venueId]);

  const submitPotentialLike = useCallback(async () => {
    setFeedback(undefined);
    setIsSubmitting(true);

    try {
      const response = await services.interactions.likeUser({
        targetUserId: params.userId,
        venueId: params.venueId,
        idempotencyKey: `profile-like-${params.userId}`,
      });

      if (response.status === 'FAIL') {
        setFeedback(response.error.message);
        return;
      }

      markPotentialLiked(params.venueId, params.userId);
      setIsPotentialLikedOverride(true);
      setFeedback(`Liked ${params.displayName}.`);
    } catch {
      setFeedback('Unable to submit like right now. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  }, [params.displayName, params.userId, params.venueId, services.interactions]);

  const submitPotentialUnlike = useCallback(async () => {
    setFeedback(undefined);
    setIsSubmitting(true);

    try {
      markPotentialUnliked(params.venueId, params.userId);
      setIsPotentialLikedOverride(false);
      setFeedback(`Removed like for ${params.displayName}.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [params.displayName, params.userId, params.venueId]);

  const submitPotentialPass = useCallback(async () => {
    setFeedback(undefined);
    setIsSubmitting(true);

    try {
      const response = await services.interactions.passUser({
        targetUserId: params.userId,
        venueId: params.venueId,
        idempotencyKey: `profile-pass-${params.userId}`,
      });

      if (response.status === 'FAIL') {
        setFeedback(response.error.message);
        return;
      }

      dismissPotential(params.venueId, params.userId);
      markPotentialUnliked(params.venueId, params.userId);
      setFeedback(`Passed on ${params.displayName}.`);
      goBackToVenue();
    } catch {
      setFeedback('Unable to submit pass right now. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  }, [goBackToVenue, params.displayName, params.userId, params.venueId, services.interactions]);

  const submitUnmatch = useCallback(async () => {
    if (!params.matchId) {
      setFeedback('Match reference is missing for unmatch action.');
      return;
    }

    setFeedback(undefined);
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
      setFeedback(`Unmatched ${params.displayName}.`);
      goBackToVenue();
    } finally {
      setIsSubmitting(false);
    }
  }, [goBackToVenue, params.age, params.displayName, params.gender, params.matchId, params.profilePhotoUrl, params.userId, params.venueId]);

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

              {feedback ? (
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{feedback}</Text>
              ) : null}

              {params.source === 'potential' ? (
                <>
                  <Button
                    disabled={isSubmitting}
                    label={isSubmitting ? 'Submitting…' : isPotentialLiked ? 'Unlike' : 'Like'}
                    onPress={() => void (isPotentialLiked ? submitPotentialUnlike() : submitPotentialLike())}
                  />
                  <Button
                    disabled={isSubmitting}
                    label={isSubmitting ? 'Submitting…' : 'Pass'}
                    onPress={() => void submitPotentialPass()}
                    variant="secondary"
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
