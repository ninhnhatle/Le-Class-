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
  description: string;
  objectives: string[];
  favorite?: boolean;
};

export const PHASE_LABELS: Record<LessonPhase, string> = {
  warmup: "Khởi động",
  knowledge: "Hình thành kiến thức",
  practice: "Luyện tập",
  application: "Vận dụng",
};

export const SUBJECT_FILTERS = ["Tất cả", "Ngữ văn", "Toán", "Khoa học tự nhiên"] as const;
export const GRADE_FILTERS = ["Tất cả", "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"] as const;

export const SAMPLE_LESSONS: LessonPlan[] = [
  {
    id: "1",
    title: "Khởi động: Trò chơi đoán từ vựng theo chủ đề",
    subject: "Ngữ văn",
    grade: "Lớp 7",
    phase: "warmup",
    durationMin: 15,
    updatedAt: "2026-05-10",
    tags: ["Từ vựng", "Trò chơi", "Nhóm"],
    favorite: true,
    description:
      "Hoạt động khởi động giúp học sinh ôn lại từ vựng chủ đề trường học qua trò chơi nhóm, tạo không khí vui và tích cực trước khi vào bài mới.",
    objectives: [
      "Học sinh nhớ lại ít nhất 10 từ vựng đã học trong chủ đề.",
      "Học sinh tham gia thảo luận nhóm và trình bày ngắn gọn.",
      "Giáo viên đánh giá nhanh mức độ nắm từ vựng của lớp.",
    ],
  },
  {
    id: "2",
    title: "Hình thành kiến thức: Câu kể có vị ngữ pháp",
    subject: "Ngữ văn",
    grade: "Lớp 8",
    phase: "knowledge",
    durationMin: 40,
    updatedAt: "2026-05-12",
    tags: ["Ngữ pháp", "Câu kể", "Ví dụ mẫu"],
    description:
      "Giới thiệu khái niệm câu kể có vị ngữ pháp, phân biệt với câu kể không vị ngữ pháp qua ví dụ minh họa và bảng tóm tắt.",
    objectives: [
      "Nhận biết được câu kể có vị ngữ pháp trong đoạn văn.",
      "Xác định đúng vị ngữ pháp của câu (CN, VN, trạng ngữ).",
      "Đặt được 3 câu kể có vị ngữ pháp đúng yêu cầu.",
    ],
  },
  {
    id: "3",
    title: "Luyện tập: Viết đoạn văn miêu tả người thân",
    subject: "Ngữ văn",
    grade: "Lớp 8",
    phase: "practice",
    durationMin: 45,
    updatedAt: "2026-05-14",
    tags: ["Viết", "Miêu tả", "Cá nhân"],
    favorite: true,
    description:
      "Học sinh viết đoạn văn 7–10 câu miêu tả người thân, áp dụng từ láy, so sánh và cấu trúc đoạn văn đã học.",
    objectives: [
      "Viết đoạn văn đủ ý, đúng chính tả cơ bản.",
      "Sử dụng ít nhất một biện pháp tu từ (so sánh hoặc ẩn dụ).",
      "Tự hiệu chỉnh theo gợi ý của giáo viên hoặc bạn bè.",
    ],
  },
  {
    id: "4",
    title: "Vận dụng: Thuyết trình về người hùng địa phương",
    subject: "Ngữ văn",
    grade: "Lớp 9",
    phase: "application",
    durationMin: 50,
    updatedAt: "2026-05-15",
    tags: ["Thuyết trình", "Kể chuyện", "Địa phương"],
    description:
      "Học sinh tìm hiểu và thuyết trình 3–5 phút về một người hùng hoặc danh nhân địa phương, kết hợp kỹ năng nói và viết tóm tắt.",
    objectives: [
      "Thu thập thông tin từ ít nhất hai nguồn (sách, báo, phỏng vấn).",
      "Thuyết trình rõ ràng, đúng trình tự thời gian.",
      "Trả lời được câu hỏi của bạn trong lớp.",
    ],
  },
  {
    id: "5",
    title: "Khởi động: Đố vui phép tính nhanh",
    subject: "Toán",
    grade: "Lớp 6",
    phase: "warmup",
    durationMin: 10,
    updatedAt: "2026-05-08",
    tags: ["Phép tính", "Đố vui", "Tốc độ"],
    description:
      "Trò chơi đố vui phép cộng, trừ, nhân, chia trong phạm vi đã học, khuyến khích phản xạ nhanh và chính xác.",
    objectives: [
      "Hoàn thành đúng ít nhất 8/10 phép tính trong thời gian quy định.",
      "Giải thích được cách làm của một bài khó.",
      "Hợp tác tốt khi chơi theo nhóm.",
    ],
  },
  {
    id: "6",
    title: "Hình thành kiến thức: Diện tích hình chữ nhật",
    subject: "Toán",
    grade: "Lớp 7",
    phase: "knowledge",
    durationMin: 45,
    updatedAt: "2026-05-11",
    tags: ["Hình học", "Diện tích", "Công thức"],
    description:
      "Xây dựng công thức tính diện tích hình chữ nhật qua bài toán thực tế (sân bóng, mảnh vườn) và luyện tập có hướng dẫn.",
    objectives: [
      "Nêu được công thức S = a × b.",
      "Áp dụng công thức vào bài toán có lời văn đơn giản.",
      "Giải thích được đơn vị đo diện tích (cm², m²).",
    ],
  },
  {
    id: "7",
    title: "Luyện tập: Thí nghiệm nhiệt độ nước",
    subject: "Khoa học tự nhiên",
    grade: "Lớp 8",
    phase: "practice",
    durationMin: 50,
    updatedAt: "2026-05-13",
    tags: ["Thí nghiệm", "Nhiệt độ", "Ghi chép"],
    description:
      "Học sinh đo nhiệt độ nước ở các trạng thái khác nhau, ghi chép số liệu và vẽ biểu đồ cột đơn giản.",
    objectives: [
      "Sử dụng đúng nhiệt kế và đọc được số đo.",
      "Hoàn thành phiếu ghi chép thí nghiệm đầy đủ.",
      "Rút ra nhận xét về mối liên hệ nhiệt độ – trạng thái.",
    ],
  },
  {
    id: "8",
    title: "Vận dụng: Dự án bảo vệ môi trường trường học",
    subject: "Khoa học tự nhiên",
    grade: "Lớp 9",
    phase: "application",
    durationMin: 55,
    updatedAt: "2026-05-16",
    tags: ["Dự án", "Môi trường", "Nhóm"],
    favorite: true,
    description:
      "Nhóm học sinh khảo sát rác thải tại trường, đề xuất giải pháp và trình bày poster hoặc slide ngắn.",
    objectives: [
      "Khảo sát và thống kê được tình hình rác tại một khu vực.",
      "Đề xuất ít nhất hai giải pháp khả thi.",
      "Trình bày dự án trước lớp trong 5 phút.",
    ],
  },
];

export function getLessonById(id: string): LessonPlan | undefined {
  return SAMPLE_LESSONS.find((lesson) => lesson.id === id);
}

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
