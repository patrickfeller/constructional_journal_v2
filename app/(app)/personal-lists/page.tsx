import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PersonalPersonForm } from "./PersonalPersonForm";
import { PersonalCompanyForm } from "./PersonalCompanyForm";
import { PersonalPersonEditForm } from "./PersonalPersonEditForm";
import { PersonalCompanyEditForm } from "./PersonalCompanyEditForm";
import { DeletePersonalPersonButton } from "./DeletePersonalPersonButton";
import { DeletePersonalCompanyButton } from "./DeletePersonalCompanyButton";

export default async function PersonalListsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return <div>Please log in to view your personal lists.</div>;
  }

  const [personalPeople, personalCompanies] = await Promise.all([
    db.personalPerson.findMany({ 
      where: { userId },
      include: { 
        defaultCompany: true,
        projectEntries: {
          select: {
            id: true,
            project: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { name: "asc" } 
    }),
    db.personalCompany.findMany({ 
      where: { userId },
      include: {
        people: true,
        projectEntries: {
          select: {
            id: true,
            project: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { name: "asc" } 
    }),
  ]);

  // Convert Decimal objects to regular numbers for client components
  const personalPeopleWithNumbers = personalPeople.map(person => ({
    ...person,
    hourlyRate: person.hourlyRate ? Number(person.hourlyRate) : null,
    defaultCompany: person.defaultCompany ? {
      ...person.defaultCompany,
      hourlyRateDefault: person.defaultCompany.hourlyRateDefault ? Number(person.defaultCompany.hourlyRateDefault) : null
    } : null,
    // projectEntries now only contains id and project info, no Decimal fields
    projectEntries: person.projectEntries
  }));

  const personalCompaniesWithNumbers = personalCompanies.map(company => ({
    ...company,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null,
    people: company.people.map(person => ({
      ...person,
      hourlyRate: person.hourlyRate ? Number(person.hourlyRate) : null
    })),
    // projectEntries now only contains id and project info, no Decimal fields
    projectEntries: company.projectEntries
  }));

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Personal Masterlists</h1>
        <p className="text-muted-foreground">
          Manage your personal roster of people and companies. You can transfer these to your projects when needed.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal People Section */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <h2 className="font-medium mb-2">Add Person</h2>
            <PersonalPersonForm companies={personalCompaniesWithNumbers} />
          </section>
          
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <h2 className="font-medium mb-4">My People ({personalPeopleWithNumbers.length})</h2>
            <div className="space-y-3">
              {personalPeopleWithNumbers.map((person) => (
                <div key={person.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {person.defaultCompany?.name ?? "No company"}
                        {person.hourlyRate && ` • $${person.hourlyRate}/hr`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PersonalPersonEditForm person={person} companies={personalCompaniesWithNumbers} />
                      <DeletePersonalPersonButton personId={person.id} personName={person.name} />
                    </div>
                  </div>
                  
                  {person.notes && (
                    <p className="text-sm text-muted-foreground mb-2">{person.notes}</p>
                  )}
                  
                  {person.projectEntries.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Used in: {person.projectEntries.filter(entry => entry.project).map(entry => entry.project!.name).join(", ")}
                    </div>
                  )}
                </div>
              ))}
              {personalPeopleWithNumbers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No people in your personal list yet. Add some to get started!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Personal Companies Section */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <h2 className="font-medium mb-2">Add Company</h2>
            <PersonalCompanyForm />
          </section>
          
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <h2 className="font-medium mb-4">My Companies ({personalCompaniesWithNumbers.length})</h2>
            <div className="space-y-3">
              {personalCompaniesWithNumbers.map((company) => (
                <div key={company.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.people.length} people
                        {company.hourlyRateDefault && ` • Default: $${company.hourlyRateDefault}/hr`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PersonalCompanyEditForm company={company} />
                      <DeletePersonalCompanyButton 
                        companyId={company.id} 
                        companyName={company.name}
                        peopleCount={company.people.length}
                      />
                    </div>
                  </div>
                  
                  {company.address && (
                    <div className="text-sm text-muted-foreground mb-1">{company.address}</div>
                  )}
                  
                  {company.notes && (
                    <p className="text-sm text-muted-foreground mb-2">{company.notes}</p>
                  )}
                  
                  {company.projectEntries.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Used in: {company.projectEntries.filter(entry => entry.project).map(entry => entry.project!.name).join(", ")}
                    </div>
                  )}
                </div>
              ))}
              {personalCompaniesWithNumbers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No companies in your personal list yet. Add some to get started!
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
