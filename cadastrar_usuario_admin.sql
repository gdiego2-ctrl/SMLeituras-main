-- Script SQL para cadastrar usuário administrador
-- Execute este script no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/dbvhmvymoyxkhqkewgyl/sql

-- IMPORTANTE: Este script cria o usuário diretamente no Supabase Auth
-- Senha: 32211904
-- Email: gdiego2@gmail.com

-- Primeiro, verificar se o usuário já existe
DO $$
DECLARE
    user_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'gdiego2@gmail.com'
    ) INTO user_exists;

    IF user_exists THEN
        RAISE NOTICE 'Usuário gdiego2@gmail.com já existe!';
    ELSE
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
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'gdiego2@gmail.com',
            crypt('32211904', gen_salt('bf')), -- Senha criptografada
            NOW(), -- Email já confirmado
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Diego Admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
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
        )
        SELECT
            gen_random_uuid(),
            id,
            format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        FROM auth.users
        WHERE email = 'gdiego2@gmail.com';

        RAISE NOTICE 'Usuário gdiego2@gmail.com criado com sucesso!';
    END IF;
END $$;

-- Verificar se foi criado
SELECT
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'name' as nome
FROM auth.users
WHERE email = 'gdiego2@gmail.com';
