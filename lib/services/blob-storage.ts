import { del } from "@vercel/blob";

const blobHostSuffix = ".public.blob.vercel-storage.com";

export function isBlobStorageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(blobHostSuffix);
  } catch {
    return false;
  }
}

export async function deleteBlobUrls(urls: string[]) {
  const blobUrls = [...new Set(urls.filter(isBlobStorageUrl))];

  if (blobUrls.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    await del(blobUrls);
  } catch (error) {
    console.error("Blob deletion error:", error);
  }
}
