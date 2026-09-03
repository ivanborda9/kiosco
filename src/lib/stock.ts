export function totalStock(product: { stock: number; variants?: { stock: number }[] }): number {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock;
}
