"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File): Promise<string> {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const result = await api.upload<{ url: string }>("/admin/menu/upload-image", form);
      return result.url;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading };
}
