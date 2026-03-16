import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, ListItem, LoadingStateTemplate, TopBar } from '../components';
import { MatchRecord } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { useTheme } from '../theme';

const formatGenderLabel = (gender: MatchRecord['counterpart']['gender']) => gender.replace('_', ' ');

function ActiveMatchesSection({ matches, titleColor }: { matches: MatchRecord[]; titleColor: string }) {
  return (
    <View>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: titleColor }]}>
        Active Matches
      </Text>
      {matches.map((match) => (
        <ListItem
          key={match.matchId}
          subtitle={`Venue: ${match.venueId}`}
          title={`${match.counterpart.displayName} • ${match.counterpart.age} • ${formatGenderLabel(match.counterpart.gender)}`}
          trailingText="Active"
        />
      ))}
    </View>
  );
}

function ExpiredMatchesSection({ matches, titleColor }: { matches: MatchRecord[]; titleColor: string }) {
  return (
    <View>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: titleColor }]}>
        Expired Matches
      </Text>
      {matches.map((match) => (
        <ListItem
          key={match.matchId}
          subtitle={`Venue: ${match.venueId}`}
          title={`${match.counterpart.displayName} • ${match.counterpart.age} • ${formatGenderLabel(match.counterpart.gender)}`}
          trailingText="Expired"
        />
      ))}
    </View>
  );
}

export function MatchesListScreen() {
  const navigation = useNavigation();
  const services = useServiceLocator();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.match.listMatches();

      if (response.status === 'FAIL') {
        setMatches([]);
        setErrorText(response.error.message);
        return;
      }

      setMatches(response.data.matches);
    } catch {
      setMatches([]);
      setErrorText('Unable to load matches right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [services.match]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const activeMatches = useMemo(() => matches.filter((match) => match.status === 'matched'), [matches]);
  const expiredMatches = useMemo(() => matches.filter((match) => match.status === 'expired'), [matches]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Your active and expired venue matches." title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="View match state history in mock mode." title="Matches List Screen">
          {isLoading ? (
            <LoadingStateTemplate message="Loading your match history." title="Fetching Matches" />
          ) : errorText ? (
            <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadMatches()} title="Matches Failed" />
          ) : activeMatches.length === 0 && expiredMatches.length === 0 ? (
            <EmptyStateTemplate
              actionLabel="Back to User Entry"
              message="No active or expired matches are available yet."
              onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))}
              title="No Matches"
            />
          ) : (
            <ScrollView contentContainerStyle={{ gap: theme.spacing.md }} showsVerticalScrollIndicator={false}>
              <View style={styles.summaryRow}>
                <Badge label={`Active: ${activeMatches.length}`} tone="success" />
                <Badge label={`Expired: ${expiredMatches.length}`} tone="warning" />
              </View>

              {activeMatches.length > 0 ? <ActiveMatchesSection matches={activeMatches} titleColor={theme.colors.textPrimary} /> : null}
              {expiredMatches.length > 0 ? <ExpiredMatchesSection matches={expiredMatches} titleColor={theme.colors.textPrimary} /> : null}

              <Button label="Back to User Entry" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))} variant="secondary" />
            </ScrollView>
          )}
        </Card>
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
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
});