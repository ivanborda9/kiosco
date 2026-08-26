"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h1>
        <p className="mt-2 text-gray-500">Agregá productos del catálogo para empezar tu pedido.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Tu carrito</h1>
        <div className="flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-4">
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(item.price)} c/u</p>
              </div>
              <input
                type="number"
                min={1}
                max={item.stock}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center"
              />
              <span className="w-24 text-right font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-sm text-red-500 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="h-fit rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Resumen</h2>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">Los descuentos de revendedora se aplican en el siguiente paso.</p>
        <Link
          href="/checkout"
          className="mt-4 block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-700"
        >
          Continuar compra
        </Link>
        <Link href="/" className="mt-2 block text-center text-sm text-brand-600 hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
