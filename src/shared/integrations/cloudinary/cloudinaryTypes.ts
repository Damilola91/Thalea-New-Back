export type SupportedCloudinaryResourceType = "image" | "video";

export interface CloudinaryStorageParams {
  folder: string;
  allowed_formats: string[];
  resource_type: SupportedCloudinaryResourceType;
  public_id: string;
}
