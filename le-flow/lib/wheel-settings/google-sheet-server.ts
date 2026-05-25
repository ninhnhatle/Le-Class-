import { getDefaultWheelSettings, normalizeWheelSettings } from "./defaults";
import type { WheelSettingsPayload } from "./types";

function stripQuotes(value: string): string {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).trim();
  }
  return v;
}

/** Read at request time — avoids Next.js inlining undefined at build when env was missing. */
function getWheelEnv() {
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
      "GOOGLE_APPS_SCRIPT_WEB_APP_URL không hợp lệ trên Vercel. Dán URL Web App đầy đủ dạng https://script.google.com/macros/s/.../exec (không có dấu ngoặc hoặc khoảng trắng thừa).",
    );
  }
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

  const url = assertValidWebAppUrl(webAppUrl);
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
