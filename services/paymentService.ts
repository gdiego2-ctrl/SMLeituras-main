// Payment Service - Integração com Mercado Pago via Supabase Edge Functions

import { supabaseClient } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CreatePixPaymentResponse {
  success: boolean;
  pagamentoId: string;
  qrCode: string;
  qrCodeBase64: string;
  status: string;
  expiraEm: string;
  error?: string;
}

export interface CreatePixPaymentParams {
  leituraId: string;
  valor: number;
  email: string;
  nome: string;
}

class PaymentService {
  private functionsUrl: string;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL not configured');
    }
    this.functionsUrl = `${supabaseUrl}/functions/v1`;
  }

  /**
   * Cria um novo pagamento PIX
   */
  async createPixPayment(params: CreatePixPaymentParams): Promise<CreatePixPaymentResponse> {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();

      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this.functionsUrl}/create-pix-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento');
      }

      return data;
    } catch (error: any) {
      console.error('Error in createPixPayment:', error);
      return {
        success: false,
        error: error.message || 'Erro ao conectar com servidor de pagamentos',
        pagamentoId: '',
        qrCode: '',
        qrCodeBase64: '',
        status: 'error',
        expiraEm: '',
      };
    }
  }

  /**
   * Busca detalhes de um pagamento
   */
  async getPaymentDetails(pagamentoId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('pagamentos')
        .select('*')
        .eq('id', pagamentoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  }

  /**
   * Assina atualizações em tempo real de um pagamento
   * Retorna uma subscription que deve ser unsubscribed quando não for mais necessária
   */
  subscribeToPaymentUpdates(
    pagamentoId: string,
    onUpdate: (status: string) => void
  ): RealtimeChannel {
    const channel = supabaseClient
      .channel(`payment:${pagamentoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pagamentos',
          filter: `id=eq.${pagamentoId}`,
        },
        (payload: any) => {
          console.log('Payment update received:', payload.new.status);
          onUpdate(payload.new.status);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return channel;
  }

  /**
   * Cancela uma subscription de atualizações
   */
  async unsubscribe(channel: RealtimeChannel) {
    if (channel) {
      await supabaseClient.removeChannel(channel);
    }
  }

  /**
   * Verifica status de pagamento manualmente (fallback se webhook falhar)
   */
  async checkPaymentStatus(pagamentoId: string): Promise<string | null> {
    try {
      const payment = await this.getPaymentDetails(pagamentoId);
      return payment?.status || null;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  }

  /**
   * Lista todos os pagamentos de uma leitura
   */
  async getPaymentsByLeitura(leituraId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('pagamentos')
        .select('*')
        .eq('leitura_id', leituraId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
