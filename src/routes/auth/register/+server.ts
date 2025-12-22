import { json, type RequestHandler } from "@sveltejs/kit";
import { getAccount, createAccount } from "$lib/server/dynamodb";
import { generatePin, hashPassword, setSession } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return json({ error: "Username is required" }, { status: 400 });
    }

    // Check if username already exists
    const existing = await getAccount(username);

    if (existing) {
      return json({ error: "Username already exists" }, { status: 400 });
    }

    // Generate PIN and hash it
    const pin = generatePin();
    const hashedPassword = await hashPassword(pin);

    // Create account
    await createAccount(username, hashedPassword);

    // Set session with username and PIN
    setSession(cookies, username, pin);

    return json({ success: true, pin });
  } catch (error) {
    console.error("Register error:", error);
    return json({ error: "Failed to create account" }, { status: 500 });
  }
};
