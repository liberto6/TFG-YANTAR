"use client";

import { useEffect, useState } from "react";
import { Coffee, Moon, Sun, Sunset, type LucideIcon } from "lucide-react";

interface Greeting {
  text: string;
  Icon: LucideIcon;
  iconClass: string;
}

function greetingFor(hour: number, name: string | null): Greeting {
  const who = name ? `, ${name}` : "";
  if (hour < 7) return { text: `Buenas noches${who}`, Icon: Moon, iconClass: "text-info" };
  if (hour < 12) return { text: `Buenos días${who}`, Icon: Coffee, iconClass: "text-warning" };
  if (hour < 17) return { text: `Buenas tardes${who}`, Icon: Sun, iconClass: "text-accent" };
  if (hour < 21) return { text: `Buenas tardes${who}`, Icon: Sunset, iconClass: "text-accent" };
  return { text: `Buenas noches${who}`, Icon: Moon, iconClass: "text-info" };
}

interface DailyGreetingProps {
  name?: string | null;
}

export function DailyGreeting({ name }: DailyGreetingProps) {
  const [greeting, setGreeting] = useState<Greeting | null>(null);

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours(), name?.split(" ")[0] ?? null));
  }, [name]);

  if (!greeting) return null;
  const { text, Icon, iconClass } = greeting;

  return (
    <p className="inline-flex items-center gap-2 text-body-sm text-muted-foreground animate-fade-in">
      <Icon size={16} className={iconClass} />
      <span>
        {text}. <span className="text-foreground/70">Echa un vistazo a la carta.</span>
      </span>
    </p>
  );
}
