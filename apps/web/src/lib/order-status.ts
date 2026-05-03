import { OrderStatus } from "@yantar/shared";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

export type BadgeVariant =
  | "neutral"
  | "info"
  | "warning"
  | "success"
  | "danger"
  | "primary";

export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  ACCEPTED: "info",
  PREPARING: "primary",
  READY: "success",
  DELIVERED: "neutral",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

export const ORDER_STATUS_DOT_CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-warning",
  ACCEPTED: "bg-info",
  PREPARING: "bg-primary",
  READY: "bg-success",
  DELIVERED: "bg-muted-foreground",
  REJECTED: "bg-danger",
  CANCELLED: "bg-muted-foreground",
};
