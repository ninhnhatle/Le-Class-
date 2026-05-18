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
