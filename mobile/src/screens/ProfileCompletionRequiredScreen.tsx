import { StackActions, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { useTheme } from '../theme';

export function ProfileCompletionRequiredScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { setProfileCompleted } = useOnboardingState();

  const continueToUserShell = () => {
    setProfileCompleted(true);
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.UserGroup));
  };

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
            <Button label="Continue" onPress={continueToUserShell} />
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
