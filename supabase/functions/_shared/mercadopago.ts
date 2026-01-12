// Shared Mercado Pago utilities for Edge Functions

export interface MercadoPagoPaymentRequest {
  transaction_amount: number;
  description: string;
  payment_method_id: 'pix';
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  notification_url?: string;
  external_reference?: string;
  date_of_expiration?: string;
}

export interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  date_of_expiration?: string;
  external_reference?: string;
}

/**
 * Cria um pagamento PIX no Mercado Pago
 */
export async function createPixPayment(
  accessToken: string,
  paymentData: MercadoPagoPaymentRequest
): Promise<MercadoPagoPaymentResponse> {
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago API Error: ${error.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Busca detalhes de um pagamento no Mercado Pago
 */
export async function getPaymentDetails(
  accessToken: string,
  paymentId: number
): Promise<MercadoPagoPaymentResponse> {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Verifica assinatura do webhook do Mercado Pago
 */
export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  webhookSecret: string
): boolean {
  try {
    // Parse x-signature header: ts=<timestamp>,v1=<hash>
    const parts = xSignature.split(',');
    const tsMatch = parts.find(p => p.startsWith('ts='));
    const v1Match = parts.find(p => p.startsWith('v1='));

    if (!tsMatch || !v1Match) {
      console.error('Invalid signature format');
      return false;
    }

    const timestamp = tsMatch.split('=')[1];
    const receivedHash = v1Match.split('=')[1];

    // Construir string para validação: id:<data_id>;request-id:<request_id>;ts:<timestamp>;
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

    // Criar HMAC SHA256
    const encoder = new TextEncoder();
    const key = encoder.encode(webhookSecret);
    const message = encoder.encode(manifest);

    return crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(cryptoKey =>
      crypto.subtle.sign('HMAC', cryptoKey, message)
    ).then(signature => {
      const computedHash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return computedHash === receivedHash;
    }).catch(error => {
      console.error('Signature verification error:', error);
      return false;
    });

  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
