import { createFileRoute } from "@tanstack/react-router";
import { JobHistoryPage } from "@/components/job-ui";

export const Route = createFileRoute("/app/history")({
  component: JobHistoryPage,
});