// PDFs are stored on this device only (IndexedDB). They are not synced to the cloud.
import { db, type PdfDoc } from "./db";
import { newId, now } from "./utils";

export type { PdfDoc };

export async function listPdfs(): Promise<PdfDoc[]> {
  if (!db.isOpen()) await db.open();
  const rows = await db.pdfDocs.toArray();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addPdf(file: File): Promise<PdfDoc> {
  if (!db.isOpen()) await db.open();
  const t = now();
  const doc: PdfDoc = { id: newId(), name: file.name, size: file.size, blob: file, createdAt: t, updatedAt: t };
  await db.pdfDocs.add(doc);
  return doc;
}

export async function getPdf(id: string): Promise<PdfDoc | undefined> {
  if (!db.isOpen()) await db.open();
  return db.pdfDocs.get(id);
}

export async function deletePdf(id: string): Promise<void> {
  if (!db.isOpen()) await db.open();
  await db.pdfDocs.delete(id);
}
