import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "../server/db/prisma";
import { z } from "zod";
import { auth } from "../lib/auth";

const addItemsSchema = z.object({
  items: z
    .array(
      z.object({
        originalText: z.string().min(1),
        normalizedName: z.string().optional(),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        note: z.string().optional(),
        recipeId: z.string().uuid().optional(),
        recipeTitle: z.string().optional(),
      })
    )
    .min(1),
});

export const APIRoute = createAPIFileRoute("/api/shopping-list-items/$listId")({
  POST: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return Response.json({ success: false }, { status: 401 });
    const { listId } = params as { listId: string };
    const body = await request.json();
    const { items } = addItemsSchema.parse(body);

    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
      select: { id: true },
    });
    if (!list)
      return Response.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );

    await prisma.shoppingListItem.createMany({
      data: items.map((i) => ({
        listId,
        originalText: i.originalText,
        normalizedName: i.normalizedName,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
        recipeId: i.recipeId,
      })),
    });
    return Response.json({ success: true });
  },

  PATCH: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return Response.json({ success: false }, { status: 401 });
    const { listId } = params as { listId: string };
    const body = await request.json();
    const toggleSchema = z.object({
      itemId: z.string().uuid(),
      checked: z.boolean(),
    });
    const { itemId, checked } = toggleSchema.parse(body);

    const item = await prisma.shoppingListItem.findFirst({
      where: { id: itemId, list: { userId: session.user.id, id: listId } },
      select: { id: true },
    });
    if (!item)
      return Response.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );

    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { checked },
    });
    return Response.json({ success: true });
  },

  DELETE: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return Response.json({ success: false }, { status: 401 });
    const { listId } = params as { listId: string };
    const modeSchema = z.object({ mode: z.enum(["purchased", "all"]) });
    const { mode } = modeSchema.parse(
      await request.json().catch(() => ({ mode: "purchased" }))
    );

    const where = mode === "purchased" ? { checked: true, listId } : { listId };
    await prisma.shoppingListItem.deleteMany({ where });
    return Response.json({ success: true });
  },
});
