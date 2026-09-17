import { FormEvent } from "react";
import { Notice } from "./types";
import { Field, inputClass, Modal } from "./ui";

type Props = {
  mode: "login" | "register";
  notice: Notice;
  close: () => void;
  switchMode: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthModal({ mode, notice, close, switchMode, submit }: Props) {
  return (
    <Modal
      title={mode === "login" ? "Welcome back" : "Create your Eventify account"}
      close={close}
    >
      <p className="-mt-3 mb-6 text-sm leading-6 text-slate-500">
        {mode === "login"
          ? "Sign in to load data from your Eventify backend."
          : "Choose Organizer to manage events, or User to book tickets."}
      </p>
      {notice && (
        <div
          className={`mb-4 rounded-xl px-3 py-2 text-sm ${notice.kind === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {notice.text}
        </div>
      )}
      <form onSubmit={submit} className="grid gap-4">
        {mode === "register" && (
          <Field label="Your name">
            <input
              required
              name="name"
              className={inputClass}
              placeholder="Avery Johnson"
            />
          </Field>
        )}
        <Field label="Email address">
          <input
            required
            type="email"
            name="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            minLength={6}
            type="password"
            name="password"
            className={inputClass}
            placeholder="At least 6 characters"
          />
        </Field>
        {mode === "register" && (
          <Field label="Account type">
            <select name="role" defaultValue="ORGANIZER" className={inputClass}>
              <option value="ORGANIZER">Organizer — manage events</option>
              <option value="USER">Attendee — book tickets</option>
              <option value="ADMIN">Admin — manage venues</option>
            </select>
          </Field>
        )}
        <button className="mt-2 h-11 rounded-xl bg-slate-950 text-sm font-semibold text-white hover:bg-violet-700">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "login" ? "New to Eventify?" : "Already have an account?"}{" "}
        <button onClick={switchMode} className="font-semibold text-violet-700">
          {mode === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </Modal>
  );
}
