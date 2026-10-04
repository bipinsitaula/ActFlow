import { ArrowUpRight } from "lucide-react";
import { RESOURCE_ICON } from "@/components/ui/icons";
import { resourceHost, resourceUrl } from "@/lib/utils/links";
import type { Resource } from "@/types";

const LABEL: Record<Resource["kind"], string> = {
  location: "Where to go",
  learn: "Learn it",
  video: "Watch",
  link: "Open",
};

export function ResourceList({ resources }: { resources?: Resource[] }) {
  if (!resources?.length) return null;
  return (
    <ul className="space-y-2">
      {resources.map((r) => {
        const Icon = RESOURCE_ICON[r.kind];
        return (
          <li key={`${r.kind}-${r.query}`}>
            <a
              href={resourceUrl(r)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold text-slate-800">{r.title}</span>
                <span className="block truncate text-xs text-slate-500">
                  {LABEL[r.kind]} · {resourceHost(r)}
                  {r.note ? ` · ${r.note}` : ""}
                </span>
              </span>
              <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
