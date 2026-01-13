# SM Engenharia - Sistema de Faturamento

Sistema de gerenciamento de leituras de energia elétrica e faturamento com integração de pagamento PIX via Mercado Pago.

## 🚀 Funcionalidades

- 📊 Gerenciamento de clientes e leituras
- ⚡ Coleta de dados de medidores
- 📄 Geração automática de faturas
- 💳 **Pagamento PIX via Mercado Pago** (integrado!)
- 📱 PWA - Funciona offline
- 👥 Dois perfis: Técnico e Cliente
- 🔔 Notificações em tempo real

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth
- **Pagamentos**: Mercado Pago API
- **Realtime**: Supabase Realtime

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- Conta Supabase
- Conta Mercado Pago Developers

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone <repo-url>
   cd SMLeituras-main
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente**

   Copie `.env.example` para `.env.local` e preencha:
   ```bash
   cp .env.example .env.local
   ```

   Edite `.env.local` com suas credenciais:
   - Supabase URL e Anon Key
   - Mercado Pago Public Key (teste)

4. **Configure o banco de dados**
   ```bash
   supabase link --project-ref SEU-PROJECT-REF
   supabase db push
   ```

5. **Deploy das Edge Functions**
   ```bash
   supabase functions deploy create-pix-payment
   supabase functions deploy mercadopago-webhook
   ```

6. **Rode localmente**
   ```bash
   npm run dev
   ```

Acesse: http://localhost:3000

## 💳 Configuração do Mercado Pago

Para configurar a integração completa com PIX, siga o guia detalhado:

👉 **[SETUP_MERCADOPAGO.md](./SETUP_MERCADOPAGO.md)**

## 📖 Uso

### Perfil Técnico
- Login: `bwasistemas@gmail.com`
- Gerencia clientes
- Registra novas leituras
- Visualiza histórico de faturas

### Perfil Cliente
- Visualiza suas faturas
- Paga via PIX (QR Code ou Copia e Cola)
- Acompanha consumo

## 🏗️ Estrutura do Projeto

```
├── screens/
│   ├── Client/          # Telas do cliente
│   ├── Technician/      # Telas do técnico
│   └── Login.tsx
├── services/
│   └── paymentService.ts   # Integração Mercado Pago
├── supabase/
│   ├── migrations/         # Schemas do banco
│   └── functions/          # Edge Functions
├── types.ts             # TypeScript types
├── supabase.ts          # Cliente Supabase
└── App.tsx              # Roteamento

```

## 🔐 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ Row Level Security (RLS) no banco
- ✅ Verificação de assinatura em webhooks
- ✅ Autenticação JWT
- ✅ HTTPS obrigatório em produção

## 🧪 Testes

Para testar pagamentos no ambiente de sandbox:

1. Use credenciais de teste do Mercado Pago
2. Crie uma fatura de teste
3. Simule o pagamento via API ou app de teste
4. Verifique a atualização automática

## 🚀 Deploy no Vercel

### Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Projeto configurado no GitHub
3. Credenciais do Supabase e Mercado Pago

### Passo a Passo

#### 1. Conectar Repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione o repositório **SMLeituras-main**
4. Configure conforme abaixo:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

#### 2. Configurar Variáveis de Ambiente

⚠️ **CRÍTICO**: O app NÃO funcionará sem estas variáveis!

No Vercel, vá em **Settings** → **Environment Variables** e adicione:

| Nome | Valor | Onde Encontrar |
|------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase → Settings → API → anon public |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | `APP-xxx` ou `TEST-xxx` | Mercado Pago → Developers → Suas aplicações |
| `VITE_APP_ENV` | `production` | Opcional |

**Environments**: Selecione `Production`, `Preview` e `Development` para cada variável.

#### 3. Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Acesse o URL fornecido pelo Vercel

#### 4. Verificação

✅ **Se configurado corretamente:**
- App carrega a tela de login
- Login funciona
- Navegação entre telas OK

🔴 **Se aparecer tela vermelha de erro:**
- Verifique se TODAS as variáveis foram configuradas
- Confirme que os valores estão corretos (sem espaços extras)
- Faça um Redeploy: Deployments → ⋮ → Redeploy

### 📖 Documentação Completa

- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Guia detalhado com troubleshooting
- **[.env.example](./.env.example)** - Template de variáveis de ambiente

### 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Tela azul infinita** | Variáveis de ambiente faltando - configure no Vercel |
| **Tela vermelha de erro** | Siga instruções na tela - adicione variáveis e redeploy |
| **Erro 404 ao navegar** | Normal com HashRouter - use navegação do app |
| **Build falha** | Verifique logs no Vercel → Functions |

## 📊 Otimizações de Bundle

Este projeto foi otimizado para Vercel com:

- ✅ Code splitting com React.lazy()
- ✅ Manual chunks (React, Router, Supabase)
- ✅ Terser minification
- ✅ Tree shaking
- ✅ Console.log removal em produção

**Bundle size**: ~11 kB (main) + ~163 kB (Supabase) + ~222 kB (React)

📖 Veja [OTIMIZACOES.md](./OTIMIZACOES.md) para detalhes técnicos.

## 📝 License

Propriedade de SM Engenharia Elétrica LTDA

## 🤝 Contribuindo

Entre em contato: bwasistemas@gmail.com
