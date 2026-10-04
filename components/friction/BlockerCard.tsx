"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Blocker } from "@/lib/actions/next";

export function BlockerCard({
  blocker,
  onReminded,
}: {
  blocker: Blocker;
  onReminded: (intentionId: string, stepId: string, owner: string) => void;
}) {
  const { intention, step, owner, blocked } = blocker;
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const lastReminder = intention.reminders.filter((r) => r.stepId === step.id).at(-1);

  async function remind() {
    setBusy(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, task: step.title, project: intention.title, blocking: blocked.length }),
      });
      const data = (await res.json()) as { message: string };
      setMessage(data.message);
      toast(`Reminder drafted for ${owner}.`, "success");
      onReminded(intention.id, step.id, owner);
    } catch {
      toast("Couldn't draft the reminder. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast("Reminder copied to clipboard.", "success");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Copy was blocked. Select the text and copy it manually.", "warning");
    }
  }

  const ghostLink =
    "inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:bg-neutral-50";

  return (
    <div className="rise rounded-2xl bg-red-50/70 p-5 ring-1 ring-red-200 sm:p-6">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-red-700">
        <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
        Blocked
      </p>
      <Link href={`/intention/${intention.id}`} className="mt-3 block text-lg font-semibold hover:underline">
        {step.title}
      </Link>
      <p className="mt-0.5 text-sm text-muted">{intention.title}</p>

      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Waiting for</dt>
          <dd className="mt-0.5 font-semibold">{owner}</dd>
        </div>
        <div>
          <dt className="text-muted">Blocking</dt>
          <dd className="mt-0.5 font-semibold">
            {blocked.length} task{blocked.length === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>

      {message ? (
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-line">
          <p className="select-all text-sm leading-relaxed">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="dark" onClick={copy}>
              {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
              {copied ? "Copied" : "Copy message"}
            </Button>
            <a
              className={ghostLink}
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              className={ghostLink}
              href={`mailto:?subject=${encodeURIComponent(step.title)}&body=${encodeURIComponent(message)}`}
            >
              Email
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="danger" onClick={remind} disabled={busy}>
            <Send aria-hidden className="h-4 w-4" />
            {busy ? "Drafting..." : "Send reminder"}
          </Button>
          {lastReminder && (
            <span className="text-xs text-muted">
              Last nudged {new Date(lastReminder.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
