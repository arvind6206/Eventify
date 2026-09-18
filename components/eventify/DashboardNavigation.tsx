import { WorkspaceView, UserRole } from "./types";
import { Brand } from "./ui";

export const getNavItems = (role: UserRole): { id: WorkspaceView; label: string; icon: string }[] => {
  const allNav = [
    { id: "overview" as WorkspaceView, label: "Overview", icon: "◈" },
    { id: "events" as WorkspaceView, label: "Events", icon: "✦" },
    { id: "venues" as WorkspaceView, label: "Venues", icon: "⌂" },
    { id: "bookings" as WorkspaceView, label: "Bookings", icon: "▣" },
    { id: "tickets" as WorkspaceView, label: "Tickets", icon: "◉" },
  ];

  // All roles can see overview, events, bookings, tickets
  // Only ADMIN can see venues
  if (role === "ADMIN") {
    return allNav;
  }
  
  // USER and ORGANIZER cannot see venues
  return allNav.filter(item => item.id !== "venues");
};

export function Sidebar({
  view,
  setView,
  logout,
  userRole,
}: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  logout: () => void;
  userRole: UserRole;
}) {
  const nav = getNavItems(userRole);
  
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
      <Brand />
      <div className="mt-10 grid gap-1">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${view === item.id ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-sm font-semibold">You're connected as {userRole}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          All information in this workspace comes from your Eventify API.
        </p>
        <button
          onClick={logout}
          className="mt-4 text-xs font-semibold text-violet-300 hover:text-white"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}

export function WorkspaceHeader({
  view,
  setView,
  refresh,
  userRole,
}: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  refresh: () => Promise<void>;
  userRole: UserRole;
}) {
  const nav = getNavItems(userRole);
  
  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm text-slate-500">Eventify workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {nav.find((item) => item.id === view)?.label}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void refresh()}
            className="hidden h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:text-violet-700 sm:block"
          >
            ↻ Refresh
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
            EV
          </div>
        </div>
      </header>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium ${view === item.id ? "bg-violet-100 text-violet-700" : "bg-white text-slate-500"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}