# Setup Completo - Sistema de Pagamentos MercadoPago
# Execute este script no PowerShell como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP - Sistema de Pagamentos PIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/7] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Node.js não está instalado!" -ForegroundColor Red
    Write-Host "Instale em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js $nodeVersion instalado" -ForegroundColor Green

Write-Host ""
Write-Host "[2/7] Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "⚠ Supabase CLI não encontrado!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "INSTALE usando Scoop (recomendado):" -ForegroundColor Cyan
    Write-Host "  1. Instale Scoop: https://scoop.sh" -ForegroundColor White
    Write-Host "  2. Execute: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor White
    Write-Host "  3. Execute: scoop install supabase" -ForegroundColor White
    Write-Host ""
    Write-Host "OU baixe o binário: https://github.com/supabase/cli/releases" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Supabase CLI instalado? (s/n)"
    if ($continue -ne "s") {
        Write-Host "Instale o Supabase CLI e execute este script novamente." -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "✓ Supabase CLI instalado" -ForegroundColor Green

Write-Host ""
Write-Host "[3/7] Instalando dependências do projeto..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependências!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependências instaladas" -ForegroundColor Green

Write-Host ""
Write-Host "[4/7] Configurando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ Arquivo .env já existe" -ForegroundColor Green
    Write-Host ""
    Write-Host "EDITE O ARQUIVO .env com suas credenciais:" -ForegroundColor Cyan
    Write-Host "  - VITE_SUPABASE_URL (do dashboard do Supabase)" -ForegroundColor White
    Write-Host "  - VITE_SUPABASE_ANON_KEY (do dashboard do Supabase)" -ForegroundColor White
    Write-Host "  - VITE_MERCADOPAGO_PUBLIC_KEY (do painel do MercadoPago)" -ForegroundColor White
} else {
    Write-Host "ERRO: Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
$envConfigured = Read-Host "Arquivo .env configurado com suas credenciais? (s/n)"
if ($envConfigured -ne "s") {
    Write-Host "Por favor, configure o .env antes de continuar." -ForegroundColor Yellow
    notepad .env
    exit 0
}

Write-Host ""
Write-Host "[5/7] Configurando Supabase Secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: Você precisa configurar os secrets do Supabase!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute estes comandos MANUALMENTE (um por vez):" -ForegroundColor Yellow
Write-Host ""
Write-Host "supabase secrets set MERCADOPAGO_ACCESS_TOKEN=SEU-ACCESS-TOKEN" -ForegroundColor White
Write-Host "supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co" -ForegroundColor White
Write-Host "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA-SERVICE-ROLE-KEY" -ForegroundColor White
Write-Host "supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=\"\"" -ForegroundColor White
Write-Host ""
$secretsConfigured = Read-Host "Secrets configurados? (s/n)"
if ($secretsConfigured -ne "s") {
    Write-Host "Configure os secrets e execute este script novamente." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[6/7] Editando lista de técnicos autorizados..." -ForegroundColor Yellow
if (Test-Path "supabase\migrations\003_fix_rls_policies.sql") {
    Write-Host "✓ Migration encontrada" -ForegroundColor Green
    Write-Host ""
    Write-Host "EDITE o arquivo 003_fix_rls_policies.sql:" -ForegroundColor Cyan
    Write-Host "  - Substitua 'tecnico1@smengenharia.com' pelos emails reais" -ForegroundColor White
    Write-Host "  - Adicione todos os técnicos autorizados" -ForegroundColor White
    Write-Host ""
    $editMigration = Read-Host "Abrir arquivo agora? (s/n)"
    if ($editMigration -eq "s") {
        notepad "supabase\migrations\003_fix_rls_policies.sql"
    }
    Write-Host ""
    $migrationEdited = Read-Host "Migration editada? (s/n)"
    if ($migrationEdited -ne "s") {
        Write-Host "Edite a migration antes de continuar." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "[7/7] Aplicando migrations e fazendo deploy..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Aplicando migrations no banco de dados..." -ForegroundColor Cyan
supabase db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao aplicar migrations!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Migrations aplicadas" -ForegroundColor Green

Write-Host ""
Write-Host "Deployando Edge Functions..." -ForegroundColor Cyan
supabase functions deploy create-pix-payment
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao deployer create-pix-payment!" -ForegroundColor Red
    exit 1
}

supabase functions deploy mercadopago-webhook
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao deployer mercadopago-webhook!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Edge Functions deployadas" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure o Webhook no MercadoPago:" -ForegroundColor Yellow
Write-Host "   - URL: https://seu-projeto.supabase.co/functions/v1/mercadopago-webhook" -ForegroundColor White
Write-Host "   - Copie o Webhook Secret" -ForegroundColor White
Write-Host "   - Execute: supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=seu-secret" -ForegroundColor White
Write-Host ""
Write-Host "2. Rodar a aplicação:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Acessar:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Leia CORRECOES_CRITICAS_APLICADAS.md para mais detalhes!" -ForegroundColor Cyan
Write-Host ""
