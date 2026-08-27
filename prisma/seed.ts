import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const DEMO_RESELLER_PASSWORD = "revendedora123";

const productosBase = [
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

// Catálogo ampliado: se identifica con un id fijo ("seed-...") para poder
// actualizarlo con upsert en cada deploy sin duplicar productos ni pisar lo
// que el negocio haya cargado o editado a mano desde /admin/productos.
const catalogoAmpliado = [
  // Remeras y Tops
  {
    id: "seed-remera-basica-lisa",
    name: "Remera básica lisa premium",
    description: "Remera de algodón pima, corte regular, ideal para el día a día.",
    price: 14000,
    category: "Remeras y Tops",
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  },
  {
    id: "seed-top-cropped",
    name: "Top cropped canalé",
    description: "Top cropped de canalé elastizado, tiras regulables.",
    price: 11500,
    category: "Remeras y Tops",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80",
  },
  {
    id: "seed-musculosa-canesu",
    name: "Musculosa con canesú bordado",
    description: "Musculosa liviana con detalle de bordado en el canesú.",
    price: 12800,
    category: "Remeras y Tops",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
  },
  {
    id: "seed-remera-oversize-negra",
    name: "Remera oversize negra",
    description: "Remera oversize 100% algodón, básica infaltable en color negro.",
    price: 13000,
    category: "Remeras y Tops",
    stock: 26,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
  },
  {
    id: "seed-top-lycra-fruncido",
    name: "Top de lycra fruncido",
    description: "Top de lycra con frunce frontal, ideal para combinar con jean tiro alto.",
    price: 10800,
    category: "Remeras y Tops",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=600&q=80",
  },
  {
    id: "seed-remera-rayada-ml",
    name: "Remera rayada manga larga",
    description: "Remera de manga larga a rayas, algodón peinado.",
    price: 15500,
    category: "Remeras y Tops",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
  },
  {
    id: "seed-blusa-gasa-volados",
    name: "Blusa de gasa con volados",
    description: "Blusa liviana de gasa con volados en mangas, ideal para looks de noche.",
    price: 17500,
    category: "Remeras y Tops",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=600&q=80",
  },
  {
    id: "seed-camisa-denim-oversize",
    name: "Camisa denim oversize",
    description: "Camisa de jean oversize, ideal para usar suelta o anudada.",
    price: 22000,
    category: "Remeras y Tops",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
  },
  {
    id: "seed-top-halter-satinado",
    name: "Top halter satinado",
    description: "Top halter de tela satinada, ideal para eventos y salidas nocturnas.",
    price: 16000,
    category: "Remeras y Tops",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80",
  },
  {
    id: "seed-remera-estampa-retro",
    name: "Remera estampa retro",
    description: "Remera con estampa retro exclusiva, tela suave 24/1.",
    price: 14500,
    category: "Remeras y Tops",
    stock: 19,
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
  },

  // Pantalones y Calzas
  {
    id: "seed-jean-wide-leg",
    name: "Jean wide leg tiro alto",
    description: "Jean de pierna ancha, tiro alto, tendencia de la temporada.",
    price: 34000,
    category: "Pantalones y Calzas",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80",
  },
  {
    id: "seed-calza-deportiva",
    name: "Calza deportiva elastizada",
    description: "Calza de tela súplex, ideal para entrenar o uso diario.",
    price: 19500,
    category: "Pantalones y Calzas",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
  },
  {
    id: "seed-jogger-friza",
    name: "Jogger de friza premium",
    description: "Pantalón jogger de friza, puños en botamanga, muy cómodo.",
    price: 23000,
    category: "Pantalones y Calzas",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
  },
  {
    id: "seed-pantalon-palazzo",
    name: "Pantalón palazzo fluido",
    description: "Pantalón palazzo de tela fluida, tiro alto, ideal para looks elegantes.",
    price: 27500,
    category: "Pantalones y Calzas",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
  },
  {
    id: "seed-short-jean",
    name: "Short de jean tiro alto",
    description: "Short de jean con dobladillo, tiro alto, para el verano.",
    price: 18500,
    category: "Pantalones y Calzas",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
  },
  {
    id: "seed-calza-recortes",
    name: "Calza con recortes laterales",
    description: "Calza deportiva con recortes de mesh laterales.",
    price: 20500,
    category: "Pantalones y Calzas",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
  },
  {
    id: "seed-jean-recto-clasico",
    name: "Jean recto clásico",
    description: "Jean de corte recto, tiro medio, un básico versátil.",
    price: 29500,
    category: "Pantalones y Calzas",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
  },
  {
    id: "seed-pantalon-cargo-mujer",
    name: "Pantalón cargo mujer",
    description: "Pantalón cargo con bolsillos laterales, cintura ajustable.",
    price: 26500,
    category: "Pantalones y Calzas",
    stock: 17,
    imageUrl: "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&q=80",
  },

  // Vestidos y Polleras
  {
    id: "seed-vestido-negro-basico",
    name: "Vestido negro básico",
    description: "Vestido negro entallado, infaltable en el placard.",
    price: 33000,
    category: "Vestidos y Polleras",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&q=80",
  },
  {
    id: "seed-pollera-plisada",
    name: "Pollera plisada midi",
    description: "Pollera plisada de tela liviana, largo midi.",
    price: 21500,
    category: "Vestidos y Polleras",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&q=80",
  },
  {
    id: "seed-vestido-camisero",
    name: "Vestido camisero",
    description: "Vestido estilo camisero con cinturón a tono.",
    price: 29500,
    category: "Vestidos y Polleras",
    stock: 13,
    imageUrl: "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=600&q=80",
  },
  {
    id: "seed-vestido-de-fiesta",
    name: "Vestido de fiesta satinado",
    description: "Vestido de fiesta en tela satinada, ideal para eventos.",
    price: 45000,
    category: "Vestidos y Polleras",
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
  },
  {
    id: "seed-pollera-jean",
    name: "Pollera de jean con botones",
    description: "Pollera de jean con botones al frente, tiro alto.",
    price: 24000,
    category: "Vestidos y Polleras",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
  },
  {
    id: "seed-vestido-lino-largo",
    name: "Vestido largo de lino",
    description: "Vestido largo de lino fresco, ideal para el verano.",
    price: 34500,
    category: "Vestidos y Polleras",
    stock: 11,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
  },
  {
    id: "seed-pollera-cargo",
    name: "Pollera cargo con bolsillos",
    description: "Pollera estilo cargo con bolsillos laterales, tendencia urbana.",
    price: 22500,
    category: "Vestidos y Polleras",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80",
  },
  {
    id: "seed-vestido-wrap-estampado",
    name: "Vestido wrap estampado",
    description: "Vestido cruzado con estampa exclusiva, entalla en la cintura.",
    price: 31000,
    category: "Vestidos y Polleras",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
  },

  // Buzos y Camperas
  {
    id: "seed-campera-puffer",
    name: "Campera puffer acolchada",
    description: "Campera acolchada tipo puffer, súper abrigada.",
    price: 42000,
    category: "Buzos y Camperas",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80",
  },
  {
    id: "seed-buzo-oversize",
    name: "Buzo oversize sin capucha",
    description: "Buzo oversize de algodón frizado, cuello redondo.",
    price: 25500,
    category: "Buzos y Camperas",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
  },
  {
    id: "seed-campera-cuero-eco",
    name: "Campera eco-cuero cropped",
    description: "Campera de eco-cuero cropped, cierre frontal.",
    price: 39500,
    category: "Buzos y Camperas",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80",
  },
  {
    id: "seed-sweater-lana",
    name: "Sweater de lana trenzado",
    description: "Sweater tejido con trenzas, ideal para el invierno.",
    price: 28500,
    category: "Buzos y Camperas",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80",
  },
  {
    id: "seed-campera-rompeviento",
    name: "Campera rompeviento",
    description: "Campera liviana rompeviento, ideal para entretiempo.",
    price: 26000,
    category: "Buzos y Camperas",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
  },
  {
    id: "seed-buzo-estampado",
    name: "Buzo canguro estampado",
    description: "Buzo canguro con estampa exclusiva, friza interior.",
    price: 25000,
    category: "Buzos y Camperas",
    stock: 19,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
  },
  {
    id: "seed-campera-jean-clasica",
    name: "Campera de jean clásica",
    description: "Campera de jean clásica, corte regular, para todo el año.",
    price: 33500,
    category: "Buzos y Camperas",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
  },

  // Blazers y Sacos
  {
    id: "seed-blazer-oversize",
    name: "Blazer oversize",
    description: "Blazer oversize estructurado, ideal para looks de oficina o casual chic.",
    price: 41000,
    category: "Blazers y Sacos",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
  },
  {
    id: "seed-saco-de-pano",
    name: "Saco de paño cruzado",
    description: "Saco de paño con cierre cruzado, ideal para el invierno.",
    price: 45500,
    category: "Blazers y Sacos",
    stock: 9,
    imageUrl: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=80",
  },
  {
    id: "seed-blazer-entallado",
    name: "Blazer entallado clásico",
    description: "Blazer entallado de un botón, tela con textura.",
    price: 38500,
    category: "Blazers y Sacos",
    stock: 11,
    imageUrl: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&q=80",
  },
  {
    id: "seed-chaleco-vestir",
    name: "Chaleco de vestir",
    description: "Chaleco sin mangas, ideal para combinar con camisa.",
    price: 24500,
    category: "Blazers y Sacos",
    stock: 13,
    imageUrl: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=80",
  },

  // Accesorios
  {
    id: "seed-aros-dorados",
    name: "Aros dorados argolla",
    description: "Aros de argolla bañados en oro, livianos.",
    price: 9500,
    category: "Accesorios",
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
  },
  {
    id: "seed-collar-largo",
    name: "Collar largo con dije",
    description: "Collar largo dorado con dije, tendencia de la temporada.",
    price: 8500,
    category: "Accesorios",
    stock: 26,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
  },
  {
    id: "seed-gorra-bordada",
    name: "Gorra bordada unisex",
    description: "Gorra de algodón con bordado, ajustable.",
    price: 11000,
    category: "Accesorios",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80",
  },
  {
    id: "seed-bufanda-lana",
    name: "Bufanda de lana",
    description: "Bufanda tejida de lana, abrigada y suave.",
    price: 12500,
    category: "Accesorios",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80",
  },
  {
    id: "seed-billetera-cuero",
    name: "Billetera de eco-cuero",
    description: "Billetera compacta de eco-cuero con múltiples compartimentos.",
    price: 13500,
    category: "Accesorios",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
  },
  {
    id: "seed-mochila-urbana",
    name: "Mochila urbana",
    description: "Mochila liviana ideal para uso diario, varios bolsillos.",
    price: 24000,
    category: "Accesorios",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  },
  {
    id: "seed-cinturon-ancho",
    name: "Cinturón ancho con hebilla",
    description: "Cinturón ancho de eco-cuero con hebilla metálica grande.",
    price: 10500,
    category: "Accesorios",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&q=80",
  },
  {
    id: "seed-anteojos-sol",
    name: "Anteojos de sol",
    description: "Anteojos de sol con protección UV, marco moderno.",
    price: 14500,
    category: "Accesorios",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
  },
  {
    id: "seed-cartera-eco-cuero",
    name: "Cartera cruzada eco-cuero",
    description: "Cartera cruzada compacta, ideal para salidas casuales.",
    price: 19500,
    category: "Accesorios",
    stock: 17,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
  },
  {
    id: "seed-cinturon-fino",
    name: "Cinturón fino de cuero",
    description: "Cinturón fino de cuero genuino, ideal para vestidos y polleras.",
    price: 8800,
    category: "Accesorios",
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80",
  },

  // Niños
  {
    id: "seed-conjunto-nene",
    name: "Conjunto nene remera y short",
    description: "Conjunto de remera estampada y short, algodón suave.",
    price: 13500,
    category: "Niños",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
  },
  {
    id: "seed-vestido-nena-floreado",
    name: "Vestido nena floreado",
    description: "Vestido liviano con estampa floral para nena.",
    price: 15000,
    category: "Niños",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1519457851430-30d1a5075a5f?w=600&q=80",
  },
  {
    id: "seed-buzo-infantil",
    name: "Buzo canguro infantil",
    description: "Buzo canguro con capucha, friza interior, talles infantiles.",
    price: 14500,
    category: "Niños",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80",
  },
  {
    id: "seed-campera-nino",
    name: "Campera de abrigo para niño",
    description: "Campera acolchada liviana para niño, cierre frontal.",
    price: 21500,
    category: "Niños",
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=600&q=80",
  },
  {
    id: "seed-jogger-infantil",
    name: "Jogger infantil de friza",
    description: "Pantalón jogger cómodo para el día a día en el jardín o la escuela.",
    price: 12000,
    category: "Niños",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
  },
  {
    id: "seed-remera-estampada-nino",
    name: "Remera estampada para niño",
    description: "Remera de algodón con estampa divertida, ideal para el uso diario.",
    price: 10500,
    category: "Niños",
    stock: 24,
    imageUrl: "https://images.unsplash.com/photo-1503457574465-3821b4d3a2ad?w=600&q=80",
  },

  // Hombre
  {
    id: "seed-remera-basica-hombre",
    name: "Remera básica hombre",
    description: "Remera de algodón peinado, corte clásico.",
    price: 14000,
    category: "Hombre",
    stock: 26,
    imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
  },
  {
    id: "seed-jean-hombre",
    name: "Jean hombre corte recto",
    description: "Jean de corte recto, tiro medio, para uso diario.",
    price: 31000,
    category: "Hombre",
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
  },
  {
    id: "seed-buzo-hombre",
    name: "Buzo canguro hombre",
    description: "Buzo canguro de friza, básico y cómodo.",
    price: 26500,
    category: "Hombre",
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&q=80",
  },
  {
    id: "seed-camisa-hombre",
    name: "Camisa hombre slim fit",
    description: "Camisa slim fit de algodón, ideal para looks formales o casuales.",
    price: 24500,
    category: "Hombre",
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
  },
  {
    id: "seed-campera-hombre",
    name: "Campera hombre urbana",
    description: "Campera liviana con capucha, ideal para entretiempo.",
    price: 34500,
    category: "Hombre",
    stock: 13,
    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80",
  },
  {
    id: "seed-short-deportivo-hombre",
    name: "Short deportivo hombre",
    description: "Short deportivo liviano, ideal para entrenar.",
    price: 15500,
    category: "Hombre",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
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
  if (existingProducts === 0) {
    for (const p of productosBase) {
      await prisma.product.create({ data: p });
    }
    console.log(`Catálogo base creado: ${productosBase.length} productos.`);
  } else {
    console.log("El catálogo base ya existe, se omite.");
  }

  // El catálogo ampliado usa upsert por id fijo: se puede volver a correr en
  // cada deploy sin duplicar productos ni pisar precios/stock que el negocio
  // ya haya editado a mano en /admin/productos (update: {} no toca nada).
  for (const p of catalogoAmpliado) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`Catálogo ampliado verificado: ${catalogoAmpliado.length} productos.`);

  const passwordHash = await hashPassword(DEMO_RESELLER_PASSWORD);
  for (const r of resellers) {
    await prisma.reseller.upsert({
      where: { email: r.email },
      update: {},
      create: { ...r, passwordHash },
    });
  }
  console.log(
    `Revendedoras de ejemplo verificadas: ${resellers.length} (contraseña de prueba: "${DEMO_RESELLER_PASSWORD}").`
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
