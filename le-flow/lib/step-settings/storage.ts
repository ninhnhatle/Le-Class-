import { fetchStepSettings, saveStepSettingsRemote } from "@/lib/step-settings/client";
import type { StepId } from "./keys";
import type { StepSettingsMap } from "./sanitize";
import { getDefaultStepSettings, sanitizeStepSettings } from "./sanitize";
import type { StepSettingsSource } from "./types";

export async function loadStepSettingsRemote<S extends StepId>(
  step: S,
): Promise<{ settings: StepSettingsMap[S]; source: StepSettingsSource }> {
  const response = await fetchStepSettings(step);

  const settings = response.data
    ? (sanitizeStepSettings(step, response.data) as StepSettingsMap[S])
    : getDefaultStepSettings(step);

  return {
    settings,
    source: response.ok ? response.source : "defaults",
  };
}

export async function persistStepSettingsRemote<S extends StepId>(
  step: S,
  settings: StepSettingsMap[S],
): Promise<{ ok: boolean; error?: string }> {
  const response = await saveStepSettingsRemote(step, settings);
  if (response.ok && response.data) {
    return { ok: true };
  }

  return { ok: false, error: response.error ?? "Không lưu được lên Google Sheet." };
}
