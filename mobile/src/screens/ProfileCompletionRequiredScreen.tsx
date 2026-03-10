import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';

export function ProfileCompletionRequiredScreen() {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Profile Completion Required" />
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}> 
        <Card
          subtitle="Your onboarding details are captured. Venue and discovery access stay gated until profile completion is confirmed by flow state."
          title="Profile Completion Required Screen"
        >
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body }}>
              Continue to the user shell in mock mode.
            </Text>
            <Button label="Continue" onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup))} />
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
    justifyContent: 'center',
  },
});
