import { json, type RequestHandler } from "@sveltejs/kit";
import { getSession } from "$lib/server/auth";
import { createOrUpdateSubmission } from "$lib/server/dynamodb";

export const POST: RequestHandler = async ({ request, params, cookies }) => {
  const username = getSession(cookies);
  const challengeId = params.id!;

  if (!username) {
    return json({ error: "You must be signed in to submit" }, { status: 401 });
  }

  try {
    const { code } = await request.json();

    if (typeof code !== "string") {
      return json({ error: "Invalid code" }, { status: 400 });
    }

    const submission = await createOrUpdateSubmission(username, challengeId, code);

    return json({
      success: true,
      submission: {
        code: submission.code,
        submittedAt: submission.submittedAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to submit:", error);
    return json({ error: "Failed to submit code" }, { status: 500 });
  }
};
