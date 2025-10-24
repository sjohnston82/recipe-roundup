import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "../lib/auth";
import { prisma } from "../server/db/prisma";

export const APIRoute = createAPIFileRoute("/api/profile")({
  PUT: async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      const { name, image } = body;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: name || null,
          image: image || null,
        },
      });

      return Response.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return Response.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }
  },
});
