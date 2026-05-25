import { NextResponse } from "next/server";
import { getDefaultWheelSettings, normalizeWheelSettings } from "@/lib/wheel-settings/defaults";
import {
  fetchWheelSettingsFromSheet,
  isGoogleSheetEnabled,
  saveWheelSettingsToSheet,
} from "@/lib/wheel-settings/google-sheet-server";
import type { WheelSettingsApiResponse } from "@/lib/wheel-settings/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isGoogleSheetEnabled()) {
      const data = getDefaultWheelSettings();
      return NextResponse.json({
        ok: true,
        source: "defaults",
        data,
        error:
          "Chưa cấu hình Google Sheet. Thêm GOOGLE_APPS_SCRIPT_WEB_APP_URL và WHEEL_SETTINGS_API_SECRET trên Vercel.",
      } satisfies WheelSettingsApiResponse);
    }

    const data = await fetchWheelSettingsFromSheet();
    return NextResponse.json({
      ok: true,
      source: "google_sheet",
      data,
    } satisfies WheelSettingsApiResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const data = getDefaultWheelSettings();
    return NextResponse.json(
      {
        ok: false,
        source: "defaults",
        data,
        error: message,
      } satisfies WheelSettingsApiResponse,
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const settings = normalizeWheelSettings(body);

    if (!isGoogleSheetEnabled()) {
      return NextResponse.json(
        {
          ok: false,
          source: "defaults",
          data: settings,
          error:
            "Chưa cấu hình Google Sheet. Thêm biến môi trường trên Vercel (xem docs/GOOGLE_SHEETS_WHEEL_SETTINGS.md).",
        } satisfies WheelSettingsApiResponse,
        { status: 503 },
      );
    }

    const data = await saveWheelSettingsToSheet(settings);
    return NextResponse.json({
      ok: true,
      source: "google_sheet",
      data,
    } satisfies WheelSettingsApiResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        source: "defaults",
        data: getDefaultWheelSettings(),
        error: message,
      } satisfies WheelSettingsApiResponse,
      { status: 502 },
    );
  }
}
