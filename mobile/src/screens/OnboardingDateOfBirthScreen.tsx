import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { Button, Input } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { validateAdultDateOfBirth } from '../validation/formValidation';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

const ADULT_AGE_FALLBACK = 21;

function formatDateForStorage(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseStoredDate(value: string): Date | null {
  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const [year, month, day] = trimmed.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function buildDefaultDate() {
  const today = new Date();
  return new Date(today.getFullYear() - ADULT_AGE_FALLBACK, today.getMonth(), today.getDate());
}

export function OnboardingDateOfBirthScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { markStepCompleted } = useOnboardingState();
  const draft = readDraftFromParams(route.params);
  const parsedDraftDate = parseStoredDate(draft.dateOfBirth);

  const [dateOfBirth, setDateOfBirth] = useState(draft.dateOfBirth);
  const [pickerDate, setPickerDate] = useState<Date>(parsedDraftDate ?? buildDefaultDate());
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();

  const goBack = () => {
    navigation.dispatch(StackActions.replace(ROUTE_NAMES.OnboardingName, { draft: { ...draft, dateOfBirth } }));
  };

  const goNext = () => {
    const nextError = validateAdultDateOfBirth(dateOfBirth);

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    setErrorText(undefined);
    markStepCompleted(2);

    navigation.dispatch(
      StackActions.replace(ROUTE_NAMES.OnboardingGender, {
        draft: {
          ...draft,
          dateOfBirth: dateOfBirth.trim(),
        },
      })
    );
  };

  return (
    <OnboardingStepLayout
      onBack={goBack}
      onNext={goNext}
      step={2}
      subtitle="Select your date of birth using the date picker."
      title="Onboarding Step 2: Date of Birth"
      totalSteps={7}
    >
      <Input
        editable={false}
        helperText="You must be at least 18 years old."
        errorText={errorText}
        label="Date of Birth"
        onPress={() => setIsPickerVisible(true)}
        placeholder="1998-12-31"
        testID="onboarding-dob-input"
        value={dateOfBirth}
      />
      <View>
        <Button label="Select Date" onPress={() => setIsPickerVisible((currentValue) => !currentValue)} variant="secondary" />
      </View>
      {isPickerVisible ? (
        <View>
          <DateTimePicker
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setIsPickerVisible(false);
              }

              if (!selectedDate || event.type === 'dismissed') {
                return;
              }

              setPickerDate(selectedDate);
              setDateOfBirth(formatDateForStorage(selectedDate));

              if (errorText) {
                setErrorText(undefined);
              }
            }}
            testID="onboarding-dob-picker"
            value={pickerDate}
          />
          {Platform.OS === 'ios' ? <Button label="Done" onPress={() => setIsPickerVisible(false)} variant="secondary" /> : null}
        </View>
      ) : null}
    </OnboardingStepLayout>
  );
}
