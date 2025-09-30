import { supabase } from "./supabase";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type UploadProgressCallback = (progress: number) => void;

const IMAGE_CONFIG = {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

const VIDEO_CONFIG = {
  maxSize: 100 * 1024 * 1024,
  allowedTypes: [
    "video/mp4",
    "video/mov",
    "video/quicktime",
    "video/avi",
    "video/wmv",
    "video/x-ms-wmv",
  ],
  allowedExtensions: [".mp4", ".mov", ".avi", ".wmv"],
};

const DOCUMENT_CONFIG = {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/zip",
    "application/x-zip-compressed",
    "application/rar",
    "application/x-rar-compressed",
  ],
  allowedExtensions: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".zip",
    ".rar",
  ],
};

const FILE_CONFIG = {
  image: IMAGE_CONFIG,
  video: VIDEO_CONFIG,
  document: DOCUMENT_CONFIG,
} as const;

export const SUPPORTED_IMAGE_TYPES = IMAGE_CONFIG.allowedTypes;
export const SUPPORTED_VIDEO_TYPES = VIDEO_CONFIG.allowedTypes;
export const MAX_IMAGE_SIZE = IMAGE_CONFIG.maxSize;
export const MAX_VIDEO_SIZE = VIDEO_CONFIG.maxSize;

export function validateFile(
  file: File,
  type: "image" | "video" | "document",
): FileValidationResult {
  const config = FILE_CONFIG[type];

  if (!config) {
    return { valid: false, error: "不支持的文件类型" };
  }

  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制（最大 ${formatFileSize(config.maxSize)}）`,
    };
  }

  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件格式，请使用 ${config.allowedExtensions.join(", ")} 格式`,
    };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = config.allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `文件扩展名不正确，请使用 ${config.allowedExtensions.join(", ")} 格式`,
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf("."));
  return `${timestamp}_${random}${extension}`;
}

async function uploadToStorage(
  bucket: string,
  filePath: string,
  file: File,
  onProgress?: UploadProgressCallback,
  progressInterval = 200,
  progressDuration = 1000,
): Promise<string> {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    if (onProgress) {
      onProgress(0);
      intervalId = setInterval(() => {
        onProgress(Math.min(90, Math.random() * 80 + 10));
      }, progressInterval);
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
      }, progressDuration);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`文件上传失败: ${error.message}`);
    }

    if (onProgress) {
      onProgress(100);
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    if (onProgress) {
      onProgress(0);
    }
    throw error;
  } finally {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function uploadImage(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const validation = validateFile(file, "image");
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = `projects/${projectId}/images/${generateFileName(file.name)}`;
  return uploadToStorage("buildbridge", filePath, file, onProgress, 200, 1000);
}

export async function uploadVideo(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const validation = validateFile(file, "video");
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = `projects/${projectId}/videos/${generateFileName(file.name)}`;
  return uploadToStorage("buildbridge", filePath, file, onProgress, 500, 2000);
}

export async function uploadDocument(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const validation = validateFile(file, "document");
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = `projects/${projectId}/documents/${generateFileName(file.name)}`;
  return uploadToStorage("buildbridge", filePath, file, onProgress, 300, 1500);
}

export async function uploadProjectImages(
  files: File[],
  projectId: string,
  onProgress?: (fileIndex: number, progress: number) => void,
): Promise<string[]> {
  const uploadPromises = files.map((file, index) =>
    uploadImage(file, projectId, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(
      `批量图片上传失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}

export async function uploadProjectVideo(
  file: File,
  projectId: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  return uploadVideo(file, projectId, onProgress);
}

export async function uploadProjectDocuments(
  files: File[],
  projectId: string,
  onProgress?: (fileIndex: number, progress: number) => void,
): Promise<string[]> {
  const uploadPromises = files.map((file, index) =>
    uploadDocument(file, projectId, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(
      `批量文档上传失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}

export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  let type: "image" | "video" | "document" | null = null;

  if (file.type.startsWith("image/")) {
    type = "image";
  } else if (file.type.startsWith("video/")) {
    type = "video";
  } else if (DOCUMENT_CONFIG.allowedTypes.includes(file.type)) {
    type = "document";
  }

  if (!type) {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }

  const validation = validateFile(file, type);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = `${path}/${generateFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`文件上传失败: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteFile(
  target: string,
  bucket: string = "buildbridge",
): Promise<void> {
  const filePath = bucket
    ? extractFilePathFromUrl(target, bucket) ?? target
    : target;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`删除文件失败: ${error.message}`);
  }
}

export async function deleteProjectFiles(
  projectId: string,
  bucket: string = "buildbridge",
): Promise<void> {
  try {
    const targets = [
      `projects/${projectId}/images`,
      `projects/${projectId}/videos`,
      `projects/${projectId}/documents`,
    ];

    for (const prefix of targets) {
      const { data: objects, error: listError } = await supabase.storage
        .from(bucket)
        .list(prefix, { limit: 1000 });

      if (listError || !objects?.length) {
        continue;
      }

      const paths = objects.map((item) => `${prefix}/${item.name}`);
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (removeError) {
        console.warn("部分文件删除失败:", { prefix, error: removeError });
      }
    }
  } catch (error) {
    console.error("删除项目文件时出错:", error);
    throw new Error("删除项目文件失败");
  }
}

export function getPublicUrl(
  filePath: string,
  bucket: string = "buildbridge",
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export function extractFilePathFromUrl(
  url: string,
  bucket: string = "buildbridge",
): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.findIndex((part) => part === bucket);

    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join("/");
    }

    return null;
  } catch {
    return null;
  }
}
