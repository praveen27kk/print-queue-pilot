import { createFileRoute } from "@tanstack/react-router";
import { MyJobsPage } from "@/components/job-ui";

export const Route = createFileRoute("/app/my-jobs")({
  component: MyJobsPage,
});