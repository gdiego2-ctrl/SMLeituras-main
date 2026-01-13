# Guia de Deploy no Vercel - SM Engenharia

## 🔴 Problema: Tela Azul no Vercel

Se o aplicativo mostra uma tela totalmente azul no Vercel mas funciona no localhost, o problema é a **falta de variáveis de ambiente**.

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### Passo 1: Acessar Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto **sm-engenharia-faturamento**

### Passo 2: Adicionar Variáveis de Ambiente

1. No menu lateral, clique em **Settings**
2. Clique em **Environment Variables**
3. Adicione as seguintes variáveis **OBRIGATÓRIAS**:

#### Variáveis Obrigatórias (Supabase):

```
VITE_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
Environment: Production, Preview, Development
```

```
VITE_SUPABASE_ANON_KEY
Valor: sua-anon-key-aqui
Environment: Production, Preview, Development
```

#### Variáveis Opcionais:

```
VITE_MERCADOPAGO_PUBLIC_KEY
Valor: TEST-xxxxx ou sua chave real
Environment: Production, Preview, Development
```

```
VITE_APP_ENV
Valor: production
Environment: Production
```

⚠️ **NUNCA adicione `VITE_SUPABASE_SERVICE_ROLE_KEY` no Vercel** - essa chave só deve ser usada em desenvolvimento local!

### Passo 3: Encontrar as Credenciais do Supabase

Se você não sabe quais são os valores, encontre-os em:

1. **No seu arquivo local**: Abra `.env.local` no seu projeto local
2. **No Dashboard do Supabase**:
   - Acesse [app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto
   - Vá em **Settings** → **API**
   - Copie:
     - **Project URL** → use como `VITE_SUPABASE_URL`
     - **anon/public key** → use como `VITE_SUPABASE_ANON_KEY`

### Passo 4: Re-deploy

Após adicionar as variáveis:

1. No Vercel, vá em **Deployments**
2. Clique nos 3 pontinhos do último deployment
3. Clique em **Redeploy**
4. Aguarde o build completar (2-3 minutos)
5. Teste o aplicativo novamente

## 🎯 Como Verificar se Funcionou

Após o redeploy, o aplicativo deve:

✅ Carregar normalmente
✅ Mostrar a tela de login
✅ Permitir fazer login com as credenciais
✅ Navegar entre as telas sem erros

Se ainda aparecer tela azul, verifique:

1. **Console do Navegador**: Abra F12 → Console e veja se há erros em vermelho
2. **Vercel Logs**: No dashboard Vercel → Functions → veja se há erros
3. **Variáveis Corretas**: Verifique se copiou os valores corretos (sem espaços extras)

## 📋 Checklist de Configuração

- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Valores copiados corretamente do Supabase
- [ ] Redeploy realizado após adicionar variáveis
- [ ] Aplicativo carrega a tela de login
- [ ] Login funciona corretamente

## 🆘 Suporte Adicional

Se o problema persistir:

1. Compartilhe o **console do navegador** (F12 → Console)
2. Compartilhe o **URL do Vercel deployment**
3. Confirme que as variáveis estão salvas no Vercel (Settings → Environment Variables)
