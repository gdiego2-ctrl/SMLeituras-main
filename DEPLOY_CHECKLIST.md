# 📋 Checklist de Deploy - SM Engenharia

## ✅ PRÉ-DEPLOY (Desenvolvimento Local)

### 1️⃣ Configuração Inicial

- [ ] **Clone o repositório**
  ```bash
  git clone <repo-url>
  cd SMLeituras-main
  ```

- [ ] **Instale as dependências**
  ```bash
  npm install
  ```

- [ ] **Configure variáveis de ambiente locais**
  ```bash
  cp .env.example .env.local
  ```
  - [ ] Preencha `VITE_SUPABASE_URL`
  - [ ] Preencha `VITE_SUPABASE_ANON_KEY`
  - [ ] Preencha `VITE_MERCADOPAGO_PUBLIC_KEY`
  - [ ] (Opcional) Preencha `VITE_SUPABASE_SERVICE_ROLE_KEY` (apenas local!)

### 2️⃣ Configuração do Supabase

- [ ] **Acesse o Supabase Dashboard**
  - URL: https://app.supabase.com
  - Selecione seu projeto

- [ ] **Obtenha as credenciais**
  - [ ] Settings → API → Copie "Project URL"
  - [ ] Settings → API → Copie "anon public" key
  - [ ] Cole no arquivo `.env.local`

- [ ] **Configure o banco de dados**
  ```bash
  supabase link --project-ref SEU-PROJECT-REF
  supabase db push
  ```

- [ ] **Deploy das Edge Functions**
  ```bash
  supabase functions deploy create-pix-payment
  supabase functions deploy mercadopago-webhook
  ```

- [ ] **Verifique as migrations**
  - [ ] Migration 001: Schema inicial
  - [ ] Migration 002: Payments
  - [ ] Migration 003: Webhook setup
  - [ ] Migration 004: Manual payment regularization

### 3️⃣ Configuração do Mercado Pago

- [ ] **Acesse Mercado Pago Developers**
  - URL: https://www.mercadopago.com.br/developers

- [ ] **Crie uma aplicação**
  - [ ] Vá em "Suas aplicações" → "Criar aplicação"
  - [ ] Copie a "Public Key" (TEST-xxxxx para testes)

- [ ] **Configure variáveis no .env.local**
  - [ ] Cole a Public Key em `VITE_MERCADOPAGO_PUBLIC_KEY`

- [ ] **Configure webhook (opcional para testes)**
  - Siga instruções em `SETUP_MERCADOPAGO.md`

### 4️⃣ Teste Local

- [ ] **Inicie o servidor de desenvolvimento**
  ```bash
  npm run dev
  ```

- [ ] **Acesse o app**
  - URL: http://localhost:3000
  - [ ] App carrega sem erros
  - [ ] Tela de login aparece

- [ ] **Teste funcionalidades básicas**
  - [ ] Login funciona (use: bwasistemas@gmail.com)
  - [ ] Dashboard de técnico carrega
  - [ ] Navegação entre telas funciona
  - [ ] Console do navegador sem erros (F12)

- [ ] **Teste build de produção**
  ```bash
  npm run build
  npm run preview
  ```
  - [ ] Build completa sem erros
  - [ ] Todos os chunks < 500 kB
  - [ ] Preview funciona em http://localhost:4173

---

## 🚀 DEPLOY NO VERCEL

### 1️⃣ Preparação do Repositório

- [ ] **Commit todas as mudanças**
  ```bash
  git add .
  git commit -m "chore: prepare for vercel deploy"
  git push origin main
  ```

- [ ] **Verifique arquivos essenciais**
  - [ ] `.gitignore` contém `.env.local`
  - [ ] `vercel.json` existe e está correto
  - [ ] `package.json` tem script "build"
  - [ ] `.env.example` está atualizado

### 2️⃣ Conectar ao Vercel

- [ ] **Acesse Vercel**
  - URL: https://vercel.com
  - [ ] Faça login com GitHub

- [ ] **Crie novo projeto**
  - [ ] Clique em "Add New Project"
  - [ ] Selecione o repositório `SMLeituras-main`
  - [ ] Clique em "Import"

- [ ] **Configure projeto**
  - [ ] Framework Preset: **Vite**
  - [ ] Root Directory: **./** (padrão)
  - [ ] Build Command: **npm run build**
  - [ ] Output Directory: **dist**
  - [ ] Install Command: **npm install** (padrão)

### 3️⃣ Configurar Variáveis de Ambiente (CRÍTICO!)

⚠️ **ATENÇÃO**: O app NÃO funcionará sem estas variáveis!

- [ ] **No Vercel, vá em Settings → Environment Variables**

- [ ] **Adicione cada variável abaixo:**

  #### Variável 1: VITE_SUPABASE_URL
  - [ ] Name: `VITE_SUPABASE_URL`
  - [ ] Value: `https://xxx.supabase.co` (copie do Supabase)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clique "Save"

  #### Variável 2: VITE_SUPABASE_ANON_KEY
  - [ ] Name: `VITE_SUPABASE_ANON_KEY`
  - [ ] Value: `eyJxxx...` (copie do Supabase)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clique "Save"

  #### Variável 3: VITE_MERCADOPAGO_PUBLIC_KEY
  - [ ] Name: `VITE_MERCADOPAGO_PUBLIC_KEY`
  - [ ] Value: `APP-xxx` ou `TEST-xxx` (copie do Mercado Pago)
  - [ ] Environment: ✅ Production ✅ Preview ✅ Development
  - [ ] Clique "Save"

  #### Variável 4: VITE_APP_ENV (opcional)
  - [ ] Name: `VITE_APP_ENV`
  - [ ] Value: `production`
  - [ ] Environment: ✅ Production
  - [ ] Clique "Save"

- [ ] **⚠️ NUNCA adicione no Vercel:**
  - ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY` (risco de segurança!)

### 4️⃣ Deploy

- [ ] **Inicie o deploy**
  - [ ] Clique em "Deploy" (se ainda não deployou)
  - [ ] OU vá em Deployments → ⋮ → "Redeploy"

- [ ] **Acompanhe o build**
  - [ ] Aguarde 2-3 minutos
  - [ ] Verifique logs de build (não deve ter erros)
  - [ ] Status deve ficar "Ready"

### 5️⃣ Verificação Pós-Deploy

- [ ] **Acesse o app no Vercel**
  - URL fornecido: `https://seu-projeto.vercel.app`

- [ ] **Verifique tela inicial**
  - ✅ **SUCESSO**: Tela de login aparece
  - 🔴 **ERRO**: Tela vermelha com "ERRO DE CONFIGURAÇÃO"
    - → Volte ao passo 3 e verifique variáveis
    - → Faça um redeploy após corrigir

- [ ] **Teste funcionalidades**
  - [ ] Login funciona
  - [ ] Dashboard carrega
  - [ ] Navegação entre telas OK
  - [ ] Não há erros no console (F12)

- [ ] **Teste em diferentes navegadores**
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (se disponível)
  - [ ] Mobile (Chrome/Safari)

---

## 🐛 TROUBLESHOOTING

### Problema: Tela Azul Infinita
**Causa**: Variáveis de ambiente não configuradas
**Solução**:
- [ ] Vá em Settings → Environment Variables no Vercel
- [ ] Adicione todas as variáveis obrigatórias
- [ ] Faça Redeploy

### Problema: Tela Vermelha "ERRO DE CONFIGURAÇÃO"
**Causa**: Variáveis faltando ou incorretas
**Solução**:
- [ ] Leia a mensagem de erro na tela
- [ ] Verifique se copiou os valores corretos
- [ ] Confirme que não há espaços extras
- [ ] Redeploy após corrigir

### Problema: Build Falha no Vercel
**Causa**: Erro de TypeScript ou dependências
**Solução**:
- [ ] Verifique logs de build no Vercel
- [ ] Teste `npm run build` localmente
- [ ] Corrija erros de TypeScript
- [ ] Commit e push novamente

### Problema: 404 ao Navegar Diretamente para Rota
**Causa**: Normal com HashRouter
**Solução**: Use a navegação do app, não digite URLs diretamente

### Problema: Pagamentos não Funcionam
**Causa**: Mercado Pago não configurado
**Solução**:
- [ ] Verifique `VITE_MERCADOPAGO_PUBLIC_KEY` no Vercel
- [ ] Confirme que a chave está ativa no Mercado Pago
- [ ] Siga `SETUP_MERCADOPAGO.md` para webhook

---

## 📊 VALIDAÇÕES FINAIS

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Total Bundle Size < 500 kB (por chunk)

### Segurança
- [ ] Variáveis sensíveis em .env (não commitadas)
- [ ] HTTPS ativo no Vercel
- [ ] Row Level Security ativo no Supabase
- [ ] Sem console.logs em produção
- [ ] Service Role Key NÃO exposta

### Funcionalidade
- [ ] Login/Logout funciona
- [ ] Criação de clientes funciona
- [ ] Registro de leituras funciona
- [ ] Geração de faturas funciona
- [ ] Pagamento PIX funciona (se configurado)
- [ ] Webhook atualiza status (se configurado)

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- **[README.md](./README.md)** - Visão geral do projeto
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Guia detalhado Vercel
- **[.env.example](./.env.example)** - Template de variáveis
- **[OTIMIZACOES.md](./OTIMIZACOES.md)** - Detalhes técnicos de bundle
- **[SETUP_MERCADOPAGO.md](./SETUP_MERCADOPAGO.md)** - Integração Mercado Pago

---

## ✅ CHECKLIST RESUMIDO (Copie e Cole)

```
PRÉ-DEPLOY LOCAL:
☐ npm install
☐ .env.local configurado
☐ npm run dev funciona
☐ npm run build sem erros

DEPLOY VERCEL:
☐ Repositório conectado
☐ Framework: Vite
☐ Build: npm run build
☐ Output: dist
☐ Variáveis de ambiente adicionadas:
  ☐ VITE_SUPABASE_URL
  ☐ VITE_SUPABASE_ANON_KEY
  ☐ VITE_MERCADOPAGO_PUBLIC_KEY
☐ Deploy executado
☐ App funciona no Vercel

PÓS-DEPLOY:
☐ Tela de login carrega
☐ Login funciona
☐ Dashboard funciona
☐ Sem erros no console
☐ Testado em mobile
```

---

**🎉 Se todos os itens estão marcados, seu deploy está completo!**

**🆘 Precisa de ajuda?**
- Abra uma issue no GitHub
- Contato: bwasistemas@gmail.com
