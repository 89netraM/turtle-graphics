import { getChallengeTimespan } from "$lib/server/dynamodb";

export const load = async () => {
  const challengeTimespan = await getChallengeTimespan();
  return {
    challengeTimespan,
  };
};
