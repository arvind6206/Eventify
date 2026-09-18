import { WorkspaceView, UserRole } from "./types";
import { Brand } from "./ui";

export const getNavItems = (role: UserRole): { id: WorkspaceView; label: string; icon: string }[] => {
  const allNav = [
    { id: "overview" as WorkspaceView, label: "Overview", icon: "📊" },
    { id: "events" as WorkspaceView, label: "Events", icon: "🎪" },
    { id: "venues" as WorkspaceView, label: "Venues", icon: "🏟️" },
    { id: "bookings" as WorkspaceView, label: "Bookings", icon: "📋" },
    { id: "tickets" as WorkspaceView, label: "Tickets", icon: "🎫" },
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
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-100 bg-gradient-to-b from-white to-slate-50 px-6 py-8 lg:flex">
      <div className="mb-8">
        <Brand />
      </div>
      
      <nav className="flex-1">
        <div className="space-y-2">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                view === item.id 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/20 text-violet-300">
            👤
          </div>
          <div>
            <p className="text-sm font-semibold">Connected as</p>
            <p className="text-xs text-slate-400 mt-0.5">{userRole}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-all"
        >
          Sign out
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
          <p className="text-sm font-medium text-slate-500">Eventify workspace</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {nav.find((item) => item.id === view)?.label}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => void refresh()}
            className="hidden h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:text-violet-700 hover:border-violet-300 transition-all sm:flex items-center gap-2"
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-violet-200">
            EV
          </div>
        </div>
      </header>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              view === item.id 
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md" 
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}