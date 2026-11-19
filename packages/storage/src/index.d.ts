export type StorageUploadOptions = {
  contentType?: string;
};

export type StorageAdapter = {
  upload(
    key: string,
    data: Buffer | Uint8Array | string,
    options?: StorageUploadOptions,
  ): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
};

export function createLocalStorage(options: {
  rootDir: string;
  publicBaseUrl?: string;
}): StorageAdapter;

export function createS3Storage(options: {
  client: {
    putObject(input: {
      Bucket: string;
      Key: string;
      Body: Buffer | Uint8Array | string;
      ContentType?: string;
    }): Promise<unknown>;
    deleteObject(input: { Bucket: string; Key: string }): Promise<unknown>;
  };
  bucket: string;
  publicBaseUrl?: string;
}): StorageAdapter;

export type ObjectStorageSettings = {
  provider: "local" | "oss" | "r2";
  bucket?: string;
  region?: string;
  accountId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  prefix?: string;
  publicBaseUrl?: string;
  hasAccessKeyId?: boolean;
  hasAccessKeySecret?: boolean;
};
export function createMediaStorage(options?: { rootDir?: string; dataDir?: string; fetch?: typeof fetch }): StorageAdapter & {
  rewriteUrls(text: string, toInternal?: boolean): string;
  settings(provider?: string): Promise<ObjectStorageSettings>;
  save(input: ObjectStorageSettings): Promise<ObjectStorageSettings>;
  test(input: ObjectStorageSettings): Promise<{ok: boolean; message: string}>;
  flushDirectory(group: string): Promise<void>;
  read(key: string): Promise<{data: Buffer; mimeType: string} | null>;
  exists(key: string): Promise<boolean>;
  serve(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse): Promise<boolean>;
};
