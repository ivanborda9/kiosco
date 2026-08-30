/**
 * Envía un WhatsApp a la persona a cargo de la cancha usando CallMeBot
 * (https://www.callmebot.com/blog/free-api-whatsapp-messages/), un servicio
 * gratuito que no requiere cuenta de empresa: se activa mandándole un
 * mensaje al bot una sola vez desde el WhatsApp que va a recibir los avisos.
 *
 * Si no hay número o API key configurados, no hace nada (feature opcional).
 */
export async function sendCallMeBotMessage(params: {
  phone: string;
  apiKey: string;
  message: string;
}): Promise<void> {
  if (!params.phone || !params.apiKey) return;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    params.phone
  )}&text=${encodeURIComponent(params.message)}&apikey=${encodeURIComponent(params.apiKey)}`;

  try {
    await fetch(url);
  } catch (err) {
    // Un aviso de WhatsApp fallido no debe romper la reserva ni el cambio de estado.
    console.error("Error enviando notificación de WhatsApp (CallMeBot):", err);
  }
}
