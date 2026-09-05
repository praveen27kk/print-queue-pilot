import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Printer,
  History,
  Bell,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { JobsProvider } from "@/lib/jobs-store";
import { SearchProvider, useSearch } from "@/lib/search-context";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — Print Job Scheduler" },
      { name: "description", content: "Manage office print jobs, priorities and printer control." },
      { property: "og:title", content: "Dashboard — Print Job Scheduler" },
      { property: "og:description", content: "Manage office print jobs, priorities and printer control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/submit", label: "Submit Job", icon: FilePlus2 },
  { to: "/app/my-jobs", label: "My Jobs", icon: ListChecks },
  { to: "/app/admin", label: "Admin – Printer Control", icon: Printer },
  { to: "/app/history", label: "Job History", icon: History },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Profile & Settings", icon: Settings },
] as const;

function TopBar() {
  const { search, setSearch } = useSearch();
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <kbd className="ml-auto hidden items-center gap-1 rounded border bg-secondary px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    <JobsProvider>
      <SearchProvider>
        <div className="flex min-h-screen w-full bg-background">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
                PJS
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Print Job Scheduler</p>
                <p className="text-xs text-sidebar-muted">Print queue management</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/app" }}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 p-3">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
              >
                <LogOut className="size-4" />
                Sign out
              </Link>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="flex-1 px-6 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SearchProvider>
    </JobsProvider>
  );
}
