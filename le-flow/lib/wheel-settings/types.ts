import type { WheelCopySettings } from "@/components/spin-wheel/constants";

export type WheelSettingsPayload = WheelCopySettings & {
  options: string[];
  updatedAt?: string;
};

export type WheelSettingsApiResponse = {
  ok: boolean;
  source: "google_sheet" | "defaults" | "local_fallback";
  data: WheelSettingsPayload;
  error?: string;
};
