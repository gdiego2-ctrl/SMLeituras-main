# 🚀 Sprint 1: Setup e Configuração

## ✅ O Que Foi Implementado

Sprint 1 implementou o **sistema completo de controle de acesso a clientes**:

### Mudanças Principais:
1. ✅ **Cadastro exclusivo por admin** - Login.tsx não tem mais auto-registro
2. ✅ **Admin define senha inicial** - ManageClients.tsx agora tem campo senha
3. ✅ **Criação atômica** - Cliente + usuário Auth criados juntos
4. ✅ **Validação de exclusão** - Bloqueia se houver faturas pendentes
5. ✅ **Prazo alterado** - 5 dias para pagamento (antes 15 dias)
6. ✅ **Monitoramento** - Banco preparado para rastreamento de leituras

---

## 📋 Pré-requisitos

Antes de continuar, certifique-se de ter:
- [x] Projeto rodando localmente (`npm run dev` funcionando)
- [x] Acesso ao Supabase Dashboard
- [x] Arquivo `.env.local` configurado com URL e Anon Key

---

## 🔧 Passo 1: Aplicar Migration no Banco de Dados

### Opção A: Via SQL Editor (Recomendado)

1. **Acesse o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql
   ```

2. **Clique em "New query"** (canto superior esquerdo)

3. **Abra o arquivo de migration:**
   - Arquivo: `supabase/migrations/002_client_management.sql`
   - **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

4. **Cole no SQL Editor** do Supabase (Ctrl+V)

5. **Execute o script:**
   - Clique em **"Run"** (ou pressione Ctrl+Enter)
   - Aguarde a execução (leva ~5 segundos)

6. **Verifique o resultado:**
   - Deve aparecer mensagens como "Success. No rows returned"
   - Verifique que não há erros em vermelho

### Opção B: Via CLI (Avançado)

Se você tem Supabase CLI configurado:

```bash
supabase db push
```

### ✅ Verificar se Migration Funcionou

Execute esta query no SQL Editor para verificar:

```sql
-- Verificar se as novas colunas existem
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

-- Deve mostrar: user_id, status, ultima_leitura_em, proxima_leitura_prevista, criado_em, atualizado_em
```

---

## 🔑 Passo 2: Configurar Service Role Key

### ⚠️ IMPORTANTE - Segurança

A **Service Role Key** tem acesso TOTAL ao banco de dados. Por isso:
- ✅ **Use APENAS em localhost** durante desenvolvimento
- ❌ **NUNCA faça deploy** desta key no frontend em produção
- 🔒 Para produção, mova funções admin para **Edge Functions**

### Como Obter a Service Role Key

1. **Acesse as configurações de API do Supabase:**
   ```
   https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/settings/api
   ```

2. **Localize a seção "Project API keys"**

3. **Encontre a chave "service_role"** (marcada como "secret")

4. **Clique em "Reveal"** e copie a chave

### Adicionar ao `.env.local`

1. **Abra o arquivo `.env.local`** na raiz do projeto

2. **Encontre a linha:**
   ```env
   VITE_SUPABASE_SERVICE_ROLE_KEY=
   ```

3. **Cole a chave copiada:**
   ```env
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

4. **Salve o arquivo**

---

## 🧪 Passo 3: Testar a Implementação

### 1. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

**Por quê?** Para carregar a nova variável de ambiente.

### 2. Testar Login (Deve bloquear auto-cadastro)

1. Acesse: `http://localhost:3000`
2. ✅ Verifique que **NÃO há mais** a aba "Primeiro Acesso"
3. ✅ Apenas o formulário de login deve aparecer
4. ✅ Mensagem: "Não possui acesso? Entre em contato com o administrador"

### 3. Testar Cadastro de Cliente (Admin)

1. **Faça login com o admin:**
   - Email: `gdiego2@gmail.com`
   - Senha: `32211904`

2. **Navegue para "Clientes"** (menu inferior)

3. **Clique em "Novo Cliente"** (botão flutuante azul)

4. **Preencha o formulário:**
   - Nome: `Cliente Teste Sprint 1`
   - ID Medidor: `9999`
   - Tipo: `Monofásico`
   - Email: `teste.sprint1@example.com`
   - **Senha Inicial:** `teste123` (NOVO CAMPO!)
   - Telefone: `(31) 99999-9999`
   - Endereço: `Rua Teste, 123`

5. **Clique em "Confirmar Cadastro"**

6. **Resultado esperado:**
   - ✅ Mensagem: "Cliente e conta de acesso criados com sucesso!"
   - ✅ Cliente aparece na lista
   - ✅ No Supabase Auth, o usuário foi criado com email `teste.sprint1@example.com`

### 4. Testar Login do Cliente

1. **Faça logout** (botão vermelho no dashboard admin)

2. **Faça login com o cliente recém-criado:**
   - Email: `teste.sprint1@example.com`
   - Senha: `teste123`

3. **Resultado esperado:**
   - ✅ Login com sucesso
   - ✅ Redirecionado para dashboard do cliente
   - ✅ Nome exibido: "Cliente Teste Sprint 1" ou "teste.sprint1"

### 5. Verificar no Supabase Dashboard

**Verificar Auth:**
```
https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/auth/users
```
- ✅ Deve ter 2 usuários: `gdiego2@gmail.com` e `teste.sprint1@example.com`

**Verificar Clientes:**
```sql
-- Execute no SQL Editor
SELECT id, nome, email, user_id, status, criado_em
FROM clientes
ORDER BY criado_em DESC;
```
- ✅ Cliente "Cliente Teste Sprint 1" deve ter `user_id` preenchido
- ✅ Status: `ativo`

---

## 🐛 Solução de Problemas

### Erro: "Service Role Key not configured"

**Problema:** A variável `VITE_SUPABASE_SERVICE_ROLE_KEY` não está definida ou vazia.

**Solução:**
1. Verifique se copiou a chave corretamente no `.env.local`
2. Reinicie o servidor (`Ctrl+C` e `npm run dev`)
3. Verifique se o arquivo `.env.local` está na raiz do projeto

### Erro: "Failed to create user account"

**Problema:** Email já cadastrado no Supabase Auth.

**Solução:**
1. Use um email diferente OU
2. Exclua o usuário existente no Supabase Auth Dashboard
3. Tente novamente

### Erro: "column clientes.user_id does not exist"

**Problema:** Migration não foi aplicada.

**Solução:**
1. Volte ao **Passo 1** e execute a migration
2. Verifique se não há erros ao executar o script SQL
3. Execute a query de verificação para confirmar que as colunas existem

### Erro: "Invalid login credentials" (cliente)

**Problema:** Senha incorreta ou usuário não criado corretamente.

**Solução:**
1. Verifique no Supabase Auth se o usuário foi criado
2. Tente criar o cliente novamente com uma senha diferente
3. Certifique-se de que o email está correto (sem espaços extras)

### Login antigo com auto-cadastro ainda aparece

**Problema:** Cache do navegador.

**Solução:**
1. Force refresh: `Ctrl+Shift+R` ou `Ctrl+F5`
2. Limpe o cache: `Ctrl+Shift+Delete`
3. Ou use aba anônima/incógnita

---

## 📊 O Que Mudou no Banco de Dados

### Tabela `clientes` - Novos Campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | UUID | Link para `auth.users.id` |
| `status` | TEXT | 'ativo', 'inativo' ou 'suspenso' |
| `ultima_leitura_em` | TIMESTAMPTZ | Data/hora da última leitura |
| `proxima_leitura_prevista` | TIMESTAMPTZ | Próxima leitura esperada (+30 dias) |
| `criado_em` | TIMESTAMPTZ | Quando o registro foi criado |
| `atualizado_em` | TIMESTAMPTZ | Última modificação |

### Triggers Criados:

1. **`trigger_update_ultima_leitura`**
   - Dispara: Quando nova leitura é inserida
   - Ação: Atualiza `ultima_leitura_em` e `proxima_leitura_prevista` do cliente

2. **`trigger_cliente_timestamp`**
   - Dispara: Quando cliente é atualizado
   - Ação: Atualiza `atualizado_em` automaticamente

### View Criada:

**`clientes_pendentes_leitura`** - Para monitoramento
- Lista clientes com leitura atrasada (30+ dias)
- Calcula dias desde última leitura
- Ordena por urgência

---

## 🎯 Próximos Passos (Sprint 2)

Com Sprint 1 completo, você está pronto para:

### Sprint 2: CRUD Completo (3-4h)
- [ ] Criar `EditClientModal.tsx`
- [ ] Implementar edição de clientes
- [ ] Implementar exclusão com validação
- [ ] Ativar botões em `ClientDetails.tsx`

### Sprint 3: Troca de Senha (1-2h)
- [ ] Criar `ProfileSettings.tsx` para clientes
- [ ] Permitir que cliente altere própria senha

### Sprint 4: Prazos e Monitoramento (2-3h)
- [ ] Alterar prazo de 15 para 5 dias (já está no constants.ts!)
- [ ] Dashboard de leituras pendentes
- [ ] Widget de monitoramento

---

## 📞 Precisa de Ajuda?

Se encontrar problemas não listados aqui:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do terminal onde o servidor está rodando
3. Confirme que a migration foi aplicada com sucesso
4. Verifique se o Service Role Key está configurado

---

## ✅ Checklist Final

Antes de considerar Sprint 1 completo, verifique:

- [ ] Migration `002_client_management.sql` aplicada com sucesso
- [ ] Service Role Key configurada no `.env.local`
- [ ] Servidor reiniciado após mudanças no `.env.local`
- [ ] Login não mostra mais aba "Primeiro Acesso"
- [ ] Admin consegue criar cliente com senha
- [ ] Cliente criado pode fazer login com a senha definida
- [ ] Cliente tem `user_id` vinculado no banco
- [ ] Campos novos (`status`, `criado_em`, etc.) estão populados

---

**Sprint 1 Completo! 🎉**

Você agora tem um sistema seguro onde:
- ✅ Apenas admin cadastra clientes
- ✅ Admin define senha inicial
- ✅ Cliente e usuário são criados atomicamente
- ✅ Banco rastreia última leitura e próxima prevista
- ✅ Sistema pronto para monitoramento de 30 dias
- ✅ Prazo de pagamento configurável (5 dias)
