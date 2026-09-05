import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Priority = "Urgent" | "Normal" | "Low";
export type Status = "Queued" | "Printing" | "Completed";

export interface Job {
  id: number;
  document: string;
  pages: number;
  priority: Priority;
  status: Status;
  submittedAt: number;
}

export const PRIORITY_RANK: Record<Priority, number> = { Urgent: 0, Normal: 1, Low: 2 };

export const PRIORITY_STYLES: Record<Priority, string> = {
  Urgent: "bg-urgent text-urgent-foreground",
  Normal: "bg-normal text-normal-foreground",
  Low: "bg-low text-low-foreground",
};

export const STATUS_STYLES: Record<Status, string> = {
  Queued: "bg-secondary text-secondary-foreground",
  Printing: "bg-primary/10 text-primary",
  Completed: "bg-success text-success-foreground",
};

const SAMPLE_JOBS: Job[] = [
  { id: 1, document: "Q3 Financial Report.pdf", pages: 42, priority: "Urgent", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 18 },
  { id: 2, document: "Onboarding Handbook.docx", pages: 15, priority: "Normal", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 12 },
  { id: 3, document: "Meeting Agenda — Sept 5.pdf", pages: 2, priority: "Urgent", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 7 },
  { id: 4, document: "Old Archive Backup Scan.pdf", pages: 120, priority: "Low", status: "Queued", submittedAt: Date.now() - 1000 * 60 * 5 },
  { id: 5, document: "Expense Claim Form.pdf", pages: 3, priority: "Normal", status: "Completed", submittedAt: Date.now() - 1000 * 60 * 40 },
];

export function timeAgo(ts: number) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

interface JobsContextValue {
  jobs: Job[];
  queuedJobs: Job[];
  activeJob: Job | null;
  completedJobs: Job[];
  addJob: (document: string, pages: number, priority: Priority) => void;
  cancelJob: (id: number) => void;
  processNext: () => void;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [nextId, setNextId] = useState(6);
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

  const value: JobsContextValue = {
    jobs,
    queuedJobs,
    activeJob,
    completedJobs,
    addJob: (document, pages, priority) => {
      setJobs((prev) => [
        ...prev,
        { id: nextId, document, pages, priority, status: "Queued", submittedAt: Date.now() },
      ]);
      setNextId((n) => n + 1);
    },
    cancelJob: (id) => setJobs((prev) => prev.filter((j) => j.id !== id)),
    processNext: () => {
      const next = queuedJobs[0];
      if (activeJob || !next) return;
      setJobs((prev) => prev.map((j) => (j.id === next.id ? { ...j, status: "Printing" as Status } : j)));
      setPrintingJobId(next.id);
    },
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
