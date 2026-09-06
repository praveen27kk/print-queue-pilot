import { X } from "lucide-react";
import {
  PRIORITY_STYLES,
  STATUS_STYLES,
  timeAgo,
  useJobs,
  type Job,
  type Priority,
  type Status,
} from "@/lib/jobs-store";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge-base ${PRIORITY_STYLES[priority]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge-base ${STATUS_STYLES[status]}`}>
      {status === "Printing" && <span className="size-1.5 rounded-full bg-current animate-pulse-dot" />}
      {status}
    </span>
  );
}

export function SubmitJobForm() {
  const { addJob } = useJobs();
  const [document, setDocument] = useState("");
  const [pages, setPages] = useState("");
  const [priority, setPriority] = useState<Priority>("Normal");

  const submitJob = (e: React.FormEvent) => {
    e.preventDefault();
    const pageCount = parseInt(pages, 10);
    if (!document.trim() || !pageCount || pageCount < 1) return;
    addJob(document.trim(), pageCount, priority);
    setDocument("");
    setPages("");
    setPriority("Normal");
  };

  return (
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
  );
}

export function QueueTable({ search = "" }: { search?: string }) {
  const { jobs, queuedJobs, activeJob, completedJobs, cancelJob } = useJobs();
  const term = search.trim().toLowerCase();
  const rows = [...queuedJobs, ...(activeJob ? [activeJob] : []), ...completedJobs.slice().reverse()].filter(
    (j) => !term || j.document.toLowerCase().includes(term),
  );

  return (
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
            {rows.map((job, i) => (
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  {jobs.length === 0 ? "No jobs yet — submit one to get started." : "No jobs match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
function JobsListTable({
  jobs,
  emptyMessage,
  showCancel = false,
}: {
  jobs: Job[];
  emptyMessage: string;
  showCancel?: boolean;
}) {
  const { cancelJob } = useJobs();

  return (
    <section className="rounded-xl border bg-card shadow-sm">
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
              {showCancel && <th className="px-5 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr key={job.id} className="border-b last:border-0 hover:bg-secondary/50">
                <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-3 font-medium">{job.document}</td>
                <td className="px-5 py-3 tabular-nums text-muted-foreground">{job.pages}</td>
                <td className="px-5 py-3"><PriorityBadge priority={job.priority} /></td>
                <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                <td className="px-5 py-3 text-muted-foreground">{timeAgo(job.submittedAt)}</td>
                {showCancel && (
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
                )}
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={showCancel ? 7 : 6} className="px-5 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function MyJobsPage() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const myJobs = jobs
    .filter((j) => j.userId === user?.id)
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">My Jobs</h1>
        <p className="text-sm text-muted-foreground">Every job you've submitted, across all statuses.</p>
      </div>
      <JobsListTable jobs={myJobs} emptyMessage="You haven't submitted any jobs yet." showCancel />
    </div>
  );
}

export function JobHistoryPage() {
  const { jobs } = useJobs();
  const history = jobs
    .filter((j) => j.status === "Completed" || j.status === "Cancelled")
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Job History</h1>
        <p className="text-sm text-muted-foreground">Completed and cancelled jobs across the whole queue.</p>
      </div>
      <JobsListTable jobs={history} emptyMessage="No completed or cancelled jobs yet." />
    </div>
  );
}