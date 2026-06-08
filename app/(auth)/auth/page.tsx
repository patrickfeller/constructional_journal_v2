"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function AuthForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl,
    });
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
        />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--accent)] hover:opacity-90 disabled:opacity-60 text-[var(--on-accent)] font-semibold px-4 py-2 w-fit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-[var(--ink-2)] text-sm mt-3">
        Hint: demo@example.com / demo1234 (from seed)
      </p>
      <div className="text-sm mt-4">
        New here? <a href="/register" className="text-[var(--accent-deep)] hover:underline">Create an account</a>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <div className="text-[var(--ink-2)] text-sm">Loading...</div>
      </main>
    }>
      <AuthForm />
    </Suspense>
  );
}


