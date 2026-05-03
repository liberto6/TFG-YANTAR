import type { ComponentType } from "react";
import type { DemoStep } from "../hooks/use-demo-step";

import { Step01SaaSLanding } from "./01-saas-landing";
import { Step02Register } from "./02-register";
import { Step03Welcome } from "./03-welcome";
import { Step04AdminEmpty } from "./04-admin-empty";
import { Step05Branding } from "./05-branding";
import { Step06BranchCreate } from "./06-branch-create";
import { Step07HoursZones } from "./07-hours-zones";
import { Step08Categories } from "./08-categories";
import { Step09DishCreate } from "./09-dish-create";
import { Step10CustomerLanding } from "./10-customer-landing";
import { Step11CustomerMenu } from "./11-customer-menu";
import { Step12CustomerDish } from "./12-customer-dish";
import { Step13Checkout } from "./13-checkout";
import { Step14OperativoReceive } from "./14-operativo-receive";
import { Step15OperativoProgress } from "./15-operativo-progress";
import { Step16CustomerTracking } from "./16-customer-tracking";
import { Step17Recap } from "./17-recap";

export interface DemoStepDef extends DemoStep {
  Component: ComponentType;
}

export const DEMO_STEPS: DemoStepDef[] = [
  {
    id: "saas-landing",
    role: "visitor",
    title: "Ana descubre Yantar",
    narration:
      "Ana es dueña de la Pizzería Nápoli y busca una alternativa a las plataformas agregadoras. Llega a yantar.app y ve la propuesta de valor de la plataforma.",
    mockUrl: "yantar.app",
    duration: 9000,
    Component: Step01SaaSLanding,
  },
  {
    id: "register",
    role: "visitor",
    title: "Ana se registra",
    narration:
      "En menos de un minuto rellena el formulario de alta self-service. Solo necesita el nombre del restaurante, su nombre, email y contraseña.",
    mockUrl: "yantar.app/register-business",
    duration: 12000,
    Component: Step02Register,
  },
  {
    id: "welcome",
    role: "visitor",
    title: "Bienvenida y URL pública",
    narration:
      "Yantar crea la empresa y le entrega su URL pública. A partir de aquí cualquier cliente que entre a napoli.yantar.app verá el restaurante de Ana.",
    mockUrl: "yantar.app/register-business",
    duration: 8000,
    Component: Step03Welcome,
  },
  {
    id: "admin-empty",
    role: "admin",
    title: "Ana entra al panel",
    narration:
      "El panel de administración está vacío: cero pedidos, cero platos. Ana va a configurar su restaurante desde cero.",
    mockUrl: "napoli.yantar.app/admin/dashboard",
    duration: 7000,
    Component: Step04AdminEmpty,
  },
  {
    id: "branding",
    role: "admin",
    title: "Ana personaliza la marca",
    narration:
      "Define su logo, paleta de colores y mensaje de bienvenida. Los cambios se aplican en vivo, sin redespliegue.",
    mockUrl: "napoli.yantar.app/admin/settings/branding",
    duration: 10000,
    Component: Step05Branding,
  },
  {
    id: "branch-create",
    role: "admin",
    title: "Ana crea su primera sede",
    narration:
      "Cada restaurante puede tener varias sucursales. Ana crea la Sede Centro con su slug, dirección y los modos de servicio que ofrece.",
    mockUrl: "napoli.yantar.app/admin/branches/new",
    duration: 11000,
    Component: Step06BranchCreate,
  },
  {
    id: "hours-zones",
    role: "admin",
    title: "Horarios y zona de reparto",
    narration:
      "Define los horarios de cada día y dibuja el polígono de cobertura del reparto sobre un mapa Leaflet.",
    mockUrl: "napoli.yantar.app/admin/branches/centro",
    duration: 9000,
    Component: Step07HoursZones,
  },
  {
    id: "categories",
    role: "admin",
    title: "Ana organiza la carta",
    narration:
      "Crea las categorías de la carta: Pizzas, Pasta, Entrantes, Bebidas y Postres.",
    mockUrl: "napoli.yantar.app/admin/menu/categories",
    duration: 8000,
    Component: Step08Categories,
  },
  {
    id: "dish-create",
    role: "admin",
    title: "Ana añade un plato",
    narration:
      "Crea la pizza Pepperoni con descripción, precio base, alérgenos, variantes de tamaño y modificadores como ingredientes extra.",
    mockUrl: "napoli.yantar.app/admin/menu/new",
    duration: 14000,
    Component: Step09DishCreate,
  },
  {
    id: "customer-landing",
    role: "customer",
    title: "Carlos quiere pedir cena",
    narration:
      "Carlos es cliente. Entra en napoli.yantar.app, elige la sede y la modalidad de entrega.",
    mockUrl: "napoli.yantar.app",
    duration: 9000,
    Component: Step10CustomerLanding,
  },
  {
    id: "customer-menu",
    role: "customer",
    title: "Carlos explora la carta",
    narration:
      "Ve la carta con el branding de Nápoli aplicado. Puede filtrar por alérgenos si tiene alguna intolerancia.",
    mockUrl: "napoli.yantar.app/menu",
    duration: 9000,
    Component: Step11CustomerMenu,
  },
  {
    id: "customer-dish",
    role: "customer",
    title: "Carlos personaliza su pizza",
    narration:
      "Selecciona tamaño y añade ingredientes extra. El precio se recalcula en tiempo real conforme cambia su elección.",
    mockUrl: "napoli.yantar.app/dish/pepperoni",
    duration: 10000,
    Component: Step12CustomerDish,
  },
  {
    id: "checkout",
    role: "customer",
    title: "Carlos confirma el pedido",
    narration:
      "Elige franja horaria, dirección de entrega y método de pago. Confirma el pedido por 33,00 €.",
    mockUrl: "napoli.yantar.app/checkout",
    duration: 11000,
    Component: Step13Checkout,
  },
  {
    id: "operativo-receive",
    role: "operator",
    title: "El pedido llega a la cocina",
    narration:
      "Sin recargar la página, el pedido aparece en la columna PENDIENTE del kanban operativo gracias al canal WebSocket en tiempo real.",
    mockUrl: "napoli.yantar.app/operativo",
    duration: 9000,
    Component: Step14OperativoReceive,
  },
  {
    id: "operativo-progress",
    role: "operator",
    title: "El cocinero avanza el pedido",
    narration:
      "Acepta el pedido con tiempo estimado, lo prepara y lo marca como listo. Cada cambio de estado se propaga a todos los dispositivos.",
    mockUrl: "napoli.yantar.app/operativo",
    duration: 10000,
    Component: Step15OperativoProgress,
  },
  {
    id: "customer-tracking",
    role: "customer",
    title: "Carlos sigue su pedido en vivo",
    narration:
      "En su móvil, Carlos ve cómo el estado avanza paso a paso. No necesita recargar ni llamar al restaurante.",
    mockUrl: "napoli.yantar.app/orders/...",
    duration: 9000,
    Component: Step16CustomerTracking,
  },
  {
    id: "recap",
    role: "visitor",
    title: "Ciclo cerrado",
    narration:
      "Sin instaladores, sin servidor propio, sin comisiones por pedido. Yantar conecta restaurador, operario y comensal en un único flujo.",
    mockUrl: "yantar.app",
    duration: 0,
    Component: Step17Recap,
  },
];
