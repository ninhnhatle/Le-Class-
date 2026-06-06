import type { StepId } from "./keys";
import type { StepSettingsApiResponse } from "./types";
import type { StepSettingsMap } from "./sanitize";

export async function fetchStepSettings<S extends StepId>(
  step: S,
): Promise<StepSettingsApiResponse<StepSettingsMap[S]>> {
  const res = await fetch(`/api/step-settings/${step}`, { cache: "no-store" });
  return res.json() as Promise<StepSettingsApiResponse<StepSettingsMap[S]>>;
}

export async function saveStepSettingsRemote<S extends StepId>(
  step: S,
  settings: StepSettingsMap[S],
): Promise<StepSettingsApiResponse<StepSettingsMap[S]>> {
  const res = await fetch(`/api/step-settings/${step}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json() as Promise<StepSettingsApiResponse<StepSettingsMap[S]>>;
}
