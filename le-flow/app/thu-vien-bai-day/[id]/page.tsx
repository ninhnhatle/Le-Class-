import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LessonDetailContent } from "@/components/lesson-library/lesson-detail-content";
import { getLessonById, SAMPLE_LESSONS } from "@/lib/lesson-library/constants";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SAMPLE_LESSONS.map((lesson) => ({ id: lesson.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) return { title: "Bài dạy không tồn tại · LeStudy" };
  return {
    title: `${lesson.title} · LeStudy`,
    description: lesson.description,
  };
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  return (
    <AppShell eyebrow="LeStudy · Thư viện bài dạy" title="Chi tiết bài dạy">
      <LessonDetailContent lesson={lesson} />
    </AppShell>
  );
}
