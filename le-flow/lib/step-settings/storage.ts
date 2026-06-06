import { fetchStepSettings, saveStepSettingsRemote } from "@/lib/step-settings/client";
import { getStepSettingsKey, LEGACY_STEP_SETTINGS_KEYS, type StepId } from "./keys";
import type { StepSettingsMap } from "./sanitize";
import { getDefaultStepSettings, sanitizeStepSettings } from "./sanitize";
import type { StepSettingsSource } from "./types";

type LoadStepSettingsOptions<T> = {
  sanitize: (input: unknown) => T;
  defaults: T;
};

/** Read cached settings from localStorage (offline / fallback). */
export function loadStepSettingsLocal<T>(stepId: StepId, options: LoadStepSettingsOptions<T>): T {
  if (typeof window === "undefined") return options.defaults;

  const key = getStepSettingsKey(stepId);

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return options.sanitize(JSON.parse(stored) as unknown);
    }
  } catch {
    // fall through
  }

  for (const legacyKey of LEGACY_STEP_SETTINGS_KEYS[stepId] ?? []) {
    try {
      const legacy = localStorage.getItem(legacyKey);
      if (!legacy) continue;

      const parsed = options.sanitize(JSON.parse(legacy) as unknown);
      saveStepSettingsLocal(stepId, parsed);
      localStorage.removeItem(legacyKey);
      return parsed;
    } catch {
      continue;
    }
  }

  return options.defaults;
}

export function saveStepSettingsLocal<T>(stepId: StepId, settings: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStepSettingsKey(stepId), JSON.stringify(settings));
}

/** @deprecated Use loadStepSettingsLocal or loadStepSettingsRemote */
export function loadStepSettings<T>(stepId: StepId, options: LoadStepSettingsOptions<T>): T {
  return loadStepSettingsLocal(stepId, options);
}

/** @deprecated Use saveStepSettingsLocal or persistStepSettingsRemote */
export function saveStepSettings<T>(stepId: StepId, settings: T): void {
  saveStepSettingsLocal(stepId, settings);
}

export async function loadStepSettingsRemote<S extends StepId>(
  step: S,
): Promise<{ settings: StepSettingsMap[S]; source: StepSettingsSource }> {
  const response = await fetchStepSettings(step);

  if (response.ok && response.data) {
    const settings = sanitizeStepSettings(step, response.data) as StepSettingsMap[S];
    saveStepSettingsLocal(step, settings);
    return { settings, source: response.source };
  }

  const cached = loadStepSettingsLocal(step, {
    defaults: getDefaultStepSettings(step),
    sanitize: (input) => sanitizeStepSettings(step, input),
  }) as StepSettingsMap[S];

  return { settings: cached, source: "local_cache" };
}

export async function persistStepSettingsRemote<S extends StepId>(
  step: S,
  settings: StepSettingsMap[S],
): Promise<{ ok: boolean; error?: string }> {
  saveStepSettingsLocal(step, settings);

  const response = await saveStepSettingsRemote(step, settings);
  if (response.ok && response.data) {
    saveStepSettingsLocal(step, sanitizeStepSettings(step, response.data) as StepSettingsMap[S]);
    return { ok: true };
  }

  return { ok: false, error: response.error ?? "Không lưu được lên Google Sheet." };
}
