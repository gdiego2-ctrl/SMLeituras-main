# 🧪 TESTE IMEDIATO - Passo a Passo

## ✅ Status Atual

- ✅ Servidor rodando: http://localhost:3000
- ✅ Código atualizado (reconhece gdiego2@gmail.com como admin)
- ⏳ **Usuário precisa ser criado no Supabase**

---

## 🚀 EXECUTE AGORA (2 Minutos)

### **ETAPA 1: Criar Usuário no Supabase**

#### Opção A: Via Dashboard (Mais Fácil - 30 segundos)

1. **Abra este link**:
   ```
   https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/auth/users
   ```

2. **Clique** no botão verde: **"Add user"** → **"Create new user"**

3. **Preencha**:
   - Email: `gdiego2@gmail.com`
   - Password: `32211904`
   - ✅ **MARQUE**: "Auto Confirm User" (importante!)

4. **Clique**: "Create user"

**✅ PRONTO! Vá para Etapa 2**

---

#### Opção B: Via SQL (Se quiser excluir todos antes - 1 minuto)

1. **Abra**:
   ```
   https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql
   ```

2. **Clique**: "New query"

3. **Copie e cole** este código:

```sql
-- Excluir todos os usuários
DELETE FROM auth.identities;
DELETE FROM auth.users;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;

-- Criar administrador
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token,
        email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'gdiego2@gmail.com',
        crypt('32211904', gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Diego Admin"}',
        NOW(), NOW(), '', '', '', ''
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider,
        created_at, updated_at, last_sign_in_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        format('{"sub":"%s","email":"gdiego2@gmail.com"}', new_user_id)::jsonb,
        'email', NOW(), NOW(), NOW()
    );
END $$;

-- Verificar
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'gdiego2@gmail.com';
```

4. **Clique**: "Run" (ou Ctrl+Enter)

5. **Deve aparecer**: Mensagem de sucesso com o usuário criado

---

### **ETAPA 2: Fazer Login**

1. **Abra o navegador**:
   ```
   http://localhost:3000
   ```

2. **Faça Login**:
   - Email: `gdiego2@gmail.com`
   - Senha: `32211904`

3. **Clique**: "Login" / "Entrar"

---

## ✅ Resultado Esperado

### Se deu certo:
- ✅ Redirecionado para Dashboard de Técnico
- ✅ Nome exibido: "Diego Admin"
- ✅ Ver métricas (Coletas Hoje, A Receber)
- ✅ Botão "Nova Leitura" visível
- ✅ Navegação inferior: Home, Faturas, Clientes

### Se deu erro:
Anote a mensagem de erro e me avise!

---

## 🧪 Testar Funcionalidades

Após login bem-sucedido:

### **Teste 1: Criar Cliente** (1 minuto)

1. Clique em **"Clientes"** (navegação inferior)
2. Clique em **"Novo Cliente"** (se houver)
3. Preencha dados de teste:
   - Nome: João Silva
   - Endereço: Rua Teste, 123
   - Contato: (31) 99999-9999
   - ID Medidor: 123456
   - Tipo Tensão: Monofásico
   - Email: joao@teste.com
4. Salvar

### **Teste 2: Criar Leitura** (1 minuto)

1. Clique em **"Home"** (navegação inferior)
2. Clique em **"Nova Leitura"**
3. Busque o cliente criado
4. Preencha:
   - Leitura Atual: 1500
   - Valor kWh: 1.19 (padrão)
   - Desconto: 0
   - Vencimento: (15 dias automático)
5. Clique **"Sincronizar Leitura"**

### **Teste 3: Ver Histórico** (30 segundos)

1. Clique em **"Faturas"** (navegação inferior)
2. Deve ver a leitura criada
3. Clique na leitura para ver detalhes

### **Teste 4: Botão PIX** (Vai dar erro - normal!)

1. Logout (botão vermelho)
2. Login como cliente: `joao@teste.com` / [senha do cliente]
3. Ver fatura pendente
4. Clicar **"Pagar via PIX"**
5. **Erro esperado**: "Erro ao gerar código PIX"
   - ⚠️ Normal! Backend não está configurado ainda

---

## 📊 Debug

### Abrir Console do Navegador (F12)

Procure por:
- ✅ Mensagens de sucesso
- ❌ Erros em vermelho
- 🔍 Network requests (aba Network)

### Erros Comuns:

**"Invalid login credentials"**
- Senha errada ou usuário não criado
- Verifique no Supabase se o usuário existe

**"Missing Supabase environment variables"**
- Reinicie o servidor: Ctrl+C e `npm run dev`

**Página branca**
- Abra F12 e veja o erro no console
- Provavelmente erro de sintaxe (já corrigido)

---

## 📞 Me Avise:

Quando testar, me diga:

1. ✅ Login funcionou?
2. ✅ Dashboard apareceu?
3. ✅ Nome "Diego Admin" está correto?
4. ✅ Conseguiu criar cliente/leitura?
5. ❌ Algum erro apareceu?

---

**Teste AGORA e me conte o resultado! 🚀**
