import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "../server/db/prisma";
import { auth } from "../lib/auth";

export const APIRoute = createAPIFileRoute("/api/shopping-list/$listId")({
  GET: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return Response.json({ success: false }, { status: 401 });
    const { listId } = params as { listId: string };
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { recipe: { select: { id: true, title: true } } },
        },
      },
    });
    if (!list)
      return Response.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return Response.json({ success: true, list });
  },

  DELETE: async ({ request, params }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id)
      return Response.json({ success: false }, { status: 401 });
    const { listId } = params as { listId: string };

    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
      select: { id: true },
    });
    if (!list)
      return Response.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );

    await prisma.shoppingList.delete({ where: { id: listId } });
    return Response.json({ success: true });
  },
});
