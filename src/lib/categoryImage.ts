const CATEGORY_FALLBACKS: Record<string, string> = {
  "Remeras y Tops": "/products/remeras.svg",
  "Pantalones y Calzas": "/products/pantalones.svg",
  "Vestidos y Polleras": "/products/vestidos.svg",
  "Buzos y Camperas": "/products/abrigos.svg",
  "Blazers y Sacos": "/products/abrigos.svg",
  Accesorios: "/products/accesorios.svg",
  Niños: "/products/ninos.svg",
  Hombre: "/products/hombre.svg",
  // Categorías del catálogo original
  Remeras: "/products/remeras.svg",
  Pantalones: "/products/pantalones.svg",
  Vestidos: "/products/vestidos.svg",
  Abrigos: "/products/abrigos.svg",
};

export function getCategoryFallbackImage(category: string): string {
  return CATEGORY_FALLBACKS[category] ?? "/products/remeras.svg";
}
