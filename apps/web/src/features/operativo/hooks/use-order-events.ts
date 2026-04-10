"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import type { Order } from "@/features/orders/types/order.types";

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Hook para la vista operativa — suscribe a todos los eventos de una sede.
 * Actualiza la cache de React Query en cada evento recibido.
 */
export function useBranchOrderEvents(branchId: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!branchId) return;

    const socket = io(`${WS_URL}/orders`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("branch:subscribe", { branchId });
    });

    socket.on("order:new", (order: Order) => {
      queryClient.setQueryData<Order[]>(["active-orders", branchId], (prev = []) => {
        const exists = prev.some((o) => o.id === order.id);
        return exists ? prev : [order, ...prev];
      });
    });

    socket.on("order:status-changed", (order: Order) => {
      // Actualiza el pedido individual
      queryClient.setQueryData(["order", order.id], order);
      // Actualiza la lista de activos
      queryClient.setQueryData<Order[]>(["active-orders", branchId], (prev = []) =>
        prev.map((o) => (o.id === order.id ? order : o)),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [branchId, queryClient]);
}

/**
 * Hook para el customer — suscribe a actualizaciones de un pedido concreto.
 * Usa WebSocket si disponible, React Query polling como fallback.
 */
export function useOrderSocketSubscription(orderId: string | undefined) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(`${WS_URL}/orders`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("order:subscribe", { orderId });
    });

    socket.on("order:status-changed", (order: Order) => {
      queryClient.setQueryData(["order", orderId], order);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, queryClient]);
}
