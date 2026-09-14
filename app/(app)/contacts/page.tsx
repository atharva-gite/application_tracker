import { requireUser } from "@/server/authorization/require-user";
import { listContacts } from "@/server/services/contact-service";

export const metadata = { title: "Contacts" };

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const { contacts } = await listContacts(user.id, { page: 1, pageSize: 100, q });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search contacts"
          className="w-full max-w-sm rounded-md border border-border bg-white px-3 py-2 text-sm"
        />
      </form>
      {contacts.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-6">
          <h2 className="font-medium">No contacts yet</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add recruiters and interviewers from an application.
          </p>
        </section>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {contacts.map((contact) => (
            <li key={contact.id} className="p-4">
              <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-stone-600">
                    {[contact.role, contact.company?.name, contact.email]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {contact.linkedinUrl ? (
                    <a
                      href={contact.linkedinUrl}
                      className="mt-1 inline-block text-sm text-accent hover:underline"
                    >
                      LinkedIn
                    </a>
                  ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
