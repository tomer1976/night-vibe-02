import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { PresenceStateTransition, VenueSession } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { usePresenceSessionState } from '../state';
import { useTheme } from '../theme';

const ACTIVE_SESSION_AUTO_REFRESH_MS = 15_000;

const formatTransitionReason = (reason: PresenceStateTransition['reason']) => {
  if (!reason) {
    return 'status_change';
  }

  return reason.replaceAll('_', ' ');
};

const formatTransitionMoment = (isoTimestamp: string) => {
  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    return isoTimestamp;
  }

  return date.toLocaleString('en-GB', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDurationMinutes = (durationMinutes: number) => {
  const safeMinutes = Math.max(0, durationMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export function ActiveVenueSessionScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();
  const { setSessionSnapshot } = usePresenceSessionState();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [activeSession, setActiveSession] = useState<VenueSession | null>(null);
  const [transitions, setTransitions] = useState<PresenceStateTransition[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>();

  const loadSessionState = useCallback(async (skipLoading = false) => {
    if (!skipLoading) {
      setIsLoading(true);
    }

    setErrorText(undefined);

    try {
      const [sessionResponse, transitionsResponse] = await Promise.all([
        services.presence.getMyActiveSession(),
        services.presence.getStateTransitions(),
      ]);

      if (sessionResponse.status === 'FAIL') {
        setErrorText(sessionResponse.error.message);
        setActiveSession(null);
        setTransitions([]);
        setSessionSnapshot(null, []);
        return;
      }

      if (transitionsResponse.status === 'FAIL') {
        setErrorText(transitionsResponse.error.message);
        setActiveSession(null);
        setTransitions([]);
        setSessionSnapshot(null, []);
        return;
      }

      const syncedAt = new Date().toISOString();
      setActiveSession(sessionResponse.data);
      setTransitions(transitionsResponse.data);
      setLastUpdatedAt(syncedAt);
      setSessionSnapshot(sessionResponse.data, transitionsResponse.data, syncedAt);
    } catch {
      setErrorText('Unable to load active venue session right now. Please retry.');
      setActiveSession(null);
      setTransitions([]);
      setSessionSnapshot(null, []);
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
      }
    }
  }, [services.presence, setSessionSnapshot]);

  useEffect(() => {
    void loadSessionState();
  }, [loadSessionState]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      void loadSessionState(true);
    }, ACTIVE_SESSION_AUTO_REFRESH_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadSessionState]);

  const statusTone = activeSession?.status === 'active' ? 'success' : 'warning';
  const lastTransitions = useMemo(() => transitions.slice(-3).reverse(), [transitions]);
  const sessionTimingView = useMemo(() => {
    if (!activeSession?.checkinAt) {
      return {
        elapsedLabel: 'Unavailable',
        remainingLabel: 'Unavailable',
        startedAtLabel: 'Unavailable',
      };
    }

    const startedAt = new Date(activeSession.checkinAt);
    const referenceInstant = new Date(lastUpdatedAt ?? new Date().toISOString());

    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(referenceInstant.getTime())) {
      return {
        elapsedLabel: 'Unavailable',
        remainingLabel: 'Unavailable',
        startedAtLabel: activeSession.checkinAt,
      };
    }

    const elapsedMinutes = Math.max(0, Math.floor((referenceInstant.getTime() - startedAt.getTime()) / 60000));
    const timeoutWindowMinutes = 4 * 60;
    const remainingMinutes = Math.max(0, timeoutWindowMinutes - elapsedMinutes);

    return {
      elapsedLabel: formatDurationMinutes(elapsedMinutes),
      remainingLabel: formatDurationMinutes(remainingMinutes),
      startedAtLabel: formatTransitionMoment(activeSession.checkinAt),
    };
  }, [activeSession, lastUpdatedAt]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Session status" title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading active session status and transition indicators." title="Fetching Active Session" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadSessionState()} title="Active Session Failed" />
        ) : !activeSession ? (
          <EmptyStateTemplate
            actionLabel="Browse Nearby Venues"
            message="No active venue session exists in the current mock state."
            onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))}
            title="No Active Session"
          />
        ) : (
          <Card subtitle={`Session ${activeSession.sessionId}`} title="Active Venue Session Screen">
            <View style={{ gap: theme.spacing.sm }}>
              <Card subtitle="Current session identity and lifecycle state" title="Session Status Card">
                <View style={{ gap: theme.spacing.sm }}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>Venue Session Status</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Venue: {activeSession.venueId}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>User: {activeSession.userId}</Text>

                  <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                    <Badge label={`Status: ${activeSession.status}`} tone={statusTone} />
                    <Badge label={`Transitions: ${transitions.length}`} tone="neutral" />
                  </View>
                </View>
              </Card>

              <Card subtitle="Deterministic elapsed and timeout indicators" title="Session Timer Card">
                <View style={{ gap: theme.spacing.sm }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                    Started at: {sessionTimingView.startedAtLabel}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                    Elapsed: {sessionTimingView.elapsedLabel}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                    Timeout remaining: {sessionTimingView.remainingLabel}
                  </Text>
                </View>
              </Card>

              {lastUpdatedAt ? (
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>
                  Last refreshed: {formatTransitionMoment(lastUpdatedAt)}
                </Text>
              ) : null}

              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>Recent session-state indicators</Text>
              {lastTransitions.map((transition) => (
                <Text key={`${transition.sessionId}-${transition.transitionedAt}`} style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  {transition.fromStatus} → {transition.toStatus} ({formatTransitionReason(transition.reason)}) at{' '}
                  {formatTransitionMoment(transition.transitionedAt)}
                </Text>
              ))}

              {lastTransitions.length === 0 ? (
                <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                  No prior closed/expired transitions recorded for this mock fixture state.
                </Text>
              ) : null}

              <Button label="Refresh Session State" onPress={() => void loadSessionState()} variant="secondary" />
              <Button
                label="Open Venue Presence"
                onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.VenuePresence))}
                variant="secondary"
              />
              <Button
                label="Proceed to Checkout"
                onPress={() => navigation.dispatch(StackActions.push(ROUTE_NAMES.CheckoutConfirmation))}
              />
              <Button label="Back to Nearby Venues" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))} variant="secondary" />
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