# ⚡ PRÓXIMOS PASSOS - O Que Você Precisa Fazer Agora

**Status:** ✅ Arquivos criados e prontos para configuração

---

## 📋 O QUE JÁ FOI FEITO AUTOMATICAMENTE:

✅ Arquivo `.env` criado (mas precisa ser preenchido)
✅ Script de setup automático criado (`setup-completo.ps1`)
✅ Correções críticas implementadas no código
✅ Migration de segurança criada
✅ Documentação completa gerada

---

## 🚀 O QUE VOCÊ PRECISA FAZER (Ordem Importante):

### **PASSO 1: Instalar Supabase CLI** ⏱️ 5 min

O Supabase CLI **NÃO** está instalado no seu sistema.

**Abra este arquivo para instruções:**
```
INSTALAR_SUPABASE_CLI.md
```

Ou execute diretamente (PowerShell como Admin):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verifique se funcionou:
```powershell
supabase --version
```

---

### **PASSO 2: Preencher o arquivo .env** ⏱️ 2 min

**Abra o arquivo:** `.env`

**Preencha com suas credenciais:**

```env
# Do Dashboard do Supabase → Settings → API
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=COLE-SUA-ANON-KEY-AQUI

# Do Painel do MercadoPago → Credenciais → Public Key
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx-xxxx-xxxx
```

**Onde encontrar cada um:**

| Credencial | Local |
|-----------|-------|
| `SUPABASE_URL` | Dashboard Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Dashboard Supabase → Settings → API → anon/public key |
| `MERCADOPAGO_PUBLIC_KEY` | MercadoPago Developers → Sua App → Credenciais → Public Key |

---

### **PASSO 3: Executar Script de Setup Automático** ⏱️ 10 min

Abra o **PowerShell** na pasta do projeto e execute:

```powershell
.\setup-completo.ps1
```

**O script vai:**
1. ✅ Verificar Node.js e Supabase CLI
2. ✅ Instalar dependências do projeto
3. ✅ Verificar configuração do .env
4. ⚠️ Pedir que você configure os **Supabase Secrets** (vai mostrar os comandos)
5. ⚠️ Pedir que você edite a lista de **técnicos autorizados**
6. ✅ Aplicar migrations no banco
7. ✅ Fazer deploy das Edge Functions

---

### **PASSO 4: Configurar Webhook no MercadoPago** ⏱️ 3 min

1. **Acesse:** https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **"Webhooks"**
4. Clique em **"Configurar notificações"**
5. Cole esta URL:
   ```
   https://SEU-PROJETO.supabase.co/functions/v1/mercadopago-webhook
   ```
   *(Substitua SEU-PROJETO pelo seu project ref do Supabase)*
6. Marque: ✅ **Pagamentos**
7. Clique em **Salvar**
8. **Copie o Webhook Secret** que aparecerá
9. Execute no terminal:
   ```bash
   supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=COLE-O-SECRET-AQUI
   ```

---

### **PASSO 5: Testar a Aplicação** ⏱️ 5 min

Execute no terminal:

```bash
npm run dev
```

Acesse: http://localhost:5173

**Teste:**
1. Faça login como cliente
2. Clique em "Pagar via PIX"
3. Veja o QR Code aparecer
4. Abra o Console (F12) e verifique os logs:
   ```
   ✓ "Criando pagamento PIX..."
   ✓ "Pagamento criado: xxx"
   ✓ "Iniciando polling fallback..."
   ✓ "PIX expira em 1800 segundos"
   ```

---

## 📊 CHECKLIST COMPLETO

Marque conforme for concluindo:

- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] Arquivo `.env` preenchido com credenciais
- [ ] Supabase Secrets configurados (4 secrets)
- [ ] Lista de técnicos editada no `003_fix_rls_policies.sql`
- [ ] Migrations aplicadas (`supabase db push`)
- [ ] Edge Functions deployadas (create-pix-payment e mercadopago-webhook)
- [ ] Webhook configurado no MercadoPago
- [ ] Webhook Secret atualizado no Supabase
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Testado geração de PIX com sucesso

---

## 🎯 ATALHOS RÁPIDOS

### **Opção A: Setup Automático (Recomendado)**
```powershell
.\setup-completo.ps1
```

### **Opção B: Setup Manual**
Siga o guia em: `APLICAR_CORRECOES_AGORA.md`

---

## 📚 DOCUMENTAÇÃO COMPLETA

| Arquivo | Descrição |
|---------|-----------|
| `INSTALAR_SUPABASE_CLI.md` | Como instalar Supabase CLI |
| `setup-completo.ps1` | Script de setup automático |
| `APLICAR_CORRECOES_AGORA.md` | Guia rápido manual (5-10 min) |
| `CORRECOES_CRITICAS_APLICADAS.md` | Detalhes técnicos completos |
| `CHANGELOG_CORRECOES.md` | Changelog das mudanças |

---

## 🆘 PRECISA DE AJUDA?

### **Erro: PowerShell não executa scripts**

Execute como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Erro: Supabase CLI não encontrado**

Siga: `INSTALAR_SUPABASE_CLI.md`

### **Erro: Migration falhou**

Verifique se você está conectado ao projeto:
```bash
supabase status
```

Se não estiver:
```bash
supabase link --project-ref SEU-PROJECT-REF
```

### **Erro: Edge Function deploy falhou**

Verifique se os secrets estão configurados:
```bash
supabase secrets list
```

---

## ✅ TUDO PRONTO?

Quando concluir todos os passos acima, você terá:

✅ Sistema de pagamentos PIX totalmente funcional
✅ Confirmação automática em tempo real
✅ Polling fallback (redundância)
✅ Tratamento de expiração de PIX
✅ Segurança RLS corrigida
✅ Webhook funcionando

---

**🎉 Comece pelo PASSO 1 agora!**

Qualquer dúvida, consulte a documentação ou me avise! 🚀
