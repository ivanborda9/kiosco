"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Banner = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
};

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];

  const content = (
    <div className="relative h-full w-full">
      <Image src={banner.imageUrl} alt={banner.title ?? ""} fill className="object-cover" priority />
      {(banner.title || banner.subtitle) && (
        <div className="absolute inset-0 flex flex-col justify-center bg-black/30 px-6 text-white">
          {banner.title && <h1 className="text-3xl font-bold sm:text-4xl">{banner.title}</h1>}
          {banner.subtitle && <p className="mt-2 max-w-xl">{banner.subtitle}</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
      {banner.linkUrl ? <Link href={banner.linkUrl}>{content}</Link> : content}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
