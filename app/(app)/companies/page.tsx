import { db } from "@/lib/db";
import { createCompany, deleteCompany } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CompanyEditForm } from "./CompanyEditForm";
import { CompanyForm } from "./CompanyForm";
import { DeleteCompanyButton } from "./DeleteCompanyButton";

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [companies, peopleByCompany] = await Promise.all([
    db.company.findMany({ where: userId ? { userId } : undefined, orderBy: { name: "asc" } }),
    db.person.groupBy({ by: ["companyId"], _count: { _all: true } }),
  ]);
  
  // Convert Decimal objects to regular numbers for client components
  const companiesWithNumbers = companies.map(company => ({
    ...company,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null
  }));
  
  const countMap = new Map<string, number>(
    peopleByCompany
      .filter((g) => g.companyId)
      .map((g) => [g.companyId as string, g._count._all])
  );

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Add company</h2>
        <CompanyForm />
      </section>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Company list</h2>
        <ul className="divide-y divide-border">
          {companiesWithNumbers.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {typeof c.hourlyRateDefault === "number"
                      ? `Default rate: ${c.hourlyRateDefault}`
                      : "No default rate"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">{countMap.get(c.id) ?? 0} people</div>
                  <div className="flex gap-2">
                    <CompanyEditForm company={c} />
                    <DeleteCompanyButton 
                      companyId={c.id} 
                      companyName={c.name} 
                      peopleCount={countMap.get(c.id) ?? 0} 
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


