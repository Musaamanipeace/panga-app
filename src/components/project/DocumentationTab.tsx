import { useState } from "react";
import {
  listDocEntries,
  createDocEntry,
  updateDocEntry,
  deleteDocEntry,
  fileToDataUrl,
  type AttachedFile,
} from "../../data/docs.tsx";
import type { DocEntry } from "../../data/db.tsx"
import MicButton from "../../components/MicButton.tsx"
import { Editable, ErrorNote, Loading, useAsync } from "../../components/ui.tsx"

export default function DocumentationTab({ projectId }: { projectId: string }) {
  const { data, error, loading, reload, setData } = useAsync(
    () => listDocEntries(projectId),
    [projectId]
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [error2, setError2] = useState<string | null>(null);

  async function refresh() {
    setData(await listDocEntries(projectId));
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() && files.length === 0) {
      setError2("Give the entry a title, attach a file, or both.");
      return;
    }
    setError2(null);
    await createDocEntry({
      projectId,
      type: "outline",
      title: title.trim() || files[0].name,
      content: body,
      file: files[0] ?? null,
    });
    setTitle("");
    setBody("");
    setFiles([]);
    await refresh();
  }

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading documentation..." />;

  return (
    <div>
      <form className="resource-form" onSubmit={addEntry}>
        <div className="field" style={{ flexBasis: "100%" }}>
          <div className="field-label">Title</div>
          <div className="inline-form" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="README, Rules, Wireframes, Design notes..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <MicButton onResult={setTitle} />
          </div>
        </div>
        <div className="field" style={{ flexBasis: "100%" }}>
          <div className="field-label">Text</div>
          <textarea
            placeholder="Write the context the assistant will read: structure, constraints, decisions."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
        </div>
        <div className="field">
          <div className="field-label">Attach a file</div>
          <input
            type="file"
            accept=".txt,.md,.json,.csv,.yaml,.yml,text/*"
            onChange={async (e) => {
              const picked = Array.from(e.target.files ?? []);
              e.target.value = "";
              try {
                const parsed = await Promise.all(picked.map(async (file) => ({
                  name: file.name,
                  type: file.type,
                  dataUrl: await fileToDataUrl(file),
                })));
                setFiles(parsed);
              } catch (err) {
                setError2(err instanceof Error ? err.message : "Could not read that file.");
              }
            }}
            data-tip="Attach a text file to this entry instead of typing"
          />
          {files.length > 0 && (
            <div className="row" style={{ marginTop: 4 }}>
              {files.map((f) => (
                <span key={f.name} className="file-attachment">
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn-primary" data-tip="Save this documentation entry">
          + Add entry
        </button>
        {error2 && <p className="form-error">{error2}</p>}
      </form>

      {(data?.length ?? 0) === 0 ? (
        <p className="empty-state">
          No documentation yet. Add entries above — this is the context the assistant
          reads when it works on this project.
        </p>
      ) : (
        <div className="doc-list">
          {data!.map((entry) => (
            <DocEntryCard key={entry.id} entry={entry} onChange={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocEntryCard({
  entry,
  onChange,
}: {
  entry: DocEntry;
  onChange: () => Promise<void>;
}) {
  return (
    <article className="doc-entry">
      <div className="doc-entry-header">
        <Editable
          className="doc-entry-title-input"
          value={entry.title}
          onSave={async (title) => {
            await updateDocEntry(entry.id, { title });
            await onChange();
          }}
          label="Rename entry"
        />
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteDocEntry(entry.id);
            await onChange();
          }}
          data-tip="Delete this entry"
          data-tip-edge="left"
        >
          Del
        </button>
      </div>

      {entry.file && (
        <a
          className="file-attachment"
          href={entry.file.dataUrl}
          download={entry.file.name}
          data-tip={`Download ${entry.file.name}`}
        >
          {entry.file.name}
        </a>
      )}

      <EditableBody entry={entry} onChange={onChange} />
    </article>
  );
}

function EditableBody({ entry, onChange }: { entry: DocEntry; onChange: () => Promise<void> }) {
  const [value, setValue] = useState(entry.content);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="stack-tight">
      <textarea
        value={value}
        rows={5}
        placeholder="Write here..."
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        onBlur={async () => {
          if (!dirty) return;
          setDirty(false);
          await updateDocEntry(entry.id, { content: value });
          await onChange();
        }}
      />
      <div className="row">
        <MicButton
          append
          onResult={(text) => setValue((v) => (v ? `${v} ${text}` : text))}
        />
        {dirty && <span className="text-tiny faint">Unsaved — click away to save</span>}
      </div>
    </div>
  );
}
