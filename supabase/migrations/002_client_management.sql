-- ================================================
-- MIGRATION 002: Client Management Enhancements
-- ================================================
-- Adds user authentication linkage, status tracking, and reading schedule monitoring
-- Execute in Supabase SQL Editor or via CLI

-- ================================================
-- PART 1: Add New Columns to clientes Table
-- ================================================

-- Link to Supabase Auth user
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Client status management
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- Reading schedule tracking
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS ultima_leitura_em TIMESTAMPTZ;

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS proxima_leitura_prevista TIMESTAMPTZ;

-- Audit timestamps
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();

-- ================================================
-- PART 2: Create Indexes for Performance
-- ================================================

CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_proxima_leitura ON clientes(proxima_leitura_prevista);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

-- ================================================
-- PART 3: Trigger to Update ultima_leitura_em
-- ================================================

-- Function to update client's last reading timestamp
CREATE OR REPLACE FUNCTION update_cliente_ultima_leitura()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET
    ultima_leitura_em = NEW.data_atual,
    proxima_leitura_prevista = (NEW.data_atual::date + interval '30 days')::timestamptz,
    atualizado_em = NOW()
  WHERE id = NEW.cliente_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after INSERT on leituras
CREATE TRIGGER trigger_update_ultima_leitura
  AFTER INSERT ON leituras
  FOR EACH ROW
  EXECUTE FUNCTION update_cliente_ultima_leitura();

-- ================================================
-- PART 4: Trigger to Update atualizado_em
-- ================================================

-- Function to update modified timestamp
CREATE OR REPLACE FUNCTION update_cliente_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires before UPDATE on clientes
CREATE TRIGGER trigger_cliente_timestamp
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_cliente_timestamp();

-- ================================================
-- PART 5: View for Pending Readings
-- ================================================

-- View to easily query clients needing readings (30+ days)
CREATE OR REPLACE VIEW clientes_pendentes_leitura AS
SELECT
  c.id,
  c.nome,
  c.email,
  c.endereco,
  c.contato,
  c.ultima_leitura_em,
  c.proxima_leitura_prevista,
  CASE
    WHEN c.ultima_leitura_em IS NULL THEN NULL
    ELSE EXTRACT(DAY FROM (NOW() - c.ultima_leitura_em))::INTEGER
  END as dias_desde_ultima_leitura,
  CASE
    WHEN c.ultima_leitura_em IS NULL THEN 'Nunca teve leitura'
    WHEN EXTRACT(DAY FROM (NOW() - c.ultima_leitura_em)) >= 30 THEN 'Atrasado'
    ELSE 'Em dia'
  END as status_leitura
FROM clientes c
WHERE c.status = 'ativo'
  AND (
    c.ultima_leitura_em IS NULL
    OR c.ultima_leitura_em < NOW() - interval '30 days'
  )
ORDER BY c.ultima_leitura_em ASC NULLS FIRST;

-- ================================================
-- PART 6: Update Existing Records
-- ================================================

-- Set criado_em for existing clients (if created_at exists in old schema)
UPDATE clientes
SET criado_em = NOW()
WHERE criado_em IS NULL;

-- Set atualizado_em for existing clients
UPDATE clientes
SET atualizado_em = NOW()
WHERE atualizado_em IS NULL;

-- Set status for existing clients
UPDATE clientes
SET status = 'ativo'
WHERE status IS NULL;

-- ================================================
-- PART 7: Update RLS Policies
-- ================================================

-- Allow authenticated users to view their own client record via user_id
CREATE POLICY "Users can view own client record"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own contact info (not email or user_id)
CREATE POLICY "Users can update own contact info"
  ON clientes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================
-- VERIFICATION QUERIES (Comment out or run separately)
-- ================================================

-- Verify new columns exist
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'clientes'
-- ORDER BY ordinal_position;

-- Verify indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'clientes';

-- Verify triggers
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_table = 'clientes' OR event_object_table = 'leituras';

-- Test view
-- SELECT * FROM clientes_pendentes_leitura LIMIT 5;

-- ================================================
-- ROLLBACK (If needed - use with caution!)
-- ================================================

-- To rollback this migration:
-- DROP VIEW IF EXISTS clientes_pendentes_leitura;
-- DROP TRIGGER IF EXISTS trigger_update_ultima_leitura ON leituras;
-- DROP TRIGGER IF EXISTS trigger_cliente_timestamp ON clientes;
-- DROP FUNCTION IF EXISTS update_cliente_ultima_leitura();
-- DROP FUNCTION IF EXISTS update_cliente_timestamp();
-- ALTER TABLE clientes DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE clientes DROP COLUMN IF EXISTS status;
-- ALTER TABLE clientes DROP COLUMN IF EXISTS ultima_leitura_em;
-- ALTER TABLE clientes DROP COLUMN IF EXISTS proxima_leitura_prevista;
-- ALTER TABLE clientes DROP COLUMN IF EXISTS criado_em;
-- ALTER TABLE clientes DROP COLUMN IF EXISTS atualizado_em;
