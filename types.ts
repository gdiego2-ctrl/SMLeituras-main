
export interface Client {
  id: string;
  nome: string;
  endereco: string;
  contato: string;
  id_medidor: string;
  tipo_tensao: 'Monofásico' | 'Bifásico' | 'Trifásico';
  email: string;
  // New fields for authentication and monitoring
  user_id?: string; // Link to Supabase Auth user
  status?: 'ativo' | 'inativo' | 'suspenso'; // Client status
  ultima_leitura_em?: string; // Timestamp of last reading
  proxima_leitura_prevista?: string; // Expected next reading date
  criado_em?: string; // Created timestamp
  atualizado_em?: string; // Updated timestamp
}

export interface Reading {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  leitura_anterior: number;
  leitura_atual: number;
  valor_kwh: number;
  desconto_percentual: number;
  data_anterior: string;
  data_atual: string;
  vencimento: string;
  valor_total: number;
  consumo_periodo: number;
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Sincronizado' | 'Cancelada';
  observacoes?: string;
  pago_em?: string;
  pagamento_id_atual?: string;
}

export interface Pagamento {
  id: string;
  leitura_id: string;
  mercadopago_payment_id: number;
  valor: number;
  tipo_pagamento: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'in_process';
  qr_code: string;
  qr_code_base64: string;
  criado_em: string;
  expira_em: string;
  pago_em?: string;
  atualizado_em: string;
  metadados?: any;
}

export type UserRole = 'tecnico' | 'cliente';

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  } | null;
}
