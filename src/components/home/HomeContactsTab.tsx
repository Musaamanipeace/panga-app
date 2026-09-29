import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllContacts,
  createContact,
  updateContact,
  deleteContact,
  contactHref,
  CONTACT_TYPE_LABELS,
  linkedProjectIds,
  type Contact,
} from "../../data/contacts";
import { listAllProjects } from "../../data/projects";
import MicButton from "../../components/MicButton";
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

export default function HomeContactsTab() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "email" | "phone" | "link">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"email" | "phone" | "link">("email");
  const [newValue, setNewValue] = useState("");
  const [newTags, setNewTags] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const { data, error, loading, reload, setData } = useAsync(listAllContacts, []);

  useEffect(() => {
    listAllProjects().then((projs) => {
      setProjects(projs.map((p) => ({ id: p.id, name: p.name })));
    });
  }, []);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (type !== "all") list = list.filter((c) => c.type === type);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.value ?? "").toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query, type]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading contacts..." />;

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newValue.trim()) return;
    await createContact({
      name: newName.trim(),
      type: newType,
      value: newValue.trim(),
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      linkedProjectIds: selectedProjectId ? [selectedProjectId] : [],
    });
    setNewName("");
    setNewValue("");
    setNewTags("");
    setSelectedProjectId("");
    setShowAddForm(false);
    setData(await listAllContacts());
  }

  async function rename(id: string, name: string) {
    await updateContact(id, { name });
    setData(await listAllContacts());
  }

  async function remove(contact: Contact) {
    if (!confirm(`Delete contact "${contact.name}"?`)) return;
    await deleteContact(contact.id);
    setData(await listAllContacts());
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          type="button"
          className="btn-primary clickable"
          onClick={() => setShowAddForm((s) => !s)}
          data-tip="Add a new contact"
        >
          {showAddForm ? "Close contact form" : "+ Add contact"}
        </button>
      </div>

      {showAddForm && (
        <form className="resource-form" onSubmit={handleAddContact} style={{ marginBottom: 16 }}>
          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Contact name</label>
            <div className="inline-form" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Person or organisation name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
              <MicButton onResult={setNewName} />
            </div>
          </div>

          <div className="field">
            <label>Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "email" | "phone" | "link")}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>
              {newType === "email" && "Email address"}
              {newType === "phone" && "Phone number"}
              {newType === "link" && "URL / Link"}
            </label>
            <input
              type={newType === "link" ? "url" : newType === "email" ? "email" : "tel"}
              placeholder={newType === "link" ? "https://..." : newType === "email" ? "you@example.com" : "+1 (555) 000-0000"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Link to project (optional)</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">No project (General contact)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flexBasis: "100%" }}>
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="work, client, urgent, contractor"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button type="submit" className="btn-primary clickable">
              Save contact
            </button>
            <button
              type="button"
              className="btn-secondary clickable"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="inline-form">
        <input
          type="search"
          placeholder="Filter by name, value or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter contacts"
          data-tip="Narrows the list below as you type"
        />
        <div className="chip-row" style={{ marginBottom: 0 }}>
          {(["all", "email", "phone", "link"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${type === t ? "chip-active" : ""}`}
              onClick={() => setType(t)}
              data-tip={t === "all" ? "Show every contact type" : `Show only ${CONTACT_TYPE_LABELS[t]} contacts`}
              aria-pressed={type === t}
            >
              {t === "all" ? "All" : CONTACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {(data?.length ?? 0) === 0
            ? "No contacts yet. Add your first contact above."
            : "No contacts match this filter."}
        </p>
      ) : (
        <ul className="item-list">
          {filtered.map((contact) => {
            const href = contactHref(contact);
            const ct = contact.type;
            return (
              <li key={contact.id} className="item">
                <span
                  className={`mark mark-contact mark-contact-${ct}`}
                  data-tip={CONTACT_TYPE_LABELS[ct]}
                  aria-label={CONTACT_TYPE_LABELS[ct]}
                />
                <span className="item-body">
                  <Editable
                    className="item-title"
                    value={contact.name}
                    onSave={(name) => rename(contact.id, name)}
                    label="Rename contact"
                  />
                  <span className="item-meta">
                    <StatusLabel status={CONTACT_TYPE_LABELS[ct]} />
                    {href ? (
                      <a href={href} data-tip={ct === "email" ? "Compose an email" : "Open this link"}>
                        {contact.value}
                      </a>
                    ) : (
                      <span className="contact-value">{contact.value}</span>
                    )}
                    {contact.tags.map((tag) => (
                      <StatusLabel key={tag} status={tag} />
                    ))}
                    {linkedProjectIds(contact).length > 0 && (
                      <span className="text-tiny">
                        in {linkedProjectIds(contact).length} project(s)
                      </span>
                    )}
                  </span>
                </span>
                <span className="item-actions">
                  {linkedProjectIds(contact)[0] && (
                    <Link
                      to={`/project/${linkedProjectIds(contact)[0]}?tab=Contacts`}
                      className="btn-icon"
                      data-tip="Open the project this contact is linked to"
                      data-tip-edge="left"
                    >
                      Project
                    </Link>
                  )}
                  <button
                    type="button"
                    className="btn-icon btn-icon-danger"
                    onClick={() => remove(contact)}
                    data-tip="Delete this contact"
                    data-tip-edge="left"
                  >
                    Del
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
