import { getPlaygroundSettings, setPlaygroundSettings } from "$lib/server/dynamodb";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const settings = await getPlaygroundSettings();
  return {
    closeTime: settings.closeTime,
  };
};

export const actions = {
  async default({ request }) {
    const data = await request.formData();
    let closeTime = data.get("closeTime");
    const clear = data.get("clear");

    if (clear === null) {
      // Validate closeTime (should be ISO string or empty string for null)
      if (closeTime && typeof closeTime === "string") {
        // Try to parse to ensure it's a valid date
        const date = new Date(closeTime);
        if (isNaN(date.getTime())) {
          return fail(400, {
            error: "Invalid date format",
          });
        }
      }
    } else {
      closeTime = null;
    }

    try {
      await setPlaygroundSettings(closeTime && typeof closeTime === "string" ? closeTime : null);
      return { success: true };
    } catch (error) {
      console.error("Error updating playground settings:", error);
      return fail(500, {
        error: "Failed to update settings",
      });
    }
  },
};
