import type { StepId } from "./keys";

export type StepSettingsSource = "google_sheet" | "defaults";

export type StepSettingsApiResponse<T> = {
  ok: boolean;
  step: StepId;
  source: StepSettingsSource;
  data: T;
  error?: string;
};
