
import { createClient } from '@supabase/supabase-js';
import { Client, Reading, PaymentHistoryItem, ClientHistorySummary, ConsumptionData } from './types';
import { PAYMENT_DEADLINE_DAYS, READING_INTERVAL_DAYS } from './constants';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin client for operations requiring service role
// Note: Service Role Key should NEVER be exposed to the client in production!
// For security, admin operations should be done via Edge Functions instead
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export const supabase = {
  auth: supabaseClient.auth,
  
  clients: {
    async list(): Promise<Client[]> {
      try {
        const { data, error } = await supabaseClient
          .from('clientes')
          .select('*')
          .order('nome', { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        return [];
      }
    },
    async save(client: Partial<Client>): Promise<void> {
      const { id, ...dataWithoutId } = client;
      if (!id) {
        const { error } = await supabaseClient.from('clientes').insert([dataWithoutId]);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from('clientes').update(dataWithoutId).eq('id', id);
        if (error) throw error;
      }
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabaseClient.from('clientes').delete().eq('id', id);
      if (error) throw error;
    },

    /**
     * Creates a new client AND auth user in a single operation
     * Requires Service Role Key for admin.createUser()
     * @param clientData - Client information (without id)
     * @param password - Initial password for the client
     * @returns The created client with user_id populated
     */
    async createClientWithAuth(clientData: Omit<Client, 'id'>, password: string): Promise<Client> {
      if (!supabaseAdmin) {
        throw new Error(
          'Service Role Key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local'
        );
      }

      if (!clientData.email) {
        throw new Error('Email is required to create client');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      try {
        // Step 1: Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: clientData.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: clientData.nome,
            role: 'cliente'
          }
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          throw new Error(`Failed to create user account: ${authError.message}`);
        }

        if (!authData.user) {
          throw new Error('User creation returned no data');
        }

        // Step 2: Create client record with user_id link
        const newClientData = {
          ...clientData,
          user_id: authData.user.id,
          status: 'ativo',
          proxima_leitura_prevista: new Date(
            Date.now() + READING_INTERVAL_DAYS * 24 * 60 * 60 * 1000
          ).toISOString(),
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };

        const { data: clientRecord, error: clientError } = await supabaseClient
          .from('clientes')
          .insert([newClientData])
          .select()
          .single();

        if (clientError) {
          // Rollback: Delete the auth user if client creation fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          console.error('Error creating client record:', clientError);
          throw new Error(`Failed to create client record: ${clientError.message}`);
        }

        return clientRecord as Client;
      } catch (error: any) {
        console.error('Error in createClientWithAuth:', error);
        throw error;
      }
    },

    /**
     * Check if a client can be deleted
     * Blocks deletion if there are pending or overdue invoices
     * @param clientId - Client UUID
     * @returns Object with canDelete flag and count of pending invoices
     */
    async canDeleteClient(clientId: string): Promise<{ canDelete: boolean; pendingCount: number; message: string }> {
      try {
        // Query for any readings that are not 'Pago' or 'Cancelada'
        const { data: readings, error } = await supabaseClient
          .from('leituras')
          .select('id, status')
          .eq('cliente_id', clientId)
          .in('status', ['Pendente', 'Vencido']);

        if (error) {
          console.error('Error checking client readings:', error);
          throw error;
        }

        const pendingCount = readings?.length || 0;
        const canDelete = pendingCount === 0;

        return {
          canDelete,
          pendingCount,
          message: canDelete
            ? 'Cliente pode ser excluído'
            : `Cliente possui ${pendingCount} fatura(s) pendente(s). Regularize antes de excluir.`
        };
      } catch (error: any) {
        console.error('Error in canDeleteClient:', error);
        throw error;
      }
    },

    /**
     * Delete client AND associated auth user
     * Validates that no pending invoices exist before deletion
     * @param clientId - Client UUID
     * @param userId - Auth user UUID
     */
    async deleteClientWithAuth(clientId: string, userId?: string): Promise<void> {
      if (!supabaseAdmin) {
        throw new Error(
          'Service Role Key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to .env.local'
        );
      }

      try {
        // Step 1: Check if client can be deleted
        const { canDelete, message } = await this.canDeleteClient(clientId);

        if (!canDelete) {
          throw new Error(message);
        }

        // Step 2: Get client data to retrieve user_id if not provided
        if (!userId) {
          const { data: client, error: clientError } = await supabaseClient
            .from('clientes')
            .select('user_id')
            .eq('id', clientId)
            .single();

          if (clientError) {
            throw new Error(`Failed to fetch client data: ${clientError.message}`);
          }

          userId = client?.user_id;
        }

        // Step 3: Delete client record (will cascade to paid leituras if configured)
        const { error: deleteError } = await supabaseClient
          .from('clientes')
          .delete()
          .eq('id', clientId);

        if (deleteError) {
          console.error('Error deleting client:', deleteError);
          throw new Error(`Failed to delete client: ${deleteError.message}`);
        }

        // Step 4: Delete auth user if user_id exists
        if (userId) {
          const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

          if (authDeleteError) {
            console.warn('Client deleted but auth user deletion failed:', authDeleteError);
            // Don't throw here - client is already deleted
          }
        }
      } catch (error: any) {
        console.error('Error in deleteClientWithAuth:', error);
        throw error;
      }
    },

    /**
     * Get clients that need readings (30+ days since last reading or never had one)
     * Uses the clientes_pendentes_leitura view created in migration
     */
    async getPendingReadings(): Promise<any[]> {
      try {
        const { data, error } = await supabaseClient
          .from('clientes_pendentes_leitura')
          .select('*')
          .order('dias_desde_ultima_leitura', { ascending: false, nullsFirst: true });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching pending readings:', err);
        return [];
      }
    }
  },
  
  readings: {
    async list(): Promise<Reading[]> {
      try {
        const { data, error } = await supabaseClient
          .from('leituras')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const today = new Date().toISOString().split('T')[0];
        
        return (data || []).map(r => {
          const reading = r as any;
          let currentStatus = reading.status || 'Pendente';
          if (currentStatus === 'Sincronizado') currentStatus = 'Pendente';
          
          const venc = reading.vencimento || today;
          if (currentStatus !== 'Pago' && currentStatus !== 'Cancelada' && venc < today) {
            currentStatus = 'Vencido';
          }

          return { ...reading, status: currentStatus } as Reading;
        });
      } catch (err) {
        console.error("Erro ao listar faturas:", err);
        return [];
      }
    },
    async getById(id: string): Promise<Reading | null> {
      try {
        const { data, error } = await supabaseClient
          .from('leituras')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        if (!data) return null;

        const today = new Date().toISOString().split('T')[0];
        const reading = data as any;
        let currentStatus = reading.status || 'Pendente';
        
        const venc = reading.vencimento || today;
        if (currentStatus !== 'Pago' && currentStatus !== 'Cancelada' && venc < today) {
          currentStatus = 'Vencido';
        }

        return { ...reading, status: currentStatus } as Reading;
      } catch (err) {
        return null;
      }
    },
    async save(reading: Partial<Reading>): Promise<void> {
      const { id, ...payload } = reading;
      const { error } = await supabaseClient
        .from('leituras')
        .insert([{ ...payload, status: 'Pendente' }]);
      if (error) throw error;
    },
    async markAsPaid(id: string): Promise<void> {
      console.log("Comando: Marcar como PAGO", id);
      const { error } = await supabaseClient
        .from('leituras')
        .update({ status: 'Pago', pago_em: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error("Erro no update de pagamento:", error);
        throw error;
      }
    },
    async cancel(id: string): Promise<void> {
      console.log("Comando: CANCELAR fatura", id);
      const { error } = await supabaseClient
        .from('leituras')
        .update({ status: 'Cancelada' })
        .eq('id', id);
      
      if (error) {
        console.error("Erro no update de cancelamento:", error);
        throw error;
      }
    },
    async getLastByClient(clientId: string): Promise<Reading | null> {
      const { data } = await supabaseClient
        .from('leituras')
        .select('*')
        .eq('cliente_id', clientId)
        .order('data_atual', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data || null;
    },

    /**
     * Manual payment regularization
     * Creates a manual payment record and marks reading as paid
     * @param leituraId - Reading/invoice ID
     * @param valorAjustado - Adjusted amount (if different from original)
     * @param observacao - Required reason/observation
     */
    async markAsPaidManual(
      leituraId: string,
      valorAjustado: number,
      observacao: string
    ): Promise<void> {
      if (!observacao?.trim()) {
        throw new Error('Observação é obrigatória para regularização manual');
      }

      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      // Validar leitura
      const reading = await this.getById(leituraId);
      if (!reading) throw new Error('Fatura não encontrada');
      if (reading.status === 'Pago') throw new Error('Fatura já está paga');

      // Criar pagamento manual
      const { data: pagamento, error: pagamentoError } = await supabaseClient
        .from('pagamentos')
        .insert({
          leitura_id: leituraId,
          valor: reading.valor_total,
          valor_ajustado: valorAjustado !== reading.valor_total ? valorAjustado : null,
          tipo_pagamento: 'manual',
          status: 'approved',
          is_manual: true,
          observacao: observacao.trim(),
          criado_por: session.user.id,
          pago_em: new Date().toISOString(),
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (pagamentoError) throw pagamentoError;

      // Atualizar leitura
      const { error: leituraError } = await supabaseClient
        .from('leituras')
        .update({
          status: 'Pago',
          pago_em: new Date().toISOString(),
          pagamento_id_atual: pagamento.id,
          observacoes: observacao
        })
        .eq('id', leituraId);

      if (leituraError) throw leituraError;
    },

    /**
     * Get all readings for a specific client
     * Used for client history screen
     * @param clientId - Client UUID
     */
    async getByClientId(clientId: string): Promise<Reading[]> {
      try {
        const { data, error } = await supabaseClient
          .from('leituras')
          .select('*')
          .eq('cliente_id', clientId)
          .order('data_atual', { ascending: false });

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];

        return (data || []).map(r => {
          const reading = r as any;
          let currentStatus = reading.status || 'Pendente';

          const venc = reading.vencimento || today;
          if (currentStatus !== 'Pago' && currentStatus !== 'Cancelada' && venc < today) {
            currentStatus = 'Vencido';
          }

          return { ...reading, status: currentStatus } as Reading;
        });
      } catch (err) {
        console.error('Error fetching client readings:', err);
        return [];
      }
    }
  },

  payments: {
    /**
     * Get all payment history for a client
     * Includes both PIX and manual payments
     * @param clientId - Client UUID
     */
    async getByClientId(clientId: string): Promise<PaymentHistoryItem[]> {
      try {
        const { data, error } = await supabaseClient
          .from('pagamentos')
          .select(`*, leituras!inner(cliente_id)`)
          .eq('leituras.cliente_id', clientId)
          .order('criado_em', { ascending: false });

        if (error) throw error;

        return (data || []).map(p => ({
          id: p.id,
          leituraId: p.leitura_id,
          valor: p.valor_ajustado || p.valor,
          tipoPagamento: p.tipo_pagamento,
          dataRegistro: p.pago_em || p.criado_em,
          observacao: p.observacao,
          isManual: p.is_manual || false,
          criadoPor: p.criado_por
        }));
      } catch (err) {
        console.error('Error fetching payment history:', err);
        return [];
      }
    }
  },

  history: {
    /**
     * Get complete client history summary
     * Aggregates financial data for summary cards
     * @param clientId - Client UUID
     */
    async getClientSummary(clientId: string): Promise<ClientHistorySummary | null> {
      try {
        const readings = await supabase.readings.getByClientId(clientId);
        if (readings.length === 0) return null;

        const totalBilled = readings.reduce((sum, r) => sum + Number(r.valor_total), 0);
        const totalPaid = readings
          .filter(r => r.status === 'Pago')
          .reduce((sum, r) => sum + Number(r.valor_total), 0);
        const totalOutstanding = readings
          .filter(r => r.status !== 'Pago' && r.status !== 'Cancelada')
          .reduce((sum, r) => sum + Number(r.valor_total), 0);

        return {
          clientId,
          clientName: readings[0]?.cliente_nome || '',
          totalBilled,
          totalPaid,
          totalOutstanding,
          monthlyAverage: readings.length > 0 ? totalBilled / readings.length : 0,
          invoiceCount: readings.length,
          paidInvoiceCount: readings.filter(r => r.status === 'Pago').length,
          pendingInvoiceCount: readings.filter(r => r.status === 'Pendente').length,
          overdueInvoiceCount: readings.filter(r => r.status === 'Vencido').length
        };
      } catch (err) {
        console.error('Error getting client summary:', err);
        return null;
      }
    },

    /**
     * Get consumption data for charts (month by month)
     * @param clientId - Client UUID
     */
    async getConsumptionData(clientId: string): Promise<ConsumptionData[]> {
      try {
        const readings = await supabase.readings.getByClientId(clientId);

        const monthlyData = readings.reduce((acc, reading) => {
          const date = new Date(reading.data_atual);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!acc[monthKey]) {
            acc[monthKey] = {
              month: monthKey,
              monthLabel: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
              consumoKwh: 0,
              valorTotal: 0
            };
          }

          acc[monthKey].consumoKwh += reading.consumo_periodo;
          acc[monthKey].valorTotal += Number(reading.valor_total);
          return acc;
        }, {} as Record<string, ConsumptionData>);

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      } catch (err) {
        console.error('Error getting consumption data:', err);
        return [];
      }
    }
  }
};
