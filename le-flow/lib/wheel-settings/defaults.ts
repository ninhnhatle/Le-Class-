import {
  DEFAULT_WHEEL_COPY,
  DEFAULT_WHEEL_OPTIONS,
  type WheelCopySettings,
} from "@/components/spin-wheel/constants";
import type { WheelSettingsPayload } from "./types";

export function getDefaultWheelSettings(): WheelSettingsPayload {
  return {
    title: DEFAULT_WHEEL_COPY.title,
    subtitle: DEFAULT_WHEEL_COPY.subtitle,
    options: [...DEFAULT_WHEEL_OPTIONS],
  };
}

export function normalizeWheelSettings(input: unknown): WheelSettingsPayload {
  const defaults = getDefaultWheelSettings();
  if (!input || typeof input !== "object") return defaults;

  const record = input as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : defaults.title;
  const subtitle = typeof record.subtitle === "string" ? record.subtitle.trim() : defaults.subtitle;
  const updatedAt = typeof record.updatedAt === "string" ? record.updatedAt : undefined;

  let options: string[] = defaults.options;
  if (Array.isArray(record.options)) {
    const cleaned = record.options.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (cleaned.length > 0) options = cleaned.map((o) => o.trim());
  } else if (typeof record.options_json === "string") {
    try {
      const parsed = JSON.parse(record.options_json) as unknown;
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0,
        );
        if (cleaned.length > 0) options = cleaned.map((o) => o.trim());
      }
    } catch {
      /* use defaults */
    }
  }

  return {
    title: title || defaults.title,
    subtitle: subtitle || defaults.subtitle,
    options,
    updatedAt,
  };
}

export function toCopy(settings: WheelSettingsPayload): WheelCopySettings {
  return { title: settings.title, subtitle: settings.subtitle };
}
