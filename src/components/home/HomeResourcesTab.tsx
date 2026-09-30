import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllResources,
  createResource,
  updateResource,
  deleteResource,
  type Resource,
  type ResourceCategory,
  type ResourceImage,
  type ResourceFile,
  type ResourceListItem,
} from "../../data/resources";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";
import { copyToClipboard } from "../../components/ui";
import { newId } from "../../data/utils";

export default function HomeResourcesTab() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [projectList, setProjectList] = useState<{ id: string; name: string }[]>([]);

  // Filter & Search states
  const [filter, setFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all"); // "all" | "unlinked" | projectId
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [editing, setEditing] = useState<Resource | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(""); // "" = unlinked quick resource
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>("notes");
  const [tags, setTags] = useState("");
  const [provider, setProvider] = useState<"gemini" | "claude" | "gpt" | "other">("other");
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [imgLink, setImgLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  // Custom Categories state (global addition, accessible across all projects)
  const DEFAULT_CATEGORIES: { id: string; label: string }[] = [
    { id: "notes", label: "Notes" },
    { id: "scripts", label: "Scripts" },
    { id: "links", label: "Links" },
    { id: "images", label: "Images" },
    { id: "pdfs", label: "PDFs" },
    { id: "preset-list", label: "Preset List" },
  ];
  const [customCategories, setCustomCategories] = useState<{ id: string; label: string }[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [listItems, setListItems] = useState<ResourceListItem[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("panga-categories-global");
      if (stored) {
        setCustomCategories(JSON.parse(stored));
      }
    } catch {}
  }, []);

  function saveCustomCategories(cats: { id: string; label: string }[]) {
    setCustomCategories(cats);
    try {
      localStorage.setItem("panga-categories-global", JSON.stringify(cats));
    } catch {}
  }

  function handleAddCategory(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!id) return;
    const exists = DEFAULT_CATEGORIES.some((c) => c.id === id) || customCategories.some((c) => c.id === id);
    if (!exists) {
      const updated = [...customCategories, { id, label: name }];
      saveCustomCategories(updated);
    }
    setCategory(id);
    setNewCatName("");
    setShowAddCategory(false);
  }

  function handleRemoveCategory(catId: string) {
    if (!confirm(`Delete custom category "${CATEGORY_LABELS[catId] || catId}"? Existing items will remain.`)) return;
    const updated = customCategories.filter((c) => c.id !== catId);
    saveCustomCategories(updated);
    if (filter === catId) setFilter("all");
    if (category === catId) setCategory("notes");
  }

  const allCategories: { id: string; label: string }[] = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const CATEGORY_LABELS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {
      notes: "Notes",
      scripts: "Scripts",
      links: "Links",
      images: "Images",
      pdfs: "PDFs",
    };
    for (const c of customCategories) {
      map[c.id] = c.label;
    }
    return map;
  }, [customCategories]);

  async function refresh() {
    const [allResources, allProjs] = await Promise.all([
      listAllResources(),
      listAllProjects(),
    ]);
    setResources(allResources);
    const pMap: Record<string, string> = {};
    for (const p of allProjs) {
      pMap[p.id] = p.name;
    }
    setProjects(pMap);
    setProjectList(allProjs.map((p) => ({ id: p.id, name: p.name })));
  }

  useEffect(() => {
    refresh();
  }, []);

  function fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function resetForm() {
    setEditing(null);
    setTargetProjectId("");
    setTitle("");
    setBody("");
    setUrl("");
    setCategory("notes");
    setTags("");
    setProvider("other");
    setImages([]);
    setFiles([]);
    setImgLink("");
    setPdfLink("");
    setListItems([]);
    setCustomFields({});
    setNewFieldKey("");
    setNewFieldValue("");
    setUploadNote(null);
    setShowAddForm(false);
  }

  function openEdit(r: Resource) {
    setEditing(r);
    setTargetProjectId(r.projectId ?? "");
    setTitle(r.title || "");
    setBody(r.body ?? "");
    setUrl(r.url ?? "");
    setCategory(r.category);
    setTags((r.tags ?? []).join(", "));
    setProvider((r.provider as any) ?? "other");
    setImages(r.images ?? []);
    setFiles(r.files ?? []);
    setListItems(r.listItems ?? []);
    setCustomFields(r.customFields ?? {});
    setShowAddForm(true);
  }

  async function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const input: any = {
      projectId: targetProjectId ? targetProjectId : null,
      category: category as ResourceCategory,
      title: title.trim(),
      tags: parsedTags,
      body: body.trim() || null,
      listItems: listItems,
      customFields: editing ? (editing.customFields ?? {}) : {},
      files,
      images,
      url: url.trim() || null,
      provider: category === "links" ? provider : null,
    };

    if (editing) {
      await updateResource(editing.id, input);
    } else {
      await createResource(input);
    }

    resetForm();
    refresh();
  }

  // Filtered resources
  const filtered = useMemo(() => {
    let list = resources;

    // Filter by category
    if (filter !== "all") {
      list = list.filter((r) => r.category === filter);
    }

    // Filter by project linkage
    if (projectFilter === "unlinked") {
      list = list.filter((r) => !r.projectId);
    } else if (projectFilter !== "all") {
      list = list.filter((r) => r.projectId === projectFilter);
    }

    // Search query
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
  }, [resources, filter, projectFilter, searchQuery]);

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
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
          data-tip="Create a quick resource (tied to a project or untied for fast access)"
        >
          {showAddForm ? "Close form" : "+ Add quick resource"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{ fontSize: 13, padding: "5px 10px" }}
            data-tip="Filter resources by project or view untied quick items"
          >
            <option value="all">All Projects &amp; Quick Items</option>
            <option value="unlinked">Untied / Quick Resources Only</option>
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>
                Project: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add / Edit Resource Form */}
      {showAddForm && (
        <form className="resource-form" onSubmit={handleSaveResource} style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 700, width: "100%" }}>
            {editing ? "Edit resource" : "Add quick resource"}
          </h3>

          {/* Project linkage selector */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Project assignment</label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              data-tip="Choose whether this resource belongs to a project or is an untied standalone resource"
            >
              <option value="">No project (Untied / Quick standalone resource)</option>
              {projectList.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
            <span className="text-tiny" style={{ color: "var(--color-text-muted)", marginTop: 2 }}>
              {targetProjectId
                ? `Linked to project "${projects[targetProjectId]}". Also visible inside that project's Resources tab.`
                : "Not tied to any project — instantly accessible anytime right from Home."}
            </span>
          </div>

          {/* Category selection + Add Category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: "100%", marginBottom: 6 }}>
            <div className="field" style={{ flex: 1, minWidth: 200 }}>
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setShowAddCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
              >
                {allCategories.map((c: { id: string; label: string }) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
                <option value="__add_new__">+ Add new category...</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-secondary btn-small clickable"
              style={{ marginTop: 18 }}
              onClick={() => setShowAddCategory((s) => !s)}
              data-tip="Add a custom category globally accessible across all projects and Home"
            >
              {showAddCategory ? "Close" : "+ Add category"}
            </button>
          </div>

          {/* Global Category Manager Panel */}
          {showAddCategory && (
            <div className="subcategory-manager" style={{ marginTop: 4, marginBottom: 10, width: "100%" }}>
              <label style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}>
                Add Category (Global addition, accessible from any project)
              </label>
              <div className="inline-form" style={{ marginBottom: 6 }}>
                <input
                  type="text"
                  placeholder="Category name (e.g. Credentials, Design, Templates, Research)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button type="button" className="btn-primary clickable" onClick={() => handleAddCategory()}>
                  + Add Category
                </button>
                <button type="button" className="btn-secondary clickable" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </button>
              </div>
              {customCategories.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Custom categories:</span>
                  <div className="subcategory-list">
                    {customCategories.map((c) => (
                      <span key={c.id} className="subcategory-tag">
                        {c.label}
                        <button
                          type="button"
                          className="subcategory-remove clickable"
                          onClick={() => handleRemoveCategory(c.id)}
                          data-tip={`Delete ${c.label} category`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title Field */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Title</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder={category === "notes" ? "Note title..." : "Resource title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <MicButton onResult={(text) => setTitle(text)} />
            </div>
          </div>

          {/* Category-specific fields */}
          {category === "links" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>URL</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  data-tip="URL to open"
                />
                <select value={provider} onChange={(e) => setProvider(e.target.value as any)} data-tip="AI provider for chat links">
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                  <option value="gpt">GPT</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Body / Content Area */}
          {(category === "notes" || category === "scripts" || category === "links" || category === "pdfs" || !DEFAULT_CATEGORIES.some((c) => c.id === category)) && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>
                {category === "notes" ? "Note Body / Content" : "Body / Description / Content"}
              </label>
              <textarea
                placeholder={category === "notes" ? "Write note body, thoughts, quick info..." : "Description or details..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                data-tip="Resource body"
              />
              <div style={{ marginTop: 4 }}>
                <MicButton onResult={(text) => setBody((prev) => (prev ? prev + " " + text : text))} />
              </div>
             </div>
           )}

           {/* Preset List Items Editor */}
           {category === "preset-list" && (
             <div className="field" style={{ flexBasis: "100%" }}>
               <label>Preset List Items</label>
               {listItems.length === 0 ? (
                 <p className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                   No items yet. Add items below.
                 </p>
               ) : (
                 <ul style={{ listStyle: "none", padding: 0, margin: "8px 0", maxHeight: 200, overflowY: "auto" }}>
                   {listItems.map((item, idx) => (
                     <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                       <input
                         type="checkbox"
                         checked={item.checked}
                         onChange={(e) => {
                           const updated = [...listItems];
                           updated[idx] = { ...item, checked: e.target.checked };
                           setListItems(updated);
                         }}
                         data-tip="Check/uncheck this item"
                       />
                       <input
                         type="text"
                         value={item.text}
                         onChange={(e) => {
                           const updated = [...listItems];
                           updated[idx] = { ...item, text: e.target.value };
                           setListItems(updated);
                         }}
                         placeholder="Item text..."
                         style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                       />
                       <input
                         type="text"
                         value={item.tags?.join(", ") ?? ""}
                         onChange={(e) => {
                           const updated = [...listItems];
                           updated[idx] = { ...item, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) };
                           setListItems(updated);
                         }}
                         placeholder="tags"
                         style={{ width: 100, padding: "4px 8px", fontSize: 13 }}
                         data-tip="Tags for this item"
                       />
                       <button
                         type="button"
                         className="btn-icon clickable"
                         data-tip="Move up"
                         onClick={() => {
                           if (idx === 0) return;
                           const updated = [...listItems];
                           [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                           setListItems(updated);
                         }}
                       >
                         ↑
                       </button>
                       <button
                         type="button"
                         className="btn-icon clickable"
                         data-tip="Move down"
                         onClick={() => {
                           if (idx === listItems.length - 1) return;
                           const updated = [...listItems];
                           [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                           setListItems(updated);
                         }}
                       >
                         ↓
                       </button>
                       <button
                         type="button"
                         className="task-delete-btn"
                         data-tip="Delete this item"
                         onClick={() => setListItems(listItems.filter((_, i) => i !== idx))}
                       >
                         ×
                       </button>
                     </li>
                   ))}
                 </ul>
               )}
               <div className="inline-form">
                 <button
                   type="button"
                   className="btn-secondary btn-small clickable"
                   onClick={() => {
                     const newItem: ResourceListItem = { id: newId(), text: "", checked: false, tags: [] };
                     setListItems([...listItems, newItem]);
                   }}
                   data-tip="Add a new list item"
                 >
                   + Add item
                 </button>
                 <button
                   type="button"
                   className="btn-secondary btn-small clickable"
                   onClick={() => setListItems(listItems.map((i) => ({ ...i, checked: true })))}
                   data-tip="Check all items"
                 >
                   Check all
                 </button>
<button
                    type="button"
                    className="btn-secondary btn-small clickable"
                    onClick={() => setListItems(listItems.map((i) => ({ ...i, checked: false })))}
                    data-tip="Clear all checks"
                  >
                    Clear all
                  </button>
               </div>
            </div>
          )}

          {/* Custom Metadata Fields for non-default categories */}
          {!DEFAULT_CATEGORIES.some((c) => c.id === category) && category !== "preset-list" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>Custom Metadata Fields</label>
              {Object.keys(customFields).length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {Object.entries(customFields).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <input
                        type="text"
                        value={key}
                        readOnly
                        style={{ width: 120, padding: "4px 8px", fontSize: 13, background: "var(--color-bg-subtle)" }}
                      />
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setCustomFields({ ...customFields, [key]: e.target.value })}
                        placeholder="value..."
                        style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                      />
                      <button
                        type="button"
                        className="task-delete-btn"
                        data-tip="Remove field"
                        onClick={() => {
                          const next = { ...customFields };
                          delete next[key];
                          setCustomFields(next);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="inline-form">
                <input
                  type="text"
                  placeholder="Field name (e.g. price, vendor)"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  style={{ width: 140, padding: "4px 8px", fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                />
                <button
                  type="button"
                  className="btn-secondary btn-small clickable"
                  data-tip="Add a custom metadata field"
                  onClick={() => {
                    const k = newFieldKey.trim();
                    if (!k) return;
                    setCustomFields({ ...customFields, [k]: newFieldValue });
                    setNewFieldKey("");
                    setNewFieldValue("");
                  }}
                >
                  + Add field
                </button>
              </div>
            </div>
          )}

            {uploadNote && (
            <p className="otp-error" style={{ flexBasis: "100%", margin: "4px 0" }}>
              {uploadNote}
            </p>
          )}

          {/* Text file upload for notes/scripts/custom categories */}
          {(!editing && (category === "notes" || category === "scripts" || !DEFAULT_CATEGORIES.some((c) => c.id === category))) && (
            <div style={{ flexBasis: "100%", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              <span className="text-tiny" style={{ color: "var(--color-text-muted)" }}>
                Upload rule: Text documents only (.txt, .md). Contents are parsed into body — no files are stored.
              </span>
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadNote(null);
                  if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
                    setUploadNote("Word documents (.doc/.docx) cannot be parsed directly in the browser. Please save as .txt or .md first, or copy/paste the content.");
                    e.target.value = "";
                    return;
                  }
                  try {
                    const text = await fileToText(file);
                    setBody((prev) => (prev ? prev + "\n\n" + text : text));
                    if (!title.trim()) {
                      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
                    }
                  } catch {
                    setUploadNote("Failed to read text from file.");
                  }
                  e.target.value = "";
                }}
                data-tip="Upload .txt or .md files to parse into body"
              />
            </div>
          )}

          {/* Image link input */}
          {category === "images" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>Image link</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https:// (Google Drive share link)"
                  value={imgLink}
                  onChange={(e) => setImgLink(e.target.value)}
                  data-tip="Paste a link to the image (e.g. Google Drive share link)"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!imgLink.trim()) return;
                    setImages((prev) => [...prev, { link: imgLink.trim(), name: imgLink.trim(), alt: imgLink.trim() }]);
                    setImgLink("");
                  }}
                >
                  + Add link
                </button>
              </div>
            </div>
          )}

          {/* PDF link input */}
          {category === "pdfs" && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>PDF link</label>
              <div className="inline-form" style={{ marginBottom: 0 }}>
                <input
                  type="url"
                  placeholder="https:// (Google Drive share link)"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  data-tip="Paste a link to the PDF"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!pdfLink.trim()) return;
                    setFiles((prev) => [...prev, { name: pdfLink.trim(), link: pdfLink.trim() }]);
                    setPdfLink("");
                  }}
                >
                  + Add link
                </button>
              </div>
            </div>
          )}

          {/* Tags input */}
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="reference, urgent, personal, sprint-1"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 8 }}>
            <button type="submit" className="btn-primary clickable">
              {editing ? "Save changes" : "Save resource"}
            </button>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="inline-form" style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Filter resources by title, notes, url or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Filter resources"
          data-tip="Narrows the list below as you type"
        />
      </div>

      {/* Filter Chips (All + Categories) */}
      <div className="chip-row">
        <button
          className={`chip ${filter === "all" ? "chip-active" : ""}`}
          data-tip="Show all categories"
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {allCategories.map((c: { id: string; label: string }) => (
          <button
            key={c.id}
            className={`chip ${filter === c.id ? "chip-active" : ""}`}
            data-tip={`Show only ${c.label.toLowerCase()}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Resource List */}
      {filtered.length === 0 ? (
        <p className="empty-state">
          {resources.length === 0
            ? "No resources yet. Add your first quick note, link, or script above."
            : "No resources match this filter."}
        </p>
      ) : (
        <ul className="resource-list">
          {filtered.map((r) => {
            const label = CATEGORY_LABELS[r.category] || r.category;
            const projectName = r.projectId ? projects[r.projectId] : null;

            return (
              <li key={r.id} className="resource-item">
                <span
                  className="resource-category-dot"
                  style={{ backgroundColor: getCategoryColor(r.category) }}
                />
                <span className="resource-text">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span className="resource-title">{r.title || "(untitled)"}</span>
                    {projectName ? (
                      <Link
                        to={`/project/${r.projectId}?tab=Resources`}
                        className="chip-small"
                        data-tip="Open project resources"
                        style={{ textDecoration: "none", color: "var(--color-accent-primary)" }}
                      >
                        📁 {projectName}
                      </Link>
                    ) : (
                      <span className="chip-small" style={{ background: "#fef3c7", color: "#92400e" }}>
                        ⚡ Quick item
                      </span>
                    )}
                  </div>

                  {r.category === "links" && r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-value-link"
                      data-tip="Open link"
                    >
                      {r.url}
                    </a>
                  ) : null}

                   {r.body && (
                     <p className="resource-notes" style={{ whiteSpace: "pre-wrap" }}>
                       {r.body}
                     </p>
                   )}

                   {r.category === "preset-list" && r.listItems && r.listItems.length > 0 && (
                     <ul style={{ listStyle: "none", padding: 0, margin: "8px 0", fontSize: 13 }}>
                       {r.listItems.map((item) => (
                         <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                           <input type="checkbox" checked={item.checked} readOnly style={{ pointerEvents: "none" }} />
                           <span style={{ textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "var(--color-text-muted)" : "inherit" }}>
                             {item.text}
                           </span>
                         </li>
                       ))}
                     </ul>
                   )}

                   {r.images && r.images.length > 0 && (
                    <div className="resource-image-row">
                      {r.images.map((img, i) =>
                        img.link ? (
                          <a
                            key={i}
                            href={img.link}
                            target="_blank"
                            rel="noreferrer"
                            className="resource-image-link"
                            data-tip="Open image link"
                          >
                            <span className="thumb-link">{img.name || "Image link"}</span>
                          </a>
                        ) : null
                      )}
                    </div>
                  )}

                  {r.files && r.files.length > 0 && (
                    <div className="resource-image-row">
                      {r.files.map((f, i) => (
                        <a
                          key={i}
                          href={f.link || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="file-attachment"
                          data-tip="Open file link"
                        >
                          {f.name}
                        </a>
                      ))}
                    </div>
                  )}

                   <div style={{ marginTop: 4 }}>
                     <span className="chip-small">{label}</span>
                     {r.tags.map((t) => (
                       <span key={t} className="chip-small">
                         {t}
                       </span>
                     ))}
                     {r.customFields && Object.keys(r.customFields).length > 0 && (
                       Object.entries(r.customFields).map(([k, v]) => (
                         <span key={k} className="chip-small" data-tip={`${k}: ${v}`}>{k}: {v}</span>
                       ))
                     )}
                   </div>
                </span>

                 <button
                   className="btn-icon clickable"
                   data-tip="Edit resource"
                   onClick={() => openEdit(r)}
                 >
                   Edit
                 </button>
                 <button
                   className="btn-icon clickable"
                   data-tip="Copy resource title"
                   onClick={async () => { await copyToClipboard(r.title || ""); }}
                 >
                   📋 Title
                 </button>
                 <button
                   className="btn-icon clickable"
                   data-tip="Copy full resource text"
                   onClick={async () => {
                     const full = [r.title, r.body, r.url, ...(r.tags || [])].filter(Boolean).join("\n\n");
                     await copyToClipboard(full);
                   }}
                 >
                   📋 Full
                 </button>
                 <button
                   className="task-delete-btn"
                   data-tip="Delete resource"
                   onClick={async () => {
                     if (!confirm(`Delete resource "${r.title}"?`)) return;
                     await deleteResource(r.id);
                     refresh();
                   }}
                 >
                   ×
                 </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    notes: "#3b82f6",
    scripts: "#8b5cf6",
    links: "#22c55e",
    images: "#a855f7",
    pdfs: "#f59e0b",
    "preset-list": "#f59e0b",
  };
  if (colors[cat]) return colors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}
