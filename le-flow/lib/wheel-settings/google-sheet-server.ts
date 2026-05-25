import { getDefaultWheelSettings, normalizeWheelSettings } from "./defaults";
import type { WheelSettingsPayload } from "./types";

const WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
const API_SECRET = process.env.WHEEL_SETTINGS_API_SECRET;

function isConfigured(): boolean {
  return Boolean(WEB_APP_URL?.trim() && API_SECRET?.trim());
}

async function callAppsScript<T>(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<T> {
  if (!isConfigured()) {
    throw new Error("Google Sheet integration is not configured");
  }

  const url = new URL(WEB_APP_URL!);
  url.searchParams.set("secret", API_SECRET!);

  const init: RequestInit = {
    method,
    cache: "no-store",
    headers: { Accept: "application/json" },
  };

  if (method === "POST" && body) {
    init.headers = {
      ...init.headers,
      "Content-Type": "application/json",
    };
    init.body = JSON.stringify({ ...body, secret: API_SECRET });
  }

  const res = await fetch(url.toString(), init);
  const text = await res.text();

  let json: { ok?: boolean; data?: unknown; error?: string };
  try {
    json = JSON.parse(text) as { ok?: boolean; data?: unknown; error?: string };
  } catch {
    throw new Error(`Invalid response from Google Apps Script (${res.status})`);
  }

  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? `Google Apps Script error (${res.status})`);
  }

  return json.data as T;
}

export function isGoogleSheetEnabled(): boolean {
  return isConfigured();
}

export async function fetchWheelSettingsFromSheet(): Promise<WheelSettingsPayload> {
  if (!isConfigured()) return getDefaultWheelSettings();
  const data = await callAppsScript<unknown>("GET");
  return normalizeWheelSettings(data);
}

export async function saveWheelSettingsToSheet(
  settings: WheelSettingsPayload,
): Promise<WheelSettingsPayload> {
  if (!isConfigured()) {
    throw new Error("Google Sheet integration is not configured");
  }

  const data = await callAppsScript<unknown>("POST", {
    title: settings.title,
    subtitle: settings.subtitle,
    options: settings.options,
  });

  return normalizeWheelSettings(data);
}
