import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { DiscoveryCandidate } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';

const formatGenderLabel = (gender: DiscoveryCandidate['gender']) => gender.replace('_', ' ');

export function UserDiscoveryFeedScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [currentCandidate, setCurrentCandidate] = useState<DiscoveryCandidate | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [isFeedExhausted, setIsFeedExhausted] = useState(false);
  const [viewedCount, setViewedCount] = useState(0);

  const loadCandidate = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      setErrorText(undefined);

      try {
        const response = await services.discovery.getFeed({
          pageSize: 1,
          cursor,
        });

        if (response.status === 'FAIL') {
          setCurrentCandidate(null);
          setNextCursor(undefined);
          setIsFeedExhausted(false);
          setErrorText(response.error.message);
          return;
        }

        const nextCandidate = response.data.candidates[0] ?? null;

        if (!nextCandidate) {
          setCurrentCandidate(null);
          setNextCursor(undefined);
          setIsFeedExhausted(true);
          return;
        }

        setCurrentCandidate(nextCandidate);
        setNextCursor(response.data.nextCursor);
        setIsFeedExhausted(false);
        setViewedCount((count) => count + 1);
      } catch {
        setCurrentCandidate(null);
        setNextCursor(undefined);
        setIsFeedExhausted(false);
        setErrorText('Unable to load discovery candidates right now. Please retry.');
      } finally {
        setIsLoading(false);
      }
    },
    [services.discovery]
  );

  useEffect(() => {
    void loadCandidate();
  }, [loadCandidate]);

  const headerSubtitle = useMemo(() => {
    if (isFeedExhausted) {
      return 'No additional candidates are available in this deterministic mock feed.';
    }

    if (!currentCandidate) {
      return 'Discovery candidates will appear when eligible same-venue users are available.';
    }

    return `Candidate ${viewedCount} in deterministic progression.`;
  }, [currentCandidate, isFeedExhausted, viewedCount]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Discovery feed" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading same-venue discovery candidates from deterministic mock feed." title="Loading Discovery Feed" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadCandidate()} title="Discovery Feed Failed" />
        ) : isFeedExhausted ? (
          <EmptyStateTemplate
            actionLabel="Refresh Feed"
            message="The current cursor reached the end of available candidates."
            onAction={() => {
              setViewedCount(0);
              void loadCandidate();
            }}
            title="Feed Exhausted"
          />
        ) : currentCandidate ? (
          <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xl }} showsVerticalScrollIndicator={false}>
            <Card subtitle={headerSubtitle} title="User Discovery Feed Screen">
              <View style={{ gap: theme.spacing.sm }}>
                <Image source={resolveUserPhotoSource(currentCandidate)} style={[styles.photo, { borderRadius: theme.radius.sm }]} />

                <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{currentCandidate.displayName}</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  Age {currentCandidate.age} • {formatGenderLabel(currentCandidate.gender)}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  Venue: {currentCandidate.venueId}
                </Text>

                <Button
                  label={nextCursor ? 'View Next Candidate' : 'Finish Feed'}
                  onPress={() => {
                    if (!nextCursor) {
                      setCurrentCandidate(null);
                      setIsFeedExhausted(true);
                      return;
                    }

                    void loadCandidate(nextCursor);
                  }}
                />
                <Button
                  label="Refresh Feed"
                  onPress={() => {
                    setViewedCount(0);
                    void loadCandidate();
                  }}
                  variant="secondary"
                />
                <Button
                  label="Back to User Entry"
                  onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))}
                  variant="secondary"
                />
              </View>
            </Card>
          </ScrollView>
        ) : (
          <EmptyStateTemplate
            actionLabel="Retry"
            message="No eligible candidates were found for your current deterministic mock session."
            onAction={() => void loadCandidate()}
            title="No Discovery Candidates"
          />
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
  photo: {
    width: '100%',
    height: 220,
  },
});
