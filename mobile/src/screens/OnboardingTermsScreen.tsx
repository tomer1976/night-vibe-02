import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Text } from 'react-native';

import { Button } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

export function OnboardingTermsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const draft = readDraftFromParams(route.params);

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingPreferences, { draft }));
  };

  const toggleAcceptance = () => {
    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingTerms, {
        draft: {
          ...draft,
          acceptedTerms: !draft.acceptedTerms,
        },
      })
    );
  };

  const finishOnboarding = () => {
    if (!draft.acceptedTerms) {
      return;
    }

    navigation.dispatch(StackActions.replace(ROUTE_NAMES.ProfileCompletionRequired, { draft }));
  };

  return (
    <OnboardingStepLayout
      disableNext={!draft.acceptedTerms}
      nextLabel="Finish"
      onBack={goBack}
      onNext={finishOnboarding}
      step={7}
      subtitle="Accept terms to complete onboarding."
      title="Onboarding Step 7: Terms Acceptance"
      totalSteps={7}
    >
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body }}>
        You must accept the terms of service to continue.
      </Text>
      <Button
        label={draft.acceptedTerms ? 'Terms Accepted' : 'Accept Terms'}
        onPress={toggleAcceptance}
        variant={draft.acceptedTerms ? 'primary' : 'secondary'}
      />
    </OnboardingStepLayout>
  );
}
