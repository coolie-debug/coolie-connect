import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/coolie")({
  component: () => <Navigate to="/coolie" />,
});
