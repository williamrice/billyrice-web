import "server-only";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function deleteS3Object(key: string) {
  if (!key) return;

  const client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  await client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET!,
    Key: key,
  }));
}
