import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Printer, X, Play, Clock, FileText } from "lucide-react";

type Priority = "Urgent" | "Normal" | "Low";
type Status = "Queued" | "Printing" | "Completed";

interface Job {
  id: number;
  document: string;
  pages: number;
  priority: Priority;
  status: Status;
  submittedAt: number;
}

const PRIORITY_RANK: Record<Priority, number> = { Urgent: 0, Normal: 1, Low: 2 };

const SAMPLE_JOBS: Job[] = [
  { id: 1, document: "Q3 Financial Report.pdf", pages: 42, priority: "Urgent", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 18 },
  { id: 2, document: "Onboarding Handbook.docx", pages: 15, priority: "Normal", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 12 },
  { id: 3, document: "Meeting Agenda — Sept 5.pdf", pages: 2, priority: "Urgent", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 7 },
  { id: 4, document: "Old Archive Backup Scan.pdf", pages: 120, priority: "Low", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 5 },
  { id: 5, document: "Expense Claim Form.pdf", pages: 3, priority: "Normal", status: "Completed", submittedAt: Date.now() - 1000 * 60 * 40 },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  Urgent: "bg-urgent text-urgent-foreground",
  Normal: "bg-normal text-normal-foreground",
  Low: "bg-low text-low-foreground",
};

const STATUS_STYLES: Record<Status, string> = {
  Queued: "bg-secondary text-secondary-foreground",
  Printing: "bg-primary/10 text-primary",
  Completed: "bg-success text-success-foreground",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Print Job Scheduler — Office Print Queue" },
      { name: "description", content: "Submit, prioritize, and track office print jobs in a live queue." },
      { property: "og:title", content: "Print Job Scheduler — Office Print Queue" },
      { property: "og:description", content: "Submit, prioritize, and track office print jobs in a live queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintScheduler,
});

function timeAgo(ts: number) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge-base ${PRIORITY_STYLES[priority]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge-base ${STATUS_STYLES[status]}`}>
      {status === "Printing" && <span className="size-1.5 rounded-full bg-current animate-pulse-dot" />}
      {status}
    </span>
  );
}

function PrintScheduler() {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [nextId, setNextId] = useState(6);
  const [document, setDocument] = useState("");
  const [pages, setPages] = useState("");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [printingJobId, setPrintingJobId] = useState<number | null>(null);

  // Simulate the printer: Printing -> Completed after 4 seconds.
  useEffect(() => {
    if (printingJobId === null) return;
    const timer = setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === printingJobId ? { ...j, status: "Completed" as Status } : j)),
      );
      setPrintingJobId(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [printingJobId]);

  const queuedJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "Queued")
        .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.submittedAt - b.submittedAt),
    [jobs],
  );

  const activeJob = jobs.find((j) => j.status === "Printing") ?? null;
  const completedJobs = jobs.filter((j) => j.status === "Completed");

  const submitJob = (e: React.FormEvent) => {
    e.preventDefault();
    const pageCount = parseInt(pages, 10);
    if (!document.trim() || !pageCount || pageCount < 1) return;
    setJobs((prev) => [
      ...prev,
      { id: nextId, document: document.trim(), pages: pageCount, priority, status: "Queued", submittedAt: Date.now() },
    ]);
    setNextId((n) => n + 1);
    setDocument("");
    setPages("");
    setPriority("Normal");
  };

  const cancelJob = (id: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const processNext = () => {
    const next = queuedJobs[0];
    if (activeJob || !next) return;
    setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, status: "Printing" as Status } : j)));
    setPrintingJobId(next.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Printer className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Print Job Scheduler</h1>
            <p className="text-sm text-muted-foreground">Office print queue management</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          {/* Submit form */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4 text-muted-foreground" />
              Submit a print job
            </h2>
            <form onSubmit={submitJob} className="mt-4 space-y-4">
              <div>
                <label htmlFor="doc" className="mb-1.5 block text-sm font-medium">Document name</label>
                <input
                  id="doc"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="e.g. Quarterly Report.pdf"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label htmlFor="pages" className="mb-1.5 block text-sm font-medium">Number of pages</label>
                <input
                  id="pages"
                  type="number"
                  min={1}
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium">Priority</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["Urgent", "Normal", "Low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        priority === p
                          ? `${PRIORITY_STYLES[p]} border-transparent`
                          : "bg-background text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add to queue
              </button>
            </form>
          </section>

          {/* Admin panel */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Admin — Printer control</h2>
            <div className="mt-3 rounded-lg bg-secondary p-3 text-sm">
              {activeJob ? (
                <p className="flex items-center gap-2 text-foreground">
                  <span className="size-2 rounded-full bg-primary animate-pulse-dot" />
                  Printing <span className="font-medium">{activeJob.document}</span>…
                </p>
              ) : (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  Printer is idle
                </p>
              )}
            </div>
            <button
              onClick={processNext}
              disabled={!!activeJob || queuedJobs.length === 0}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="size-4" />
              Process Next Job
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Takes the highest-priority, oldest queued job and prints it.
            </p>
          </section>
        </div>

        {/* Queue */}
        <section className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Live queue</h2>
            <span className="badge-base bg-secondary text-secondary-foreground">
              {queuedJobs.length} pending · {completedJobs.length} completed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Document</th>
                  <th className="px-5 py-3 font-medium">Pages</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {[...queuedJobs, ...(activeJob ? [activeJob] : []), ...completedJobs.slice().reverse()].map((job, i) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-secondary/50">
                    <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3 font-medium">{job.document}</td>
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{job.pages}</td>
                    <td className="px-5 py-3"><PriorityBadge priority={job.priority} /></td>
                    <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{timeAgo(job.submittedAt)}</td>
                    <td className="px-5 py-3 text-right">
                      {job.status === "Queued" && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          aria-label={`Cancel ${job.document}`}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground hover:border-transparent"
                        >
                          <X className="size-3.5" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                      No jobs yet — submit one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
