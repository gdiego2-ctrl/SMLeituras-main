#!/usr/bin/env node

/**
 * Script de Validação de Variáveis de Ambiente
 * SM Engenharia - Sistema de Faturamento
 *
 * Execute: node scripts/validate-env.js
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Variáveis obrigatórias
const REQUIRED_VARS = {
  VITE_SUPABASE_URL: {
    description: 'URL do projeto Supabase',
    example: 'https://xxx.supabase.co',
    whereToFind: 'Supabase → Settings → API → Project URL',
    critical: true,
  },
  VITE_SUPABASE_ANON_KEY: {
    description: 'Chave anônima do Supabase',
    example: 'eyJhbGci...',
    whereToFind: 'Supabase → Settings → API → anon public',
    critical: true,
  },
  VITE_MERCADOPAGO_PUBLIC_KEY: {
    description: 'Chave pública do Mercado Pago',
    example: 'TEST-xxxxx ou APP-xxxxx',
    whereToFind: 'Mercado Pago → Developers → Suas aplicações',
    critical: false,
  },
};

// Variáveis opcionais (apenas dev local)
const OPTIONAL_VARS = {
  VITE_SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Service Role Key (APENAS desenvolvimento local)',
    warning: '⚠️ NUNCA use em produção! Use Edge Functions para operações admin.',
  },
  VITE_APP_ENV: {
    description: 'Ambiente da aplicação',
    default: 'development',
  },
};

function loadEnvFile() {
  const envPath = resolve(rootDir, '.env.local');

  if (!existsSync(envPath)) {
    return null;
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();

    if (key && value) {
      env[key.trim()] = value;
    }
  });

  return env;
}

function validateValue(key, value, config) {
  const issues = [];

  // Verifica se está vazio
  if (!value || value === '') {
    issues.push('Valor vazio');
  }

  // Verifica se é placeholder
  if (value && (value.includes('your-') || value.includes('xxxxx'))) {
    issues.push('Valor é placeholder do .env.example');
  }

  // Validações específicas
  if (key === 'VITE_SUPABASE_URL') {
    if (value && !value.startsWith('https://')) {
      issues.push('Deve começar com https://');
    }
    if (value && !value.includes('.supabase.co')) {
      issues.push('Formato esperado: https://xxx.supabase.co');
    }
  }

  if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'VITE_SUPABASE_SERVICE_ROLE_KEY') {
    if (value && !value.startsWith('eyJ')) {
      issues.push('Chave Supabase deve começar com "eyJ"');
    }
  }

  if (key === 'VITE_MERCADOPAGO_PUBLIC_KEY') {
    if (value && !value.startsWith('TEST-') && !value.startsWith('APP-')) {
      issues.push('Chave deve começar com "TEST-" ou "APP-"');
    }
  }

  return issues;
}

function printHeader() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  SM ENGENHARIA - Validação de Variáveis de Ambiente', 'bold');
  log('='.repeat(70), 'cyan');
  log('');
}

function printResults(env) {
  let hasErrors = false;
  let hasWarnings = false;

  log('📋 VARIÁVEIS OBRIGATÓRIAS:\n', 'bold');

  Object.entries(REQUIRED_VARS).forEach(([key, config]) => {
    const value = env?.[key];
    const issues = validateValue(key, value, config);
    const status = issues.length === 0 ? '✅' : (config.critical ? '❌' : '⚠️');

    log(`${status} ${key}`, issues.length === 0 ? 'green' : (config.critical ? 'red' : 'yellow'));
    log(`   ${config.description}`, 'reset');

    if (value && issues.length === 0) {
      log(`   Valor: ${value.substring(0, 30)}...`, 'green');
    } else if (!value) {
      log(`   ❌ FALTANDO`, 'red');
      log(`   📍 Onde encontrar: ${config.whereToFind}`, 'cyan');
      log(`   Exemplo: ${config.example}`, 'reset');
      if (config.critical) hasErrors = true;
      else hasWarnings = true;
    } else {
      issues.forEach(issue => {
        log(`   ⚠️ ${issue}`, 'yellow');
        hasWarnings = true;
      });
      log(`   📍 Onde encontrar: ${config.whereToFind}`, 'cyan');
    }

    log('');
  });

  log('📝 VARIÁVEIS OPCIONAIS:\n', 'bold');

  Object.entries(OPTIONAL_VARS).forEach(([key, config]) => {
    const value = env?.[key];
    const status = value ? '✅' : '➖';

    log(`${status} ${key}`, value ? 'green' : 'reset');
    log(`   ${config.description}`, 'reset');

    if (value) {
      log(`   Valor: ${value.substring(0, 30)}...`, 'green');
      if (config.warning) {
        log(`   ${config.warning}`, 'yellow');
      }
    } else {
      log(`   Não configurado`, 'reset');
      if (config.default) {
        log(`   Padrão: ${config.default}`, 'cyan');
      }
    }

    log('');
  });

  return { hasErrors, hasWarnings };
}

function printSummary(envFileExists, hasErrors, hasWarnings) {
  log('─'.repeat(70), 'cyan');
  log('');

  if (!envFileExists) {
    log('❌ ERRO CRÍTICO: Arquivo .env.local não encontrado!', 'red');
    log('', 'reset');
    log('📝 Para corrigir:', 'bold');
    log('   1. Copie o arquivo .env.example:', 'reset');
    log('      cp .env.example .env.local', 'cyan');
    log('   2. Edite .env.local e preencha as variáveis', 'reset');
    log('   3. Execute este script novamente', 'reset');
    log('');
    process.exit(1);
  }

  if (hasErrors) {
    log('❌ VALIDAÇÃO FALHOU - Variáveis críticas faltando!', 'red');
    log('', 'reset');
    log('📝 Para corrigir:', 'bold');
    log('   1. Edite o arquivo .env.local', 'reset');
    log('   2. Preencha as variáveis marcadas com ❌', 'reset');
    log('   3. Consulte .env.example para exemplos', 'reset');
    log('   4. Veja VERCEL_SETUP.md para onde encontrar os valores', 'reset');
    log('');
    process.exit(1);
  }

  if (hasWarnings) {
    log('⚠️ VALIDAÇÃO COM AVISOS - Verifique as variáveis opcionais', 'yellow');
    log('', 'reset');
    log('O app funcionará, mas algumas funcionalidades podem não estar disponíveis.', 'reset');
    log('');
    process.exit(0);
  }

  log('✅ VALIDAÇÃO COMPLETA - Todas as variáveis obrigatórias configuradas!', 'green');
  log('', 'reset');
  log('🚀 Você pode iniciar o app com:', 'bold');
  log('   npm run dev', 'cyan');
  log('');
  process.exit(0);
}

// Execução principal
function main() {
  printHeader();

  log('🔍 Verificando arquivo .env.local...', 'cyan');
  const env = loadEnvFile();
  const envFileExists = env !== null;

  if (envFileExists) {
    log('✅ Arquivo encontrado\n', 'green');
  } else {
    log('❌ Arquivo .env.local não encontrado\n', 'red');
  }

  const { hasErrors, hasWarnings } = printResults(env);
  printSummary(envFileExists, hasErrors, hasWarnings);
}

main();
