import { getDefaultWheelSettings, normalizeWheelSettings } from "./defaults";
import type { WheelSettingsPayload } from "./types";

/** Read at request time — avoids Next.js inlining undefined at build when env was missing. */
function getWheelEnv() {
  const webAppUrl = process.env["GOOGLE_APPS_SCRIPT_WEB_APP_URL"]?.trim() ?? "";
  const apiSecret = process.env["WHEEL_SETTINGS_API_SECRET"]?.trim() ?? "";
  return { webAppUrl, apiSecret };
}

export function getGoogleSheetConfigStatus() {
  const { webAppUrl, apiSecret } = getWheelEnv();
  return {
    hasUrl: webAppUrl.length > 0,
    hasSecret: apiSecret.length > 0,
    configured: webAppUrl.length > 0 && apiSecret.length > 0,
  };
}

function isConfigured(): boolean {
  return getGoogleSheetConfigStatus().configured;
}

async function callAppsScript<T>(
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<T> {
  const { webAppUrl, apiSecret } = getWheelEnv();
  if (!webAppUrl || !apiSecret) {
    throw new Error("Google Sheet integration is not configured");
  }

  const url = new URL(webAppUrl);
  url.searchParams.set("secret", apiSecret);

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
    init.body = JSON.stringify({ ...body, secret: apiSecret });
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

export function getGoogleSheetConfigErrorMessage(): string {
  const { hasUrl, hasSecret } = getGoogleSheetConfigStatus();
  if (!hasUrl && !hasSecret) {
    return "Chưa cấu hình Google Sheet. Thêm GOOGLE_APPS_SCRIPT_WEB_APP_URL và WHEEL_SETTINGS_API_SECRET trên Vercel (Production), rồi Redeploy.";
  }
  if (!hasUrl) {
    return "Thiếu GOOGLE_APPS_SCRIPT_WEB_APP_URL trên Vercel. Sau khi thêm, bấm Redeploy deployment Production.";
  }
  if (!hasSecret) {
    return "Thiếu WHEEL_SETTINGS_API_SECRET trên Vercel. Sau khi thêm, bấm Redeploy deployment Production.";
  }
  return "";
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
