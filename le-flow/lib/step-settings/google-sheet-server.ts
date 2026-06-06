import { getDefaultStepSettings, sanitizeStepSettings } from "./sanitize";
import type { StepId } from "./keys";
import type { StepSettingsMap } from "./sanitize";

function stripQuotes(value: string): string {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).trim();
  }
  return v;
}

function getSheetEnv() {
  const webAppUrl = stripQuotes(process.env["GOOGLE_APPS_SCRIPT_WEB_APP_URL"] ?? "");
  const apiSecret = stripQuotes(process.env["WHEEL_SETTINGS_API_SECRET"] ?? "");
  return { webAppUrl, apiSecret };
}

function assertValidWebAppUrl(webAppUrl: string): URL {
  try {
    const url = new URL(webAppUrl);
    if (!url.hostname.includes("script.google.com")) {
      throw new Error("Hostname must be script.google.com");
    }
    if (!url.pathname.includes("/macros/s/")) {
      throw new Error("Path must contain /macros/s/");
    }
    return url;
  } catch {
    throw new Error(
      "GOOGLE_APPS_SCRIPT_WEB_APP_URL không hợp lệ. Dán URL Web App đầy đủ dạng https://script.google.com/macros/s/.../exec",
    );
  }
}

export function getStepGoogleSheetConfigStatus() {
  const { webAppUrl, apiSecret } = getSheetEnv();
  return {
    hasUrl: webAppUrl.length > 0,
    hasSecret: apiSecret.length > 0,
    configured: webAppUrl.length > 0 && apiSecret.length > 0,
  };
}

function isConfigured(): boolean {
  return getStepGoogleSheetConfigStatus().configured;
}

export function isStepGoogleSheetEnabled(): boolean {
  return isConfigured();
}

export function getStepGoogleSheetConfigErrorMessage(): string {
  const { hasUrl, hasSecret } = getStepGoogleSheetConfigStatus();
  if (!hasUrl && !hasSecret) {
    return "Chưa cấu hình Google Sheet. Thêm GOOGLE_APPS_SCRIPT_WEB_APP_URL và WHEEL_SETTINGS_API_SECRET trên Vercel, rồi Redeploy.";
  }
  if (!hasUrl) {
    return "Thiếu GOOGLE_APPS_SCRIPT_WEB_APP_URL trên Vercel. Sau khi thêm, bấm Redeploy deployment Production.";
  }
  if (!hasSecret) {
    return "Thiếu WHEEL_SETTINGS_API_SECRET trên Vercel. Sau khi thêm, bấm Redeploy deployment Production.";
  }
  return "";
}

type StepSheetPayload = {
  settings: unknown;
  updatedAt?: string;
};

async function callAppsScriptForStep<T>(
  method: "GET" | "POST",
  step: StepId,
  body?: Record<string, unknown>,
): Promise<T> {
  const { webAppUrl, apiSecret } = getSheetEnv();
  if (!webAppUrl || !apiSecret) {
    throw new Error("Google Sheet integration is not configured");
  }

  const url = assertValidWebAppUrl(webAppUrl);
  url.searchParams.set("secret", apiSecret);
  url.searchParams.set("resource", "step");
  url.searchParams.set("step", step);

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
    init.body = JSON.stringify({ ...body, secret: apiSecret, step });
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

export async function fetchStepSettingsFromSheet<S extends StepId>(
  step: S,
): Promise<StepSettingsMap[S]> {
  if (!isConfigured()) return getDefaultStepSettings(step);

  const data = await callAppsScriptForStep<StepSheetPayload>("GET", step);
  return sanitizeStepSettings(step, data.settings);
}

export async function saveStepSettingsToSheet<S extends StepId>(
  step: S,
  settings: StepSettingsMap[S],
): Promise<StepSettingsMap[S]> {
  if (!isConfigured()) {
    throw new Error("Google Sheet integration is not configured");
  }

  const data = await callAppsScriptForStep<StepSheetPayload>("POST", step, { settings });
  return sanitizeStepSettings(step, data.settings);
}
