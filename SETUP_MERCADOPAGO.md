# Guia de Configuração - Mercado Pago PIX

Este guia explica como configurar e fazer deploy da integração com Mercado Pago PIX.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (https://supabase.com)
- Conta no Mercado Pago Developers (https://www.mercadopago.com.br/developers)
- Supabase CLI instalado: `npm install -g supabase`

---

## 🔐 Passo 1: Configurar Mercado Pago

### 1.1 Criar Aplicação

1. Acesse https://www.mercadopago.com.br/developers/panel/app
2. Clique em "Criar aplicação"
3. Dê um nome (ex: "SM Engenharia - Faturamento")
4. Selecione "Pagamentos online e Presenciais"

### 1.2 Obter Credenciais de Teste

1. No painel da aplicação, vá em "Credenciais de teste"
2. Anote:
   - **Public Key**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `TEST-xxxxxxxxxxxxx` (MANTENHA SECRETO!)

### 1.3 Criar Usuários de Teste

1. Vá em https://www.mercadopago.com.br/developers/panel/test-users
2. Crie 2 usuários:
   - **Vendedor** (para sua aplicação)
   - **Comprador** (para testar pagamentos)
3. Anote os dados de acesso

---

## 🗄️ Passo 2: Configurar Banco de Dados (Supabase)

### 2.1 Link com projeto Supabase

```bash
cd C:\Users\Lenovo\Documents\SMLeituras-main
supabase link --project-ref SEU-PROJECT-REF
```

### 2.2 Aplicar Migration

```bash
supabase db push
```

Isso criará as tabelas:
- `pagamentos` - Transações de pagamento
- `payment_logs` - Logs de webhooks
- Coluna `pagamento_id_atual` em `leituras`

### 2.3 Verificar Aplicação

Acesse o Dashboard do Supabase → Table Editor e verifique se as tabelas foram criadas.

---

## 🚀 Passo 3: Deploy das Edge Functions

### 3.1 Configurar Secrets

No terminal, configure as variáveis secretas:

```bash
# Access Token do Mercado Pago (TESTE)
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx

# Webhook Secret (vazio por enquanto, configurar depois)
supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=""

# Service Role Key do Supabase
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL do Supabase
supabase secrets set SUPABASE_URL=https://SEU-PROJECT.supabase.co
```

**Como obter Service Role Key:**
- Dashboard Supabase → Settings → API → Service Role Key

### 3.2 Deploy das Functions

```bash
supabase functions deploy create-pix-payment
supabase functions deploy mercadopago-webhook
```

### 3.3 Verificar Deploy

```bash
supabase functions list
```

Deve mostrar:
- ✅ create-pix-payment
- ✅ mercadopago-webhook

---

## 🔔 Passo 4: Configurar Webhook no Mercado Pago

### 4.1 Obter URL do Webhook

A URL será:
```
https://SEU-PROJECT.supabase.co/functions/v1/mercadopago-webhook
```

### 4.2 Configurar no Mercado Pago

1. Acesse https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em "Webhooks"
4. Clique em "Configurar notificações"
5. Cole a URL do webhook
6. Selecione eventos: ✅ **Pagamentos**
7. Salve

### 4.3 Obter Webhook Secret

1. Após salvar, o Mercado Pago mostrará um "Secret"
2. Copie esse secret
3. Atualize no Supabase:

```bash
supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui
```

---

## 💻 Passo 5: Configurar Frontend

### 5.1 Editar .env.local

Abra o arquivo `.env.local` e preencha:

```bash
# Supabase
VITE_SUPABASE_URL=https://SEU-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Mercado Pago (Public Key pode ser de teste)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Ambiente
VITE_APP_ENV=development
```

### 5.2 Instalar Dependências

```bash
npm install
```

### 5.3 Rodar Localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Passo 6: Testar Integração

### 6.1 Criar Fatura de Teste

1. Faça login como técnico (bwasistemas@gmail.com)
2. Crie uma nova leitura para um cliente
3. Anote o valor da fatura

### 6.2 Testar Pagamento

1. Faça logout e login como cliente
2. Veja a fatura pendente
3. Clique em "Pagar via PIX"
4. O sistema deve:
   - Mostrar loading "Gerando código PIX..."
   - Exibir QR Code real do Mercado Pago
   - Mostrar botão "Copiar Código Copia e Cola"

### 6.3 Simular Pagamento no Sandbox

Para testar sem pagar de verdade:

1. Use uma das ferramentas:
   - **Mercado Pago Sandbox Tester** (app mobile)
   - API do Mercado Pago para aprovar pagamento manualmente

2. Ou use a API (Postman/Insomnia):
```bash
PUT https://api.mercadopago.com/v1/payments/{payment_id}
Authorization: Bearer TEST-xxxxx
Content-Type: application/json

{
  "status": "approved"
}
```

### 6.4 Verificar Confirmação

- A tela do cliente deve atualizar automaticamente
- Status deve mudar para "Pago"
- Modal deve mostrar mensagem de sucesso

---

## 📊 Passo 7: Monitoramento

### 7.1 Logs das Edge Functions

Ver logs em tempo real:
```bash
supabase functions logs create-pix-payment
supabase functions logs mercadopago-webhook
```

Ou no Dashboard: Functions → Logs

### 7.2 Verificar Tabelas

- `pagamentos` - Ver status dos pagamentos criados
- `payment_logs` - Verificar webhooks recebidos

Query útil:
```sql
SELECT
  p.id,
  p.mercadopago_payment_id,
  p.status,
  p.valor,
  p.criado_em,
  l.cliente_nome
FROM pagamentos p
INNER JOIN leituras l ON p.leitura_id = l.id
ORDER BY p.criado_em DESC;
```

---

## 🚢 Passo 8: Deploy para Produção

### 8.1 Obter Credenciais de Produção

No Mercado Pago:
1. Vá em "Credenciais de produção"
2. Anote Access Token de produção
3. **IMPORTANTE**: Nunca commite essas credenciais!

### 8.2 Atualizar Secrets

```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
```

### 8.3 Build do Frontend

```bash
npm run build
```

### 8.4 Deploy

Deploy para sua plataforma (Vercel, Netlify, etc):

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

Certifique-se de configurar as variáveis de ambiente na plataforma de hospedagem.

---

## ✅ Checklist Final

Antes de ir para produção, verifique:

- [ ] Migration aplicada no banco de dados
- [ ] Edge Functions deployadas e funcionando
- [ ] Webhook configurado no Mercado Pago
- [ ] Credenciais de PRODUÇÃO configuradas (não teste!)
- [ ] Variáveis de ambiente configuradas no hosting
- [ ] Testado fluxo completo em produção com valor pequeno
- [ ] Monitoramento configurado (logs, alertas)
- [ ] Backup do banco de dados criado

---

## 🆘 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Verifique se `.env.local` existe e tem as variáveis corretas. Reinicie o servidor (`npm run dev`).

### QR Code não aparece

**Solução**:
1. Verifique logs da Edge Function: `supabase functions logs create-pix-payment`
2. Confirme que credenciais do Mercado Pago estão corretas
3. Teste a Edge Function manualmente via curl

### Webhook não atualiza status

**Solução**:
1. Verifique se webhook está configurado no Mercado Pago
2. Veja logs: `supabase functions logs mercadopago-webhook`
3. Teste webhook manualmente:
```bash
curl -X POST https://SEU-PROJECT.supabase.co/functions/v1/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "payment", "action": "payment.updated", "data": {"id": "123"}}'
```

### Pagamento não encontrado no banco

**Solução**: Verifique RLS policies. O service role deve ter acesso total:
```sql
SELECT * FROM pagamentos; -- Como service role
```

---

## 📞 Suporte

- **Mercado Pago Developers**: https://www.mercadopago.com.br/developers/pt/support
- **Supabase Docs**: https://supabase.com/docs
- **Issues do Projeto**: [Link para repositório]

---

## 🔒 Segurança

**IMPORTANTE:**
- ✅ Credenciais estão em variáveis de ambiente
- ✅ `.env.local` está no `.gitignore`
- ✅ Webhooks verificam assinatura HMAC
- ✅ RLS ativo em todas as tabelas
- ✅ Access tokens nunca no frontend

---

**Integração implementada com sucesso! 🎉**
