import { S3Client, PutObjectCommand, DeleteObjectCommand, type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";
import { randomUUID } from "crypto";

const BUCKET_NAME = env.S3_BUCKET_NAME;

let s3Client: S3Client | null = null;

if (BUCKET_NAME) {
  s3Client = new S3Client({});
}

// In-memory store for local development (when S3_BUCKET_NAME is not set)
const mockS3Store = new Map<string, Buffer>();

/**
 * Upload an image to S3 and return the public URL
 * @param imageBuffer - The image data as a Buffer
 * @param contentType - The MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @returns The public URL of the uploaded image
 */
export async function uploadChallengeImage(imageBuffer: Buffer, contentType: string): Promise<string> {
  const fileExtension = contentType.split("/")[1] ?? "png";
  const fileName = `${randomUUID()}.${fileExtension}`;

  if (!BUCKET_NAME || !s3Client) {
    // Local development: store in memory and return a mock URL
    mockS3Store.set(fileName, imageBuffer);
    return `/mock-s3/${fileName}`;
  }

  const params: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  // Return the public URL
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
}

/**
 * Delete an image from S3
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteChallengeImage(imageUrl: string): Promise<void> {
  // Extract the file name from the URL
  const fileName = imageUrl.split("/").pop();
  if (!fileName) {
    throw new Error("Invalid image URL");
  }

  // Check if this is a mock URL
  if (imageUrl.startsWith("/mock-s3/")) {
    mockS3Store.delete(fileName);
    return;
  }

  if (!BUCKET_NAME || !s3Client) {
    throw new Error("S3 is not configured");
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
  };

  await s3Client.send(new DeleteObjectCommand(params));
}

/**
 * Get mock image data for local development
 * This is used by the mock S3 endpoint
 */
export function getMockImage(fileName: string): Buffer | undefined {
  return mockS3Store.get(fileName);
}
