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
        <h1 className="text-3xl font-bold text-gradient-dark mb-6">
          Shopping Lists
        </h1>

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
          <div className="text-center py-10">Loading...</div>
        ) : error?.status === 401 ? (
          <div className="text-center py-10">
            You're not signed in. <Link to="/signin">Sign in</Link> to manage
            shopping lists.
          </div>
        ) : data?.lists?.length ? (
          <ul className="space-y-3">
            {data.lists.map((l: any) => (
              <li
                key={l.id}
                className="p-4 border rounded-md bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-muted-text">
                    {l._count.items} items
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to="/shopping-lists/$listId" params={{ listId: l.id }}>
                    <Button variant="outline">Open</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => deleteList(l.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-text">No lists yet.</p>
        )}
      </div>
      {/* Child route renders here (e.g., /shopping-lists/$listId) */}
      <Outlet />
    </div>
  );
}
