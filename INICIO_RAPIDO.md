# 🚀 Início Rápido - Mercado Pago PIX

Configuração rápida para começar a testar pagamentos PIX.

---

## ✅ Checklist

### 1. Credenciais já configuradas ✓

- ✅ **Public Key** no `.env.local`: `TEST-039d1303-83fc-4a61-93f2-c5bf1a74079b`
- ✅ **Access Token** pronto para Supabase secrets: `TEST-7394624856243571-011110-...`

---

## 📝 Próximos Passos

### Passo 1: Instalar Supabase CLI

```bash
npm install -g supabase
```

Verificar instalação:
```bash
supabase --version
```

---

### Passo 2: Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para você fazer login.

---

### Passo 3: Link com seu projeto

```bash
supabase link --project-ref dbvhmvymoyxkhqkewgyl
```

---

### Passo 4: Configurar Secrets

**No Windows, execute:**
```bash
setup-secrets.bat
```

**Ou manualmente:**
```bash
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-7394624856243571-011110-742891447451fe44badea54638f2ebdc-1375293227

supabase secrets set SUPABASE_URL=https://dbvhmvymoyxkhqkewgyl.supabase.co

supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=""
```

**IMPORTANTE:** Você ainda precisa configurar a **Service Role Key**:

1. Acesse: https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/settings/api
2. Role até "Project API keys"
3. Copie a chave **service_role** (clique em "Reveal" para ver)
4. Execute:
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### Passo 5: Aplicar Migration no Banco

```bash
supabase db push
```

Isso criará as tabelas:
- `pagamentos`
- `payment_logs`
- Coluna `pagamento_id_atual` em `leituras`

---

### Passo 6: Deploy das Edge Functions

```bash
supabase functions deploy create-pix-payment
supabase functions deploy mercadopago-webhook
```

Aguarde o deploy completar. Você verá:
```
✓ create-pix-payment deployed
✓ mercadopago-webhook deployed
```

---

### Passo 7: Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Clique em **"Webhooks"** no menu lateral
4. Clique em **"Configurar notificações"**
5. Cole a URL:
   ```
   https://dbvhmvymoyxkhqkewgyl.supabase.co/functions/v1/mercadopago-webhook
   ```
6. Selecione eventos: ✅ **Pagamentos**
7. Clique em **"Salvar"**

**Webhook Secret** (opcional por enquanto):
- Após salvar, o MP mostrará um "Secret"
- Se quiser configurar, execute:
  ```bash
  supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=seu-secret-aqui
  ```

---

### Passo 8: Testar Localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Como Testar Pagamento

### 1. Criar Fatura de Teste

1. Login como **técnico**: `bwasistemas@gmail.com`
2. Vá em "Nova Leitura"
3. Selecione um cliente
4. Preencha os dados e crie a leitura

### 2. Pagar como Cliente

1. Faça logout
2. Login como **cliente** (use o email do cliente)
3. Visualize a fatura pendente
4. Clique em **"Pagar via PIX"**

### 3. O que deve acontecer:

✅ Loading: "Gerando código PIX..."
✅ QR Code real do Mercado Pago aparece
✅ Botão "Copiar Código Copia e Cola" funciona
✅ Expira em 30 minutos

---

## 💰 Simular Pagamento no Sandbox

Como é ambiente de **teste**, você precisa simular a aprovação do pagamento.

### Opção 1: Via API (Recomendado)

Use Postman ou Insomnia:

```http
PUT https://api.mercadopago.com/v1/payments/{PAYMENT_ID}
Authorization: Bearer TEST-7394624856243571-011110-742891447451fe44badea54638f2ebdc-1375293227
Content-Type: application/json

{
  "status": "approved",
  "status_detail": "accredited"
}
```

**Onde encontrar o PAYMENT_ID?**
- No console do navegador (F12), procure por "mercadopago_payment_id"
- Ou consulte a tabela `pagamentos` no Supabase

### Opção 2: App Mercado Pago de Teste

1. Baixe o app do Mercado Pago
2. Faça login com o **usuário de teste** (criar em: https://www.mercadopago.com.br/developers/panel/test-users)
3. Escaneie o QR Code
4. Confirme o pagamento

---

## ✅ Verificar Sucesso

Após simular o pagamento:

1. **Webhook é recebido** (em ~2 segundos)
2. **Status atualiza para "Pago"** no banco
3. **Frontend recebe atualização em tempo real**
4. **Modal mostra**: "Pagamento Confirmado! 🎉"
5. **Página recarrega** automaticamente após 3 segundos

---

## 🔍 Monitoramento

### Ver Logs das Edge Functions

```bash
# Logs da criação de PIX
supabase functions logs create-pix-payment --tail

# Logs do webhook
supabase functions logs mercadopago-webhook --tail
```

### Verificar Banco de Dados

No Dashboard do Supabase:
- Tabela `pagamentos` → Ver pagamentos criados
- Tabela `payment_logs` → Ver webhooks recebidos

---

## ❌ Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Reinicie o servidor dev
```bash
npm run dev
```

### QR Code não aparece

**Solução**: Verifique os logs
```bash
supabase functions logs create-pix-payment
```

Erros comuns:
- Access Token incorreto
- Edge Function não deployada
- Secrets não configurados

### Webhook não funciona

**Solução**:
1. Verifique se a URL está correta no Mercado Pago
2. Teste manualmente:
   ```bash
   curl -X POST https://dbvhmvymoyxkhqkewgyl.supabase.co/functions/v1/mercadopago-webhook \
     -H "Content-Type: application/json" \
     -d '{"type": "payment", "action": "payment.updated", "data": {"id": "123"}}'
   ```

---

## 📞 Suporte

- **Mercado Pago**: https://www.mercadopago.com.br/developers/pt/support
- **Supabase**: https://supabase.com/docs

---

**Tudo pronto! Boa sorte com os testes! 🚀**
