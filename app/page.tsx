export default function Home() {
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-sm text-gray-500">Hours this week</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-sm text-gray-500">Hours this month</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-sm text-gray-500">All-time hours</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm p-4">
          <div className="text-sm text-gray-500">Journal entries</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
      </section>
      <section className="rounded-2xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Recent activity</h2>
        <p className="text-gray-500 text-sm">No activity yet. Create a project to get started.</p>
      </section>
    </main>
  );
}
