/** English tab ids — aligned with `home-dashboard` step ids. */
export const STEP_IDS = {
  warmup: "warmup",
  knowledge: "knowledge",
  practice: "practice",
} as const;

export type StepId = (typeof STEP_IDS)[keyof typeof STEP_IDS];

export function getStepSettingsKey(stepId: StepId): string {
  return `lestudy-step-${stepId}-settings`;
}

/** Legacy localStorage keys migrated on first read. */
export const LEGACY_STEP_SETTINGS_KEYS: Partial<Record<StepId, string[]>> = {
  warmup: ["lestudy-warmup-spin-number-settings"],
  practice: ["lestudy-practice-settings"],
};
