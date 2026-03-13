import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { resolveUserPhotoSource } from './userPhotoSource';

type MatchConfirmationRouteParams = {
  venueId: string;
  matchId?: string;
  displayName: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary';
  profilePhotoUrl: string;
};

const formatGenderLabel = (gender: MatchConfirmationRouteParams['gender']) => gender.replace('_', ' ');

export function MatchConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  const params = route.params as MatchConfirmationRouteParams;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Reciprocal like" title="Night Vibe" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        <Card subtitle="You can open this match from venue details." title="Match Confirmation Screen">
          <View style={{ gap: theme.spacing.sm }}>
            <Image source={resolveUserPhotoSource({ profilePhotoUrl: params.profilePhotoUrl })} style={[styles.previewPhoto, { borderRadius: theme.radius.sm }]} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>{params.displayName}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              {params.age} • {formatGenderLabel(params.gender)}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              Match created successfully.
            </Text>
            {params.matchId ? (
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>Match reference: {params.matchId}</Text>
            ) : null}

            <Button
              label="Back to Venue"
              onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.VenueDetails, { venueId: params.venueId }))}
            />
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
  previewPhoto: {
    width: '100%',
    height: 220,
  },
});
