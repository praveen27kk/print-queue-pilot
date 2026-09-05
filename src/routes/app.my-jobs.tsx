import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/job-ui";

export const Route = createFileRoute("/app/my-jobs")({
  component: () => <PlaceholderPage title="My Jobs" />,
});
