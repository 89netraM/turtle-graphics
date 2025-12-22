import { redirect } from "@sveltejs/kit";
import { getSubmission } from "$lib/server/dynamodb";

export const load = async ({ params, parent }) => {
  const parentData = await parent();
  const challengeId = params.id!;

  // Find the active challenge
  const activeChallenge = parentData.challenges.find((c) => c.id === challengeId);
  if (!activeChallenge) {
    redirect(307, "/challenges");
  }

  // Load submission if user is logged in
  let submission = null;
  if (parentData.user) {
    try {
      submission = await getSubmission(parentData.user.username, challengeId);
    } catch (error) {
      console.error("Failed to load submission:", error);
    }
  }

  return {
    activeChallenge,
    submission,
  };
};
