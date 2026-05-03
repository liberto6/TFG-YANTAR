"use client";

import { Building2, Mail, Lock as LockIcon, User } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { useTyping } from "../hooks/use-typing";
import { DEMO_OWNER, DEMO_COMPANY } from "../data/napoli-fixtures";

/**
 * Paso 2 — Ana rellena el formulario de alta. Usamos `useTyping` para
 * "escribir" los campos uno tras otro, simulando a Ana introduciendo los
 * datos. El botón de envío se ilumina cuando todos los campos han terminado.
 */
export function Step02Register() {
  const company = useTyping(DEMO_COMPANY.name, { startDelay: 400, speed: 55 });
  const owner = useTyping(DEMO_OWNER.name, { startDelay: company.totalMs + 250, speed: 55 });
  const email = useTyping(DEMO_OWNER.email, {
    startDelay: company.totalMs + owner.totalMs + 500,
    speed: 40,
  });
  const pass = useTyping("•".repeat(DEMO_OWNER.password.length), {
    startDelay: company.totalMs + owner.totalMs + email.totalMs + 750,
    speed: 70,
  });

  const allDone = pass.done;

  return (
    <DemoChapter url="yantar.app/register-business">
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        <aside className="space-y-3 rounded-xl bg-primary/5 p-5">
          <h3 className="text-h3 text-foreground">
            Crea tu restaurante en Yantar
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Cuatro datos y tienes tu URL pública lista. Sin tarjeta, sin
            instaladores.
          </p>
          <ul className="space-y-1.5 pt-1 text-body-sm text-muted-foreground">
            <li>· Tu restaurante estará en napoli.yantar.app</li>
            <li>· Personaliza branding, carta y sedes en minutos</li>
            <li>· Sin comisiones por pedido</li>
          </ul>
        </aside>

        <form className="space-y-3">
          <Field
            icon={<Building2 size={14} />}
            label="Nombre del restaurante"
            value={company.text}
            caret={!company.done}
          />
          <Field
            icon={<User size={14} />}
            label="Tu nombre"
            value={owner.text}
            caret={company.done && !owner.done}
          />
          <Field
            icon={<Mail size={14} />}
            label="Email"
            value={email.text}
            caret={owner.done && !email.done}
          />
          <Field
            icon={<LockIcon size={14} />}
            label="Contraseña"
            value={pass.text}
            caret={email.done && !pass.done}
          />
          <button
            type="button"
            disabled
            className={[
              "mt-2 inline-flex h-10 w-full items-center justify-center rounded-md text-body-sm font-medium transition-all",
              allDone
                ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                : "bg-secondary text-muted-foreground",
            ].join(" ")}
          >
            Crear restaurante
          </button>
        </form>
      </div>
    </DemoChapter>
  );
}

function Field({
  icon,
  label,
  value,
  caret,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caret: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-caption text-muted-foreground">{label}</label>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-body-sm">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-foreground">{value}</span>
        {caret && (
          <span
            className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
