import { json, type RequestHandler } from "@sveltejs/kit";
import { clearSession } from "$lib/server/auth";

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    clearSession(cookies);
    return json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return json({ error: "Failed to logout" }, { status: 500 });
  }
};
