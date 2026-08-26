import { CheckoutForm } from "@/components/CheckoutForm";
import { isMercadoPagoEnabled } from "@/lib/mercadopago";

export default function CheckoutPage() {
  return <CheckoutForm mercadoPagoEnabled={isMercadoPagoEnabled()} />;
}
