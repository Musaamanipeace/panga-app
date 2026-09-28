import { useState } from "react";
import {
  listAllContacts,
  createContact,
  updateContact,
  toggleContactProject,
  deleteContact,
  CONTACT_TYPE_LABELS,
  contactHref,
  linkedProjectIds,
  type Contact,
} from "../../data/contacts";
import MicButton from "../../components/MicButton";
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui";

export default function ContactsTab({ projectId }: { projectId: string }) {
  const contacts = useAsync(() => listAllContacts(), []);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "email" | "phone" | "link">("all");

  const shown = (contacts.data ?? []).filter((c) => {
    if (type !== "all" && c.type !== type) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.value ?? "").toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const linked = shown.filter((c) => linkedProjectIds(c).includes(projectId));
  const unlinked = shown.filter((c) => !linkedProjectIds(c).includes(projectId));

  if (contacts.error) return <ErrorNote error={contacts.error} onRetry={contacts.reload} />;

  return (
    <div>
      <AddContactForm projectId={projectId} onCreated={contacts.reload} />

      <div className="inline-form">
        <input
          type="search"
          placeholder="Filter by name, value or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-tip="Narrows the list as you type"
        />
        <div className="chip-row" style={{ marginBottom: 0 }}>
          {(["all", "email", "phone", "link"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${type === t ? "chip-active" : ""}`}
              onClick={() => setType(t)}
              data-tip={t === "all" ? "All contact types" : `Only ${CONTACT_TYPE_LABELS[t]}`}
              aria-pressed={type === t}
            >
              {t === "all" ? "All" : CONTACT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {contacts.loading ? (
        <Loading label="Loading contacts..." />
      ) : linked.length > 0 ? (
        <section className="dashboard-section">
          <h3 className="section-heading">Linked to this project</h3>
          <ul className="item-list">
            {linked.map((c) => (
              <ContactRow
                key={c.id}
                contact={c}
                linked={true}
                projectId={projectId}
                onChange={contacts.reload}
              />
            ))}
          </ul>
        </section>
      ) : (
        <p className="empty-state">
          No contacts linked to this project. Add one above, or link an existing
          contact from the Home Contacts tab.
        </p>
      )}

      {unlinked.length > 0 && (
        <section className="dashboard-section">
          <h3 className="section-heading">Available contacts</h3>
          <ul className="item-list">
            {unlinked.map((c) => (
              <ContactRow
                key={c.id}
                contact={c}
                linked={false}
                projectId={projectId}
                onChange={contacts.reload}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ContactRow({
  contact,
  linked,
  projectId,
  onChange,
}: {
  contact: Contact;
  linked: boolean;
  projectId: string;
  onChange: () => Promise<void>;
}) {
  const href = contactHref(contact);
  const ct = contact.type;

  return (
    <li className="item item-row-wrap">
      <span className={`mark mark-contact mark-contact-${ct}`} data-tip={CONTACT_TYPE_LABELS[ct]} />
      <span className="item-body">
        <Editable
          className="item-title"
          value={contact.name}
          onSave={async (name) => {
            await updateContact(contact.id, { name });
            await onChange();
          }}
          label="Rename contact"
        />
        <span className="item-meta">
          <StatusLabel status={CONTACT_TYPE_LABELS[ct]} />
          {href ? (
            <a href={href} data-tip={ct === "email" ? "Compose email" : "Open link"}>
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
        <button
          type="button"
          className={`btn-secondary btn-small ${linked ? "btn-primary" : ""}`}
          onClick={async () => {
            await toggleContactProject(contact.id, projectId);
            await onChange();
          }}
          data-tip={linked ? "Unlink from this project" : "Link to this project"}
          data-tip-edge="left"
        >
          {linked ? "Unlink" : "Link"}
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-danger"
          onClick={async () => {
            await deleteContact(contact.id);
            await onChange();
          }}
          data-tip="Delete this contact everywhere"
          data-tip-edge="left"
        >
          Del
        </button>
      </span>
    </li>
  );
}

function AddContactForm({ projectId, onCreated }: { projectId: string; onCreated: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"email" | "phone" | "link">("email");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("");

  return (
    <form
      className="resource-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim() || !value.trim()) return;
        await createContact({
          name: name.trim(),
          type,
          value: value.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          linkedProjectIds: [projectId],
        });
        setName("");
        setValue("");
        setTags("");
        await onCreated();
      }}
    >
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">New contact</div>
        <div className="inline-form" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Person or organisation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <MicButton onResult={setName} />
        </div>
      </div>
      <div className="field">
        <div className="field-label">Type</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "email" | "phone" | "link")}
          data-tip="Changes the field below and how the value is displayed"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="link">Link</option>
        </select>
      </div>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">
          {type === "email" && "Email address"}
          {type === "phone" && "Phone number"}
          {type === "link" && "URL"}
        </div>
        <input
          type={type === "link" ? "url" : type === "email" ? "email" : "tel"}
          placeholder={type === "link" ? "https://..." : type === "email" ? "Email address" : "Phone number"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="field" style={{ flexBasis: "100%" }}>
        <div className="field-label">Tags (comma separated)</div>
        <input
          type="text"
          placeholder="work, client, urgent"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" data-tip="Create and link this contact">
        + Add contact
      </button>
    </form>
  );
}