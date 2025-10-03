-- ============================================
-- CORREÇÃO: ADICIONAR ADMIN FALTANTE
-- ============================================
-- Este script adiciona o perfil admin para arimalaco@gmail.com que estava faltando

-- 1. VERIFICAR SE O EMAIL JÁ EXISTE (para evitar duplicatas)
DO $$
BEGIN
    -- Verificar se o perfil já existe
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE email = 'arimalaco@gmail.com'
    ) THEN
        -- Inserir o perfil admin faltante
        INSERT INTO public.profiles (
            id,
            email,
            nome_completo,
            role,
            criado_em,
            atualizado_em
        ) VALUES (
            gen_random_uuid(),
            'arimalaco@gmail.com',
            'Administrador Sistema',
            'admin'::user_role,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Perfil admin criado para arimalaco@gmail.com';
    ELSE
        RAISE NOTICE '⚠️ Perfil para arimalaco@gmail.com já existe';
    END IF;
END $$;

-- 2. VERIFICAR SE AMBOS OS ADMINS ESTÃO CORRETOS
SELECT 
    '=== VERIFICAÇÃO FINAL DOS ADMINS ===' as info,
    email,
    nome_completo,
    role,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN CONFIGURADO'
        ELSE '❌ NÃO É ADMIN'
    END as status
FROM public.profiles 
WHERE email IN ('arimalaco@gmail.com', 'simeimontijo@gmail.com')
ORDER BY email;

-- 3. CONTAR TOTAL DE ADMINS
SELECT 
    '=== TOTAL DE ADMINISTRADORES ===' as info,
    COUNT(*) as total_admins
FROM public.profiles 
WHERE role = 'admin';