# 🔧 Como Instalar o Supabase CLI no Windows

**Tempo:** ~5 minutos

---

## 🎯 Opção 1: Scoop (Recomendado)

### **Passo 1: Instalar Scoop**

Abra o **PowerShell** como Administrador e execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### **Passo 2: Instalar Supabase CLI**

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### **Passo 3: Verificar instalação**

```powershell
supabase --version
```

Deve mostrar algo como: `1.x.x`

---

## 🎯 Opção 2: Download Direto

### **Passo 1: Baixar**

Acesse: https://github.com/supabase/cli/releases

Baixe o arquivo para Windows:
- `supabase_windows_amd64.zip` (64-bit)
- `supabase_windows_386.zip` (32-bit)

### **Passo 2: Extrair**

1. Extraia o ZIP
2. Copie `supabase.exe` para uma pasta permanente, ex: `C:\Program Files\Supabase\`

### **Passo 3: Adicionar ao PATH**

1. Abra **Painel de Controle** → **Sistema** → **Configurações Avançadas do Sistema**
2. Clique em **Variáveis de Ambiente**
3. Em **Variáveis do sistema**, selecione **Path** e clique em **Editar**
4. Clique em **Novo** e adicione: `C:\Program Files\Supabase`
5. Clique **OK** em todas as janelas

### **Passo 4: Verificar**

Abra um **novo** terminal e execute:

```cmd
supabase --version
```

---

## 🎯 Opção 3: NPM Local (Não recomendado)

Se nenhuma das opções acima funcionar, você pode usar `npx`:

```bash
npx supabase --version
```

**Nota:** Você precisará usar `npx supabase` em vez de só `supabase` em todos os comandos.

---

## ✅ Próximo Passo

Depois de instalar o Supabase CLI, execute:

```powershell
# PowerShell
.\setup-completo.ps1
```

Ou siga o guia manual em: `APLICAR_CORRECOES_AGORA.md`

---

## 🆘 Problemas?

### **Erro: "Set-ExecutionPolicy cannot be set"**

Execute o PowerShell como **Administrador** e tente novamente.

### **Erro: "supabase: command not found" após instalar**

1. Feche e abra um **novo** terminal
2. Verifique se o PATH foi adicionado corretamente
3. Execute: `echo $env:Path` e procure pela pasta do Supabase

### **Erro: "Scoop não funciona"**

Use a **Opção 2** (Download Direto) em vez disso.

---

**Instalação concluída? Volte para o setup principal!** 🚀
