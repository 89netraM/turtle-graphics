import { redirect } from "@sveltejs/kit";

export const prerender = false;

export async function load({ parent, params }) {
  const parentData = await parent();
  const activeChallenge = parentData.challenges.find((c) => c.id === params.id);
  if (activeChallenge == null) {
    redirect(307, "/challenges");
  }
  return {
    activeChallenge,
  };
}
