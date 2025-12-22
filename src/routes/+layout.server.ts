import { getSessionWithPin } from "$lib/server/auth";

export const load = async ({ cookies }) => {
  const session = getSessionWithPin(cookies);

  if (!session) {
    return {
      user: null,
    };
  }

  return {
    user: {
      username: session.username,
      pin: session.pin,
    },
  };
};
