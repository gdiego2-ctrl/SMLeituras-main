# 🔄 Reset Completo de Usuários

## ⚠️ ATENÇÃO
Este processo irá **EXCLUIR TODOS os usuários** existentes e criar apenas um administrador.

---

## 📋 Dados do Novo Administrador

- **Email**: gdiego2@gmail.com
- **Senha**: 32211904
- **Perfil**: Técnico/Administrador
- **Nome**: Diego Admin

---

## 🚀 Passo a Passo

### **Passo 1: Acessar SQL Editor**

1. Abra o navegador e acesse:
   ```
   https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql
   ```

2. Faça login no Supabase (se necessário)

---

### **Passo 2: Criar Nova Query**

1. Clique no botão **"New query"** (canto superior esquerdo)

2. Um editor de SQL em branco irá aparecer

---

### **Passo 3: Copiar o Script**

1. Abra o arquivo: `resetar_usuarios.sql`

2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

3. **Cole no editor SQL** do Supabase (Ctrl+V)

---

### **Passo 4: Executar o Script**

1. **Revise** o script (certifique-se que está correto)

2. Clique no botão **"Run"** (ou pressione Ctrl+Enter)

3. Aguarde a execução (leva poucos segundos)

---

### **Passo 5: Verificar Resultado**

Você verá mensagens como:

```
✅ Todos os usuários foram excluídos!
✅ Usuário administrador criado com sucesso!
   Email: gdiego2@gmail.com
   Senha: 32211904
   UUID: [uuid-gerado]
```

E uma tabela mostrando:

| id | email | nome | perfil |
|----|-------|------|--------|
| [uuid] | gdiego2@gmail.com | Diego Admin | tecnico |

**Total de usuários: 1**

---

## 🧪 Testar Login

### **Passo 1: Acessar Aplicação**
```
http://localhost:3000
```

### **Passo 2: Fazer Login**
- **Email**: `gdiego2@gmail.com`
- **Senha**: `32211904`

### **Passo 3: Verificar Acesso**
✅ Deve redirecionar para Dashboard de Técnico
✅ Nome exibido: "Diego Admin"
✅ Acesso total ao sistema

---

## 📸 Visual do Processo

### No SQL Editor você verá:

```sql
-- ⚠️ SCRIPT DE RESET DE USUÁRIOS ⚠️
DELETE FROM auth.identities;
DELETE FROM auth.users;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;

-- Criar novo administrador
INSERT INTO auth.users (...)
```

### Após executar:

```
Success. No rows returned

NOTICE: ✅ Todos os usuários foram excluídos!
NOTICE: ✅ Usuário administrador criado com sucesso!
NOTICE:    Email: gdiego2@gmail.com
NOTICE:    Senha: 32211904

Results (1 row):
┌──────────────────────┬────────────────────┬─────────────┬─────────┐
│ id                   │ email              │ nome        │ perfil  │
├──────────────────────┼────────────────────┼─────────────┼─────────┤
│ abc-123-def-456      │ gdiego2@gmail.com  │ Diego Admin │ tecnico │
└──────────────────────┴────────────────────┴─────────────┴─────────┘

Total de usuários: 1
```

---

## ✅ Checklist de Execução

- [ ] Acessei o SQL Editor do Supabase
- [ ] Criei uma nova query
- [ ] Copiei o conteúdo de `resetar_usuarios.sql`
- [ ] Colei no editor
- [ ] Executei o script (Run)
- [ ] Vi mensagem de sucesso
- [ ] Verifiquei que há apenas 1 usuário
- [ ] Testei login com gdiego2@gmail.com
- [ ] Login funcionou corretamente

---

## 🔍 Solução de Problemas

### Erro: "permission denied"
**Solução**: Certifique-se que está logado como administrador do projeto Supabase.

### Erro: "relation auth.users does not exist"
**Solução**: Você está no projeto correto? Verifique a URL.

### Script não executa
**Solução**: Copie novamente o script completo. Não pode ter caracteres especiais.

### Login não funciona após reset
**Solução**:
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página (Ctrl+F5)
3. Tente fazer login novamente

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se copiou o script completo
2. Verifique se está no projeto correto do Supabase
3. Tente executar linha por linha para identificar o erro

---

## ⚡ Execução Rápida

**TL;DR** (Muito Rápido):

1. Acesse: https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql
2. New query
3. Cole o conteúdo de `resetar_usuarios.sql`
4. Run
5. Login: gdiego2@gmail.com / 32211904

---

**Pronto para executar! 🚀**
