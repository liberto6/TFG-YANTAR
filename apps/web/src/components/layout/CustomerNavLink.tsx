"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CustomerNavLinkProps {
  href: string;
  children: ReactNode;
}

export function CustomerNavLink({ href, children }: CustomerNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : undefined}
      className={cn(
        "link-underline relative rounded-md px-3 py-2 text-body-sm font-medium",
        "transition-colors duration-150 ease-out-expo",
        "text-primary-foreground/85 hover:text-primary-foreground",
        isActive && "text-primary-foreground",
      )}
    >
      {children}
    </Link>
  );
}
