import { json, type RequestHandler } from "@sveltejs/kit";
import { getSession } from "$lib/server/auth";
import { getSubmission } from "$lib/server/dynamodb";

export const GET: RequestHandler = async ({ params, cookies }) => {
  const username = getSession(cookies);
  const challengeId = params.id!;

  if (!username) {
    return json({ error: "You must be signed in to load submissions" }, { status: 401 });
  }

  try {
    const submission = await getSubmission(username, challengeId);

    if (!submission) {
      return json({ error: "No submission found" }, { status: 404 });
    }

    return json({
      success: true,
      submission: {
        code: submission.code,
        submittedAt: submission.submittedAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to load submission:", error);
    return json({ error: "Failed to load submission" }, { status: 500 });
  }
};
