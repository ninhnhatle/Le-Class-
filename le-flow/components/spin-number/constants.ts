export type SpinNumberMode = "list" | "range";

export type SpinNumberSettings = {
  title: string;
  subtitle: string;
  resultDialogTitle: string;
  resultLabel: string;
  mode: SpinNumberMode;
  listValues: string[];
  maxNumber: number;
};

export const DEFAULT_SPIN_NUMBER_SETTINGS: SpinNumberSettings = {
  title: "Xổ số khởi động",
  subtitle: "Bấm quay để chọn số hoặc thử thách ngẫu nhiên.",
  resultDialogTitle: "Xin mời",
  resultLabel: "Bạn được chọn là",
  mode: "range",
  listValues: ["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 5"],
  maxNumber: 40,
};

export function sanitizeSpinNumberSettings(
  input: Partial<SpinNumberSettings> | null | undefined,
): SpinNumberSettings {
  if (!input) return DEFAULT_SPIN_NUMBER_SETTINGS;

  const listValues = Array.isArray(input.listValues)
    ? input.listValues
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_SPIN_NUMBER_SETTINGS.listValues;

  const normalizedMax = Number.isFinite(input.maxNumber)
    ? Math.max(2, Math.min(999, Math.floor(input.maxNumber ?? DEFAULT_SPIN_NUMBER_SETTINGS.maxNumber)))
    : DEFAULT_SPIN_NUMBER_SETTINGS.maxNumber;

  return {
    title: (input.title ?? "").trim() || DEFAULT_SPIN_NUMBER_SETTINGS.title,
    subtitle: (input.subtitle ?? "").trim() || DEFAULT_SPIN_NUMBER_SETTINGS.subtitle,
    resultDialogTitle:
      (input.resultDialogTitle ?? "").trim() || DEFAULT_SPIN_NUMBER_SETTINGS.resultDialogTitle,
    resultLabel: (input.resultLabel ?? "").trim() || DEFAULT_SPIN_NUMBER_SETTINGS.resultLabel,
    mode: input.mode === "list" ? "list" : "range",
    listValues: listValues.length > 0 ? listValues : DEFAULT_SPIN_NUMBER_SETTINGS.listValues,
    maxNumber: normalizedMax,
  };
}
