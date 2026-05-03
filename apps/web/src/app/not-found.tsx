import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotFoundIllustration } from "@/components/illustrations";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="text-muted-foreground">
        <NotFoundIllustration size={120} />
      </div>
      <div className="space-y-2 max-w-md">
        <p className="text-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="text-display text-foreground">No encontramos esta página</h1>
        <p className="text-body text-muted-foreground">
          El enlace que has seguido puede estar roto o la página puede haberse movido.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-body-sm font-medium text-primary-foreground shadow-sm transition-[background-color,transform] duration-150 ease-out-expo hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft size={16} /> Volver al inicio
      </Link>
    </div>
  );
}
