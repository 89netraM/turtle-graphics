import { getSubmissionsByChallenge } from "$lib/server/dynamodb";

export const load = async ({ params }) => {
  const submissions = await getSubmissionsByChallenge(params.challengeId);

  return {
    submissions,
  };
};
