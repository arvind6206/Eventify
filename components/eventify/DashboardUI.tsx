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
      className={`mt-6 flex items-center justify-between rounded-2xl border px-6 py-4 text-sm shadow-lg ${
        notice.kind === "success" 
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800" 
          : "border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 text-rose-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{notice.kind === "success" ? "✓" : "✕"}</span>
        <span className="font-medium">{notice.text}</span>
      </div>
      <button 
        onClick={dismiss} 
        aria-label="Dismiss notification"
        className="text-xl hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  ) : null;
}

export function Loading() {
  return (
    <div className="grid min-h-[28rem] place-items-center">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-violet-200 border-t-violet-600"></span>
        <span className="text-sm font-medium">Refreshing your workspace…</span>
      </div>
    </div>
  );
}