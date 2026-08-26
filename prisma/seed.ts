import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const DEMO_RESELLER_PASSWORD = "revendedora123";

const productos = [
  {
    name: "Remera oversize básica",
    description: "Remera de algodón peinado 24/1, corte oversize. Ideal para combinar.",
    price: 12000,
    category: "Remeras",
    stock: 30,
    imageUrl: "/products/remeras.svg",
  },
  {
    name: "Remera estampada floral",
    description: "Remera con estampa floral exclusiva, tela suave y fresca.",
    price: 13500,
    category: "Remeras",
    stock: 20,
    imageUrl: "/products/remeras.svg",
  },
  {
    name: "Jean mom fit",
    description: "Jean tiro alto, fit mom, elastizado para mayor comodidad.",
    price: 28000,
    category: "Pantalones",
    stock: 18,
    imageUrl: "/products/pantalones.svg",
  },
  {
    name: "Pantalón cargo",
    description: "Pantalón cargo con bolsillos, tela resistente, unisex.",
    price: 26000,
    category: "Pantalones",
    stock: 15,
    imageUrl: "/products/pantalones.svg",
  },
  {
    name: "Vestido midi lino",
    description: "Vestido midi de lino, fresco y liviano, ideal para el verano.",
    price: 32000,
    category: "Vestidos",
    stock: 12,
    imageUrl: "/products/vestidos.svg",
  },
  {
    name: "Vestido estampado wrap",
    description: "Vestido cruzado con estampa, entalla en la cintura.",
    price: 30000,
    category: "Vestidos",
    stock: 10,
    imageUrl: "/products/vestidos.svg",
  },
  {
    name: "Campera de jean",
    description: "Campera de jean clásica, corte cropped.",
    price: 35000,
    category: "Abrigos",
    stock: 14,
    imageUrl: "/products/abrigos.svg",
  },
  {
    name: "Buzo canguro friza",
    description: "Buzo con capucha y bolsillo canguro, friza interior.",
    price: 24000,
    category: "Abrigos",
    stock: 22,
    imageUrl: "/products/abrigos.svg",
  },
  {
    name: "Cartera de mano",
    description: "Cartera de mano eco-cuero, ideal para looks casuales y de noche.",
    price: 18000,
    category: "Accesorios",
    stock: 16,
    imageUrl: "/products/accesorios.svg",
  },
  {
    name: "Cinturón de cuero",
    description: "Cinturón de cuero genuino, hebilla metálica.",
    price: 9000,
    category: "Accesorios",
    stock: 25,
    imageUrl: "/products/accesorios.svg",
  },
];

const resellers = [
  {
    name: "Ana García",
    email: "ana@example.com",
    phone: "+54 9 11 1111-1111",
    code: "ANA10",
    discountPercent: 10,
    commissionPercent: 15,
  },
  {
    name: "Belén Ríos",
    email: "belen@example.com",
    phone: "+54 9 11 2222-2222",
    code: "BELEN15",
    discountPercent: 15,
    commissionPercent: 12,
  },
];

async function main() {
  // Se crea antes que nada y de forma idempotente para evitar que varias páginas
  // generadas en paralelo durante "next build" compitan por crear la misma fila.
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log("Ya hay productos cargados, se omite el seed.");
    return;
  }

  for (const p of productos) {
    await prisma.product.create({ data: p });
  }
  const passwordHash = await hashPassword(DEMO_RESELLER_PASSWORD);
  for (const r of resellers) {
    await prisma.reseller.create({ data: { ...r, passwordHash } });
  }
  console.log(
    `Seed completo: ${productos.length} productos, ${resellers.length} revendedoras (contraseña de prueba: "${DEMO_RESELLER_PASSWORD}").`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
