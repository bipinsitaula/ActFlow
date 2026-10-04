import {
  Brain,
  FileText,
  GitFork,
  Globe,
  ListChecks,
  MapPin,
  Monitor,
  PlayCircle,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Mode, Resource, StepKind } from "@/types";

export const MODE_ICON: Record<Mode, LucideIcon> = {
  focus: Target,
  coordinate: Users,
  navigate: ListChecks,
  decide: GitFork,
};

export const KIND_META: Record<StepKind, { icon: LucideIcon; label: string }> = {
  physical: { icon: MapPin, label: "In person" },
  digital: { icon: Monitor, label: "Online" },
  people: { icon: Users, label: "Someone else" },
  mental: { icon: Brain, label: "Think / study" },
};

export const RESOURCE_ICON: Record<Resource["kind"], LucideIcon> = {
  location: MapPin,
  learn: FileText,
  video: PlayCircle,
  link: Globe,
};
