import { createFileRoute } from "@tanstack/react-router";
import { Clock, Play } from "lucide-react";
import { useJobs } from "@/lib/jobs-store";

export const Route = createFileRoute("/app/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { activeJob, queuedJobs, processNext } = useJobs();
  return (
    <section className="max-w-md rounded-xl border bg-card p-5 shadow-sm">
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
  );
}
