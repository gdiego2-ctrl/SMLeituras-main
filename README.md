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

## 📝 License

Propriedade de SM Engenharia Elétrica LTDA

## 🤝 Contribuindo

Entre em contato: bwasistemas@gmail.com
