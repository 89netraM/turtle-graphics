import { getPlaygroundSettings } from "$lib/server/dynamodb";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const settings = await getPlaygroundSettings();
  const currentTime = new Date();

  // Check if playground is closed
  const isClosed = settings.closeTime ? new Date(settings.closeTime) <= currentTime : false;

  return {
    isClosed,
    closeTime: settings.closeTime,
    currentTime: currentTime.toISOString(),
  };
};
