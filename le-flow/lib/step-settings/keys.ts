/** English tab ids — aligned with `home-dashboard` step ids. */
export const STEP_IDS = {
  warmup: "warmup",
  knowledge: "knowledge",
  practice: "practice",
} as const;

export type StepId = (typeof STEP_IDS)[keyof typeof STEP_IDS];
