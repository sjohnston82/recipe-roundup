import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/shopping-lists/$listId")({
  component: ShoppingListDetail,
});

function useShoppingList(listId: string) {
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
      const res = await fetch(`/api/shopping-list/${listId}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError({ message: "Failed to load list", status: res.status });
        setData(null);
      } else {
        setData(json?.list ?? null);
      }
    } catch (_) {
      setError({ message: "Network error" });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [listId]);
  React.useEffect(() => {
    void reload();
  }, [reload]);
  const optimisticToggle = React.useCallback(
    (itemId: string, checked: boolean) => {
      setData((prev: any) => {
        if (!prev) return prev;
        const items = prev.items?.map((it: any) =>
          it.id === itemId ? { ...it, checked } : it
        );
        return { ...prev, items };
      });
    },
    []
  );

  const optimisticClearPurchased = React.useCallback(() => {
    setData((prev: any) => {
      if (!prev) return prev;
      const items = prev.items?.filter((it: any) => !it.checked);
      return { ...prev, items };
    });
  }, []);

  return {
    data,
    loading,
    error,
    reload,
    optimisticToggle,
    optimisticClearPurchased,
    setData,
  };
}

const ShoppingListItemRow = React.memo(function ShoppingListItemRow({
  item,
  onToggle,
}: {
  item: any;
  onToggle: (itemId: string, checked: boolean) => void;
}) {
  return (
    <li className="flex items-center justify-between p-3 bg-white border rounded-md">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!item.checked}
          onChange={(e) => onToggle(item.id, e.target.checked)}
        />
        <div className="flex flex-col">
          <span className={item.checked ? "line-through text-muted-text" : ""}>
            {item.originalText}
          </span>
          <span className="text-xs text-muted-text">
            {item.recipe?.title && item.recipe?.id ? (
              <>
                sent from{" "}
                <Link
                  to="/recipe/$recipeId"
                  params={{ recipeId: item.recipe.id }}
                  className="underline"
                >
                  {item.recipe.title}
                </Link>
              </>
            ) : (
              "Manually added"
            )}
          </span>
        </div>
      </div>
    </li>
  );
});

export default function ShoppingListDetail() {
  const { listId } = Route.useParams();
  const {
    data,
    loading,
    error,
    reload,
    optimisticToggle,
    optimisticClearPurchased,
    setData,
  } = useShoppingList(listId);
  const [text, setText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const navigate = Route.useNavigate();

  const addItem = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/shopping-list-items/${listId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: [{ originalText: text }] }),
      });
      if (res.ok) {
        setText("");
        setData((prev: any) =>
          prev
            ? {
                ...prev,
                items: [
                  ...(prev.items || []),
                  {
                    id:
                      (typeof crypto !== "undefined" &&
                        "randomUUID" in crypto &&
                        crypto.randomUUID()) ||
                      Math.random().toString(36).slice(2),
                    originalText: text,
                    checked: false,
                  },
                ],
              }
            : prev
        );
      } else {
        await reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = React.useCallback(
    async (itemId: string, checked: boolean) => {
      optimisticToggle(itemId, checked);
      const res = await fetch(`/api/shopping-list-items/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId, checked }),
      });
      if (!res.ok) {
        optimisticToggle(itemId, !checked);
      }
    },
    [listId, optimisticToggle]
  );

  const clearPurchased = async () => {
    optimisticClearPurchased();
    const res = await fetch(`/api/shopping-list-items/${listId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ mode: "purchased" }),
    });
    if (!res.ok) await reload();
  };

  const deleteList = async () => {
    const res = await fetch(`/api/shopping-list/${listId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      navigate({ to: "/shopping-lists" });
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error?.status === 401 ? (
          <div className="text-center py-10">You're not signed in.</div>
        ) : error ? (
          <div className="text-center py-10">{error.message}</div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gradient-dark mb-6">
              {data?.name || "Shopping List"}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add an item (e.g., 2 avocados)"
                className="flex-1"
              />
              <Button
                onClick={addItem}
                disabled={submitting || !text.trim()}
                className="bg-gradient-to-r from-gradient-dark to-gradient-light"
              >
                {submitting ? "Adding..." : "Add Item"}
              </Button>
            </div>

            <ul className="space-y-2">
              {data?.items?.map((it: any) => (
                <ShoppingListItemRow key={it.id} item={it} onToggle={toggle} />
              ))}
            </ul>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={clearPurchased}>
                Clear Purchased
              </Button>
              <Button variant="destructive" onClick={deleteList}>
                Delete List
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
