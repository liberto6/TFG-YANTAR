"use client";

import { useEffect, useRef, useState } from "react";

interface TypingOptions {
  /** Milisegundos por carácter. Default 50ms. */
  speed?: number;
  /** Espera inicial antes de empezar a teclear (ms). Default 0. */
  startDelay?: number;
}

export interface TypingResult {
  text: string;
  done: boolean;
  /** Tiempo total que tarda en escribirse (delay + chars * speed), en ms. */
  totalMs: number;
}

/**
 * Anima el tipeo de un string letra a letra. Útil en pasos de formulario
 * donde queremos que el usuario vea cómo "Ana escribe" cada campo.
 *
 * El componente se reinicia automáticamente al cambiar el `target` o las
 * opciones (efecto de remount entre pasos: el `key` del paso ya provoca esto).
 */
export function useTyping(target: string, options: TypingOptions = {}): TypingResult {
  const speed = options.speed ?? 50;
  const startDelay = options.startDelay ?? 0;

  const [text, setText] = useState("");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const totalMs = startDelay + target.length * speed;
  const done = text === target;

  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setText("");

    for (let i = 1; i <= target.length; i++) {
      const t = setTimeout(() => setText(target.slice(0, i)), startDelay + i * speed);
      timersRef.current.push(t);
    }

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [target, speed, startDelay]);

  return { text, done, totalMs };
}
