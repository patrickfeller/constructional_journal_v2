import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkProjectPermissions } from "@/lib/project-permissions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface CompanyDetailPageProps {
  params: Promise<{ id: string; companyId: string }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams.id;
  const companyId = resolvedParams.companyId;
  
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    redirect('/auth');
  }
  
  // Check permissions first
  const permissions = await checkProjectPermissions(userId, projectId);
  
  if (!permissions.canView) {
    notFound();
  }
  
  // Get project details for breadcrumb
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { name: true }
  });
  
  if (!project) {
    notFound();
  }
  
  // Get company details (scoped to project)
  const company = await db.company.findFirst({
    where: { 
      id: companyId, 
      projectId: projectId 
    },
    include: {
      addedByUser: {
        select: { id: true, name: true }
      }
    }
  });
  
  if (!company) {
    notFound();
  }
  
  // Get time entries and expenses for this company in this project
  const [timeEntries, expenses] = await Promise.all([
    db.timeEntry.findMany({
      where: { 
        projectId: projectId,
        person: {
          companyId: companyId
        }
      },
      include: { 
        person: { select: { name: true } },
        owner: { select: { name: true, id: true } }
      },
      orderBy: { date: 'desc' }
    }),
    db.expense.findMany({
      where: { 
        projectId: projectId,
        OR: [
          { companyId: companyId },
          { company: company.name }
        ]
      },
      include: { 
        createdBy: { select: { name: true, id: true } }
      },
      orderBy: { date: 'desc' }
    })
  ]);
  
  // Convert Decimal fields to numbers for display
  const companyWithNumbers = {
    ...company,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null
  };
  
  // Calculate summary statistics
  const totalTimeMinutes = timeEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const totalTimeHours = Math.floor(totalTimeMinutes / 60);
  const remainingMinutes = totalTimeMinutes % 60;
  
  // Calculate total cost (time × hourly rate)
  const totalTimeHoursDecimal = totalTimeMinutes / 60;
  const totalCost = companyWithNumbers.hourlyRateDefault 
    ? totalTimeHoursDecimal * companyWithNumbers.hourlyRateDefault 
    : 0;
  
  const totalExpenseAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  
  const expensesWithNumbers = expenses.map(expense => ({
    ...expense,
    amount: Number(expense.amount)
  }));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>→</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">{project.name}</Link>
          <span>→</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">Companies</Link>
          <span>→</span>
          <span>{company.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            {companyWithNumbers.hourlyRateDefault && (
              <p className="text-muted-foreground">
                Default rate: {formatCurrency(companyWithNumbers.hourlyRateDefault)}/hr
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              permissions.role === 'OWNER' ? 'bg-green-100 text-green-800' :
              permissions.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {permissions.role}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
          <h3 className="font-medium mb-2">Time Entries</h3>
          <div className="text-2xl font-semibold">
            {totalTimeHours > 0 ? `${totalTimeHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
          </div>
          <div className="text-sm text-muted-foreground">
            {timeEntries.length} {timeEntries.length === 1 ? 'entry' : 'entries'}
          </div>
          {companyWithNumbers.hourlyRateDefault && totalCost > 0 && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              Total cost: {formatCurrency(totalCost)}
            </div>
          )}
        </div>
        
        <div className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
          <h3 className="font-medium mb-2">Expenses</h3>
          <div className="text-2xl font-semibold">
            {formatCurrency(totalExpenseAmount)}
          </div>
          <div className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </div>
        </div>
      </div>

      {/* Time Entries Section */}
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-4">
          Time Entries ({timeEntries.length})
        </h2>
        {timeEntries.length > 0 ? (
          <ul className="divide-y divide-border">
            {timeEntries.map((entry) => (
              <li key={entry.id} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">
                      {formatDuration(entry.durationMinutes)}
                      {entry.person && ` — ${entry.person.name}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                      {entry.owner && entry.owner.id !== userId && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          by {entry.owner.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {entry.notes && (
                  <div className="text-sm text-muted-foreground">{entry.notes}</div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No time entries for this company yet
          </div>
        )}
      </section>

      {/* Expenses Section */}
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-4">
          Expenses ({expenses.length})
        </h2>
        {expenses.length > 0 ? (
          <ul className="divide-y divide-border">
            {expensesWithNumbers.map((expense) => (
              <li key={expense.id} className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-lg">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                      {expense.createdBy && expense.createdBy.id !== userId && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          by {expense.createdBy.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mt-1">{expense.description}</div>
                    {expense.invoiceUrl && (
                      <div className="mt-2">
                        <a
                          href={expense.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Invoice
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No expenses for this company yet
          </div>
        )}
      </section>
    </main>
  );
}
