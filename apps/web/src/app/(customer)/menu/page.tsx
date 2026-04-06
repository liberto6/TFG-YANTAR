import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MenuPage() {
  // Placeholder categories and items - will be fetched from API
  const categories = [
    { id: "1", name: "Entrantes" },
    { id: "2", name: "Principales" },
    { id: "3", name: "Postres" },
    { id: "4", name: "Bebidas" },
  ];

  return (
    <div className="space-y-6">
      {/* Category quick-nav */}
      <nav className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button key={cat.id} variant="outline" size="sm" className="shrink-0">
            {cat.name}
          </Button>
        ))}
      </nav>

      {/* Menu sections */}
      {categories.map((cat) => (
        <section key={cat.id} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{cat.name}</h2>

          {/* Placeholder menu items */}
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">
                      Plato de ejemplo {item}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Descripcion del plato con ingredientes principales
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {(8 + item * 2).toFixed(2)} EUR
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  Anadir al pedido
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ))}
    </div>
  );
}
