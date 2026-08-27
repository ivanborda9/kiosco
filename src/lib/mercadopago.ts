import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { createHmac, timingSafeEqual } from "crypto";

export function isMercadoPagoEnabled(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Falta configurar MERCADOPAGO_ACCESS_TOKEN en las variables de entorno.");
  }
  return new MercadoPagoConfig({ accessToken });
}

async function createPreference(params: {
  externalReference: string;
  title: string;
  amount: number;
  successPath: string;
  notificationPath: string;
  baseUrl: string;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const preference = new Preference(getClient());
  const isTestCredential = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith("TEST-");

  const response = await preference.create({
    body: {
      items: [
        {
          id: params.externalReference,
          title: params.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: params.amount,
        },
      ],
      external_reference: params.externalReference,
      back_urls: {
        success: `${params.baseUrl}${params.successPath}`,
        pending: `${params.baseUrl}${params.successPath}`,
        failure: `${params.baseUrl}${params.successPath}`,
      },
      auto_return: "approved",
      notification_url: `${params.baseUrl}${params.notificationPath}`,
    },
  });

  const checkoutUrl = (isTestCredential ? response.sandbox_init_point : response.init_point) ?? response.init_point;

  if (!response.id || !checkoutUrl) {
    throw new Error("Mercado Pago no devolvió una preferencia válida.");
  }

  return { preferenceId: response.id, checkoutUrl };
}

export async function createOrderPreference(params: {
  orderId: string;
  title: string;
  total: number;
  baseUrl: string;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  return createPreference({
    externalReference: params.orderId,
    title: params.title,
    amount: params.total,
    successPath: `/pedido/${params.orderId}`,
    notificationPath: "/api/mercadopago/webhook",
    baseUrl: params.baseUrl,
  });
}

export async function createBookingPreference(params: {
  bookingId: string;
  title: string;
  depositAmount: number;
  baseUrl: string;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  return createPreference({
    externalReference: params.bookingId,
    title: params.title,
    amount: params.depositAmount,
    successPath: `/cancha/reserva/${params.bookingId}`,
    notificationPath: "/api/mercadopago/cancha-webhook",
    baseUrl: params.baseUrl,
  });
}

export async function getMercadoPagoPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

export function mapMercadoPagoStatus(status: string | undefined): "APROBADO" | "RECHAZADO" | "PENDIENTE" {
  if (status === "approved") return "APROBADO";
  if (status === "rejected" || status === "cancelled" || status === "charged_back") return "RECHAZADO";
  return "PENDIENTE";
}

/**
 * Valida la firma x-signature de las notificaciones de Mercado Pago para evitar
 * que cualquiera pueda simular un pago aprobado llamando al webhook directamente.
 * https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/notifications/webhooks
 */
export function verifyMercadoPagoWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature || !params.xRequestId || !params.dataId) return false;

  const parts = Object.fromEntries(
    params.xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${params.dataId.toLowerCase()};request-id:${params.xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(v1, "hex");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
