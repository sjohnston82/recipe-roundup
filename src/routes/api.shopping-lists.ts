import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "../server/db/prisma";
import { z } from "zod";
import { auth } from "../lib/auth";

const createListSchema = z.object({
  name: z.string().min(1),
});

//

export const APIRoute = createAPIFileRoute("/api/shopping-lists")({
  GET: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id)
        return Response.json({ success: false }, { status: 401 });

      let lists = await (prisma as any).shoppingList.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
      });
      if (lists.length === 0) {
        const general = await (prisma as any).shoppingList.create({
          data: { name: "General", userId: session.user.id },
        });
        lists = [
          {
            id: general.id,
            name: general.name,
            createdAt: general.createdAt,
            updatedAt: general.updatedAt,
            _count: { items: 0 },
          } as any,
        ];
      }
      return Response.json({ success: true, lists });
    } catch (err) {
      console.error("GET /api/shopping-lists failed", err);
      return Response.json({ success: false }, { status: 503 });
    }
  },

  POST: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id)
        return Response.json({ success: false }, { status: 401 });
      const body = await request.json();
      const { name } = createListSchema.parse(body);
      const list = await (prisma as any).shoppingList.create({
        data: { name, userId: session.user.id },
      });
      return Response.json({ success: true, list });
    } catch (err) {
      console.error("POST /api/shopping-lists failed", err);
      return Response.json({ success: false }, { status: 503 });
    }
  },
});
