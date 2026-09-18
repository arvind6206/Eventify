import { FormEvent } from "react";
import { Notice } from "./types";
import { Brand, primaryButton } from "./ui";
import { AuthModal } from "./AuthModal";

interface LandingPageProps {
  openAuth: (mode: "login" | "register" | null) => void;
  authMode: "login" | "register" | null;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  notice: Notice;
}

export function LandingPage({
  openAuth,
  authMode,
  close,
  submit,
  notice,
}: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#f8f7ff] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top_right,_#d9ccff_0%,_transparent_52%),radial-gradient(ellipse_at_top_left,_#bfe6ff_0%,_transparent_42%)]" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Brand />
        <button
          onClick={() => openAuth("login")}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5"
        >
          Sign in
        </button>
      </nav>
      
      {/* Hero Section */}
      <section className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.12fr_.88fr] lg:px-10 lg:pt-24">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
            EVENT OPERATIONS, MADE BEAUTIFUL
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.03] tracking-[-.055em] text-slate-950 sm:text-6xl">
            Every great event starts with a clear view.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Plan events, manage tickets, and keep an eye on every booking from
            one calm, connected workspace.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={() => openAuth("register")}
              className={primaryButton}
            >
              Create your workspace&nbsp; →
            </button>
            <button
              onClick={() => openAuth("login")}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              I already have an account
            </button>
          </div>
        </div>
        <PreviewCard />
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need to manage events
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From venue management to ticket sales, Eventify handles it all.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "⌂",
              title: "Venue Management",
              description: "Create and manage venues with detailed seat layouts and capacity tracking."
            },
            {
              icon: "✦",
              title: "Event Creation",
              description: "Set up events with multiple ticket types, pricing tiers, and scheduling."
            },
            {
              icon: "◉",
              title: "Ticket Management",
              description: "Generate unique QR codes for tickets with real-time validation and tracking."
            },
            {
              icon: "▣",
              title: "Booking System",
              description: "Streamlined booking flow with payment integration and reservation management."
            },
            {
              icon: "◷",
              title: "Real-time Analytics",
              description: "Track bookings, revenue, and attendance with live dashboards and reports."
            },
            {
              icon: "⚡",
              title: "Multi-role Access",
              description: "Organizers, admins, and attendees with role-based permissions and workflows."
            }
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-2xl text-violet-700">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            How Eventify works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Get started in minutes with our simple workflow
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create your account",
              description: "Sign up as an organizer, admin, or attendee to get started with your workspace."
            },
            {
              step: "02",
              title: "Set up your venue",
              description: "Add venues and configure seat layouts for different event types and capacities."
            },
            {
              step: "03",
              title: "Launch your event",
              description: "Create events, set ticket prices, and start selling to your audience."
            }
          ].map((step) => (
            <div key={step.step} className="relative">
              <div className="text-6xl font-bold text-violet-200/50">{step.step}</div>
              <div className="absolute top-8 left-0 right-0">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-3xl bg-slate-950 p-12 text-white">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: "10K+", label: "Events Managed" },
              { value: "500K+", label: "Tickets Sold" },
              { value: "98%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Ready to transform your event management?
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Join thousands of organizers who trust Eventify to manage their events seamlessly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => openAuth("register")}
            className={primaryButton}
          >
            Get started for free
          </button>
          <button
            onClick={() => openAuth("login")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in to existing account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mx-auto max-w-7xl px-6 py-12 lg:px-10 border-t border-slate-200">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Brand />
            <p className="mt-4 text-sm text-slate-600">
              Event operations, beautifully organized.
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
              <li>API</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-600">
          © 2024 Eventify. All rights reserved.
        </div>
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          close={close}
          switchMode={() =>
            openAuth(authMode === "login" ? "register" : "login")
          }
          submit={submit}
          notice={notice}
        />
      )}
    </main>
  );
}

function PreviewCard() {
  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_-28px_rgba(62,34,124,.35)] backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">
            Your next event
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            A workspace that stays in sync
          </h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-xl">
          ✦
        </span>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex justify-between text-xs text-slate-400">
          <span>EVENTIFY PULSE</span>
          <span>LIVE</span>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            ["24", "Bookings"],
            ["6", "Events"],
            ["98%", "Check-in"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}