import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

export type Priority = "Urgent" | "Normal" | "Low";
export type Status = "Queued" | "Printing" | "Completed" | "Cancelled";

export interface Job {
  id: string;
  document: string;
  pages: number;
  priority: Priority;
  status: Status;
  submittedAt: number;
  sequenceNumber: number;
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
  Cancelled: "bg-destructive/10 text-destructive",
};

export function timeAgo(ts: number) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

// Raw shape of a row as it comes back from Supabase (snake_case columns).
interface JobRow {
  id: string;
  document: string;
  pages: number;
  priority: Priority;
  status: Status;
  sequence_number: number;
  created_at: string;
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    document: row.document,
    pages: row.pages,
    priority: row.priority,
    status: row.status,
    submittedAt: new Date(row.created_at).getTime(),
    sequenceNumber: row.sequence_number,
  };
}

interface JobsContextValue {
  jobs: Job[];
  queuedJobs: Job[];
  activeJob: Job | null;
  completedJobs: Job[];
  loading: boolean;
  addJob: (document: string, pages: number, priority: Priority) => Promise<void>;
  cancelJob: (id: string) => Promise<void>;
  processNext: () => Promise<void>;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("sequence_number", { ascending: true });

    if (error) {
      console.error("Failed to load jobs:", error.message);
      return;
    }
    setJobs((data ?? []).map(rowToJob));
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadJobs().finally(() => setLoading(false));
  }, [user]);

  // Priority queue ordering: Urgent before Normal before Low, and within
  // the same priority, whichever arrived first (lowest sequence_number).
  const queuedJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "Queued")
        .sort(
          (a, b) =>
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.sequenceNumber - b.sequenceNumber,
        ),
    [jobs],
  );

  const activeJob = jobs.find((j) => j.status === "Printing") ?? null;
  const completedJobs = jobs.filter((j) => j.status === "Completed");

  const value: JobsContextValue = {
    jobs,
    queuedJobs,
    activeJob,
    completedJobs,
    loading,

    addJob: async (document, pages, priority) => {
      if (!user) return;
      const { error } = await supabase
        .from("jobs")
        .insert({ document, pages, priority, user_id: user.id });
      if (error) {
        console.error("Failed to add job:", error.message);
        return;
      }
      await loadJobs();
    },

    // Lazy deletion: flip the status instead of removing the row, so the
    // job disappears from the live queue but stays around for history.
    cancelJob: async (id) => {
      const { error } = await supabase.from("jobs").update({ status: "Cancelled" }).eq("id", id);
      if (error) {
        console.error("Failed to cancel job:", error.message);
        return;
      }
      await loadJobs();
    },

    // Priority-queue "extract-min": take the queued job with the lowest
    // priority number, and among ties the lowest sequence_number.
      processNext: async () => {
        if (activeJob) return;
        const next = queuedJobs[0];
        if (!next) return;

      const { error: startError } = await supabase
        .from("jobs")
        .update({ status: "Printing" })
        .eq("id", next.id);
      if (startError) {
        console.error("Failed to start job:", startError.message);
        return;
      }
      await loadJobs();

      setTimeout(async () => {
        const { error: finishError } = await supabase
          .from("jobs")
          .update({ status: "Completed" })
          .eq("id", next.id);
        if (finishError) console.error("Failed to complete job:", finishError.message);
        await loadJobs();
      }, 4000);
    },
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}