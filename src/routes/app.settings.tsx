import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/job-ui";

export const Route = createFileRoute("/app/settings")({
  component: () => <PlaceholderPage title="Profile & Settings" />,
});
