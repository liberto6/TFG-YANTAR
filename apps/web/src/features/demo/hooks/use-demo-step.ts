"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DemoRole = "visitor" | "admin" | "operator" | "customer";

export interface DemoStep {
  id: string;
  role: DemoRole;
  /** Título corto visible en sidebar y barra superior. */
  title: string;
  /** Narración larga (1-3 frases) que va bajo el visual. */
  narration: string;
  /** URL ficticia que se muestra en la barra del browser mockup. */
  mockUrl: string;
  /** Duración en autoplay (ms). 0 = obligar al usuario a pulsar siguiente. */
  duration: number;
}

interface UseDemoStepOptions {
  steps: DemoStep[];
  initialAutoplay?: boolean;
}

export interface DemoController {
  index: number;
  step: DemoStep;
  total: number;
  isPlaying: boolean;
  progress: number; // 0..1 dentro del paso actual

  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
}

/**
 * Máquina de estados del DemoPlayer.
 *
 * Mantiene el paso actual, el modo autoplay y el progreso fraccional dentro
 * del paso (para alimentar la barra de progreso). Se autodetiene al terminar.
 */
export function useDemoStep({
  steps,
  initialAutoplay = true,
}: UseDemoStepOptions): DemoController {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialAutoplay);
  const [progress, setProgress] = useState(0);

  const startedAtRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  const step = steps[index] ?? steps[0];
  const total = steps.length;

  const reset = useCallback(() => {
    startedAtRef.current = Date.now();
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      const nextIdx = Math.min(i + 1, total - 1);
      if (nextIdx === total - 1) {
        setIsPlaying(false);
      }
      return nextIdx;
    });
    reset();
  }, [total, reset]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
    reset();
  }, [reset]);

  const goTo = useCallback(
    (target: number) => {
      setIndex(Math.max(0, Math.min(target, total - 1)));
      reset();
    },
    [total, reset],
  );

  const play = useCallback(() => {
    setIsPlaying(true);
    reset();
  }, [reset]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
    reset();
  }, [reset]);

  // Loop de animación del progreso. Si llega al final del paso y está en
  // autoplay, avanza al siguiente.
  useEffect(() => {
    if (!isPlaying) return;
    const duration = step.duration;
    if (!duration || duration <= 0) {
      setProgress(0);
      return;
    }

    startedAtRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startedAtRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        if (index < total - 1) {
          setIndex((i) => i + 1);
          startedAtRef.current = Date.now();
          setProgress(0);
        } else {
          setIsPlaying(false);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, step.duration, index, total]);

  return {
    index,
    step,
    total,
    isPlaying,
    progress,
    next,
    prev,
    goTo,
    togglePlay,
    pause,
    play,
  };
}
