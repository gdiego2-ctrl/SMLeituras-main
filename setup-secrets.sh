#!/bin/bash

# Script para configurar secrets do Supabase
# Execute: bash setup-secrets.sh

echo "🔐 Configurando secrets do Supabase..."
echo ""

# Mercado Pago Access Token (PRIVADO - apenas backend)
echo "📝 Configurando Mercado Pago Access Token..."
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-7394624856243571-011110-742891447451fe44badea54638f2ebdc-1375293227

# Supabase URL
echo "📝 Configurando Supabase URL..."
supabase secrets set SUPABASE_URL=https://dbvhmvymoyxkhqkewgyl.supabase.co

# Supabase Service Role Key (você precisa pegar no dashboard)
echo ""
echo "⚠️  ATENÇÃO: Você precisa configurar manualmente:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/settings/api"
echo "2. Copie a 'service_role' key (secret)"
echo "3. Execute:"
echo ""
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui"
echo ""
echo "4. (Opcional) Configure o webhook secret do Mercado Pago:"
echo "   supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=seu-webhook-secret"
echo ""

echo "✅ Secrets principais configurados!"
echo ""
echo "Próximo passo: Aplicar migration no banco de dados"
echo "Execute: supabase db push"
