import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  listAllContacts,
  updateContact,
  deleteContact,
  contactHref,
  CONTACT_TYPE_LABELS,
  linkedProjectIds,
  type Contact,
} from "../../data/contacts.tsx";
import { Editable, ErrorNote, Loading, StatusLabel, useAsync } from "../../components/ui.tsx"

export default function HomeContactsTab() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "email" | "phone" | "social">("all");
  const { data, error, loading, reload, setData } = useAsync(listAllContacts, []);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (type !== "all") list = list.filter((c) => c.contactType === type);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.value ?? "").toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, query, type]);

  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (loading) return <Loading label="Loading contacts..." />;

  async function rename(id: string, name: string) {
    await updateContact(id, { title: name });
    setData(await listAllContacts());
  }

  async function remove(contact: Contact) {
    await deleteContact(contact.id);
    setData(await listAllContacts());
  }

  return (
    <div>
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
           {(["all", "email", "phone", "social"] as const).map((t) => (
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
            ? "No contacts yet. Contacts are added from a project's Contacts tab, and every one of them shows up here."
            : "No contacts match this filter."}
        </p>
      ) : (
        <ul className="item-list">
          {filtered.map((contact) => {
            const href = contactHref(contact);
            const ct = contact.contactType ?? "email";
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
                    value={contact.title}
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
