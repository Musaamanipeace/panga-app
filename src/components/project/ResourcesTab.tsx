import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  type LinkProvider,
  type Resource,
  type ResourceCategory,
  type ResourceProvider,
} from "../../data/db.ts";
import {
  listResourcesForProject,
  createResource,
  updateResource,
  deleteResource,
  validateLink,
  linkProviderFromUrl,
  PROVIDER_LABELS,
} from "../../data/resources.ts";
import {
  listSubcategories,
  createSubcategory,
  renameSubcategory,
  restoreSubcategory,
  restoreCategoryDefaults,
  deleteSubcategory,
  isRenamedFromDefault,
} from "../../data/subcategories.ts";
import { createSecret, decryptSecret, isVaultUnlocked } from "../../data/secrets.ts"
import { fileToDataUrl } from "../../data/docs.ts"
import { pickAndUploadToDrive, isDriveReady } from "../../sync/googleDrive.ts"
import MicButton from "../../components/MicButton.tsx"
import { Disclosure, Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui.tsx"

export default function ResourcesTab({ projectId }: { projectId: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") as ResourceCategory | null;
  const category = RESOURCE_CATEGORIES.includes(categoryParam as ResourceCategory)
    ? (categoryParam as ResourceCategory)
    : "notes";

  const resources = useAsync(() => listResourcesForProject(projectId), [projectId]);
  const subcategories = useAsync(() => listSubcategories(category), [category]);

  const shown = useMemo(
    () => (resources.data ?? []).filter((r) => r.category === category),
    [resources.data, category]
  );

  function setCategory(next: ResourceCategory) {
    setSearchParams({ category: next }, { replace: true });
  }

  if (resources.error) return <ErrorNote error={resources.error} onRetry={resources.reload} />;

  return (
    <div>
      <div className="chip-row">
        {RESOURCE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? "chip-active" : ""}`}
            onClick={() => setCategory(c)}
            data-tip={CATEGORY_HINTS[c]}
            aria-pressed={category === c}
          >
            {RESOURCE_CATEGORY_LABELS[c]}
            <span className="tab-btn-count">
              {(resources.data ?? []).filter((r) => r.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <SubcategoryBar
        projectId={projectId}
        category={category}
        subs={subcategories.data ?? []}
        onChange={subcategories.reload}
      />

      <ResourceForm
        key={category}
        projectId={projectId}
        category={category}
        onCreated={resources.reload}
      />

      {resources.loading ? (
        <Loading label="Loading resources..." />
      ) : shown.length === 0 ? (
        <p className="empty-state">
          No {RESOURCE_CATEGORY_LABELS[category].toLowerCase()} in this project yet.
          {CATEGORY_EMPTY[category]}
        </p>
      ) : (
        <ul className="item-list">
          {shown.map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              subcategoryName={(subcategories.data ?? []).find((s) => s.id === r.subcategory)?.name}
              onChange={resources.reload}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const CATEGORY_HINTS: Record<ResourceCategory, string> = {
  notes: "Plain text notes and attached text files, for context",
  scripts: "Plain text scripts and code snippets",
  prompts: "Prompt templates for the assistant",
  ai_chat_links: "Direct links to AI chat sessions",
  reports_memos: "Structured reports and memos",
  links: "Bookmarks, AI chat links and multi-tab groups",
  contacts: "People and organizations linked to this project",
  secrets: "Encrypted values — env vars, tokens, keys",
  images: "Google Drive images. Files are never stored locally.",
  pdfs: "Google Drive PDFs. Files are never stored locally.",
};

const CATEGORY_EMPTY: Record<ResourceCategory, string> = {
  notes: "",
  scripts: "",
  prompts: "",
  ai_chat_links: "",
  reports_memos: "",
  links: "",
  contacts: "",
  secrets: " Add one above; it is encrypted with your vault passphrase before it is stored.",
  images: " Use the upload button above to send a file to Drive.",
  pdfs: " Use the upload button above to send a file to Drive.",
};

/* ------------------------------------------------------------------ */
/* Subcategories                                                       */
/* ------------------------------------------------------------------ */

function SubcategoryBar({
  projectId,
  category,
  subs,
  onChange,
}: {
  projectId: string;
  category: ResourceCategory;
  subs: { id: string; name: string; isDefault: boolean }[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [_managing] = useState(false);

  return (
    <div className="subcategory-bar">
      <Disclosure
        label="Subcategories"
        count={subs.length}
        defaultOpen={false}
      >
        <div className="subcategory-manager">
          {subs.length === 0 && (
            <p className="text-small faint">No subcategories in this category yet.</p>
          )}
          {subs.map((sub) => (
            <div key={sub.id} className="subcategory-row">
              <span className="subcategory-name">{sub.name}</span>
              {isRenamedFromDefault(sub as never) && (
                <span className="subcategory-modified">renamed</span>
              )}
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  const next = window.prompt("Rename subcategory", sub.name);
                  if (next?.trim()) void renameSubcategory(sub.id, next).then(onChange);
                }}
                data-tip="Rename this subcategory"
                data-tip-edge="left"
              >
                Edit
              </button>
              {sub.isDefault ? (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => void restoreSubcategory(sub.id).then(onChange)}
                  data-tip="Restore the shipped name for this default"
                  data-tip-edge="left"
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-icon btn-icon-danger"
                  onClick={() => void deleteSubcategory(sub.id).then(onChange)}
                  data-tip="Delete this subcategory. Its resources are kept."
                  data-tip-edge="left"
                >
                  Del
                </button>
              )}
            </div>
          ))}

          <div className="subcategory-row">
            {adding ? (
              <>
                <input
                  type="text"
                  className="subcategory-rename"
                  autoFocus
                  value={name}
                  placeholder="New subcategory name"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key !== "Enter" || !name.trim()) return;
                    await createSubcategory(category, name);
                    setName("");
                    setAdding(false);
                    onChange();
                  }}
                />
                <button
                  type="button"
                  className="btn-primary btn-small"
                  onClick={async () => {
                    if (!name.trim()) return;
                    await createSubcategory(category, name);
                    setName("");
                    setAdding(false);
                    onChange();
                  }}
                  data-tip="Create this subcategory"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-small"
                  onClick={() => {
                    setAdding(false);
                    setName("");
                  }}
                  data-tip="Cancel"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => setAdding(true)}
                data-tip="Add a custom subcategory to this category"
              >
                + Subcategory
              </button>
            )}
            <button
              type="button"
              className="btn-secondary btn-small push-right"
              onClick={() => void restoreCategoryDefaults(category).then(onChange)}
              disabled={_managing}
              data-tip="Put every default subcategory of this category back to its shipped name"
            >
              Restore defaults
            </button>
          </div>
        </div>
      </Disclosure>
      <span className="text-tiny faint" style={{ marginLeft: 8 }}>
        {projectId ? "" : ""}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

function ResourceForm({
  projectId,
  category,
  onCreated,
}: {
  projectId: string;
  category: ResourceCategory;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [tags, setTags] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<LinkProvider>("other");
  const [extraUrls, setExtraUrls] = useState("");
  const [secret, setSecret] = useState("");
  const [file, setFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const subs = useAsync(() => listSubcategories(category), [category]);
  const isAiChat =
    category === "links" &&
    (subs.data ?? []).find((s) => s.id === subcategory)?.name === "AI Chats";
  const isBookmarkGroup =
    category === "links" &&
    (subs.data ?? []).find((s) => s.id === subcategory)?.name === "Multi-tab Bookmarks";

  function reset() {
    setTitle("");
    setSubcategory("");
    setTags("");
    setBody("");
    setUrl("");
    setExtraUrls("");
    setSecret("");
    setFile(null);
    setNotice(null);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (category === "links") {
        const check = await validateLink(url);
        if (!check.ok) {
          setError(check.error ?? "That URL cannot be saved.");
          return;
        }
        if (check.warning) setNotice(check.warning);
        await createResource({
          projectId,
          category,
          subcategory,
          title: title.trim() || url.trim(),
          tags: splitTags(tags),
          meta: {
            url: url.trim(),
            provider: isAiChat ? (provider === "other" ? linkProviderFromUrl(url) : provider) : null,
            extraUrls: isBookmarkGroup ? splitLines(extraUrls) : null,
          },
        });
      } else if (category === "secrets") {
        if (!isVaultUnlocked()) {
          setError("The vault is locked. Unlock it in Settings before saving a secret.");
          return;
        }
        if (!secret) {
          setError("Enter the value to encrypt.");
          return;
        }
        const cipher = await createSecret({
          projectId,
          title: title.trim() || "Secret",
          tags: splitTags(tags),
          value: secret,
        });
        await createResource({
          projectId,
          category,
          subcategory,
          title: title.trim() || "Secret",
          tags: splitTags(tags),
          meta: { cipher, body: null },
        });
      } else if (category === "images" || category === "pdfs") {
        if (!file) {
          setError("Choose a file to send to Drive first.");
          return;
        }
        const picked = await pickAndUploadToDrive(projectId, file, category);
        if (!picked) return;
        await createResource({
          projectId,
          category,
          subcategory,
          title: title.trim() || picked.name,
          tags: splitTags(tags),
          meta: {
            driveFileId: picked.fileId,
            driveFolderId: picked.folderId,
            driveWebViewLink: picked.webViewLink,
            driveMimeType: picked.mimeType,
          },
        });
      } else {
        await createResource({
          projectId,
          category,
          subcategory,
          title: title.trim() || "Untitled",
          tags: splitTags(tags),
          meta: { body, file },
        });
      }
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that resource.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="resource-form" onSubmit={submit}>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">Title</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder={titlePlaceholder(category)}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <MicButton onResult={setTitle} />
        </div>
      </div>

      {(subs.data?.length ?? 0) > 0 && (
        <div className="field">
          <div className="field-label">Subcategory</div>
          <select
            value={subcategory}
            onChange={(e) => {
              const id = e.target.value;
              setSubcategory(id);
              const sub = (subs.data ?? []).find((s) => s.id === id);
              if (sub?.name === "AI Chats" && !url) setProvider("other");
            }}
            data-tip="Narrow this down inside the category"
          >
            <option value="">Uncategorised</option>
            {(subs.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {category === "links" && (
        <>
          <div className="field" style={{ flexBasis: "100%" }}>
            <div className="field-label">URL</div>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-tip="Checked for a valid http or https format before it is saved"
            />
          </div>
          {isAiChat && (
            <div className="field">
              <div className="field-label">Provider</div>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as LinkProvider)}
                data-tip="Which chat this opens. It opens directly, it is not embedded."
              >
                {(Object.keys(PROVIDER_LABELS) as LinkProvider[]).map((p) => (
                  <option key={p} value={p}>
                    {PROVIDER_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isBookmarkGroup && (
            <div className="field" style={{ flexBasis: "100%" }}>
              <div className="field-label">Extra tabs (one per line)</div>
              <textarea
                rows={3}
                value={extraUrls}
                onChange={(e) => setExtraUrls(e.target.value)}
                placeholder={"https://example.com/a\nhttps://example.com/b"}
              />
            </div>
          )}
        </>
      )}

      {category === "secrets" && (
        <div className="field" style={{ flexBasis: "100%" }}>
          <div className="field-label">Value (encrypted with your passphrase)</div>
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            data-tip="Encrypted with AES-GCM before it touches IndexedDB"
          />
        </div>
      )}

      {(category === "images" || category === "pdfs") && (
        <div className="field" style={{ flexBasis: "100%" }}>
          <div className="field-label">Upload to Google Drive</div>
          <input
            type="file"
            accept={category === "images" ? "image/*" : "application/pdf"}
            onChange={async (e) => {
              const picked = e.target.files?.[0];
              e.target.value = "";
              if (!picked) return;
              if (!isDriveReady()) {
                setError("Google Drive is not connected. Add the keys in Settings first.");
                return;
              }
              try {
                // The base64 data URL is only a carrier for the bytes; Drive
                // is the only place the file itself is stored.
                const dataUrl = await fileToDataUrl(picked);
                setFile({ name: picked.name, type: picked.type, dataUrl });
                if (!title) setTitle(picked.name);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not read that file.");
              }
            }}
            data-tip="Sends the file to your Drive folder and stores only the link"
          />
        </div>
      )}

      {(category === "notes" || category === "scripts") && (
        <>
          <div className="field" style={{ flexBasis: "100%" }}>
            <div className="field-label">Text</div>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type the content..."
            />
          </div>
          <div className="field">
            <div className="field-label">Or attach a text file</div>
            <input
              type="file"
              accept=".txt,.md,.json,.csv,.sh,.js,.ts,.py,.yaml,.yml,text/*"
              onChange={async (e) => {
                const picked = e.target.files?.[0];
                e.target.value = "";
                if (!picked) return;
                try {
                  const dataUrl = await fileToDataUrl(picked);
                  setFile({ name: picked.name, type: picked.type, dataUrl });
                  if (!title) setTitle(picked.name);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not read that file.");
                }
              }}
              data-tip="Attach a text file instead of typing"
            />
          </div>
        </>
      )}

      <div className="field">
        <div className="field-label">Tags (comma separated)</div>
        <input
          type="text"
          placeholder="research, urgent"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          data-tip="Free-form labels for filtering and search"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={busy} data-tip="Save this resource">
        {busy ? "Saving..." : "+ Add resource"}
      </button>
      {(error || notice) && (
        <>
          {error && <p className="form-error">{error}</p>}
          {notice && <p className="form-note">{notice}</p>}
        </>
      )}
    </form>
  );
}

function titlePlaceholder(category: ResourceCategory): string {
  switch (category) {
    case "links":
      return "What is this link?";
    case "scripts":
      return "Script name";
    case "secrets":
      return "What is this secret for? e.g. DATABASE_URL";
    case "images":
      return "Image title";
    case "pdfs":
      return "Document title";
    default:
      return "Note title";
  }
}

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

function ResourceRow({
  resource,
  subcategoryName,
  onChange,
}: {
  resource: Resource;
  subcategoryName?: string;
  onChange: () => void;
}) {
  const meta = (resource.meta ?? {}) as Record<string, unknown>;
  const getMetaString = (key: string): string | undefined => {
    const val = meta[key];
    return typeof val === "string" ? val : undefined;
  };
  return (
    <li className={`item resource-${resource.category}`}>
      <span
        className={`mark resource-mark mark-${resource.category}`}
        data-tip={RESOURCE_CATEGORY_LABELS[resource.category]}
        aria-label={RESOURCE_CATEGORY_LABELS[resource.category]}
      />
      <span className="item-body">
        <Editable
          className="item-title"
          value={resource.title}
          onSave={async (title) => {
            await updateResource(resource.id, { title });
            onChange();
          }}
          label="Rename resource"
        />
        <span className="item-meta">
          <StatusLabel status={RESOURCE_CATEGORY_LABELS[resource.category]} />
          {subcategoryName && <StatusLabel status={subcategoryName} />}
          {resource.tags.map((t) => (
            <StatusLabel key={t} status={t} />
          ))}
        </span>
        <ResourceBody resource={resource} meta={meta} />
      </span>
      <span className="item-actions">
        {resource.category === "links" && getMetaString("url") && (
          <a
            href={getMetaString("url")!}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-small"
            data-tip="Open in a new tab"
            data-tip-edge="left"
          >
            Open
          </a>
        )}
        {(resource.category === "images" || resource.category === "pdfs") &&
          getMetaString("driveWebViewLink") && (
            <a
              href={getMetaString("driveWebViewLink")!}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary btn-small"
              data-tip="Open in Google Drive"
              data-tip-edge="left"
            >
              Drive
            </a>
          )}
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteResource(resource.id);
            onChange();
          }}
          data-tip="Delete this resource"
          data-tip-edge="left"
        >
          Del
        </button>
      </span>
    </li>
  );
}

function ResourceBody({
  resource,
  meta,
}: {
  resource: Resource;
  meta: Resource["meta"];
}) {
  if (resource.category === "secrets") {
    return <SecretValue resource={resource} />;
  }
  if (!meta) return null;

  // Helper to safely get string values from meta
  const getMetaString = (key: string): string | undefined => {
    const val = meta[key];
    return typeof val === "string" ? val : undefined;
  };
  const getMetaArray = (key: string): string[] | undefined => {
    const val = meta[key];
    return Array.isArray(val) ? val : undefined;
  };
  const getMetaBoolean = (key: string): boolean => {
    const val = meta[key];
    return typeof val === "boolean" ? val : false;
  };

  return (
    <>
      {getMetaString("url") && <span className="resource-url">{getMetaString("url")}</span>}
      {getMetaString("provider") && getMetaString("provider") !== "other" && (() => {
        const p = getMetaString("provider");
        return p && p !== "other" ? <span className="text-tiny muted">Opens {PROVIDER_LABELS[p as ResourceProvider]}</span> : null;
      })()}
      {getMetaArray("extraUrls") && getMetaArray("extraUrls")!.length > 0 && (
        <div className="chip-row" style={{ margin: "4px 0 0" }}>
          {getMetaArray("extraUrls")!.map((u) => (
            <a
              key={u}
              href={u}
              target="_blank"
              rel="noreferrer"
              className="chip"
              data-tip="Open this tab of the bookmark group"
            >
              {shorten(u)}
            </a>
          ))}
        </div>
      )}
      {resource.category === "images" && getMetaString("driveWebViewLink") && (
        <img
          className="drive-thumb"
          src={driveThumbnailUrl(getMetaString("driveFileId"))}
          alt={resource.title}
          data-tip="Stored in Google Drive, not in the browser"
        />
      )}
      {resource.category === "pdfs" && getMetaString("driveFileId") && (
        <span className="file-attachment" data-tip="Stored in Google Drive">
          {getMetaString("driveMimeType") ?? "PDF"} in Drive
        </span>
      )}
      {getMetaString("body") && <p className="item-note">{truncate(getMetaString("body")!, 400)}</p>}
      {getMetaBoolean("file") && (
        <a
          className="file-attachment"
          href={getMetaString("dataUrl")}
          download={getMetaString("name")}
          data-tip={`Download ${getMetaString("name")}`}
        >
          {getMetaString("name")}
        </a>
      )}
    </>
  );
}

function SecretValue({ resource }: { resource: Resource }) {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cipher = resource.meta?.cipher;

  if (!cipher) return <span className="text-tiny faint">No value stored.</span>;

  async function reveal() {
    setError(null);
    try {
      setValue(await decryptSecret(resource));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not decrypt.");
    }
  }

  return (
    <span className="stack-tight">
      <div className="row">
        <span className="resource-url">
          {value ?? "•".repeat(18)}
        </span>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={reveal}
          data-tip="Decrypt with the vault key for this session"
        >
          Reveal
        </button>
        {value !== null && (
          <button
            type="button"
            className="btn-icon"
            onClick={() => setValue(null)}
            data-tip="Hide the value again"
          >
            Hide
          </button>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function splitTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function splitLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function shorten(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return truncate(url, 30);
  }
}

function driveThumbnailUrl(fileId: string | null | undefined): string {
  if (!fileId) return "";
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w400`;
}
