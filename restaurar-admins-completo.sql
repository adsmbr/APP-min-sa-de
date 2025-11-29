-- ============================================
-- RESTAURAR ADMINISTRADORES APÓS REATIVAÇÃO
-- ============================================
-- Execute este script no SQL Editor do Supabase para restaurar
-- as permissões de admin dos dois usuários principais
-- ============================================

-- PASSO 1: VERIFICAR PERFIS ATUAIS
SELECT 
    '=== PERFIS ATUAIS ===' as info,
    id,
    email,
    nome_completo,
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ JÁ É ADMIN'
        WHEN role = 'funcionario' THEN '❌ É FUNCIONÁRIO'
        ELSE '❓ ROLE DESCONHECIDO'
    END as status_atual
FROM public.profiles 
WHERE email IN ('simeimontijo@gmail.com', 'arimalaco@gmail.com')
ORDER BY email;

-- PASSO 2: RESTAURAR AMBOS COMO ADMINISTRADORES
UPDATE public.profiles
SET 
    role = 'admin',
    atualizado_em = NOW()
WHERE email IN ('simeimontijo@gmail.com', 'arimalaco@gmail.com');

-- PASSO 3: VERIFICAR SE A RESTAURAÇÃO FOI BEM-SUCEDIDA
SELECT 
    '=== VERIFICAÇÃO PÓS-RESTAURAÇÃO ===' as info,
    id,
    email,
    nome_completo,
    role,
    atualizado_em,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN RESTAURADO'
        ELSE '❌ FALHA NA RESTAURAÇÃO'
    END as status_final
FROM public.profiles 
WHERE email IN ('simeimontijo@gmail.com', 'arimalaco@gmail.com')
ORDER BY email;

-- PASSO 4: VERIFICAR TOTAL DE ADMINISTRADORES NO SISTEMA
SELECT 
    '=== RESUMO FINAL ===' as info,
    COUNT(*) as total_admins,
    STRING_AGG(email, ', ') as emails_admins
FROM public.profiles 
WHERE role = 'admin';

-- PASSO 5: GARANTIR QUE A COLUNA ROLE EXISTE (caso tenha sido removida)
DO $$ 
BEGIN
    -- Verificar se a coluna role existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        -- Criar tipo enum se não existir
        CREATE TYPE user_role AS ENUM ('admin', 'funcionario');
        
        -- Adicionar coluna role
        ALTER TABLE public.profiles
        ADD COLUMN role user_role DEFAULT 'funcionario';
        
        -- Criar índice
        CREATE INDEX idx_profiles_role ON public.profiles(role);
        
        RAISE NOTICE 'Coluna role adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna role já existe.';
    END IF;
END $$;