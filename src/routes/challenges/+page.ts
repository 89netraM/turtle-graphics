import exampleChallengeImage from "$lib/assets/example-challenge.png";
import type { ChallengeInfo } from "$lib/ChallengeInfo";

export function load() {
  const challenges: Array<ChallengeInfo> = [];
  for (let i = 0; i < 10; i++) {
    challenges.push({
      id: `example-${i}`,
      name: `Example ${i}`,
      image: exampleChallengeImage,
    });
  }
  return {
    challenges,
  };
}
