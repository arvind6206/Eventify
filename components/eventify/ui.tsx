import { ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
export const primaryButton =
  "inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200";

export function formatDate(value?: string) {
  if (!value) return "Date to be announced";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function formatMoney(value: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-lg shadow-violet-200">
        E
      </span>
      <span className="text-lg font-bold tracking-[-.04em] text-slate-950">
        eventify
      </span>
    </div>
  );
}

export function Status({ value }: { value: string }) {
  const tones: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    ACTIVE: "bg-sky-50 text-sky-700",
    DRAFT: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-rose-50 text-rose-700",
    USED: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[value] ?? "bg-slate-100 text-slate-600"}`}
    >
      {value.toLowerCase()}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {title}
          </h2>
          <button
            onClick={close}
            aria-label="Close dialog"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">
        ✦
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
