import { ReactNode, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, TopBar } from '../components';
import { useOnboardingState } from '../state';
import { useTheme } from '../theme';

type OnboardingStepLayoutProps = {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  children: ReactNode;
};

export function OnboardingStepLayout({
  title,
  subtitle,
  step,
  totalSteps,
  onBack,
  onNext,
  nextLabel = 'Next',
  disableNext = false,
  children,
}: OnboardingStepLayoutProps) {
  const theme = useTheme();
  const { setCurrentStep } = useOnboardingState();

  useEffect(() => {
    setCurrentStep(step);
  }, [setCurrentStep, step]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar title="Night Vibe" subtitle="Onboarding" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card subtitle={subtitle} title={title}>
            <View style={{ gap: theme.spacing.md }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.meta }}>{`Step ${step} of ${totalSteps}`}</Text>
              {children}
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                {onBack ? <Button label="Back" onPress={onBack} variant="secondary" /> : null}
                <Button disabled={disableNext} label={nextLabel} onPress={onNext} />
              </View>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
