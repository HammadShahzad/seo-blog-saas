/**
 * Backblaze B2 Storage Client (S3-compatible API)
 *
 * Required env vars:
 *   B2_ACCOUNT_ID       — keyID (e.g. 0055a8571f819ad000000000e)
 *   B2_APPLICATION_KEY  — applicationKey
 *   B2_BUCKET_NAME      — e.g. seo-blog
 *   B2_ENDPOINT         — e.g. s3.us-east-005.backblazeb2.com (with or without https://)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _s3: S3Client | null = null;

function resolveEndpoint(raw: string): string {
  // Strip any trailing slash and ensure https://
  const clean = raw.replace(/\/$/, "");
  return clean.startsWith("http") ? clean : `https://${clean}`;
}

export function getB2Client(): S3Client {
  if (_s3) return _s3;

  const endpoint = process.env.B2_ENDPOINT;
  const accountId = process.env.B2_ACCOUNT_ID;
  const appKey = process.env.B2_APPLICATION_KEY;

  if (!endpoint || !accountId || !appKey) {
    throw new Error(
      "Backblaze B2 not configured. Set B2_ENDPOINT, B2_ACCOUNT_ID, and B2_APPLICATION_KEY."
    );
  }

  _s3 = new S3Client({
    endpoint: resolveEndpoint(endpoint),
    region: "us-east-1", // B2 requires a region value but ignores it
    credentials: {
      accessKeyId: accountId,
      secretAccessKey: appKey,
    },
    forcePathStyle: true,
  });

  return _s3;
}

export function getB2PublicUrl(key: string): string {
  const bucket = process.env.B2_BUCKET_NAME!;
  const endpoint = process.env.B2_ENDPOINT!;

  // If a custom public URL override is set, use it
  if (process.env.B2_PUBLIC_URL) {
    return `${process.env.B2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }

  // S3-compatible: https://{bucket}.{endpoint}/{key}
  const host = endpoint.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${bucket}.${host}/${key}`;
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
      // Public bucket — each object readable without auth
      ACL: "public-read",
    })
  );

  return getB2PublicUrl(key);
}
