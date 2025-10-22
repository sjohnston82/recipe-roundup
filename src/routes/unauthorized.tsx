import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ShieldXIcon } from "lucide-react";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldXIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-dark mb-2">
            Access Denied
          </h1>
          <p className="text-muted-text">
            You need to be signed in to access this page.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/signin" className="block">
            <Button className="w-full bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 transition-opacity">
              Sign In
            </Button>
          </Link>

          <Link to="/signup" className="block">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>

          <Link to="/" className="block">
            <Button variant="ghost" className="w-full text-muted-text">
              Go Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
