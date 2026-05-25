"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GRADE_FILTERS,
  PHASE_LABELS,
  RECOMMENDED_FEATURES,
  SAMPLE_LESSONS,
  SUBJECT_FILTERS,
  type LessonPhase,
} from "@/lib/lesson-library/constants";

const ALL_PHASES = "all" as const;
type PhaseFilter = LessonPhase | typeof ALL_PHASES;

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    ),
    star: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    ),
    copy: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    ),
    share: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    ),
  };
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      {icons[name] ?? icons.search}
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LessonLibraryContent() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<(typeof SUBJECT_FILTERS)[number]>("Tất cả");
  const [grade, setGrade] = useState<(typeof GRADE_FILTERS)[number]>("Tất cả");
  const [phase, setPhase] = useState<PhaseFilter>(ALL_PHASES);
  const [sort, setSort] = useState<"recent" | "title">("recent");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SAMPLE_LESSONS.filter((lesson) => {
      if (subject !== "Tất cả" && lesson.subject !== subject) return false;
      if (grade !== "Tất cả" && lesson.grade !== grade) return false;
      if (phase !== ALL_PHASES && lesson.phase !== phase) return false;
      if (favoritesOnly && !lesson.favorite) return false;
      if (!q) return true;
      const haystack = [lesson.title, lesson.subject, lesson.grade, ...lesson.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "vi");
      return b.updatedAt.localeCompare(a.updatedAt);
    });
    return list;
  }, [query, subject, grade, phase, sort, favoritesOnly]);

  const favorites = SAMPLE_LESSONS.filter((l) => l.favorite);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {filtered.length} bài dạy · {SAMPLE_LESSONS.length} mẫu trong thư viện
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tạo bài dạy mới
        </button>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-indigo-50/50 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-sky-900">Gợi ý cho bạn</h2>
        <p className="mt-1 text-sm text-sky-900/70">Bài dạy đã đánh dấu yêu thích hoặc dùng gần đây.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {favorites.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/thu-vien-bai-day/${lesson.id}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-sky-100 transition hover:bg-white hover:ring-sky-200"
            >
              <svg className="size-3.5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span className="truncate">{lesson.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="sr-only">Tìm bài dạy</span>
            <span className="relative flex">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên bài, thẻ, môn học..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              />
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Giai đoạn:</span>
            <button
              type="button"
              onClick={() => setPhase(ALL_PHASES)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                phase === ALL_PHASES ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả
            </button>
            {(Object.keys(PHASE_LABELS) as LessonPhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  phase === p ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {PHASE_LABELS[p]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as (typeof SUBJECT_FILTERS)[number])}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Lọc theo môn"
            >
              {SUBJECT_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "Tất cả" ? "Môn: Tất cả" : s}
                </option>
              ))}
            </select>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as (typeof GRADE_FILTERS)[number])}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Lọc theo lớp"
            >
              {GRADE_FILTERS.map((g) => (
                <option key={g} value={g}>
                  {g === "Tất cả" ? "Lớp: Tất cả" : g}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "title")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              aria-label="Sắp xếp"
            >
              <option value="recent">Mới nhất</option>
              <option value="title">Tên A–Z</option>
            </select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
                className="size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
              />
              Yêu thích
            </label>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">Không tìm thấy bài dạy phù hợp</p>
          <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/thu-vien-bai-day/${lesson.id}`}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {PHASE_LABELS[lesson.phase]}
                  </span>
                  {lesson.favorite ? (
                    <svg className="size-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24" aria-label="Yêu thích">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ) : null}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 group-hover:text-sky-800">
                  {lesson.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {lesson.subject} · {lesson.grade} · {lesson.durationMin} phút
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{lesson.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {lesson.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">Cập nhật {formatDate(lesson.updatedAt)}</span>
                  <span className="text-xs font-medium text-sky-700 group-hover:text-sky-900">Xem chi tiết →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Tính năng đề xuất</h2>
        <p className="mt-1 text-sm text-slate-500">Hướng phát triển tiếp theo cho thư viện bài dạy.</p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {RECOMMENDED_FEATURES.map((feature) => (
            <li key={feature.title} className="flex gap-3 rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm ring-1 ring-slate-100">
                <FeatureIcon name={feature.icon} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
