// Reads text PDFs on-device with pdf.js (loaded only when you open one).
// Scanned PDFs have no text layer; those show a notice (no OCR).
import { useCallback, useEffect, useRef, useState } from "react";
import { addPdf, deletePdf, listPdfs, type PdfDoc } from "../../data/pdfs";
import { createResource } from "../../data/resources";
import { confirmDelete, copyToClipboard, showToast } from "../ui";
import ReadAloudButton from "../ReadAloudButton";

const MAX_PAGES = 400;

async function extractPages(blob: Blob, onProgress: (done: number, total: number, pages: string[]) => void): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
  const pdf = await task.promise;
  const total = Math.min(pdf.numPages, MAX_PAGES);
  const pages: string[] = [];
  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : ""))
      .join("")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    pages.push(text);
    if (i === 1 || i % 5 === 0 || i === total) onProgress(i, total, pages.slice());
  }
  await task.destroy();
  return pages;
}

export default function PdfReader() {
  const [docs, setDocs] = useState<PdfDoc[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const token = useRef(0);

  const reload = useCallback(async () => setDocs(await listPdfs()), []);
  useEffect(() => void reload(), [reload]);

  async function open(d: PdfDoc) {
    const mine = ++token.current;
    setOpenId(d.id);
    setPages([]);
    setPage(1);
    setError("");
    setQuery("");
    setProgress("Reading…");
    try {
      const out = await extractPages(d.blob, (done, total, soFar) => {
        if (mine !== token.current) return;
        setPages(soFar);
        setProgress(done < total ? `Reading page ${done} of ${total}…` : "");
      });
      if (mine === token.current) {
        setPages(out);
        setProgress("");
      }
    } catch (e) {
      if (mine === token.current) {
        setProgress("");
        setError(e instanceof Error ? `Could not read this PDF: ${e.message}` : "Could not read this PDF.");
      }
    }
  }

  async function onFile(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
      showToast("Please choose a PDF file.", "error");
      return;
    }
    const d = await addPdf(f);
    await reload();
    void open(d);
  }

  const q = query.trim().toLowerCase();
  const hits = q ? pages.map((t, i) => (t.toLowerCase().includes(q) ? i + 1 : 0)).filter(Boolean) : [];
  const current = pages[page - 1] ?? "";
  const hasAnyText = pages.some((p) => p.length > 0);
  const openDoc = docs.find((d) => d.id === openId);

  return (
    <div>
      <label className="btn-primary pg-file">
        + Add PDF
        <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => void onFile(e.target.files)} />
      </label>
      <span className="pg-muted"> Stays on this device.</span>

      {docs.length > 0 && (
        <ul className="pg-list">
          {docs.map((d) => (
            <li key={d.id} className={`pg-row ${d.id === openId ? "pg-active" : ""}`}>
              <button type="button" className="pg-link pg-grow" onClick={() => void open(d)}>
                {d.name}
              </button>
              <span className="pg-muted">{(d.size / 1024 / 1024).toFixed(1)} MB</span>
              <button
                type="button"
                className="btn-icon"
                aria-label="Delete PDF"
                onClick={async () => {
                  if (!(await confirmDelete({ kind: "PDF", name: d.name }))) return;
                  await deletePdf(d.id);
                  if (d.id === openId) {
                    token.current++;
                    setOpenId(null);
                    setPages([]);
                  }
                  await reload();
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {openDoc && (
        <section className="pg-card">
          <div className="pg-actions">
            <button type="button" className="btn-secondary btn-small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ‹
            </button>
            <span>
              Page {page} / {pages.length || "…"}
            </span>
            <button type="button" className="btn-secondary btn-small" disabled={page >= pages.length} onClick={() => setPage(page + 1)}>
              ›
            </button>
            <ReadAloudButton text={() => current} label="Read page" />
            <button type="button" className="btn-secondary btn-small" disabled={!current} onClick={() => void copyToClipboard(current)}>
              Copy page
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              disabled={!current}
              onClick={async () => {
                await createResource({ category: "notes", title: `${openDoc.name} p.${page}`, body: current, tags: ["cat:PDF"] });
                showToast("Saved as a note", "success");
              }}
            >
              → Note
            </button>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this PDF…" />
          {q && (
            <p className="pg-muted">
              {hits.length === 0 ? "No matches." : "Found on pages: "}
              {hits.slice(0, 30).map((h) => (
                <button key={h} type="button" className="chip" onClick={() => setPage(h)}>
                  {h}
                </button>
              ))}
            </p>
          )}
          {progress && <p className="pg-muted">{progress}</p>}
          {error && <p className="pg-error">{error}</p>}
          {!progress && !error && pages.length > 0 && !hasAnyText && <p className="pg-muted">No selectable text found. This PDF may be scanned images; Panga does not do OCR yet.</p>}
          {current ? <p className="pg-body pg-pdf-text">{current}</p> : !progress && hasAnyText && <p className="pg-muted">No text on this page.</p>}
        </section>
      )}
    </div>
  );
}
