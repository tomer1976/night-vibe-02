import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';

type DiscoveryFallbackReason = 'ineligible_state' | 'feed_exhausted';

type DiscoveryFallbackRouteParams = {
  reason: DiscoveryFallbackReason;
  venueId?: string;
};

const fallbackCopyByReason: Record<DiscoveryFallbackReason, { title: string; subtitle: string; helper: string; actionLabel: string }> = {
  ineligible_state: {
    title: 'Discovery Ineligible',
    subtitle: 'Discovery requires an active venue session in the same venue.',
    helper: 'Check in again from Nearby Venues to unlock potential matches.',
    actionLabel: 'Back to Nearby Venues',
  },
  feed_exhausted: {
    title: 'Discovery Feed Exhausted',
    subtitle: 'No more eligible candidates are available right now.',
    helper: 'Refresh later or return to nearby venues and try another active venue.',
    actionLabel: 'Retry Discovery',
  },
};

export function DiscoveryFallbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  const params = route.params as DiscoveryFallbackRouteParams | undefined;
  const reason: DiscoveryFallbackReason = params?.reason ?? 'feed_exhausted';
  const copy = fallbackCopyByReason[reason];

  const handlePrimaryAction = () => {
    if (reason === 'feed_exhausted' && params?.venueId) {
      navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId: params.venueId }));
      return;
    }

    navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Discovery fallback" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle={copy.subtitle} title="Discovery Fallback Screen">
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{copy.title}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>{copy.helper}</Text>

            <Button label={copy.actionLabel} onPress={handlePrimaryAction} />
            <Button label="Back to Nearby Venues" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))} variant="secondary" />
          </View>
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
});
