export interface PresignedUploadInput {
  directory: string;
  fileName: string;
  contentType: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
  expiresIn: number;
}
