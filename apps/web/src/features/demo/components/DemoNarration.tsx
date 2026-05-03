"use client";

import type { ComponentType } from "react";
import type { DemoRole } from "../hooks/use-demo-step";
import {
  GraduationCap,
  Headset,
  Smartphone,
  Store,
  UserCog,
} from "lucide-react";

const ROLE_LABEL: Record<DemoRole, string> = {
  visitor: "Visitante del SaaS",
  admin: "Restauradora",
  operator: "Cocinero",
  customer: "Comensal",
};

type IconType = ComponentType<{ size?: number | string }>;

const ROLE_ICON: Record<DemoRole, IconType> = {
  visitor: GraduationCap as IconType,
  admin: UserCog as IconType,
  operator: Headset as IconType,
  customer: Smartphone as IconType,
};

const ROLE_COLOR: Record<DemoRole, string> = {
  visitor: "bg-muted text-muted-foreground",
  admin: "bg-primary/10 text-primary",
  operator: "bg-accent/15 text-accent",
  customer: "bg-success/15 text-success",
};

export function DemoNarration({
  role,
  title,
  narration,
}: {
  role: DemoRole;
  title: string;
  narration: string;
}) {
  const Icon = ROLE_ICON[role];
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${ROLE_COLOR[role]}`}
          aria-hidden
        >
          <Icon size={16} />
        </span>
        <span className="text-caption uppercase tracking-wider text-muted-foreground">
          {ROLE_LABEL[role]}
        </span>
      </div>
      <h2 className="text-h2 text-foreground">{title}</h2>
      <p className="text-body text-muted-foreground">{narration}</p>
    </div>
  );
}

export { Store as ChapterIcon }; // re-export por si lo usamos en sidebar
