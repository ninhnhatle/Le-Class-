import { NextResponse } from "next/server";
import {
  fetchStepSettingsFromSheet,
  getStepGoogleSheetConfigErrorMessage,
  getStepGoogleSheetConfigStatus,
  isStepGoogleSheetEnabled,
  saveStepSettingsToSheet,
} from "@/lib/step-settings/google-sheet-server";
import { isValidStepId } from "@/lib/step-settings/sanitize";
import { getDefaultStepSettings, sanitizeStepSettings } from "@/lib/step-settings/sanitize";
import type { StepId } from "@/lib/step-settings/keys";
import type { StepSettingsApiResponse } from "@/lib/step-settings/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ step: string }> };

function parseStep(step: string): StepId | null {
  return isValidStepId(step) ? step : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { step: stepParam } = await context.params;
  const step = parseStep(stepParam);

  if (!step) {
    return NextResponse.json({ ok: false, error: "Invalid step" }, { status: 400 });
  }

  try {
    if (!isStepGoogleSheetEnabled()) {
      const data = getDefaultStepSettings(step);
      return NextResponse.json({
        ok: true,
        step,
        source: "defaults",
        data,
        error: getStepGoogleSheetConfigErrorMessage(),
        config: getStepGoogleSheetConfigStatus(),
      } satisfies StepSettingsApiResponse<typeof data> & {
        config?: ReturnType<typeof getStepGoogleSheetConfigStatus>;
      });
    }

    const data = await fetchStepSettingsFromSheet(step);
    return NextResponse.json({
      ok: true,
      step,
      source: "google_sheet",
      data,
    } satisfies StepSettingsApiResponse<typeof data>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const data = getDefaultStepSettings(step);
    return NextResponse.json(
      {
        ok: false,
        step,
        source: "defaults",
        data,
        error: message,
      } satisfies StepSettingsApiResponse<typeof data>,
      { status: 502 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { step: stepParam } = await context.params;
  const step = parseStep(stepParam);

  if (!step) {
    return NextResponse.json({ ok: false, error: "Invalid step" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as unknown;
    const settings = sanitizeStepSettings(step, body);

    if (!isStepGoogleSheetEnabled()) {
      return NextResponse.json(
        {
          ok: false,
          step,
          source: "defaults",
          data: settings,
          error: getStepGoogleSheetConfigErrorMessage(),
          config: getStepGoogleSheetConfigStatus(),
        } satisfies StepSettingsApiResponse<typeof settings> & {
          config?: ReturnType<typeof getStepGoogleSheetConfigStatus>;
        },
        { status: 503 },
      );
    }

    const data = await saveStepSettingsToSheet(step, settings);
    return NextResponse.json({
      ok: true,
      step,
      source: "google_sheet",
      data,
    } satisfies StepSettingsApiResponse<typeof data>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        step,
        source: "defaults",
        data: getDefaultStepSettings(step),
        error: message,
      } satisfies StepSettingsApiResponse<ReturnType<typeof getDefaultStepSettings>>,
      { status: 502 },
    );
  }
}
