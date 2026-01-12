-- Migration: Corrigir RLS Policies permissivas
-- Criado em: 2026-01-12
-- CORREÇÃO CRÍTICA #4: Policy com LIKE '%tecnico%' é vulnerável
--
-- PROBLEMA: Qualquer usuário com "tecnico" no email (ex: hacker_tecnico@gmail.com)
-- teria acesso total aos pagamentos.
--
-- SOLUÇÃO: Usar lista explícita de emails autorizados ou roles do Supabase Auth

-- ============================================
-- Remover policies antigas (inseguras)
-- ============================================

DROP POLICY IF EXISTS "tecnicos_veem_tudo" ON pagamentos;
DROP POLICY IF EXISTS "tecnicos_veem_logs" ON payment_logs;

-- ============================================
-- Criar policies seguras para tabela pagamentos
-- ============================================

-- Policy: Administradores e técnicos autorizados veem tudo
-- IMPORTANTE: Adicione aqui os emails dos técnicos autorizados da sua empresa
CREATE POLICY "tecnicos_autorizados_veem_tudo"
  ON pagamentos FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'bwasistemas@gmail.com',
      'admin@smengenharia.com',
      'tecnico1@smengenharia.com',
      'tecnico2@smengenharia.com'
      -- Adicione mais emails de técnicos aqui conforme necessário
    )
  );

-- Alternative approach using custom claims (recomendado para produção)
-- Caso você configure roles customizadas no Supabase Auth:
-- CREATE POLICY "tecnicos_por_role"
--   ON pagamentos FOR ALL
--   USING (
--     auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'tecnico')
--   );

-- ============================================
-- Criar policies seguras para tabela payment_logs
-- ============================================

-- Policy: Apenas técnicos autorizados veem logs
CREATE POLICY "tecnicos_autorizados_veem_logs"
  ON payment_logs FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'bwasistemas@gmail.com',
      'admin@smengenharia.com',
      'tecnico1@smengenharia.com',
      'tecnico2@smengenharia.com'
    )
    OR auth.role() = 'service_role'
  );

-- ============================================
-- Comentários de documentação
-- ============================================

COMMENT ON POLICY "tecnicos_autorizados_veem_tudo" ON pagamentos IS
  'Permite acesso total aos pagamentos apenas para técnicos e admins explicitamente autorizados';

COMMENT ON POLICY "tecnicos_autorizados_veem_logs" ON payment_logs IS
  'Permite visualização de logs apenas para técnicos autorizados e service role';

-- ============================================
-- Instruções para adicionar novos técnicos
-- ============================================

-- Para adicionar um novo técnico autorizado, execute:
--
-- ALTER POLICY "tecnicos_autorizados_veem_tudo" ON pagamentos
-- USING (
--   auth.jwt() ->> 'email' IN (
--     'bwasistemas@gmail.com',
--     'admin@smengenharia.com',
--     'tecnico1@smengenharia.com',
--     'tecnico2@smengenharia.com',
--     'novo_tecnico@smengenharia.com'  -- <- Adicione aqui
--   )
-- );
--
-- Repita para a policy de payment_logs também.
