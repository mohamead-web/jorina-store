import { put } from "@vercel/blob";

import { getCurrentUser } from "@/lib/auth/session";
import { deleteBlobUrls, isBlobStorageUrl } from "@/lib/services/blob-storage";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

function ensureAdmin(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const unauthorizedResponse = ensureAdmin(user);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const productSlug = String(formData.get("productSlug") ?? "draft-product");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing image file" }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileBaseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "product-image";
  const pathname = `products/${slugify(productSlug) || "draft-product"}/${Date.now()}-${fileBaseName}.${extension}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true
  });

  return Response.json({
    url: blob.url,
    pathname: blob.pathname
  });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  const unauthorizedResponse = ensureAdmin(user);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const body = (await request.json()) as { url?: string };

  if (!body.url || !isBlobStorageUrl(body.url)) {
    return Response.json({ error: "Invalid blob URL" }, { status: 400 });
  }

  await deleteBlobUrls([body.url]);

  return Response.json({ success: true });
}
