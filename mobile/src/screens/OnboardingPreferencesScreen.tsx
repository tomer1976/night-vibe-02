import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, InlineErrorMessage } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { normalizePreferredGenders, validateAgeRange, validatePreferredGenders } from '../validation/formValidation';
import { useTheme } from '../theme';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

const MIN_AGE_LIMIT = 18;
const MAX_AGE_LIMIT = 70;
const PREFERRED_GENDER_OPTIONS = ['female', 'male', 'other'] as const;

export function OnboardingPreferencesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { markStepCompleted } = useOnboardingState();
  const draft = readDraftFromParams(route.params);

  const initialMinAge = Number(draft.preferredAgeMin);
  const initialMaxAge = Number(draft.preferredAgeMax);
  const initialPreferredGenders = normalizePreferredGenders(draft.preferredGenders);

  const [preferredAgeMin, setPreferredAgeMin] = useState(
    Number.isFinite(initialMinAge) && initialMinAge >= MIN_AGE_LIMIT ? initialMinAge : MIN_AGE_LIMIT
  );
  const [preferredAgeMax, setPreferredAgeMax] = useState(
    Number.isFinite(initialMaxAge) && initialMaxAge >= preferredAgeMin ? initialMaxAge : 35
  );
  const [preferredGenders, setPreferredGenders] = useState<string[]>(initialPreferredGenders);
  const [isGenderDropdownVisible, setIsGenderDropdownVisible] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingBio, {
        draft: {
          ...draft,
          preferredAgeMin: String(preferredAgeMin),
          preferredAgeMax: String(preferredAgeMax),
          preferredGenders: preferredGenders.join(', '),
        },
      })
    );
  };

  const goNext = () => {
    const ageError = validateAgeRange(String(preferredAgeMin), String(preferredAgeMax));
    const genderError = validatePreferredGenders(preferredGenders.join(', '));

    if (ageError || genderError) {
      setErrorText('Set valid age boundaries and at least one preferred gender.');
      return;
    }

    setErrorText(undefined);
    markStepCompleted(6);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingTerms, {
        draft: {
          ...draft,
          preferredAgeMin: String(preferredAgeMin),
          preferredAgeMax: String(preferredAgeMax),
          preferredGenders: preferredGenders.join(', '),
        },
      })
    );
  };

  const togglePreferredGender = (value: (typeof PREFERRED_GENDER_OPTIONS)[number]) => {
    setPreferredGenders((currentValues) => {
      if (currentValues.includes(value)) {
        return currentValues.filter((entry) => entry !== value);
      }

      return [...currentValues, value];
    });

    if (errorText) {
      setErrorText(undefined);
    }
  };

  return (
    <OnboardingStepLayout
      onBack={goBack}
      onNext={goNext}
      step={6}
      subtitle="Set your matching preferences."
      title="Onboarding Step 6: Preferences"
      totalSteps={7}
    >
      <View style={[styles.section, { backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.radius.md, padding: theme.spacing.md }]}> 
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.label }}>Preferred Age Range</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>{`${preferredAgeMin} - ${preferredAgeMax}`}</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Minimum preferred age: {preferredAgeMin}</Text>
        <Slider
          maximumTrackTintColor={theme.colors.backgroundPrimary}
          maximumValue={preferredAgeMax}
          minimumTrackTintColor={theme.colors.accentPrimary}
          minimumValue={MIN_AGE_LIMIT}
          step={1}
          testID="onboarding-pref-age-min-slider"
          thumbTintColor={theme.colors.accentPrimary}
          value={preferredAgeMin}
          onValueChange={(value) => {
            setPreferredAgeMin(value);

            if (value > preferredAgeMax) {
              setPreferredAgeMax(value);
            }

            if (errorText) {
              setErrorText(undefined);
            }
          }}
        />
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>Maximum preferred age: {preferredAgeMax}</Text>
        <Slider
          maximumTrackTintColor={theme.colors.backgroundPrimary}
          maximumValue={MAX_AGE_LIMIT}
          minimumTrackTintColor={theme.colors.accentPrimary}
          minimumValue={preferredAgeMin}
          step={1}
          testID="onboarding-pref-age-max-slider"
          thumbTintColor={theme.colors.accentPrimary}
          value={preferredAgeMax}
          onValueChange={(value) => {
            setPreferredAgeMax(value);

            if (value < preferredAgeMin) {
              setPreferredAgeMin(value);
            }

            if (errorText) {
              setErrorText(undefined);
            }
          }}
        />
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
          Use the bar handles to set minimum and maximum preferred ages.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.radius.md, padding: theme.spacing.md }]}> 
        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.label }}>Preferred Genders</Text>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>
          {preferredGenders.length > 0 ? preferredGenders.join(', ') : 'No selection yet'}
        </Text>
        <Button
          label="Select Preferred Genders"
          onPress={() => setIsGenderDropdownVisible(true)}
          variant="secondary"
        />
      </View>

      <InlineErrorMessage message={errorText} />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsGenderDropdownVisible(false)}
        transparent
        visible={isGenderDropdownVisible}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.backgroundPrimary }]}> 
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.radius.md,
                gap: theme.spacing.sm,
              },
            ]}
          >
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.cardTitle }}>Preferred Genders</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
              Select one or more options.
            </Text>
            {PREFERRED_GENDER_OPTIONS.map((option) => {
              const isSelected = preferredGenders.includes(option);

              return (
                <Pressable
                  accessibilityLabel={`Toggle ${option}`}
                  key={option}
                  onPress={() => togglePreferredGender(option)}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor: isSelected ? theme.colors.accentPrimary : theme.colors.backgroundPrimary,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                  testID={`onboarding-pref-gender-option-${option}`}
                >
                  <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.body }}>{option}</Text>
                </Pressable>
              );
            })}
            <Button label="Done" onPress={() => setIsGenderDropdownVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    padding: 16,
    width: '100%',
  },
  dropdownItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
