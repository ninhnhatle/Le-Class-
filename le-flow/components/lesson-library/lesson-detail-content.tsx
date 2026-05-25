import Link from "next/link";
import { PHASE_LABELS, type LessonPlan } from "@/lib/lesson-library/constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type LessonDetailContentProps = {
  lesson: LessonPlan;
};

export function LessonDetailContent({ lesson }: LessonDetailContentProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/thu-vien-bai-day"
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Quay lại thư viện
      </Link>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            {PHASE_LABELS[lesson.phase]}
          </span>
          {lesson.favorite ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100">
              <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Yêu thích
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">{lesson.title}</h2>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Môn học</dt>
            <dd className="mt-0.5 text-slate-900">{lesson.subject}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Lớp</dt>
            <dd className="mt-0.5 text-slate-900">{lesson.grade}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Thời lượng</dt>
            <dd className="mt-0.5 text-slate-900">{lesson.durationMin} phút</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Cập nhật</dt>
            <dd className="mt-0.5 text-slate-900">{formatDate(lesson.updatedAt)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-8 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mô tả</h3>
          <p className="mt-3 text-slate-700 leading-relaxed">{lesson.description}</p>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mục tiêu học tập</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 leading-relaxed">
            {lesson.objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </article>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Nhân bản bài dạy
        </button>
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Chỉnh sửa bài dạy
        </button>
      </div>
    </div>
  );
}
