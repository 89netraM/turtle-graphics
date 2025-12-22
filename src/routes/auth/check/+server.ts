import { json, type RequestHandler } from "@sveltejs/kit";
import { getAccount } from "$lib/server/dynamodb";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return json({ error: "Username is required" }, { status: 400 });
    }

    const account = await getAccount(username);
    return json({ exists: account !== null });
  } catch (error) {
    console.error("Check username error:", error);
    return json({ error: "Failed to check username" }, { status: 500 });
  }
};
