import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "../server/db/prisma";
import { z } from "zod";
import { auth } from "../lib/auth";

// use prisma singleton

// Zod schema for recipe validation
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  sourceUrl: z.string().url("Must be a valid URL"),
  cuisine: z.string().optional().nullable(),
  prepTime: z.string().optional().nullable(),
  cookTime: z.string().optional().nullable(),
  servings: z.string().optional().nullable(),
  ingredients: z.array(z.string().optional()),
  instructions: z.array(z.string().optional()),
  tags: z.array(z.string()).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  nutrition: z
    .object({
      calories: z.string().optional(),
      protein: z.string().optional(),
      totalFat: z.string().optional(),
      saturatedFat: z.string().optional(),
      transFat: z.string().optional(),
      fiber: z.string().optional(),
      sugar: z.string().optional(),
      sodium: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export const APIRoute = createAPIFileRoute("/api/recipes")({
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
      const validatedData = recipeSchema.parse(body);

      const recipe = await prisma.recipe.create({
        data: {
          id: crypto.randomUUID(),
          title: validatedData.title,
          description: validatedData.description || null,
          sourceUrl: validatedData.sourceUrl,
          cuisine: validatedData.cuisine || null,
          prepTime: validatedData.prepTime,
          cookTime: validatedData.cookTime,
          servings: validatedData.servings,
          ingredients: validatedData.ingredients.filter(
            (ingredient): ingredient is string => ingredient !== undefined
          ),
          instructions: validatedData.instructions.filter(
            (instruction): instruction is string => instruction !== undefined
          ),
          imageUrl: validatedData.imageUrl || null,
          tags: validatedData.tags || [],
          nutrition: validatedData.nutrition ?? undefined,
          userId: session.user.id || null,
        },
      });

      return Response.json({ success: true, recipe }, { status: 201 });
    } catch (error) {
      console.error("Error creating recipe:", error);

      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { success: false, error: "Failed to create recipe" },
        { status: 500 }
      );
    }
  },

  GET: async ({ request }) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      // Get total count for pagination info
      const totalCount = await prisma.recipe.count();
      const totalPages = Math.ceil(totalCount / limit);

      const recipes = await prisma.recipe.findMany({
        include: {
          notes: {
            orderBy: { createdAt: "desc" },
          },
        },
        // Order primarily by id desc to remain compatible pre-migration; client will prefer createdAt when present.
        orderBy: { id: "desc" },
        skip: skip,
        take: limit,
      });

      return Response.json({
        success: true,
        recipes,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return Response.json(
        { success: false, error: "Failed to fetch recipes" },
        { status: 500 }
      );
    }
  },

  PUT: async ({ request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session || !session.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      const { id, lastMadeAt, ...updateData } = body;

      if (!id) {
        return Response.json(
          { success: false, error: "Recipe ID is required" },
          { status: 400 }
        );
      }

      // Check if recipe exists and belongs to user
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id: id,
          userId: session.user.id,
        },
      });

      if (!existingRecipe) {
        return Response.json(
          { success: false, error: "Recipe not found or unauthorized" },
          { status: 404 }
        );
      }

      // If only updating lastMadeAt (for "I Made This Today" functionality)
      if (lastMadeAt && Object.keys(updateData).length === 0) {
        const recipe = await prisma.recipe.update({
          where: { id: id },
          data: {
            lastMadeAt: new Date(lastMadeAt),
          },
          include: {
            notes: {
              orderBy: { createdAt: "desc" },
            },
          },
        });

        return Response.json({ success: true, recipe });
      }

      // For full recipe updates, validate the data
      const validatedData = recipeSchema.parse(updateData);

      const recipe = await prisma.recipe.update({
        where: { id: id },
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          sourceUrl: validatedData.sourceUrl,
          cuisine: validatedData.cuisine || null,
          prepTime: validatedData.prepTime,
          cookTime: validatedData.cookTime,
          servings: validatedData.servings,
          ingredients: validatedData.ingredients,
          instructions: validatedData.instructions,
          tags: validatedData.tags || [],
          imageUrl: validatedData.imageUrl || null,
          rating: validatedData.rating || 0,
          ...(lastMadeAt && { lastMadeAt: new Date(lastMadeAt) }),
        },
        include: {
          notes: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return Response.json({ success: true, recipe });
    } catch (error) {
      console.error("Error updating recipe:", error);

      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { success: false, error: "Failed to update recipe" },
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
          { success: false, error: "Recipe ID is required" },
          { status: 400 }
        );
      }

      // Check if recipe exists and belongs to user
      const existingRecipe = await prisma.recipe.findFirst({
        where: {
          id: id,
          userId: session.user.id,
        },
      });

      if (!existingRecipe) {
        return Response.json(
          { success: false, error: "Recipe not found or unauthorized" },
          { status: 404 }
        );
      }

      await prisma.recipe.delete({
        where: { id: id },
      });

      return Response.json({
        success: true,
        message: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return Response.json(
        { success: false, error: "Failed to delete recipe" },
        { status: 500 }
      );
    }
  },
});
