export type LessonPhase = "warmup" | "knowledge" | "practice" | "application";

export type LessonPlan = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  phase: LessonPhase;
  durationMin: number;
  updatedAt: string;
  tags: string[];
  favorite?: boolean;
};

export const PHASE_LABELS: Record<LessonPhase, string> = {
  warmup: "Khởi động",
  knowledge: "Hình thành kiến thức",
  practice: "Luyện tập",
  application: "Vận dụng",
};

export const SUBJECT_FILTERS = ["Tất cả", "Tiếng Nhật", "Ngữ văn", "Toán"] as const;
export const GRADE_FILTERS = ["Tất cả", "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"] as const;

export const SAMPLE_LESSONS: LessonPlan[] = [
  {
    id: "1",
    title: "Bài 1: Chào hỏi và giới thiệu bản thân",
    subject: "Tiếng Nhật",
    grade: "Lớp 7",
    phase: "warmup",
    durationMin: 45,
    updatedAt: "2026-05-10",
    tags: ["Hiragana", "Giao tiếp"],
    favorite: true,
  },
  {
    id: "2",
    title: "Trợ động từ できる · 〜ことができる",
    subject: "Tiếng Nhật",
    grade: "Lớp 8",
    phase: "knowledge",
    durationMin: 50,
    updatedAt: "2026-05-12",
    tags: ["Ngữ pháp", "N4"],
  },
  {
    id: "3",
    title: "Luyện nghe: Đặt món tại nhà hàng",
    subject: "Tiếng Nhật",
    grade: "Lớp 8",
    phase: "practice",
    durationMin: 40,
    updatedAt: "2026-05-14",
    tags: ["Nghe", "Từ vựng"],
    favorite: true,
  },
  {
    id: "4",
    title: "Vận dụng: Viết email mời tham gia sự kiện",
    subject: "Tiếng Nhật",
    grade: "Lớp 9",
    phase: "application",
    durationMin: 55,
    updatedAt: "2026-05-15",
    tags: ["Viết", "Email"],
  },
  {
    id: "5",
    title: "Ôn tập từ vựng chủ đề trường học",
    subject: "Tiếng Nhật",
    grade: "Lớp 6",
    phase: "warmup",
    durationMin: 35,
    updatedAt: "2026-05-08",
    tags: ["Từ vựng", "Trò chơi"],
  },
  {
    id: "6",
    title: "Thể te-form và cách dùng cơ bản",
    subject: "Tiếng Nhật",
    grade: "Lớp 9",
    phase: "knowledge",
    durationMin: 50,
    updatedAt: "2026-05-11",
    tags: ["Ngữ pháp", "Te-form"],
  },
];

export const RECOMMENDED_FEATURES = [
  {
    title: "Tìm kiếm & lọc nhanh",
    description: "Lọc theo môn, lớp, giai đoạn 4 bước và từ khóa trong tiêu đề hoặc thẻ.",
    icon: "search",
  },
  {
    title: "Sao yêu thích",
    description: "Đánh dấu bài dạy thường dùng để mở lại nhanh trước giờ lên lớp.",
    icon: "star",
  },
  {
    title: "Nhân bản bài dạy",
    description: "Sao chép bài có sẵn rồi chỉnh sửa cho lớp hoặc tiết học khác.",
    icon: "copy",
  },
  {
    title: "Xuất & chia sẻ",
    description: "Xuất PDF hoặc link chia sẻ với đồng nghiệp trong trường.",
    icon: "share",
  },
] as const;
