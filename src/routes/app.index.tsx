import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { QueueTable, SubmitJobForm } from "@/components/job-ui";
import { useSearch } from "@/lib/search-context";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { search } = useSearch();
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section className="h-fit rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4 text-muted-foreground" />
          Submit a print job
        </h2>
        <SubmitJobForm />
      </section>
      <QueueTable search={search} />
    </div>
  );
}
