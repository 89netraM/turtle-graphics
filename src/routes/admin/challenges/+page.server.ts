import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeTimespan,
} from "$lib/server/dynamodb";
import { uploadChallengeImage, deleteChallengeImage } from "$lib/server/s3";
import { fail } from "@sveltejs/kit";

export const load = async () => {
  const [challenges, challengeTimespan] = await Promise.all([getChallenges(), getChallengeTimespan()]);

  // Check if currently in challenge timespan (read-only mode)
  const now = new Date();
  const isReadOnly =
    challengeTimespan !== null && now >= challengeTimespan.startTime && now <= challengeTimespan.endTime;

  return {
    challenges,
    isReadOnly,
  };
};

export const actions = {
  create: async ({ request }) => {
    // Check if in read-only mode
    const challengeTimespan = await getChallengeTimespan();
    const now = new Date();
    const isReadOnly =
      challengeTimespan !== null && now >= challengeTimespan.startTime && now <= challengeTimespan.endTime;

    if (isReadOnly) {
      return fail(400, {
        error: "Cannot create challenges during active challenge timespan",
      });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const imageFile = formData.get("image");

    // Validate inputs
    if (!title || typeof title !== "string" || title.trim() === "") {
      return fail(400, { error: "Title is required" });
    }

    if (!imageFile || !(imageFile instanceof File)) {
      return fail(400, { error: "Image is required" });
    }

    // Validate image type
    if (!imageFile.type.startsWith("image/")) {
      return fail(400, { error: "File must be an image" });
    }

    try {
      // Upload image to S3
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imageUrl = await uploadChallengeImage(imageBuffer, imageFile.type);

      // Create challenge in database
      await createChallenge({
        title: title.trim(),
        imageUrl,
      });

      return { success: true };
    } catch (error) {
      console.error("Error creating challenge:", error);
      return fail(500, { error: "Failed to create challenge" });
    }
  },

  update: async ({ request }) => {
    // Check if in read-only mode
    const challengeTimespan = await getChallengeTimespan();
    const now = new Date();
    const isReadOnly =
      challengeTimespan !== null && now >= challengeTimespan.startTime && now <= challengeTimespan.endTime;

    if (isReadOnly) {
      return fail(400, {
        error: "Cannot update challenges during active challenge timespan",
      });
    }

    const formData = await request.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const imageFile = formData.get("image");
    const existingImageUrl = formData.get("existingImageUrl");

    // Validate inputs
    if (!id || typeof id !== "string") {
      return fail(400, { error: "Challenge ID is required" });
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      return fail(400, { error: "Title is required" });
    }

    try {
      let imageUrl = existingImageUrl as string;

      // If new image provided, upload it and delete old one
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        // Validate image type
        if (!imageFile.type.startsWith("image/")) {
          return fail(400, { error: "File must be an image" });
        }

        // Upload new image
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        imageUrl = await uploadChallengeImage(imageBuffer, imageFile.type);

        // Delete old image if it exists
        if (existingImageUrl && typeof existingImageUrl === "string") {
          try {
            await deleteChallengeImage(existingImageUrl);
          } catch (error) {
            console.error("Error deleting old image:", error);
            // Don't fail the update if old image deletion fails
          }
        }
      }

      // Update challenge in database
      await updateChallenge(id, {
        title: title.trim(),
        imageUrl,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating challenge:", error);
      return fail(500, { error: "Failed to update challenge" });
    }
  },

  delete: async ({ request }) => {
    // Check if in read-only mode
    const challengeTimespan = await getChallengeTimespan();
    const now = new Date();
    const isReadOnly =
      challengeTimespan !== null && now >= challengeTimespan.startTime && now <= challengeTimespan.endTime;

    if (isReadOnly) {
      return fail(400, {
        error: "Cannot delete challenges during active challenge timespan",
      });
    }

    const formData = await request.formData();
    const id = formData.get("id");
    const imageUrl = formData.get("imageUrl");

    // Validate inputs
    if (!id || typeof id !== "string") {
      return fail(400, { error: "Challenge ID is required" });
    }

    try {
      // Delete challenge from database
      await deleteChallenge(id);

      // Delete image from S3
      if (imageUrl && typeof imageUrl === "string") {
        try {
          await deleteChallengeImage(imageUrl);
        } catch (error) {
          console.error("Error deleting image:", error);
          // Don't fail the delete if image deletion fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting challenge:", error);
      return fail(500, { error: "Failed to delete challenge" });
    }
  },
};
