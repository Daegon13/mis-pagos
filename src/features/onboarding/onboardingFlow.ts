export const DEMO_STEPS = ["today", "commitments", "available", "projection", "action"] as const;
export type DemoStep = typeof DEMO_STEPS[number];
export type OnboardingStep = "setup" | DemoStep;
export type OnboardingStatus = "active" | "completed" | "skipped" | "legacy";
export type OnboardingState = { status: OnboardingStatus; stepId: OnboardingStep | null };

export type Entry = "welcome" | "setup" | "demo" | "home";

export function entryFor(profileExists: boolean, state: OnboardingState | null): Entry {
  if (state?.status === "active") return profileExists ? "demo" : "setup";
  if (!profileExists) return state === null ? "welcome" : "setup";
  return "home";
}

export function resumeStep(state: OnboardingState | null): DemoStep {
  return state?.status === "active" && state.stepId && state.stepId !== "setup"
    ? state.stepId : "today";
}

export function nextStep(step: DemoStep): DemoStep {
  const index = DEMO_STEPS.indexOf(step);
  return DEMO_STEPS[Math.min(index + 1, DEMO_STEPS.length - 1)];
}

// These values live only in the tutorial's component state and never enter a repository.
export const DEMO = {
  balanceMinor: 3_000_000,
  expenseMinor: 800_000,
  incomeMinor: 1_200_000,
  availableMinor: 2_200_000,
  projectionMinor: 3_400_000,
} as const;
