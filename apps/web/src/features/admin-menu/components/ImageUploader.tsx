"use client";

import { useRef } from "react";
import Image from "next/image";
import { useUploadImage } from "../hooks/use-upload-image";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const { upload, isUploading } = useUploadImage();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    onChange(url);
    // Reset so the same file can be re-selected after clearing
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
        {value ? (
          <Image
            src={value}
            alt="Imagen del plato"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-sm text-muted-foreground">Sin imagen</span>
        )}
      </div>

      <div className="flex gap-2">
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        <button
          type="button"
          aria-label="Seleccionar imagen"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
        >
          {isUploading ? "Subiendo..." : "Seleccionar imagen"}
        </button>

        {value && (
          <button
            type="button"
            aria-label="Eliminar imagen"
            onClick={() => onChange(null)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Eliminar imagen
          </button>
        )}
      </div>
    </div>
  );
}
