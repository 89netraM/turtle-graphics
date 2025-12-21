import { getMockImage } from "$lib/server/s3";
import { error } from "@sveltejs/kit";

export async function GET({ params }) {
  const imageData = getMockImage(params.filename);

  if (!imageData) {
    throw error(404, "Image not found");
  }

  // Determine content type based on file extension
  const extension = params.filename.split(".").pop()?.toLowerCase();
  const contentType =
    {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
    }[extension ?? ""] ?? "application/octet-stream";

  return new Response(new Blob([imageData as ArrayBufferView<ArrayBuffer>]), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
    },
  });
}
