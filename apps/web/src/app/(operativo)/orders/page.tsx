import { Card, CardContent, CardHeader } from "@/components/ui/card";

const columns = [
  { id: "pending", label: "Pendientes", color: "bg-yellow-500" },
  { id: "preparing", label: "En preparacion", color: "bg-blue-500" },
  { id: "ready", label: "Listos", color: "bg-green-500" },
  { id: "delivered", label: "Entregados", color: "bg-muted" },
];

export default function OrderBoardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          Panel de Pedidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualizacion en tiempo real
        </p>
      </div>

      {/* Kanban-style order board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${col.color}`} />
              <h2 className="text-sm font-semibold text-foreground">
                {col.label}
              </h2>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                0
              </span>
            </div>

            {/* Order cards area */}
            <div className="min-h-[200px] rounded-lg border border-dashed border-border bg-background p-2">
              <Card className="opacity-50">
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      #---
                    </span>
                    <span className="text-xs text-muted-foreground">
                      --:--
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-sm text-muted-foreground">
                    Sin pedidos
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
