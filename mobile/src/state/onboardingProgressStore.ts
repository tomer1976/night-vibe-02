export const ONBOARDING_TOTAL_STEPS = 7;

export type OnboardingProgressState = {
  currentStep: number;
  completedSteps: number[];
};

export type OnboardingProgressAction =
  | { type: 'SET_CURRENT_STEP'; step: number }
  | { type: 'MARK_STEP_COMPLETED'; step: number }
  | { type: 'GO_TO_NEXT_STEP' }
  | { type: 'GO_TO_PREVIOUS_STEP' }
  | { type: 'HYDRATE_STATE'; state: OnboardingProgressState }
  | { type: 'RESET_PROGRESS' };

function clampStep(step: number): number {
  if (!Number.isFinite(step)) {
    return 1;
  }

  if (step < 1) {
    return 1;
  }

  if (step > ONBOARDING_TOTAL_STEPS) {
    return ONBOARDING_TOTAL_STEPS;
  }

  return Math.floor(step);
}

export function createInitialOnboardingProgressState(): OnboardingProgressState {
  return {
    currentStep: 1,
    completedSteps: [],
  };
}

export function onboardingProgressReducer(
  state: OnboardingProgressState,
  action: OnboardingProgressAction
): OnboardingProgressState {
  switch (action.type) {
    case 'SET_CURRENT_STEP': {
      const nextStep = clampStep(action.step);

      if (nextStep === state.currentStep) {
        return state;
      }

      return {
        ...state,
        currentStep: nextStep,
      };
    }

    case 'MARK_STEP_COMPLETED': {
      const step = clampStep(action.step);

      if (state.completedSteps.includes(step)) {
        return state;
      }

      return {
        ...state,
        completedSteps: [...state.completedSteps, step].sort((left, right) => left - right),
      };
    }

    case 'GO_TO_NEXT_STEP': {
      const nextStep = clampStep(state.currentStep + 1);

      if (nextStep === state.currentStep) {
        return state;
      }

      return {
        ...state,
        currentStep: nextStep,
      };
    }

    case 'GO_TO_PREVIOUS_STEP': {
      const previousStep = clampStep(state.currentStep - 1);

      if (previousStep === state.currentStep) {
        return state;
      }

      return {
        ...state,
        currentStep: previousStep,
      };
    }

    case 'HYDRATE_STATE': {
      return {
        currentStep: clampStep(action.state.currentStep),
        completedSteps: action.state.completedSteps
          .map((step) => clampStep(step))
          .filter((step, index, items) => items.indexOf(step) === index)
          .sort((left, right) => left - right),
      };
    }

    case 'RESET_PROGRESS': {
      return createInitialOnboardingProgressState();
    }

    default:
      return state;
  }
}
