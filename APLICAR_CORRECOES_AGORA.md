# ⚡ Aplicar Correções Críticas - GUIA RÁPIDO

**Tempo estimado:** 5-10 minutos

---

## 🚨 O que foi corrigido?

✅ **Confirmação de pagamento com polling fallback** (se Realtime falhar)
✅ **Tratamento automático de expiração de PIX** (gerar novo código)
✅ **Brecha de segurança na RLS Policy corrigida** (emails autorizados)

---

## 📋 Passo a Passo

### **1️⃣ Editar Lista de Técnicos Autorizados (IMPORTANTE!)**

Abra o arquivo: `supabase/migrations/003_fix_rls_policies.sql`

Encontre estas linhas (por volta da linha 19):

```sql
auth.jwt() ->> 'email' IN (
  'bwasistemas@gmail.com',
  'admin@smengenharia.com',
  'tecnico1@smengenharia.com',  -- ← EDITE AQUI
  'tecnico2@smengenharia.com'   -- ← EDITE AQUI
  -- Adicione mais emails aqui conforme necessário
)
```

**SUBSTITUA** `tecnico1@smengenharia.com` e `tecnico2@smengenharia.com` pelos **emails reais** dos seus técnicos.

**Exemplo:**
```sql
auth.jwt() ->> 'email' IN (
  'bwasistemas@gmail.com',
  'joao.silva@smengenharia.com',
  'maria.santos@smengenharia.com'
)
```

**Repita o mesmo** na linha 45 (policy de logs).

---

### **2️⃣ Aplicar Migration no Banco de Dados**

Abra o terminal e execute:

```bash
cd C:\Users\Lenovo\Documents\SMLeituras-main

supabase db push
```

**O que isso faz:**
- Remove a policy insegura antiga
- Cria a nova policy com lista de emails autorizados
- Corrige a brecha de segurança

---

### **3️⃣ Rebuild do Frontend (Opcional - Desenvolvimento)**

Se estiver rodando em **desenvolvimento local**:

```bash
npm run dev
```

Se for fazer **deploy em produção**:

```bash
npm run build
```

**Não precisa modificar nenhum código!** As correções já estão implementadas no `ClientDashboard.tsx`.

---

## ✅ Pronto! As correções estão aplicadas

### **Como testar se funcionou:**

1. **Abra o app e gere um pagamento PIX**
2. **Abra o Console do navegador (F12)**
3. **Procure por estes logs:**
   ```
   ✓ "Iniciando polling fallback para pagamento: xxx"
   ✓ "PIX expira em X segundos"
   ```

4. **Aguarde 30 minutos (ou mude o timer para 10s no código)**
   - Deve aparecer: "Código PIX Expirado"
   - Botão: "Gerar Novo Código"

5. **Teste a segurança:**
   - Tente fazer login com email NÃO autorizado
   - Tente acessar pagamentos → Não deve ter acesso

---

## 🆘 Deu erro?

### **Erro: "Migration failed"**

Verifique se você tem conexão com Supabase:
```bash
supabase status
```

Se não estiver conectado:
```bash
supabase link --project-ref SEU-PROJECT-REF
```

### **Erro: "RLS policy already exists"**

Significa que a migration antiga ainda está ativa. Delete manualmente:
```sql
DROP POLICY IF EXISTS "tecnicos_veem_tudo" ON pagamentos;
```

Depois execute `supabase db push` novamente.

---

## 📞 Perguntas Frequentes

**Q: Preciso modificar o código do ClientDashboard.tsx?**
A: **Não!** As correções já estão aplicadas. Só precisa fazer `npm run dev` ou `npm run build`.

**Q: E se eu adicionar um novo técnico no futuro?**
A: Edite o arquivo `003_fix_rls_policies.sql`, adicione o email, e execute `supabase db push` novamente.

**Q: As correções afetam pagamentos já existentes?**
A: **Não.** Apenas melhoram a experiência de novos pagamentos.

---

## 📊 O que mudou no frontend?

| Antes | Depois |
|-------|--------|
| Dependia só do Realtime | **Realtime + Polling fallback** |
| PIX expirava sem aviso | **Aviso de expiração + Botão "Gerar Novo"** |
| Reload completo da página | **Atualização suave sem reload** |
| Emails com "tecnico" = acesso | **Apenas emails autorizados = acesso** |

---

**✅ Tudo pronto! Suas correções críticas estão ativas.**

Leia `CORRECOES_CRITICAS_APLICADAS.md` para detalhes técnicos completos.
