import * as React from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  Outlet,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/shopping-lists")({
  component: ShoppingListsPage,
});

function useShoppingLists() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<null | {
    message: string;
    status?: number;
  }>(null);
  const reload = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/shopping-lists", {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError({ message: "Failed to load lists", status: res.status });
        setData(null);
      } else {
        setData(json);
      }
    } catch (e) {
      setError({ message: "Network error" });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    void reload();
  }, [reload]);
  const optimisticAdd = (list: any) => {
    setData((prev: any) => {
      const lists = prev?.lists ? [...prev.lists] : [];
      return { success: true, lists: [list, ...lists] };
    });
  };

  const optimisticRemove = (listId: string) => {
    setData((prev: any) => {
      const lists = prev?.lists
        ? prev.lists.filter((l: any) => l.id !== listId)
        : [];
      return { success: true, lists };
    });
  };

  return { data, loading, error, reload, optimisticAdd, optimisticRemove };
}

export default function ShoppingListsPage() {
  const { data, loading, error, reload, optimisticAdd, optimisticRemove } =
    useShoppingLists();
  const [name, setName] = React.useState("");
  const navigate = useNavigate();
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const createList = async () => {
    if (!name.trim()) return;
    try {
      setCreating(true);
      setCreateError(null);
      const res = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        // optimistic: show in list immediately if user stays
        optimisticAdd({
          id: json.list.id,
          name: json.list.name,
          createdAt: json.list.createdAt,
          updatedAt: json.list.updatedAt,
          _count: { items: 0 },
        });
        navigate({
          to: "/shopping-lists/$listId",
          params: { listId: json.list.id },
        });
      } else if (res.status === 401) {
        navigate({ to: "/signin" });
      } else {
        setCreateError(
          `Failed to create list${res.status ? ` (status ${res.status})` : ""}`
        );
        console.error("Create list failed", res.status, json);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteList = async (listId: string) => {
    // optimistic remove
    optimisticRemove(listId);
    const res = await fetch(`/api/shopping-list/${listId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) await reload();
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gradient-dark mb-2">
          Shopping Lists
        </h1>
        <p className="text-muted-text mb-6">
          Organize groceries across lists. Create one for weekly shops, Costco
          runs, or events.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New list name (e.g., Weekly)"
            className="flex-1"
          />
          <Button
            onClick={createList}
            disabled={creating || !name.trim()}
            className="bg-gradient-to-r from-gradient-dark to-gradient-light"
          >
            {creating ? "Creating..." : "Create List"}
          </Button>
        </div>

        {createError ? (
          <div className="text-red-600 text-sm mb-6">{createError}</div>
        ) : null}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-dark"></div>
            <p className="mt-2 text-muted-text">Loading lists...</p>
          </div>
        ) : error?.status === 401 ? (
          <div className="text-center py-10">
            You're not signed in. <Link to="/signin">Sign in</Link> to manage
            shopping lists.
          </div>
        ) : data?.lists?.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.lists.map((l: any) => (
              <div
                key={l.id}
                className="group p-5 rounded-xl border shadow-sm bg-white/90 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg text-gradient-dark">
                      {l.name}
                    </p>
                    <p className="text-sm text-muted-text">
                      {l._count.items} {l._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/shopping-lists/$listId"
                      params={{ listId: l.id }}
                    >
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-gradient-dark to-gradient-light"
                      >
                        Open
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteList(l.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-text mb-4">
              No lists yet. Create your first one above.
            </p>
          </div>
        )}
      </div>
      {/* Child route renders here (e.g., /shopping-lists/$listId) */}
      <Outlet />
    </div>
  );
}
