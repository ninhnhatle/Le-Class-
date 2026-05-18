export const WHEEL_OPTIONS_STORAGE_KEY = "lestudy-warmup-wheel-options";
export const WHEEL_COPY_STORAGE_KEY = "lestudy-warmup-wheel-copy";

export type WheelCopySettings = {
  title: string;
  subtitle: string;
};

export const DEFAULT_WHEEL_COPY: WheelCopySettings = {
  title: "Vòng quay ngẫu nhiên",
  subtitle: "Quay để chọn hoạt động khởi động cho lớp.",
};

export const WHEEL_SUBTITLE_PRESETS = [
  "Quay để chọn hoạt động khởi động cho lớp.",
  "Lựa chọn nhân tố may mắn.",
  "Quay để chọn học sinh trả lời.",
  "Chọn thử thách ngẫu nhiên cho lớp.",
] as const;

export const DEFAULT_WHEEL_OPTIONS = [
  "Chào hỏi bằng tiếng Nhật",
  "Đoán từ vựng",
  "Hát một bài ngắn",
  "Kể chuyện 1 phút",
  "Trò chơi nhóm",
  "Ôn bài cũ",
];

export const WHEEL_SLICE_COLORS = [
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
  "#f43f5e",
  "#10b981",
  "#ec4899",
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Assign colors so no two adjacent slices (including first/last) share the same color. */
export function assignSliceColors(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [WHEEL_SLICE_COLORS[0]];

  const palette = WHEEL_SLICE_COLORS;

  for (let attempt = 0; attempt < 64; attempt++) {
    const order = shuffle(palette);
    const colors: string[] = [];
    let failed = false;

    for (let i = 0; i < count; i++) {
      const prev = i > 0 ? colors[i - 1] : null;
      const candidates = order.filter((c) => c !== prev);
      if (candidates.length === 0) {
        failed = true;
        break;
      }
      const lastIdx = i === count - 1;
      const pool =
        lastIdx && count > 1 ? candidates.filter((c) => c !== colors[0]) : candidates;
      if (pool.length === 0) {
        failed = true;
        break;
      }
      colors.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    if (!failed) return colors;
  }

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const forbidden = new Set<string>();
    if (i > 0) forbidden.add(colors[i - 1]);
    if (i === count - 1 && count > 1) forbidden.add(colors[0]);
    const available = palette.filter((c) => !forbidden.has(c));
    colors.push(available[i % available.length] ?? palette[i % palette.length]);
  }
  return colors;
}
