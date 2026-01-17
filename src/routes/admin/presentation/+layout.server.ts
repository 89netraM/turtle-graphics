import { getChallenges } from "$lib/server/dynamodb";

export const load = async () => {
  const challenges = await getChallenges();

  return {
    challenges: challenges.sort((a, b) => a.title.localeCompare(b.title)),
  };
};
