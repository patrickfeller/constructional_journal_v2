import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseEditForm } from "./ExpenseEditForm";
import { DeleteExpenseButton } from "./DeleteExpenseButton";
import { getUserAccessibleProjects } from "@/lib/project-permissions";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Get all projects user has access to (owned + shared)
  const accessibleProjects = await getUserAccessibleProjects(userId);
  const accessibleProjectIds = accessibleProjects.map(p => p.id);

  // Build where clause for expenses
  const expenseWhereClause = {
    OR: [
      { userId }, // User's own expenses
      { projectId: { in: accessibleProjectIds } } // Expenses in accessible projects
    ]
  };

  // Get companies from all accessible projects
  const companiesWhereClause = userId ? {
    OR: [
      { userId }, // User's legacy personal companies (if any still exist)
      { projectId: { in: accessibleProjectIds } } // Companies in accessible projects
    ]
  } : undefined;

  const [projects, companiesRaw, expensesRaw] = await Promise.all([
    // Return accessible projects with role information
    Promise.resolve(accessibleProjects),
    db.company.findMany({
      where: userId ? companiesWhereClause : undefined,
      orderBy: { name: "asc" },
    }),
    db.expense.findMany({
      where: userId ? expenseWhereClause : undefined,
      include: {
        project: true,
        createdBy: { select: { name: true, id: true } },
      },
      orderBy: { date: "desc" },
    }) as any,
  ]);

  // Convert Decimal fields to numbers for client components
  const companies = companiesRaw.map(company => ({
    id: company.id,
    name: company.name,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null,
  }));

  const expenses = expensesRaw.map((expense: any) => ({
    ...expense,
    amount: Number(expense.amount),
  }));

  const today = new Date().toISOString().slice(0, 10);

  const formatCurrency = (amount: any) => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(num);
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Expenses</h1>
      
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="font-medium mb-2">Add New Expense</h2>
        <ExpenseForm projects={projects} companies={companies} today={today} />
      </section>

      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Recent Expenses</h2>
        <ul className="divide-y divide-border">
          {expenses.map((expense: any) => (
            <li key={expense.id} className="py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-lg">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      — {expense.company}
                    </span>
                  </div>
                  <div className="font-medium">
                    {expense.project.name}
                    {expense.createdBy && expense.createdBy.id !== userId && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm font-normal">
                        by {expense.createdBy.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString()}
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
                <div className="flex gap-2 flex-shrink-0">
                  <ExpenseEditForm
                    expense={expense}
                    projects={projects}
                    companies={companies}
                  />
                  <DeleteExpenseButton
                    expenseId={expense.id}
                    description={expense.description}
                    amount={Number(expense.amount)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

