import { AppShell } from "@/components/layout/app-shell";
import { LessonLibraryContent } from "@/components/lesson-library/lesson-library-content";

export const metadata = {
  title: "Thư viện bài dạy · LeStudy",
  description: "Quản lý, tìm kiếm và tái sử dụng bài dạy theo mô hình 4 bước.",
};

export default function LessonLibraryPage() {
  return (
    <AppShell
      eyebrow="LeStudy · Thư viện"
      title="Thư viện bài dạy"
      headerAside={
        <p className="max-w-sm text-sm text-slate-500">
          Lưu trữ và tìm nhanh giáo án theo giai đoạn Khởi động — Hình thành kiến thức — Luyện tập — Vận dụng.
        </p>
      }
    >
      <LessonLibraryContent />
    </AppShell>
  );
}
