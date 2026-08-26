import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <ProductForm action={createProduct} submitLabel="Crear producto" />
    </div>
  );
}
