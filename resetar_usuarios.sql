-- ⚠️ SCRIPT DE RESET DE USUÁRIOS ⚠️
-- Este script EXCLUI TODOS os usuários e cria apenas o administrador
-- Execute no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql

-- ==================================================
-- PARTE 1: EXCLUIR TODOS OS USUÁRIOS
-- ==================================================

-- Primeiro, excluir todas as identities
DELETE FROM auth.identities;

-- Depois, excluir todos os usuários
DELETE FROM auth.users;

-- Limpar refresh tokens
DELETE FROM auth.refresh_tokens;

-- Limpar sessions
DELETE FROM auth.sessions;

RAISE NOTICE '✅ Todos os usuários foram excluídos!';

-- ==================================================
-- PARTE 2: CRIAR NOVO ADMINISTRADOR
-- ==================================================

-- Criar usuário administrador
-- Email: gdiego2@gmail.com
-- Senha: 32211904

DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Gerar novo UUID para o usuário
    new_user_id := gen_random_uuid();

    -- Criar usuário
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'gdiego2@gmail.com',
        crypt('32211904', gen_salt('bf')), -- Senha criptografada
        NOW(), -- Email já confirmado
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Diego Admin","role":"tecnico"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        false,
        NULL
    );

    -- Criar identity para o usuário
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        format('{"sub":"%s","email":"gdiego2@gmail.com","email_verified":true,"provider":"email"}', new_user_id::text)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Usuário administrador criado com sucesso!';
    RAISE NOTICE '   Email: gdiego2@gmail.com';
    RAISE NOTICE '   Senha: 32211904';
    RAISE NOTICE '   UUID: %', new_user_id;
END $$;

-- ==================================================
-- VERIFICAÇÃO FINAL
-- ==================================================

-- Listar todos os usuários (deve mostrar apenas 1)
SELECT
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'name' as nome,
    raw_user_meta_data->>'role' as perfil
FROM auth.users
ORDER BY created_at DESC;

-- Contar usuários
SELECT COUNT(*) as total_usuarios FROM auth.users;
