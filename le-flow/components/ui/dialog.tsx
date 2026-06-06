"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useId } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Portal target — use fullscreen container so dialog appears above fullscreen content. */
  portalContainer?: HTMLElement | null;
  /** Prevent closing when clicking the overlay. */
  preventOutsideClose?: boolean;
  size?: "md" | "lg" | "xl" | "2xl";
};

const SIZE_CLASS: Record<NonNullable<DialogProps["size"]>, string> = {
  md: "max-w-md max-h-[min(90vh,720px)]",
  lg: "max-w-3xl max-h-[min(92vh,860px)]",
  xl: "max-w-5xl max-h-[min(95vh,960px)]",
  "2xl": "h-[min(98vh,1080px)] max-h-[min(98vh,1080px)] w-[calc(100%-1rem)] max-w-7xl",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  portalContainer,
  preventOutsideClose = false,
  size = "md",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal container={portalContainer ?? undefined}>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[2147483646] bg-slate-900/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          onPointerDownOutside={(event) => {
            if (preventOutsideClose) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (preventOutsideClose) event.preventDefault();
          }}
          className={`fixed left-1/2 top-1/2 z-[2147483647] flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 outline-none focus:outline-none ${SIZE_CLASS[size]}`}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="min-w-0 pr-2">
              <DialogPrimitive.Title id={titleId} className="text-lg font-semibold text-slate-900">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description id={descriptionId} className="mt-1 text-sm text-slate-500">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              type="button"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Đóng"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>

          {footer ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
