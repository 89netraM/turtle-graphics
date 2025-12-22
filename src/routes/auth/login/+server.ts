import { json, type RequestHandler } from "@sveltejs/kit";
import { getAccount } from "$lib/server/dynamodb";
import { verifyPassword, setSession } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      return json({ error: "Username and password are required" }, { status: 400 });
    }

    const account = await getAccount(username);

    if (!account) {
      return json({ error: "Invalid username or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, account.password);

    if (!isValid) {
      return json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Set session with username and PIN
    setSession(cookies, account.username, password);

    return json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Failed to login" }, { status: 500 });
  }
};
