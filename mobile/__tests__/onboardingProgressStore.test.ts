import {
  createInitialOnboardingProgressState,
  onboardingProgressReducer,
  ONBOARDING_TOTAL_STEPS,
} from '../src/state/onboardingProgressStore';

describe('onboardingProgressStore', () => {
  it('starts at step 1 with no completed steps', () => {
    const initialState = createInitialOnboardingProgressState();

    expect(initialState.currentStep).toBe(1);
    expect(initialState.completedSteps).toEqual([]);
  });

  it('sets and clamps current step boundaries', () => {
    const initialState = createInitialOnboardingProgressState();

    const atMinBoundary = onboardingProgressReducer(initialState, {
      type: 'SET_CURRENT_STEP',
      step: 0,
    });

    const atMaxBoundary = onboardingProgressReducer(initialState, {
      type: 'SET_CURRENT_STEP',
      step: ONBOARDING_TOTAL_STEPS + 10,
    });

    expect(atMinBoundary.currentStep).toBe(1);
    expect(atMaxBoundary.currentStep).toBe(ONBOARDING_TOTAL_STEPS);
  });

  it('marks completed steps uniquely and in sorted order', () => {
    const initialState = createInitialOnboardingProgressState();

    const withStepThree = onboardingProgressReducer(initialState, {
      type: 'MARK_STEP_COMPLETED',
      step: 3,
    });

    const withStepOne = onboardingProgressReducer(withStepThree, {
      type: 'MARK_STEP_COMPLETED',
      step: 1,
    });

    const duplicateStepOne = onboardingProgressReducer(withStepOne, {
      type: 'MARK_STEP_COMPLETED',
      step: 1,
    });

    expect(withStepThree.completedSteps).toEqual([3]);
    expect(withStepOne.completedSteps).toEqual([1, 3]);
    expect(duplicateStepOne.completedSteps).toEqual([1, 3]);
  });

  it('supports next/previous and reset transitions', () => {
    const initialState = createInitialOnboardingProgressState();

    const nextStep = onboardingProgressReducer(initialState, { type: 'GO_TO_NEXT_STEP' });
    const previousStep = onboardingProgressReducer(nextStep, { type: 'GO_TO_PREVIOUS_STEP' });
    const completed = onboardingProgressReducer(nextStep, {
      type: 'MARK_STEP_COMPLETED',
      step: 1,
    });
    const reset = onboardingProgressReducer(completed, { type: 'RESET_PROGRESS' });

    expect(nextStep.currentStep).toBe(2);
    expect(previousStep.currentStep).toBe(1);
    expect(completed.completedSteps).toEqual([1]);
    expect(reset).toEqual(createInitialOnboardingProgressState());
  });
});
