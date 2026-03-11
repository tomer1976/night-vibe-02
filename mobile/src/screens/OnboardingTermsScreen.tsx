import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { Button } from '../components';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useOnboardingState } from '../state';
import { useTheme } from '../theme';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { readDraftFromParams } from './onboardingDraft';

const TERMS_CONTENT = [
  'Night Vibe Terms of Service (Mock Preview)',
  '1. You confirm all profile information you provide is accurate and truthful.',
  '2. You confirm you are at least 18 years old to use Night Vibe.',
  '3. Discovery and messaging are available only when users are eligible according to platform safety and venue rules.',
  '4. Harassment, impersonation, hate speech, and abusive behavior are prohibited.',
  '5. Account access may be limited for safety, moderation, or policy violations.',
  '6. You can request account deletion and recover only within the allowed recovery window.',
  '7. This is a Sprint-02 mock legal preview for product validation only.',
].join('\n\n');

export function OnboardingTermsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { markStepCompleted, setProfileCompleted } = useOnboardingState();
  const draft = readDraftFromParams(route.params);
  const [isTermsVisible, setIsTermsVisible] = useState(false);

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

    markStepCompleted(7);
    setProfileCompleted(false);

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
      <Button label="Read Terms" onPress={() => setIsTermsVisible(true)} variant="secondary" />
      <Button
        label={draft.acceptedTerms ? 'Terms Accepted' : 'Accept Terms'}
        onPress={toggleAcceptance}
        variant={draft.acceptedTerms ? 'primary' : 'secondary'}
      />
      <Modal animationType="slide" onRequestClose={() => setIsTermsVisible(false)} transparent visible={isTermsVisible}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.backgroundPrimary }]}> 
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.cardTitle }}>Terms of Service</Text>
            <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing.sm }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.body, lineHeight: theme.typography.body + 8 }}>
                {TERMS_CONTENT}
              </Text>
            </ScrollView>
            <Button label="Close" onPress={() => setIsTermsVisible(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    gap: 12,
    maxHeight: '80%',
    padding: 16,
    width: '100%',
  },
});
