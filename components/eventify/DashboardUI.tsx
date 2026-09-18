import { Notice } from "./types";

export function NoticeBanner({
  notice,
  dismiss,
}: {
  notice: Notice;
  dismiss: () => void;
}) {
  return notice ? (
    <div
      className={`mt-6 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${notice.kind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
    >
      <span>{notice.text}</span>
      <button onClick={dismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  ) : null;
}

export function Loading() {
  return (
    <div className="grid min-h-[28rem] place-items-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        Refreshing your workspace…
      </div>
    </div>
  );
}