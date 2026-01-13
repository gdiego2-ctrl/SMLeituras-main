# ⚡ Início Rápido - SM Engenharia

Guia rápido para começar a usar o sistema em **5 minutos**.

## 🎯 Desenvolvimento Local

### 1. Clone e Instale (2 min)

```bash
git clone <repo-url>
cd SMLeituras-main
npm install
```

### 2. Configure Variáveis (2 min)

```bash
# Copie o template
cp .env.example .env.local

# Edite .env.local e preencha:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_MERCADOPAGO_PUBLIC_KEY
```

**Onde encontrar os valores?**
- **Supabase**: https://app.supabase.com → Seu Projeto → Settings → API
- **Mercado Pago**: https://www.mercadopago.com.br/developers → Suas aplicações

### 3. Valide e Inicie (1 min)

```bash
# Valide suas configurações
npm run validate-env

# Inicie o servidor
npm run dev
```

Acesse: **http://localhost:3000**

Login padrão: **bwasistemas@gmail.com**

---

## 🚀 Deploy no Vercel (5 minutos)

### 1. Conecte o Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione o repositório
4. Framework Preset: **Vite**

### 2. Adicione Variáveis de Ambiente

No Vercel, vá em **Settings → Environment Variables** e adicione:

```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxxx...
VITE_MERCADOPAGO_PUBLIC_KEY = TEST-xxx ou APP-xxx
```

⚠️ **Marque todas como Production + Preview + Development**

### 3. Deploy

Clique em **"Deploy"** e aguarde 2-3 minutos.

---

## ✅ Testes Rápidos

Após iniciar, teste:

- [ ] App carrega sem erros
- [ ] Tela de login aparece
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Console sem erros (F12)

---

## 🆘 Problemas Comuns

| Problema | Solução Rápida |
|----------|----------------|
| **Tela azul** | Variáveis faltando - rode `npm run validate-env` |
| **Build falha** | Rode `npm run check` localmente |
| **App não carrega no Vercel** | Verifique variáveis no Vercel Settings |

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:

- **[README.md](./README.md)** - Documentação completa
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist passo a passo
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Troubleshooting Vercel
- **[.env.example](./.env.example)** - Referência de variáveis

---

## 🎉 Pronto!

Se você completou todos os passos acima, seu sistema está funcionando!

**Próximos passos:**
1. Configure o banco de dados Supabase (veja README.md)
2. Configure webhook do Mercado Pago (veja SETUP_MERCADOPAGO.md)
3. Crie seus primeiros clientes e leituras

**Suporte:** bwasistemas@gmail.com
