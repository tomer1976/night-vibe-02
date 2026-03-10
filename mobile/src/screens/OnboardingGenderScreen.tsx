import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useTheme } from '../theme';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

const GENDER_OPTIONS = ['female', 'male', 'other'] as const;

export function OnboardingGenderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const draft = readDraftFromParams(route.params);

  const [gender, setGender] = useState(draft.gender);

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingDateOfBirth, { draft: { ...draft, gender } }));
  };

  const goNext = () => {
    if (!gender) {
      return;
    }

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingPhotoUpload, {
        draft: {
          ...draft,
          gender,
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      disableNext={!gender}
      onBack={goBack}
      onNext={goNext}
      step={3}
      subtitle="Select your gender."
      title="Onboarding Step 3: Gender"
      totalSteps={7}
    >
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>Choose one option to continue.</Text>
      {GENDER_OPTIONS.map((option) => (
        <Button
          key={option}
          label={option}
          onPress={() => setGender(option)}
          variant={gender === option ? 'primary' : 'secondary'}
        />
      ))}
    </OnboardingStepLayout>
  );
}
