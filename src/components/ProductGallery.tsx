"use client";

import Image from "next/image";
import { useState } from "react";
import { getCategoryFallbackImage } from "@/lib/categoryImage";

export function ProductGallery({
  images,
  alt,
  category,
}: {
  images: string[];
  alt: string;
  category: string;
}) {
  const fallback = getCategoryFallbackImage(category);
  const gallery = images.length > 0 ? images : [fallback];
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const currentSrc = failed[selected] ? fallback : gallery[selected];

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand-50">
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className="object-cover"
          priority
          onError={() => setFailed((prev) => ({ ...prev, [selected]: true }))}
        />
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                selected === i ? "border-brand-600" : "border-transparent"
              }`}
            >
              <Image
                src={failed[i] ? fallback : src}
                alt=""
                fill
                className="object-cover"
                onError={() => setFailed((prev) => ({ ...prev, [i]: true }))}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
