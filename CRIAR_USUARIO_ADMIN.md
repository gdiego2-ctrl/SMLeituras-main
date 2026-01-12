# 👤 Criar Usuário Administrador

## Dados do Usuário:
- **Email**: gdiego2@gmail.com
- **Senha**: 32211904
- **Perfil**: Técnico/Administrador

---

## Método 1: Via Dashboard Supabase (Recomendado)

### Passo 1: Acessar Authentication
1. Acesse: https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/auth/users
2. Faça login no Supabase

### Passo 2: Criar Usuário
1. Clique em **"Add user"** → **"Create new user"**
2. Preencha:
   - **Email**: `gdiego2@gmail.com`
   - **Password**: `32211904`
   - **Auto Confirm User**: ✅ (marque essa opção!)
3. Clique em **"Create user"**

### Passo 3: Verificar
1. O usuário aparecerá na lista
2. Status deve ser **"Confirmed"**

---

## Método 2: Via SQL (Alternativo)

Se preferir criar direto no banco:

### Passo 1: Acessar SQL Editor
1. Dashboard Supabase → SQL Editor
2. Nova query

### Passo 2: Executar SQL

```sql
-- Criar usuário no Supabase Auth
-- NOTA: Isso só funciona se você tiver a extensão auth configurada
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'gdiego2@gmail.com',
  crypt('32211904', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"name":"Diego Admin"}',
  NULL,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);
```

**⚠️ AVISO**: Este método é mais complexo. Use o Método 1 (Dashboard) que é mais simples.

---

## Método 3: Via Tela de Login (Sign Up)

Se a aplicação tiver signup habilitado:

### Passo 1: Habilitar Sign Up
No código `App.tsx`, a aplicação usa Supabase Auth que permite signup.

### Passo 2: Criar conta
1. Acesse: http://localhost:3000
2. Se houver opção "Criar conta" / "Sign up", use:
   - Email: `gdiego2@gmail.com`
   - Senha: `32211904`

### Passo 3: Confirmar Email
Verifique o email `gdiego2@gmail.com` e confirme.

---

## ✅ Após Criar o Usuário

### Verificar Perfil

O sistema detecta automaticamente que é técnico/admin porque:

```typescript
// Em App.tsx linha 21-27
const getRoleFromUser = (user: any): UserRole => {
  const email = user.email?.toLowerCase() || '';
  if (email === 'bwasistemas@gmail.com' || email.includes('tecnico')) {
    return 'tecnico';
  }
  return 'cliente';
};
```

**Para tornar gdiego2@gmail.com um ADMIN, você precisa:**

### Opção A: Adicionar no código

Edite `App.tsx` linha 23:

```typescript
if (email === 'bwasistemas@gmail.com' ||
    email === 'gdiego2@gmail.com' ||  // ← Adicionar esta linha
    email.includes('tecnico')) {
  return 'tecnico';
}
```

### Opção B: Usar email com palavra "tecnico"

Cadastre como: `tecnico.diego@gmail.com` ou `gdiego2.tecnico@gmail.com`

---

## 🧪 Testar Login

1. Acesse: http://localhost:3000
2. Login:
   - Email: `gdiego2@gmail.com`
   - Senha: `32211904`
3. Deve redirecionar para Dashboard de Técnico

---

## 📝 Notas Importantes

1. **Email de confirmação**: Se o Supabase enviar email de confirmação, verifique a caixa de entrada
2. **Permissões**: Usuário terá acesso de técnico se o email estiver na lista ou incluir "tecnico"
3. **Segurança**: Em produção, use senha mais forte que `32211904`

---

**Recomendação**: Use o **Método 1 (Dashboard)** - é o mais rápido e confiável! 🚀
