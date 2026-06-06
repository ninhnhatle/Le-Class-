import {
  DEFAULT_SPIN_NUMBER_SETTINGS,
  sanitizeSpinNumberSettings,
  type SpinNumberSettings,
} from "@/components/spin-number/constants";
import {
  DEFAULT_KNOWLEDGE_SETTINGS,
  type KnowledgeSettings,
} from "@/lib/knowledge/constants";
import { sanitizeKnowledgeSettings } from "@/lib/knowledge/utils";
import { DEFAULT_PRACTICE_SETTINGS } from "@/lib/practice/constants";
import type { PracticeSettings } from "@/lib/practice/types";
import { sanitizePracticeSettings } from "@/lib/practice/utils";
import { STEP_IDS, type StepId } from "./keys";

export type StepSettingsMap = {
  warmup: SpinNumberSettings;
  knowledge: KnowledgeSettings;
  practice: PracticeSettings;
};

export function getDefaultStepSettings<S extends StepId>(step: S): StepSettingsMap[S] {
  switch (step) {
    case STEP_IDS.warmup:
      return DEFAULT_SPIN_NUMBER_SETTINGS as StepSettingsMap[S];
    case STEP_IDS.knowledge:
      return DEFAULT_KNOWLEDGE_SETTINGS as StepSettingsMap[S];
    case STEP_IDS.practice:
      return DEFAULT_PRACTICE_SETTINGS as StepSettingsMap[S];
    default:
      return DEFAULT_SPIN_NUMBER_SETTINGS as StepSettingsMap[S];
  }
}

export function sanitizeStepSettings<S extends StepId>(
  step: S,
  input: unknown,
): StepSettingsMap[S] {
  switch (step) {
    case STEP_IDS.warmup:
      return sanitizeSpinNumberSettings(input as Partial<SpinNumberSettings>) as StepSettingsMap[S];
    case STEP_IDS.knowledge:
      return sanitizeKnowledgeSettings(input) as StepSettingsMap[S];
    case STEP_IDS.practice:
      return sanitizePracticeSettings(input as Partial<PracticeSettings>) as StepSettingsMap[S];
    default:
      return getDefaultStepSettings(step);
  }
}

export function isValidStepId(value: string): value is StepId {
  return value === STEP_IDS.warmup || value === STEP_IDS.knowledge || value === STEP_IDS.practice;
}
