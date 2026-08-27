"use client";

import Image from "next/image";
import { useState } from "react";
import { getCategoryFallbackImage } from "@/lib/categoryImage";

export function ProductImage({
  src,
  alt,
  category,
  fill,
  sizes,
  priority,
  className,
}: {
  src: string | null;
  alt: string;
  category: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const fallback = getCategoryFallbackImage(category);
  const [imgSrc, setImgSrc] = useState(src || fallback);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setImgSrc(fallback)}
    />
  );
}
