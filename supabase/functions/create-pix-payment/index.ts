// Edge Function: Criar Pagamento PIX via Mercado Pago
// Rota: POST /functions/v1/create-pix-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createPixPayment } from '../_shared/mercadopago.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  leituraId: string;
  valor: number;
  email: string;
  nome: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Inicializar Supabase client com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar JWT e obter usuário
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Parse request body
    const { leituraId, valor, email, nome }: CreatePaymentRequest = await req.json();

    // Validar parâmetros
    if (!leituraId || !valor || !email || !nome) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: leituraId, valor, email, nome'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar leitura no banco
    const { data: leitura, error: leituraError } = await supabase
      .from('leituras')
      .select('*, cliente:clientes(*)')
      .eq('id', leituraId)
      .single();

    if (leituraError || !leitura) {
      return new Response(
        JSON.stringify({ success: false, error: 'Leitura não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se leitura já está paga
    if (leitura.status === 'Pago') {
      return new Response(
        JSON.stringify({ success: false, error: 'Esta fatura já foi paga' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já existe pagamento ativo (não expirado e não rejeitado)
    const { data: existingPayment } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('leitura_id', leituraId)
      .in('status', ['pending', 'in_process'])
      .gte('expira_em', new Date().toISOString())
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Se existe pagamento ativo, retornar ele
    if (existingPayment) {
      console.log('Reusing existing active payment:', existingPayment.id);

      return new Response(
        JSON.stringify({
          success: true,
          pagamentoId: existingPayment.id,
          qrCode: existingPayment.qr_code,
          qrCodeBase64: existingPayment.qr_code_base64,
          status: existingPayment.status,
          expiraEm: existingPayment.expira_em,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar novo pagamento no Mercado Pago
    console.log('Creating new PIX payment for leitura:', leituraId);

    // Expiração: 30 minutos a partir de agora
    const expirationDate = new Date(Date.now() + 30 * 60 * 1000);

    // Separar nome em primeiro e último nome
    const nameParts = nome.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const webhookUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    const mpPayment = await createPixPayment(mercadoPagoToken, {
      transaction_amount: valor,
      description: `Fatura SM Engenharia - ${leitura.cliente_nome}`,
      payment_method_id: 'pix',
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
      notification_url: webhookUrl,
      external_reference: leituraId,
      date_of_expiration: expirationDate.toISOString(),
    });

    // Extrair dados do PIX
    const qrCode = mpPayment.point_of_interaction?.transaction_data?.qr_code || '';
    const qrCodeBase64 = mpPayment.point_of_interaction?.transaction_data?.qr_code_base64 || '';

    if (!qrCode || !qrCodeBase64) {
      throw new Error('Mercado Pago não retornou dados do PIX');
    }

    // Salvar pagamento no banco
    const { data: newPayment, error: paymentError } = await supabase
      .from('pagamentos')
      .insert({
        leitura_id: leituraId,
        mercadopago_payment_id: mpPayment.id,
        valor: valor,
        status: mpPayment.status,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        expira_em: expirationDate.toISOString(),
        metadados: {
          mp_status_detail: mpPayment.status_detail,
          ticket_url: mpPayment.point_of_interaction?.transaction_data?.ticket_url,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment to database:', paymentError);
      throw new Error('Falha ao salvar pagamento no banco de dados');
    }

    // Atualizar leitura com referência ao pagamento
    await supabase
      .from('leituras')
      .update({ pagamento_id_atual: newPayment.id })
      .eq('id', leituraId);

    console.log('Payment created successfully:', newPayment.id);

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        pagamentoId: newPayment.id,
        qrCode: newPayment.qr_code,
        qrCodeBase64: newPayment.qr_code_base64,
        status: newPayment.status,
        expiraEm: newPayment.expira_em,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-pix-payment:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao criar pagamento'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
