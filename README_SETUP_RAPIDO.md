# 🚀 Setup Rápido - Sistema de Pagamentos PIX

**Tempo total:** 15-20 minutos

---

## ✅ O QUE JÁ ESTÁ PRONTO:

- ✅ Código com correções críticas implementado
- ✅ Polling fallback para confirmação de pagamento
- ✅ Tratamento automático de expiração de PIX
- ✅ Brecha de segurança corrigida
- ✅ Arquivo `.env` criado (precisa preencher)
- ✅ Scripts de setup prontos
- ✅ Documentação completa

---

## ⚡ COMEÇAR AGORA (3 opções):

### **🎯 Opção 1: Setup Automático (Recomendado)** ⏱️ 15 min

```powershell
# 1. Instale Supabase CLI (se não tiver)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 2. Preencha o arquivo .env com suas credenciais
notepad .env

# 3. Execute o script de setup
.\setup-completo.ps1
```

**Pronto!** O script vai guiar você pelo resto.

---

### **🎯 Opção 2: Seguir Guia Detalhado** ⏱️ 20 min

Abra este arquivo e siga passo a passo:

📘 **`PROXIMOS_PASSOS.md`** → Guia completo ilustrado

---

### **🎯 Opção 3: Setup Manual Rápido** ⏱️ 25 min

Abra este arquivo para o passo a passo manual:

📙 **`APLICAR_CORRECOES_AGORA.md`** → Guia manual em 9 etapas

---

## 📚 DOCUMENTAÇÃO DISPONÍVEL:

| Arquivo | Quando Usar |
|---------|-------------|
| **`PROXIMOS_PASSOS.md`** | 👈 **COMECE AQUI** - Checklist completo |
| `INSTALAR_SUPABASE_CLI.md` | Se Supabase CLI não estiver instalado |
| `setup-completo.ps1` | Script automático (Windows) |
| `APLICAR_CORRECOES_AGORA.md` | Setup manual (alternativa ao script) |
| `CORRECOES_CRITICAS_APLICADAS.md` | Detalhes técnicos das correções |
| `CHANGELOG_CORRECOES.md` | Log de mudanças implementadas |
| `SETUP_MERCADOPAGO.md` | Guia completo MercadoPago (original) |

---

## 🎯 FLUXO RECOMENDADO:

```
1. Abra: PROXIMOS_PASSOS.md
        ↓
2. Siga o PASSO 1 (instalar Supabase CLI)
        ↓
3. Siga o PASSO 2 (preencher .env)
        ↓
4. Execute: .\setup-completo.ps1
        ↓
5. Configure webhook no MercadoPago
        ↓
6. Teste: npm run dev
```

---

## ⚠️ PRÉ-REQUISITOS:

Você precisa ter em mãos:

- [ ] Credenciais do **Supabase**:
  - Project URL
  - Anon Key
  - Service Role Key

- [ ] Credenciais do **MercadoPago**:
  - Public Key
  - Access Token

**Onde encontrar?**
- Supabase: Dashboard → Settings → API
- MercadoPago: Developers Panel → Sua App → Credenciais

---

## 🆘 PROBLEMAS COMUNS:

### **"Supabase CLI não encontrado"**
→ Leia: `INSTALAR_SUPABASE_CLI.md`

### **"PowerShell não executa scripts"**
→ Execute como Admin: `Set-ExecutionPolicy RemoteSigned`

### **"Migration falhou"**
→ Execute: `supabase link --project-ref SEU-REF`

### **"Não sei onde encontrar X credencial"**
→ Leia: `PROXIMOS_PASSOS.md` (tem tabela completa)

---

## 📊 O QUE VAI SER CONFIGURADO:

Ao finalizar o setup, você terá:

| Componente | Status Atual | Após Setup |
|-----------|--------------|------------|
| Frontend | ✅ Código pronto | ✅ Rodando |
| Backend (Edge Functions) | ✅ Código pronto | ✅ Deployado |
| Banco de Dados | ✅ Schema pronto | ✅ Migrations aplicadas |
| Segurança (RLS) | ✅ Corrigido | ✅ Aplicado |
| Webhook MercadoPago | ⏳ Precisa configurar | ✅ Configurado |
| Secrets | ⏳ Precisa configurar | ✅ Configurados |

---

## ✅ TESTE RÁPIDO (Depois do Setup):

```bash
# Rodar aplicação
npm run dev

# Acessar
http://localhost:5173

# Fazer login como cliente
# Clicar em "Pagar via PIX"
# Ver QR Code aparecer ✅
```

---

## 🎉 COMEÇAR AGORA:

**👉 Abra: `PROXIMOS_PASSOS.md` e comece pelo PASSO 1**

Ou execute diretamente:
```powershell
.\setup-completo.ps1
```

---

**Boa configuração! Qualquer dúvida, consulte a documentação.** 🚀

---

## 📞 Estrutura de Arquivos do Projeto:

```
SMLeituras-main/
├── 📘 README_SETUP_RAPIDO.md          ← VOCÊ ESTÁ AQUI
├── 📘 PROXIMOS_PASSOS.md              ← COMECE AQUI
├── 📙 INSTALAR_SUPABASE_CLI.md
├── 📙 APLICAR_CORRECOES_AGORA.md
├── 📕 CORRECOES_CRITICAS_APLICADAS.md
├── 📗 CHANGELOG_CORRECOES.md
├── 📗 SETUP_MERCADOPAGO.md
│
├── ⚙️ setup-completo.ps1              ← Script automático
├── ⚙️ .env                             ← Preencher com credenciais
├── ⚙️ .env.example
│
├── 🗂️ screens/                        ← Frontend (React)
├── 🗂️ services/                       ← Services (Payment)
├── 🗂️ supabase/
│   ├── functions/                     ← Edge Functions
│   └── migrations/                    ← DB Migrations
│       └── 003_fix_rls_policies.sql  ← Correção de segurança
│
└── ...outros arquivos
```

---

**🎯 Próximo: Abra `PROXIMOS_PASSOS.md`**
