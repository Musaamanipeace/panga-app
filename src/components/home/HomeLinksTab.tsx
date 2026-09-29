import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllLinks,
  createResource,
  updateResource,
  deleteResource,
  type Resource,
  type ResourceProvider,
} from "../../data/resources";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";

export default function HomeLinksTab() {
  const [links, setLinks] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [filter, setFilter] = useState<"all" | "standalone" | "project">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(""); // "" = standalone unlinked
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [provider, setProvider] = useState<ResourceProvider>("other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [allLinks, allProjs] = await Promise.all([
      listAllLinks(),
      listAllProjects(),
    ]);
    setLinks(allLinks);
    const pMap: Record<string, string> = {};
    for (const p of allProjs) {
      pMap[p.id] = p.name;
    }
    setProjects(pMap);
    setProjectList(allProjs.map((p) => ({ id: p.id, name: p.name })));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function normalizeUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return "https://" + trimmed;
    }
    return trimmed;
  }

  function resetForm() {
    setEditingId(null);
    setTargetProjectId("");
    setTitle("");
    setUrl("");
    setDescription("");
    setTags("");
    setProvider("other");
    setShowAddForm(false);
    setError(null);
  }

  function startEdit(link: Resource) {
    setEditingId(link.id);
    setTargetProjectId(link.projectId || "");
    setTitle(link.title);
    setUrl(link.url || "");
    setDescription(link.body || "");
    setTags((link.tags || []).join(", "));
    setProvider(link.provider || "other");
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) {
      setError("Please enter a valid link URL.");
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      try {
        const parsed = new URL(finalUrl);
        finalTitle = parsed.hostname.replace(/^www\./, "");
      } catch {
        finalTitle = finalUrl;
      }
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateResource(editingId, {
          title: finalTitle,
          url: finalUrl,
          body: description.trim() || null,
          projectId: targetProjectId || null,
          tags: tagList,
          provider: provider || "other",
        });
      } else {
        await createResource({
          category: "links",
          title: finalTitle,
          url: finalUrl,
          body: description.trim() || null,
          projectId: targetProjectId || null,
          tags: tagList,
          provider: provider || "other",
        });
      }
      resetForm();
      await refresh();
    } catch (err: any) {
      console.error("Failed to save link:", err);
      setError(err?.message || "Could not save the link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, linkTitle: string) {
    if (!confirm(`Delete link "${linkTitle}"?`)) return;
    await deleteResource(id);
    if (editingId === id) resetForm();
    await refresh();
  }

  function handleCopy(id: string, linkUrl: string) {
    navigator.clipboard?.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  // Filtered links
  const filtered = useMemo(() => {
    let list = links;

    // Filter by linkage (all vs standalone vs project)
    if (filter === "standalone") {
      list = list.filter((r) => !r.projectId);
    } else if (filter === "project") {
      list = list.filter((r) => Boolean(r.projectId));
    }

    // Filter by specific project
    if (selectedProjectId !== "all") {
      list = list.filter((r) => r.projectId === selectedProjectId);
    }

    // Filter by provider
    if (providerFilter !== "all") {
      list = list.filter((r) => r.provider === providerFilter);
    }

    // Search query across title, URL, description (body), tags
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          (r.body ?? "").toLowerCase().includes(q) ||
          (r.url ?? "").toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [links, filter, selectedProjectId, providerFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: links.length,
      standalone: links.filter((l) => !l.projectId).length,
      project: links.filter((l) => Boolean(l.projectId)).length,
    };
  }, [links]);

  return (
    <div className="home-links-tab">
      {/* Top Header & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <button
            type="button"
            className="btn-primary clickable"
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }}
            data-tip="Add a link with a title and description — standalone at Home or tied to a project"
          >
            {showAddForm ? "✕ Close form" : "+ Add link"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {projectList.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (e.target.value !== "all") setFilter("project");
              }}
              style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
              data-tip="Filter links by specific project"
            >
              <option value="all">All Projects</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--radius-sm)" }}
            data-tip="Filter by AI or link type"
          >
            <option value="all">All Link Types</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="gpt">GPT</option>
            <option value="other">Web &amp; Other</option>
          </select>
        </div>
      </div>

      {/* Add / Edit Link Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="stack"
          style={{
            background: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            padding: "16px",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              {editingId ? "Edit link" : "Add a new link"}
            </h3>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {targetProjectId ? "Project-associated link" : "⚡ Standalone link at Home (No project required)"}
            </span>
          </div>

          {/* Project selector — defaults to Standalone */}
          <div>
            <label htmlFor="link-target-project" style={{ fontSize: "13px", fontWeight: 600 }}>
              Project association
            </label>
            <select
              id="link-target-project"
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            >
              <option value="">⚡ None — Standalone / Quick Link (at Home)</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 Associate with: {p.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginTop: "3px" }}>
              Leave as "None" to keep this link as a personal, cross-project standalone link accessible at Home.
            </span>
          </div>

          {/* URL & Link Type */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <label htmlFor="link-url-input" style={{ fontSize: "13px", fontWeight: 600 }}>
                Link URL <span style={{ color: "var(--color-accent-issue)" }}>*</span>
              </label>
              <input
                id="link-url-input"
                type="text"
                autoFocus
                placeholder="https://example.com or paste any URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
            </div>

            <div style={{ minWidth: "160px" }}>
              <label htmlFor="link-provider-select" style={{ fontSize: "13px", fontWeight: 600 }}>
                Link type / Provider
              </label>
              <select
                id="link-provider-select"
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              >
                <option value="other">🌐 Web Link / Bookmark</option>
                <option value="gemini">✨ Gemini Chat / Link</option>
                <option value="claude">🤖 Claude Chat</option>
                <option value="gpt">🟢 ChatGPT Link</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="link-title-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Title
            </label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                id="link-title-input"
                type="text"
                placeholder="e.g. Next.js App Router Documentation, Competitor Analysis..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
              />
              <MicButton onResult={(text) => setTitle(text)} />
            </div>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "block", marginTop: "3px" }}>
              Give the link a human-friendly name. If left blank, the website domain is used.
            </span>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="link-description-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Description &amp; Notes
            </label>
            <textarea
              id="link-description-input"
              rows={3}
              placeholder="What is this link about? Add notes, key insights, reminders, or why you saved it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            />
            <div style={{ marginTop: "4px" }}>
              <MicButton onResult={(text) => setDescription((prev) => (prev ? prev + " " + text : text))} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="link-tags-input" style={{ fontSize: "13px", fontWeight: 600 }}>
              Tags <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(comma-separated, optional)</span>
            </label>
            <input
              id="link-tags-input"
              type="text"
              placeholder="research, docs, design, tools, reading"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary clickable"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Save link"}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <input
            type="search"
            placeholder="Search links by title, url, description, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontSize: "14px",
            }}
          />
        </div>

        <div className="chip-row" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`chip ${filter === "all" ? "chip-active" : ""}`}
            onClick={() => { setFilter("all"); setSelectedProjectId("all"); }}
            data-tip="Show all links"
          >
            All Links ({counts.all})
          </button>
          <button
            type="button"
            className={`chip ${filter === "standalone" ? "chip-active" : ""}`}
            onClick={() => setFilter("standalone")}
            data-tip="Show standalone quick links not tied to any project"
          >
            ⚡ Standalone ({counts.standalone})
          </button>
          <button
            type="button"
            className={`chip ${filter === "project" ? "chip-active" : ""}`}
            onClick={() => setFilter("project")}
            data-tip="Show links tied to projects"
          >
            📁 Project Links ({counts.project})
          </button>
        </div>
      </div>

      {/* Links List */}
      {loading ? (
        <p className="empty-state">Loading links...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "32px 16px" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔗</div>
          <p style={{ margin: "0 0 12px 0", fontWeight: 500 }}>
            {links.length === 0
              ? "No links saved yet. Add your first standalone link above!"
              : "No links match this filter or search query."}
          </p>
          <button
            type="button"
            className="btn-primary btn-small clickable"
            onClick={() => setShowAddForm(true)}
          >
            + Add your first link
          </button>
        </div>
      ) : (
        <ul className="item-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtered.map((link) => {
            const projectName = link.projectId ? projects[link.projectId] : null;
            const isCopied = copiedId === link.id;

            return (
              <li
                key={link.id}
                className="item"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "white",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  padding: "14px",
                  marginBottom: "10px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "var(--transition)",
                }}
              >
                {/* Header row: Icon + Title + Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "16px" }} aria-hidden="true">
                      {link.provider === "gemini"
                        ? "✨"
                        : link.provider === "claude"
                        ? "🤖"
                        : link.provider === "gpt"
                        ? "🟢"
                        : "🔗"}
                    </span>
                    <a
                      href={link.url || "#"}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "var(--color-accent-primary)",
                        textDecoration: "none",
                        wordBreak: "break-word",
                      }}
                      className="clickable"
                      data-tip="Click to open link in a new tab"
                    >
                      {link.title || link.url} ↗
                    </a>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => link.url && handleCopy(link.id, link.url)}
                      data-tip="Copy link URL"
                    >
                      {isCopied ? "✓ Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small clickable"
                      onClick={() => startEdit(link)}
                      data-tip="Edit title, URL, description, or project"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-icon clickable"
                      onClick={() => handleDelete(link.id, link.title)}
                      data-tip="Delete link"
                      style={{ color: "var(--color-accent-issue)" }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* URL preview */}
                {link.url && (
                  <div style={{ marginTop: "2px", marginBottom: "6px" }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{
                        fontSize: "12px",
                        color: "var(--color-text-muted)",
                        textDecoration: "none",
                        wordBreak: "break-all",
                      }}
                    >
                      {link.url}
                    </a>
                  </div>
                )}

                {/* Description Body */}
                {link.body && (
                  <div
                    style={{
                      background: "var(--color-bg-subtle)",
                      borderLeft: "3px solid var(--color-accent-primary)",
                      padding: "8px 12px",
                      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      color: "var(--color-text)",
                      margin: "6px 0 8px 0",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {link.body}
                  </div>
                )}

                {/* Meta badges: Project or Standalone, Provider, Tags */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
                  {projectName ? (
                    <Link
                      to={`/project/${link.projectId}?tab=Resources`}
                      className="chip-small"
                      style={{
                        textDecoration: "none",
                        color: "var(--color-accent-primary)",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        margin: 0,
                      }}
                      data-tip="Open associated project"
                    >
                      📁 {projectName}
                    </Link>
                  ) : (
                    <span
                      className="chip-small"
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                        margin: 0,
                        fontWeight: 600,
                      }}
                      data-tip="Standalone link at Home (not tied to any project)"
                    >
                      ⚡ Standalone
                    </span>
                  )}

                  {link.provider && link.provider !== "other" && (
                    <span
                      className="chip-small"
                      style={{
                        textTransform: "capitalize",
                        background: "#ede9fe",
                        color: "#5b21b6",
                        border: "1px solid #ddd6fe",
                        margin: 0,
                      }}
                    >
                      {link.provider}
                    </span>
                  )}

                  {link.tags &&
                    link.tags.map((tag) => (
                      <span
                        key={tag}
                        className="chip-small"
                        style={{ margin: 0, background: "var(--color-bg-subtle)" }}
                      >
                        #{tag}
                      </span>
                    ))}

                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {new Date(link.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
