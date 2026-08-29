import { put, del } from "@vercel/blob";

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadImageFile(file: File, folder: string): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`${folder}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteImageFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // Si el archivo ya no existe o la URL no es de Vercel Blob, no hay nada que hacer.
  }
}
