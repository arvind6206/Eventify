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
          <span className="inline-flex rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 px-4 py-2 text-xs font-bold text-violet-700 ring-1 ring-violet-200 shadow-sm">
            ✨ EVENT OPERATIONS, MADE BEAUTIFUL
          </span>
          <h1 className="mt-8 text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Every great event starts with a 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600"> clear view.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Plan events, manage tickets, and keep an eye on every booking from
            one calm, connected workspace.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => openAuth("register")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-200 transition-all hover:scale-105"
            >
              Create your workspace →
            </button>
            <button
              onClick={() => openAuth("login")}
              className="px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:border-violet-300 hover:text-violet-700 transition-all"
            >
              I already have an account
            </button>
          </div>
        </div>
        <PreviewCard />
      </section>

      {/* Features Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 bg-gradient-to-b from-white to-violet-50/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to manage events
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From venue management to ticket sales, Eventify handles it all with elegance and efficiency.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🏟️",
              title: "Venue Management",
              description: "Create and manage venues with detailed seat layouts and capacity tracking.",
              gradient: "from-orange-100 to-amber-100"
            },
            {
              icon: "🎪",
              title: "Event Creation",
              description: "Set up events with multiple ticket types, pricing tiers, and scheduling.",
              gradient: "from-violet-100 to-purple-100"
            },
            {
              icon: "🎫",
              title: "Ticket Management",
              description: "Generate unique QR codes for tickets with real-time validation and tracking.",
              gradient: "from-emerald-100 to-teal-100"
            },
            {
              icon: "📋",
              title: "Booking System",
              description: "Streamlined booking flow with payment integration and reservation management.",
              gradient: "from-blue-100 to-cyan-100"
            },
            {
              icon: "📊",
              title: "Real-time Analytics",
              description: "Track bookings, revenue, and attendance with live dashboards and reports.",
              gradient: "from-pink-100 to-rose-100"
            },
            {
              icon: "👥",
              title: "Multi-role Access",
              description: "Organizers, admins, and attendees with role-based permissions and workflows.",
              gradient: "from-indigo-100 to-violet-100"
            }
          ].map((feature) => (
            <div key={feature.title} className={`rounded-2xl border border-slate-100 bg-gradient-to-br ${feature.gradient} p-8 hover:shadow-xl hover:scale-105 transition-all duration-300`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm text-3xl">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-slate-600 leading-relaxed">{feature.description}</p>
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
      <section className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white shadow-2xl">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            {[
              { value: "10K+", label: "Events Managed", icon: "🎪" },
              { value: "500K+", label: "Tickets Sold", icon: "🎫" },
              { value: "98%", label: "Uptime", icon: "⚡" },
              { value: "24/7", label: "Support", icon: "💬" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-400 font-medium">{stat.label}</div>
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