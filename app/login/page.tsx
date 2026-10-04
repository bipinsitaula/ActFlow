"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Workflow } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getSession, useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = mode === "in" ? await signIn(email, password) : await signUp(name, email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      toast(res.error, "error");
      return;
    }
    const who = getSession()?.name.split(" ")[0] ?? "";
    toast(mode === "in" ? `Logged in. Welcome back, ${who}.` : `Account created. Welcome, ${who}.`, "success");
    // on success the session changes and AuthGate redirects to the dashboard
  }

  return (
    <div className="mx-auto flex min-h-[520px] max-w-sm flex-col justify-center">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <Workflow aria-hidden className="h-6 w-6" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          {mode === "in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {mode === "in" ? "Pick up where you left off." : "Turn “I should” into “I did”."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "up" && (
          <label className="relative block">
            <span className="sr-only">Name</span>
            <User aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className={field} placeholder="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label className="relative block">
          <span className="sr-only">Email</span>
          <Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={field} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="relative block">
          <span className="sr-only">Password</span>
          <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={field}
            type={show ? "text" : "password"}
            placeholder={mode === "up" ? "Password (8+ characters)" : "Password"}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            {show ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
          </button>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-4 font-semibold text-white shadow-lg transition-all hover:bg-slate-900 active:scale-[0.98]",
            busy && "opacity-60",
          )}
        >
          {busy ? "Please wait..." : mode === "in" ? "Sign in" : "Create account"}
          {!busy && <ArrowRight aria-hidden className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "in" ? "New to ActFlow?" : "Already have an account?"}{" "}
        <button
          className="font-semibold text-indigo-600 hover:underline"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
          }}
        >
          {mode === "in" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-8 text-center text-xs text-slate-400">
        Accounts and data are stored only in this browser.
      </p>
    </div>
  );
}
