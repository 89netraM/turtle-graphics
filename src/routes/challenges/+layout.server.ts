import { getChallengeTimespan, getChallenges } from "$lib/server/dynamodb";

export const load = async () => {
  const [challengeTimespan, challenges] = await Promise.all([getChallengeTimespan(), getChallenges()]);

  return {
    challengeTimespan,
    challenges,
  };
};
