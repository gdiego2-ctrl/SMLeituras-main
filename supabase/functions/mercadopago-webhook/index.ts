// Edge Function: Webhook do Mercado Pago
// Rota: POST /functions/v1/mercadopago-webhook
// Recebe notificações de mudança de status de pagamentos

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getPaymentDetails, verifyWebhookSignature } from '../_shared/mercadopago.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

interface WebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string; // Payment ID do Mercado Pago
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Inicializar Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();

    console.log('Received webhook:', {
      type: payload.type,
      action: payload.action,
      paymentId: payload.data?.id,
    });

    // Validar tipo de notificação
    if (payload.type !== 'payment') {
      console.log('Ignoring non-payment webhook');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = parseInt(payload.data?.id);
    if (!paymentId) {
      console.error('Invalid payment ID in webhook');
      return new Response(JSON.stringify({ error: 'Invalid payment ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar assinatura do webhook (se configurado)
    let signatureValid = false;
    if (webhookSecret) {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');

      if (xSignature && xRequestId) {
        signatureValid = await verifyWebhookSignature(
          xSignature,
          xRequestId,
          payload.data.id,
          webhookSecret
        );

        if (!signatureValid) {
          console.warn('Invalid webhook signature!');
        }
      }
    }

    // Logar webhook recebido
    const { data: logEntry } = await supabase
      .from('payment_logs')
      .insert({
        evento_tipo: `${payload.type}.${payload.action}`,
        mp_payment_id: paymentId,
        payload: payload as any,
        signature_valid: signatureValid || null,
        ip_address: clientIp,
        status: 'received',
      })
      .select()
      .single();

    // Buscar detalhes completos do pagamento no Mercado Pago
    console.log('Fetching payment details from Mercado Pago...');
    const mpPayment = await getPaymentDetails(mercadoPagoToken, paymentId);

    console.log('Payment status:', mpPayment.status);

    // Buscar pagamento no banco de dados
    const { data: dbPayment, error: findError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('mercadopago_payment_id', paymentId)
      .maybeSingle();

    if (findError || !dbPayment) {
      console.error('Payment not found in database:', paymentId);

      // Atualizar log
      if (logEntry) {
        await supabase
          .from('payment_logs')
          .update({
            status: 'failed',
            erro_mensagem: 'Payment not found in database',
            processado_em: new Date().toISOString(),
          })
          .eq('id', logEntry.id);
      }

      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Atualizar status do pagamento
    const updates: any = {
      status: mpPayment.status,
      atualizado_em: new Date().toISOString(),
    };

    // Se aprovado, definir data de pagamento
    if (mpPayment.status === 'approved' && !dbPayment.pago_em) {
      updates.pago_em = new Date().toISOString();
    }

    await supabase
      .from('pagamentos')
      .update(updates)
      .eq('id', dbPayment.id);

    console.log('Payment updated in database');

    // Se pagamento aprovado, atualizar leitura/fatura
    if (mpPayment.status === 'approved') {
      console.log('Payment approved! Updating leitura status...');

      const { error: leituraUpdateError } = await supabase
        .from('leituras')
        .update({
          status: 'Pago',
          pago_em: new Date().toISOString(),
        })
        .eq('id', dbPayment.leitura_id);

      if (leituraUpdateError) {
        console.error('Error updating leitura:', leituraUpdateError);
      } else {
        console.log('Leitura marked as paid successfully');
      }
    }

    // Atualizar log como processado
    if (logEntry) {
      await supabase
        .from('payment_logs')
        .update({
          pagamento_id: dbPayment.id,
          status: 'processed',
          processado_em: new Date().toISOString(),
        })
        .eq('id', logEntry.id);
    }

    console.log('Webhook processed successfully');

    // Retornar 200 OK para o Mercado Pago
    return new Response(
      JSON.stringify({ received: true, status: mpPayment.status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
