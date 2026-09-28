// src/sync/googleDrive.ts
// Thin wrapper the Resources tab calls, so upload logic stays in one place.

import { uploadToDrive } from "./google.ts"
import { fileToDataUrl } from "../data/docs.ts"
import { isGoogleConnected } from "./google.ts"

export interface UploadedReference {
  fileId: string;
  folderId: string;
  webViewLink: string;
  name: string;
  mimeType: string;
}

/** True when Google is connected and a Picker key is present. */
export async function isDriveReady(): Promise<boolean> {
  const { getGooglePickerKey } = await import("../data/settings");
  return (await isGoogleConnected()) && !!(await getGooglePickerKey());
}

export async function pickAndUploadToDrive(
  projectId: string,
  file: { name: string; type: string; dataUrl: string },
  _category: "images" | "pdfs"
): Promise<UploadedReference | null> {
  try {
    return await uploadToDrive(projectId, file.dataUrl, file.name, file.type);
  } catch (err) {
    if (err instanceof Error && /cancelled/i.test(err.message)) return null;
    throw err;
  }
}

export { fileToDataUrl };
