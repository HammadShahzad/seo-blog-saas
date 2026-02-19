/**
 * Backblaze B2 Storage Client (S3-compatible)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _s3: S3Client | null = null;

export function getB2Client(): S3Client {
  if (!_s3) {
    const endpoint = process.env.B2_ENDPOINT;
    const accountId = process.env.B2_ACCOUNT_ID;
    const appKey = process.env.B2_APPLICATION_KEY;

    if (!endpoint || !accountId || !appKey) {
      throw new Error("Backblaze B2 credentials not configured (B2_ENDPOINT, B2_ACCOUNT_ID, B2_APPLICATION_KEY)");
    }

    _s3 = new S3Client({
      endpoint,
      region: "us-east-1", // B2 requires a region but ignores it
      credentials: {
        accessKeyId: accountId,
        secretAccessKey: appKey,
      },
      forcePathStyle: true,
    });
  }
  return _s3;
}

export async function uploadToB2(
  buffer: Buffer,
  key: string,
  contentType: string = "image/webp"
): Promise<string> {
  const client = getB2Client();
  const bucket = process.env.B2_BUCKET_NAME;

  if (!bucket) throw new Error("B2_BUCKET_NAME not configured");

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  // Construct public CDN URL
  const endpoint = process.env.B2_ENDPOINT!;
  const baseUrl = endpoint.includes("s3.") 
    ? `https://${bucket}.${endpoint.replace("https://", "")}`
    : `${endpoint}/file/${bucket}`;

  return `${baseUrl}/${key}`;
}
