import { createAPIFileRoute } from "@tanstack/react-start/api";
import { PrismaClient } from "@prisma/client";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

export const APIRoute = createAPIFileRoute("/api/share-recipe")({
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
      const { recipeId } = body;

      if (!recipeId) {
        return Response.json(
          { success: false, error: "Recipe ID is required" },
          { status: 400 }
        );
      }

      // Check if recipe exists and belongs to user
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id: recipeId,
          userId: session.user.id,
        },
      });

      if (!existingRecipe) {
        return Response.json(
          { success: false, error: "Recipe not found or unauthorized" },
          { status: 404 }
        );
      }

      // Generate a unique share token if it doesn't exist
      let shareToken = existingRecipe.shareToken;
      if (!shareToken) {
        shareToken = crypto.randomUUID();
        
        await prisma.recipe.update({
          where: { id: recipeId },
          data: { shareToken },
        });
      }

      const shareUrl = `${request.headers.get('origin') || 'http://localhost:3000'}/share/${shareToken}`;

      return Response.json({ 
        success: true, 
        shareToken,
        shareUrl 
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      return Response.json(
        { success: false, error: "Failed to generate share link" },
        { status: 500 }
      );
    }
  },

  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");

      if (!token) {
        return Response.json(
          { success: false, error: "Share token is required" },
          { status: 400 }
        );
      }

      const recipe = await prisma.recipe.findFirst({
        where: {
          shareToken: token,
        },
        select: {
          id: true,
          title: true,
          description: true,
          ingredients: true,
          instructions: true,
          prepTime: true,
          cookTime: true,
          servings: true,
          cuisine: true,
          tags: true,
          sourceUrl: true,
          imageUrl: true,
          nutrition: true,
        },
      });

      if (!recipe) {
        return Response.json(
          { success: false, error: "Shared recipe not found" },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        recipe,
      });
    } catch (error) {
      console.error("Error fetching shared recipe:", error);
      return Response.json(
        { success: false, error: "Failed to fetch shared recipe" },
        { status: 500 }
      );
    }
  },
});
