import type { WheelSettingsApiResponse, WheelSettingsPayload } from "./types";

export async function fetchWheelSettings(): Promise<WheelSettingsApiResponse> {
  const res = await fetch("/api/wheel-settings", { cache: "no-store" });
  return res.json() as Promise<WheelSettingsApiResponse>;
}

export async function saveWheelSettings(settings: WheelSettingsPayload): Promise<WheelSettingsApiResponse> {
  const res = await fetch("/api/wheel-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json() as Promise<WheelSettingsApiResponse>;
}
