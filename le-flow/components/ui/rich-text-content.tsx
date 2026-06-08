"use client";

type RichTextContentProps = {
  html: string;
  className?: string;
};

export function RichTextContent({ html, className = "" }: RichTextContentProps) {
  if (!html.trim()) return null;

  return (
    <div
      className={`rich-text-content leading-relaxed text-slate-800 [&_*]:text-[length:inherit] [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
