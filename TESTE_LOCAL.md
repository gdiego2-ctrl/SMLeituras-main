# 🧪 Guia de Teste Local

Servidor rodando em: **http://localhost:3000**

---

## Teste 1: Login e Interface ✅

### 1.1 Acesse a aplicação
- Abra: http://localhost:3000
- Deve carregar a tela de login

### 1.2 Login como Técnico
- **Email**: `bwasistemas@gmail.com`
- **Senha**: [sua senha do Supabase]
- Deve redirecionar para o Dashboard do Técnico

### 1.3 Verificar Dashboard
- ✅ Ver métricas (Coletas Hoje, A Receber)
- ✅ Ver atividade recente
- ✅ Navegação inferior funcionando

---

## Teste 2: Criar Nova Leitura ✅

### 2.1 Nova Leitura
1. Clique no botão **"Nova Leitura"**
2. Busque um cliente existente
3. Preencha:
   - Leitura Atual: `1500`
   - Valor kWh: `1.19` (padrão)
   - Desconto: `0`
   - Vencimento: (15 dias)
4. Clique **"Sincronizar Leitura"**

### 2.2 Verificar Criação
- ✅ Mensagem de sucesso
- ✅ Redirecionado para Dashboard
- ✅ Leitura aparece na lista

---

## Teste 3: Visualizar como Cliente ✅

### 3.1 Fazer Logout
- Clique no botão de logout (ícone vermelho)

### 3.2 Login como Cliente
- **Email**: [email do cliente cadastrado]
- **Senha**: [senha do cliente]
- Deve redirecionar para Dashboard do Cliente

### 3.3 Verificar Interface
- ✅ Ver fatura em aberto
- ✅ Ver consumo
- ✅ Ver faturas recentes
- ✅ Tabs funcionando (Início, Consumo, Ajuda)

---

## Teste 4: Botão Pagar PIX ⚠️

### 4.1 Clicar "Pagar via PIX"
- Na fatura em aberto, clique **"Pagar via PIX"**

### 4.2 Resultado Esperado SEM Backend:

**❌ ERRO ESPERADO:**
```
Erro ao criar pagamento
Erro ao gerar código PIX. Tente novamente.
```

**Isso é NORMAL!** O backend (Edge Functions) ainda não foi configurado.

### 4.3 Resultado Esperado COM Backend:

**✅ SUCESSO:**
1. Loading: "Gerando código PIX..."
2. QR Code aparece
3. Botão "Copiar Código Copia e Cola"
4. Contador de expiração (30 min)

---

## 📊 O Que Está Funcionando Agora:

✅ **Frontend completo**
✅ **Autenticação Supabase**
✅ **CRUD de leituras**
✅ **CRUD de clientes**
✅ **Dashboard responsivo**
✅ **Navegação**
✅ **Interface de pagamento** (UI pronta)

❌ **Pagamentos PIX** (precisa configurar backend)

---

## 🚀 Para Ativar Pagamentos PIX:

Você precisa configurar o **Supabase Backend**. Execute:

### Passo 1: Instalar Supabase CLI
```bash
npm install -g supabase
```

### Passo 2: Login
```bash
supabase login
```

### Passo 3: Link com projeto
```bash
supabase link --project-ref dbvhmvymoyxkhqkewgyl
```

### Passo 4: Aplicar Migration
```bash
supabase db push
```

### Passo 5: Configurar Secrets
```bash
# Mercado Pago
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=TEST-7394624856243571-011110-742891447451fe44badea54638f2ebdc-1375293227

# Supabase URL
supabase secrets set SUPABASE_URL=https://dbvhmvymoyxkhqkewgyl.supabase.co

# Service Role (pegar no dashboard)
# https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/settings/api
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-key
```

### Passo 6: Deploy Functions
```bash
supabase functions deploy create-pix-payment
supabase functions deploy mercadopago-webhook
```

---

## 🔍 Debug Console

Abra o DevTools (F12) e veja:

### Console
- Mensagens de erro ou sucesso
- Logs de criação de pagamento
- Status de requisições

### Network
- Requisições para Supabase
- Status codes (200, 404, 500)
- Payloads JSON

---

## ✅ Checklist de Teste

### Interface (Frontend)
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Nova leitura cria fatura
- [ ] Histórico mostra leituras
- [ ] Cliente vê suas faturas
- [ ] Modal de pagamento abre

### Backend (Quando configurar)
- [ ] QR Code é gerado
- [ ] Copia e Cola funciona
- [ ] Webhook recebe notificação
- [ ] Status atualiza automaticamente
- [ ] Modal mostra sucesso

---

## 🐛 Erros Comuns

### "Missing Supabase environment variables"
**Solução:** Reiniciar servidor (Ctrl+C e `npm run dev`)

### Console: "Failed to fetch"
**Causa:** Edge Functions não deployadas
**Solução:** Seguir passos de configuração do backend

### "User not authenticated"
**Solução:** Fazer logout/login novamente

### Página branca
**Solução:** Verificar console (F12) para erros

---

**Boa sorte com os testes! 🚀**
