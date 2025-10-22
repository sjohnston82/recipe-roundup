import { createAuthClient } from "better-auth/react";
export const { useSession, signIn, signOut, signUp, getSession } =
  createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000",
    redirectTo: "/",
  });
