const CATEGORY_FALLBACKS: Record<string, string> = {
  Remeras: "/products/remeras.svg",
  Blusas: "/products/remeras.svg",
  Jeans: "/products/pantalones.svg",
  Pantalones: "/products/pantalones.svg",
  Buzos: "/products/abrigos.svg",
  Camperas: "/products/abrigos.svg",
  Medias: "/products/medias.svg",
  Cintos: "/products/accesorios.svg",
  Mochilas: "/products/accesorios.svg",
  Accesorios: "/products/accesorios.svg",
  Perfumes: "/products/perfumes.svg",
  "Ropa interior": "/products/ropainterior.svg",
  Pijamas: "/products/pijamas.svg",
  Vestidos: "/products/vestidos.svg",
  Abrigos: "/products/abrigos.svg",
  Niños: "/products/ninos.svg",
  Hombre: "/products/hombre.svg",
};

export function getCategoryFallbackImage(category: string): string {
  return CATEGORY_FALLBACKS[category] ?? "/products/remeras.svg";
}
