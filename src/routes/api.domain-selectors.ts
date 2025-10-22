import { createAPIFileRoute } from "@tanstack/react-start/api";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

const domainSelectorSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  titleSelector: z.string().optional(),
  descriptionSelector: z.string().optional(),
  ingredientsSelector: z.string().optional(),
  instructionsSelector: z.string().optional(),
  prepTimeSelector: z.string().optional(),
  cookTimeSelector: z.string().optional(),
  servingsSelector: z.string().optional(),
  imageSelector: z.string().optional(),
  cuisineSelector: z.string().optional(),
});

export const APIRoute = createAPIFileRoute("/api/domain-selectors")({
  POST: async ({ request }: { request: Request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session || !session.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validatedData = domainSelectorSchema.parse(body);

      const domainSelector = await prisma.domainSelector.upsert({
        where: { domain: validatedData.domain },
        update: {
          titleSelector: validatedData.titleSelector || null,
          descriptionSelector: validatedData.descriptionSelector || null,
          ingredientsSelector: validatedData.ingredientsSelector || null,
          instructionsSelector: validatedData.instructionsSelector || null,
          prepTimeSelector: validatedData.prepTimeSelector || null,
          cookTimeSelector: validatedData.cookTimeSelector || null,
          servingsSelector: validatedData.servingsSelector || null,
          imageSelector: validatedData.imageSelector || null,
          cuisineSelector: validatedData.cuisineSelector || null,
        },
        create: {
          domain: validatedData.domain,
          titleSelector: validatedData.titleSelector || null,
          descriptionSelector: validatedData.descriptionSelector || null,
          ingredientsSelector: validatedData.ingredientsSelector || null,
          instructionsSelector: validatedData.instructionsSelector || null,
          prepTimeSelector: validatedData.prepTimeSelector || null,
          cookTimeSelector: validatedData.cookTimeSelector || null,
          servingsSelector: validatedData.servingsSelector || null,
          imageSelector: validatedData.imageSelector || null,
          cuisineSelector: validatedData.cuisineSelector || null,
        },
      });

      return Response.json({ success: true, domainSelector }, { status: 201 });
    } catch (error) {
      console.error("Error creating/updating domain selector:", error);

      if (error instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { success: false, error: "Failed to save domain selector" },
        { status: 500 }
      );
    }
  },

  GET: async ({ request }: { request: Request }) => {
    try {
      const url = new URL(request.url);
      const domain = url.searchParams.get("domain");

      if (domain) {
        // Get specific domain selector
        const domainSelector = await prisma.domainSelector.findUnique({
          where: { domain },
        });

        return Response.json({
          success: true,
          domainSelector: domainSelector || null,
        });
      } else {
        // Get all domain selectors
        const domainSelectors = await prisma.domainSelector.findMany({
          orderBy: { domain: "asc" },
        });

        return Response.json({ success: true, domainSelectors });
      }
    } catch (error) {
      console.error("Error fetching domain selectors:", error);
      return Response.json(
        { success: false, error: "Failed to fetch domain selectors" },
        { status: 500 }
      );
    }
  },

  DELETE: async ({ request }: { request: Request }) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session || !session.user?.id) {
        return Response.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const domain = url.searchParams.get("domain");

      if (!domain) {
        return Response.json(
          { success: false, error: "Domain parameter is required" },
          { status: 400 }
        );
      }

      await prisma.domainSelector.delete({
        where: { domain },
      });

      return Response.json({ success: true });
    } catch (error) {
      console.error("Error deleting domain selector:", error);
      return Response.json(
        { success: false, error: "Failed to delete domain selector" },
        { status: 500 }
      );
    }
  },
});
