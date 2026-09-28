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
      <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
      <p className="mt-2 text-sm text-stone-600">
        Recruiters and interviewers you have linked to applications.
      </p>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search contacts"
          className="input max-w-sm"
          aria-label="Search contacts"
        />
      </form>
      {contacts.length === 0 ? (
        <section className="card mt-8 border-dashed p-8">
          <h2 className="font-medium">No contacts yet</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add recruiters and interviewers from an application.
          </p>
        </section>
      ) : (
        <ul className="card mt-8 divide-y divide-border overflow-hidden">
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
