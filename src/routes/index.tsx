import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Printer } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — Print Job Scheduler" },
      { name: "description", content: "Sign in to submit, track and manage your office print jobs." },
      { property: "og:title", content: "Sign In — Print Job Scheduler" },
      { property: "og:description", content: "Sign in to submit, track and manage your office print jobs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

const BULLETS = [
  "Priority-based queue ordering",
  "Cancel anytime before printing",
  "Live status for every job",
];

function SignIn() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const action = mode === "signin" ? signIn : signUp;
    const { error } = await action(email, password);

    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative flex flex-col justify-between bg-brand-gradient px-10 py-10 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Printer className="size-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Print Job Scheduler</span>
        </div>

        <div className="max-w-lg py-16">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Fair queues. Urgent jobs, handled first.
          </h1>
          <p className="mt-5 text-base text-white/75">
            Submit, track, and manage your office print jobs with transparent priority and instant
            cancellation.
          </p>
          <ul className="mt-8 space-y-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/15">
                  <Check className="size-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/45">Capstone Project 2026</p>
      </div>

      {/* Right panel */}
      <div className="relative flex flex-col bg-card px-6 py-8">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm rounded-xl border bg-card p-7 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Sign in" : "Create an account"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Print Job Scheduler — manage your office print queue.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" className="text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                }}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Already have an account?"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}