import { createAPIFileRoute } from "@tanstack/react-start/api";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

// Zod schema for note validation
const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  recipeId: z.string().min(1, "Recipe ID is required"),
});

export const APIRoute = createAPIFileRoute("/api/recipe-notes")({
  POST: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session || !session.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validatedData = noteSchema.parse(body);

      // Check if recipe exists and belongs to user
      const recipe = await prisma.recipe.findFirst({
        where: {
          id: validatedData.recipeId,
          userId: session.user.id,
        },
      });

      if (!recipe) {
        return Response.json(
          { success: false, error: "Recipe not found or unauthorized" },
          { status: 404 }
        );
      }

      const note = await prisma.recipeNote.create({
        data: {
          id: crypto.randomUUID(),
          content: validatedData.content,
          recipeId: validatedData.recipeId,
          userId: session.user.id,
        },
      });

      return Response.json({ success: true, note }, { status: 201 });
    } catch (error) {
      console.error("Error creating note:", error);

      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { success: false, error: "Failed to create note" },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session || !session.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return Response.json(
          { success: false, error: "Note ID is required" },
          { status: 400 }
        );
      }

      // Check if note exists and belongs to user
      const existingNote = await prisma.recipeNote.findFirst({
        where: {
          id: id,
          userId: session.user.id,
        },
      });

      if (!existingNote) {
        return Response.json(
          { success: false, error: "Note not found or unauthorized" },
          { status: 404 }
        );
      }

      await prisma.recipeNote.delete({
        where: { id: id },
      });

      return Response.json({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      return Response.json(
        { success: false, error: "Failed to delete note" },
        { status: 500 }
      );
    }
  },
});
