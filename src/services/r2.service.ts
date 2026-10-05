import { randomUUID } from "crypto";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { r2Client, r2Config } from "../config/r2.js";

import type {
  PresignedUploadInput,
  PresignedUploadResult,
} from "../types/r2.types.js";

const PRESIGNED_URL_EXPIRY_SECONDS = 600;

const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.substring(lastDotIndex).toLowerCase();
};

export const getPublicR2Url = (objectKey: string): string => {
  const baseUrl = r2Config.publicBaseUrl.replace(/\/+$/, "");

  return `${baseUrl}/${objectKey}`;
};

export const generatePresignedUploadUrl = async (
  input: PresignedUploadInput,
): Promise<PresignedUploadResult> => {
  const extension = getFileExtension(input.fileName);

  const objectKey = `${input.directory}/${randomUUID()}${extension}`;

  const command = new PutObjectCommand({
    Bucket: r2Config.bucketName,
    Key: objectKey,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: getPublicR2Url(objectKey),
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
  };
};

export const r2ObjectExists = async (objectKey: string): Promise<boolean> => {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: r2Config.bucketName,
        Key: objectKey,
      }),
    );

    return true;
  } catch {
    return false;
  }
};

export const deleteR2Object = async (objectKey: string): Promise<void> => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
    }),
  );
};
