-- =====================================================
-- Migration 004: Manual Payment Regularization Support
-- =====================================================
-- Adds support for manual payment tracking with audit trail
-- Allows admin/technician to manually mark invoices as paid
-- with adjusted amounts and required observation notes

-- Add columns to pagamentos table for manual payment tracking
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_ajustado DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS observacao TEXT,
ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES auth.users(id);

-- Add indexes for performance on queries filtering manual payments
CREATE INDEX IF NOT EXISTS idx_pagamentos_is_manual ON pagamentos(is_manual);
CREATE INDEX IF NOT EXISTS idx_pagamentos_criado_por ON pagamentos(criado_por);

-- Update tipo_pagamento constraint to include 'manual' option
ALTER TABLE pagamentos DROP CONSTRAINT IF EXISTS pagamentos_tipo_check;
ALTER TABLE pagamentos
ADD CONSTRAINT pagamentos_tipo_check CHECK (tipo_pagamento IN ('pix', 'manual'));

-- Add column comments for documentation
COMMENT ON COLUMN pagamentos.is_manual IS 'Indica se o pagamento foi regularizado manualmente pelo admin/técnico';
COMMENT ON COLUMN pagamentos.valor_ajustado IS 'Valor ajustado pelo técnico antes de marcar como pago (se diferente do valor original)';
COMMENT ON COLUMN pagamentos.observacao IS 'Motivo/observação obrigatória para pagamentos manuais';
COMMENT ON COLUMN pagamentos.criado_por IS 'Usuário (técnico/admin) que registrou o pagamento manual';

-- =====================================================
-- RLS Policies for Manual Payments
-- =====================================================

-- Policy: Técnicos podem criar pagamentos manuais
CREATE POLICY IF NOT EXISTS "tecnicos_criam_pagamentos_manuais"
  ON pagamentos FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'bwasistemas@gmail.com'
    OR auth.jwt() ->> 'email' = 'gdiego2@gmail.com'
    OR auth.jwt() ->> 'email' LIKE '%tecnico%'
  );

-- Policy: Técnicos podem atualizar observações em leituras
CREATE POLICY IF NOT EXISTS "tecnicos_atualizam_observacoes"
  ON leituras FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'bwasistemas@gmail.com'
    OR auth.jwt() ->> 'email' = 'gdiego2@gmail.com'
    OR auth.jwt() ->> 'email' LIKE '%tecnico%'
  );

-- Migration complete
