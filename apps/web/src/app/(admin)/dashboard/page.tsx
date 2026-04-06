import { Card, CardContent, CardHeader } from "@/components/ui/card";

const stats = [
  { label: "Pedidos hoy", value: "0", change: "--" },
  { label: "Ingresos hoy", value: "0.00 EUR", change: "--" },
  { label: "Clientes activos", value: "0", change: "--" },
  { label: "Valoracion media", value: "--", change: "--" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Resumen general de tu restaurante
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders placeholder */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">
            Pedidos recientes
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No hay pedidos recientes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
