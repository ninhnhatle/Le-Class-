import { AppShell } from "@/components/layout/app-shell";
import { HomeDashboard } from "@/components/home/home-dashboard";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="LeStudy · Bảng điều khiển"
      title="Dạy học sáng tạo"
      headerAside={
        <p className="text-sm text-slate-500">Xin chào, cô Nhật Lệ — chúc cô một tiết dạy trọn vẹn.</p>
      }
    >
      <HomeDashboard />
    </AppShell>
  );
}
