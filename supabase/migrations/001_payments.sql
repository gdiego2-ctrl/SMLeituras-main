-- Migration: Adicionar sistema de pagamentos PIX via Mercado Pago
-- Criado em: 2026-01-11

-- ============================================
-- Tabela: pagamentos
-- Armazena transações de pagamento PIX
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leitura_id UUID NOT NULL REFERENCES leituras(id) ON DELETE CASCADE,

  -- Identificadores do Mercado Pago
  mercadopago_payment_id BIGINT UNIQUE,
  mercadopago_preference_id TEXT,

  -- Detalhes do pagamento
  valor DECIMAL(10, 2) NOT NULL,
  tipo_pagamento TEXT NOT NULL DEFAULT 'pix',
  status TEXT NOT NULL DEFAULT 'pending',

  -- Dados do PIX
  qr_code TEXT,                    -- Copia e Cola string
  qr_code_base64 TEXT,             -- QR Code image base64

  -- Timestamps
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  expira_em TIMESTAMPTZ,           -- Expiração em 30 minutos
  pago_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),

  -- Metadados adicionais (JSON flexível)
  metadados JSONB,

  -- Constraint: apenas status válidos
  CONSTRAINT pagamentos_status_check CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired', 'in_process')
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_leitura_id ON pagamentos(leitura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mp_id ON pagamentos(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_criado_em ON pagamentos(criado_em DESC);

-- ============================================
-- Tabela: payment_logs
-- Auditoria de webhooks do Mercado Pago
-- ============================================
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pagamento_id UUID REFERENCES pagamentos(id) ON DELETE SET NULL,

  -- Detalhes do evento
  evento_tipo TEXT NOT NULL,
  mp_payment_id BIGINT,
  payload JSONB NOT NULL,

  -- Validação de segurança
  signature_valid BOOLEAN,
  ip_address TEXT,

  -- Controle de processamento
  recebido_em TIMESTAMPTZ DEFAULT NOW(),
  processado_em TIMESTAMPTZ,
  status TEXT DEFAULT 'received',
  erro_mensagem TEXT,

  CONSTRAINT payment_logs_status_check CHECK (
    status IN ('received', 'processing', 'processed', 'failed')
  )
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_pagamento_id ON payment_logs(pagamento_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_recebido_em ON payment_logs(recebido_em DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_mp_id ON payment_logs(mp_payment_id);

-- ============================================
-- Alterar tabela leituras
-- Adicionar referência ao pagamento atual
-- ============================================
ALTER TABLE leituras
ADD COLUMN IF NOT EXISTS pagamento_id_atual UUID REFERENCES pagamentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leituras_pagamento_id ON leituras(pagamento_id_atual);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Ativar RLS na tabela pagamentos
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policy: Clientes veem apenas seus próprios pagamentos
CREATE POLICY "clientes_veem_seus_pagamentos"
  ON pagamentos FOR SELECT
  USING (
    leitura_id IN (
      SELECT l.id FROM leituras l
      INNER JOIN clientes c ON l.cliente_id = c.id
      WHERE c.email = auth.jwt() ->> 'email'
    )
  );

-- Policy: Técnicos e administradores veem tudo
CREATE POLICY "tecnicos_veem_tudo"
  ON pagamentos FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'bwasistemas@gmail.com'
    OR auth.jwt() ->> 'email' LIKE '%tecnico%'
  );

-- Policy: Service role (Edge Functions) tem acesso total
CREATE POLICY "service_role_full_access"
  ON pagamentos FOR ALL
  USING (auth.role() = 'service_role');

-- Ativar RLS na tabela payment_logs
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas técnicos e service role acessam logs
CREATE POLICY "tecnicos_veem_logs"
  ON payment_logs FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'bwasistemas@gmail.com'
    OR auth.jwt() ->> 'email' LIKE '%tecnico%'
    OR auth.role() = 'service_role'
  );

CREATE POLICY "service_role_manage_logs"
  ON payment_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Função: Atualizar timestamp automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_pagamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Atualizar atualizado_em ao modificar pagamento
DROP TRIGGER IF EXISTS trigger_update_pagamentos_timestamp ON pagamentos;
CREATE TRIGGER trigger_update_pagamentos_timestamp
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_pagamentos_updated_at();

-- ============================================
-- Comentários nas tabelas (documentação)
-- ============================================
COMMENT ON TABLE pagamentos IS 'Transações de pagamento PIX via Mercado Pago';
COMMENT ON COLUMN pagamentos.mercadopago_payment_id IS 'ID único do pagamento no Mercado Pago';
COMMENT ON COLUMN pagamentos.qr_code IS 'String Copia e Cola do PIX';
COMMENT ON COLUMN pagamentos.qr_code_base64 IS 'Imagem QR Code em base64';
COMMENT ON COLUMN pagamentos.expira_em IS 'Pagamento expira após 30 minutos';

COMMENT ON TABLE payment_logs IS 'Log de auditoria de webhooks do Mercado Pago';
COMMENT ON COLUMN payment_logs.signature_valid IS 'Se a assinatura HMAC do webhook foi validada';

COMMENT ON COLUMN leituras.pagamento_id_atual IS 'Referência ao pagamento ativo desta leitura/fatura';
