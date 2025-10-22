import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/recipe/$recipeId/cook")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/recipe/$recipeId/cook"!</div>;
}
