import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { SubmitJobForm } from "@/components/job-ui";

export const Route = createFileRoute("/app/submit")({
  component: SubmitPage,
});

function SubmitPage() {
  return (
    <section className="max-w-md rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FileText className="size-4 text-muted-foreground" />
        Submit a print job
      </h2>
      <SubmitJobForm />
    </section>
  );
}
