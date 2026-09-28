import { useState } from "react";
import { useAsync } from "../../components/ui.tsx";
import { listInsights, createInsight, updateInsight, deleteInsight, type InsightType } from "../../data/insights.ts";
import { ErrorNote, Loading, StatusLabel, Editable } from "../../components/ui.tsx";
import MicButton from "../../components/MicButton.tsx";

const INSIGHT_TYPES: { value: InsightType; label: string; placeholder: string }[] = [
  { value: "note", label: "Note", placeholder: "Write your insight..." },
  { value: "link", label: "Link", placeholder: "https://..." },
  { value: "image", label: "Image", placeholder: "https://... (Google Drive share link)" },
  { value: "pdf", label: "PDF", placeholder: "https://... (Google Drive share link)" },
];

const TYPE_HINTS: Record<InsightType, string> = {
  note: "Plain text note — type or paste text, or upload a .txt file",
  link: "A URL to any resource — the link is stored, not the content",
  image: "A Google Drive (or any) image link — the link is stored, not the file",
  pdf: "A Google Drive (or any) PDF link — use the helper below to extract text if needed",
};

const PDF_HELPER_URL = "https://www.ilovepdf.com/pdf_to_text";

export default function InsightsTab({ projectId }: { projectId: string }) {
  const insights = useAsync(() => listInsights(projectId), [projectId]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "note" as InsightType,
    link: "",
    tags: "",
  });

  if (insights.error) return <ErrorNote error={insights.error} onRetry={insights.reload} />;
  if (insights.loading) return <Loading label="Loading insights..." />;

  function resetForm() {
    setFormData({ title: "", body: "", type: "note", link: "", tags: "" });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const data = {
      title: formData.title.trim(),
      body: formData.type === "note" ? formData.body.trim() : null,
      type: formData.type,
      link: formData.type !== "note" ? formData.link.trim() : null,
      tags,
    };

    if (editingId) {
      await updateInsight(editingId, data);
    } else {
      await createInsight({ projectId, ...data });
    }
    resetForm();
    insights.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this insight?")) return;
    await deleteInsight(id);
    insights.reload();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/plain") {
      alert("Only .txt files can be uploaded. Please paste text or convert your file to plain text first.");
      return;
    }
    const text = await file.text();
    setFormData((prev) => ({
      ...prev,
      body: prev.body ? prev.body + "\n\n" + text : text,
      title: prev.title || file.name.replace(/\.txt$/i, ""),
    }));
    e.target.value = "";
  }

  return (
    <div className="insights-tab">
      <div className="section-header-row">
        <h2 className="section-heading">Insights</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={() => { setShowForm(true); setEditingId(null); }}
          data-tip="Add a new insight (note, link, image, or PDF link)"
        >
          + Add insight
        </button>
      </div>

      {showForm && (
        <form className="insight-form" onSubmit={handleSubmit}>
          <div className="field" style={{ flexBasis: "100%" }}>
            <div className="field-label">Title</div>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                autoFocus
                type="text"
                placeholder="What is this about?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <MicButton onResult={(text) => setFormData({ ...formData, title: text })} />
            </div>
          </div>

          <div className="field">
            <div className="field-label">Type</div>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as InsightType })}
              data-tip="Note = plain text. Link/Image/PDF = store a text link to the resource."
            >
              {INSIGHT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {formData.type === "note" ? (
            <div className="field" style={{ flexBasis: "100%" }}>
              <div className="field-label">Text</div>
              <textarea
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your insight, notes, or paste text here..."
              />
              <div className="field" style={{ marginTop: 8 }}>
                <div className="field-label">Or upload a text file</div>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  data-tip="Upload a .txt file — its contents will be parsed and added to the text above"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="field" style={{ flexBasis: "100%" }}>
                <div className="field-label">
                  {formData.type === "link" ? "URL" : formData.type === "image" ? "Image link" : "PDF link"}
                </div>
                <input
                  type="url"
                  placeholder={INSIGHT_TYPES.find((t) => t.value === formData.type)?.placeholder}
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  data-tip={TYPE_HINTS[formData.type]}
                />
              </div>

              {formData.type === "pdf" && (
                <div className="form-note" style={{ marginTop: 4 }}>
                  <span data-tip="Convert PDF to plain text, then paste the result">
                    💡 Need plain text from a PDF? Use a free converter like{" "}
                    <a href={PDF_HELPER_URL} target="_blank" rel="noreferrer">
                      ilovepdf.com/pdf_to_text
                    </a>
                    <span data-tip="1. Upload your PDF. 2. Download the extracted text. 3. Paste it here as a 'note' insight."> — upload, convert, download text, then add as a Note</span>
                  </span>
                </div>
              )}
            </>
          )}

          <div className="field">
            <div className="field-label">Tags (comma separated)</div>
            <input
              type="text"
              placeholder="research, important, follow-up"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              data-tip="Free-form labels for filtering"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" data-tip="Save this insight">
              {editingId ? "Save changes" : "+ Add insight"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetForm}
              data-tip="Cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {insights.data!.length === 0 && !showForm ? (
        <p className="empty-state">
          No insights yet. Click <strong>+ Add insight</strong> to save a note, link, image reference, or PDF link.
          <br />
          <span className="faint">Insights are your personal notes — not generated analytics. Add anything you want to remember.</span>
        </p>
      ) : (
        <ul className="item-list">
          {insights.data!.map((insight) => (
            <li key={insight.id} className={`item insight-${insight.type}`}>
              <span className={`mark insight-mark mark-${insight.type}`} data-tip={insight.type} />
              <span className="item-body">
                <Editable
                  className="item-title"
                  value={insight.title}
                  onSave={async (title) => {
                    await updateInsight(insight.id, { title });
                    insights.reload();
                  }}
                  label="Rename insight"
                />
                <span className="item-meta">
                  <StatusLabel status={insight.type} className={`chip-${insight.type}`} />
                  {insight.tags.map((t) => (
                    <StatusLabel key={t} status={t} />
                  ))}
                </span>
                <div className="insight-content">
                  {insight.type === "note" && insight.body && (
                    <p className="item-note">{insight.body}</p>
                  )}
                  {insight.type !== "note" && insight.link && (
                    <a
                      href={insight.link}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-link"
                      data-tip={`Open ${insight.type}`}
                    >
                      {insight.link}
                    </a>
                  )}
                </div>
              </span>
              <span className="item-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => {
                    setFormData({
                      title: insight.title,
                      body: insight.body ?? "",
                      type: insight.type,
                      link: insight.link ?? "",
                      tags: insight.tags.join(", "),
                    });
                    setEditingId(insight.id);
                    setShowForm(true);
                  }}
                  data-tip="Edit this insight"
                  data-tip-edge="left"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  onClick={() => handleDelete(insight.id)}
                  data-tip="Delete this insight"
                  data-tip-edge="left"
                >
                  Del
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}