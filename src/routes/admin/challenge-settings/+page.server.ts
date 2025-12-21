import { getChallengeTimespan, setChallengeTimespan } from "$lib/server/dynamodb";
import { fail } from "@sveltejs/kit";

export const load = async () => {
  const timespan = await getChallengeTimespan();
  return { ...timespan };
};

export const actions = {
  async default({ request }) {
    const data = await request.formData();
    const startTimeString = data.get("startTime");
    const endTimeString = data.get("endTime");
    const clear = data.get("clear");

    // If clearing, set both to null
    if (clear !== null) {
      try {
        await setChallengeTimespan(null);
        return { success: true };
      } catch (error) {
        console.error("Error clearing challenge timespan:", error);
        return fail(500, {
          error: "Failed to clear settings",
        });
      }
    }

    // Validate both times are provided
    if (!startTimeString || !endTimeString) {
      return fail(400, {
        error: "Both start and end times must be provided",
      });
    }

    if (typeof startTimeString !== "string" || typeof endTimeString !== "string") {
      return fail(400, {
        error: "Invalid time format",
      });
    }

    // Parse and validate dates
    const startTime = new Date(startTimeString);
    const endTime = new Date(endTimeString);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return fail(400, {
        error: "Invalid date format",
      });
    }

    // Validate end is after start
    if (endTime <= startTime) {
      return fail(400, {
        error: "End time must be after start time",
      });
    }

    try {
      await setChallengeTimespan({ startTime, endTime });
      return { success: true };
    } catch (error) {
      console.error("Error updating challenge timespan:", error);
      return fail(500, {
        error: "Failed to update settings",
      });
    }
  },
};
