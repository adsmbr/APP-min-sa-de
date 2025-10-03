-- ============================================
-- ATUALIZAR PERFIL PARA ADMINISTRADOR
-- ============================================
-- Este script atualiza o perfil do usuário 'simeimontijo@gmail.com' para administrador.
-- Execute este script no SQL Editor do Supabase.
-- ============================================

-- PASSO 1: VERIFICAR O PERFIL ATUAL
SELECT 
    '=== PERFIL ATUAL ===' as info,
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
WHERE email = 'simeimontijo@gmail.com';

-- PASSO 2: ATUALIZAR PARA ADMINISTRADOR
UPDATE public.profiles
SET 
    role = 'admin',
    atualizado_em = NOW()
WHERE email = 'simeimontijo@gmail.com';

-- PASSO 3: VERIFICAR SE A ATUALIZAÇÃO FOI BEM-SUCEDIDA
SELECT 
    '=== VERIFICAÇÃO PÓS-ATUALIZAÇÃO ===' as info,
    id,
    email,
    nome_completo,
    role,
    atualizado_em,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN CONFIGURADO CORRETAMENTE'
        ELSE '❌ FALHA NA ATUALIZAÇÃO'
    END as status_final
FROM public.profiles 
WHERE email = 'simeimontijo@gmail.com';

-- PASSO 4: CONTAR TOTAL DE ADMINISTRADORES
SELECT 
    '=== TOTAL DE ADMINISTRADORES ===' as info,
    COUNT(*) as total_admins,
    STRING_AGG(email, ', ') as emails_admins
FROM public.profiles 
WHERE role = 'admin';

-- PASSO 5: VERIFICAR POLÍTICAS RLS RELACIONADAS
SELECT 
    '=== POLÍTICAS RLS RELACIONADAS A ROLES ===' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'registros') 
AND (qual LIKE '%role%' OR policyname LIKE '%admin%')
ORDER BY tablename, policyname;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Copie todo este script
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute o script completo
-- 4. Verifique se o resultado mostra "✅ ADMIN CONFIGURADO CORRETAMENTE"
-- 5. Teste fazendo login com simeimontijo@gmail.com
-- 6. Verifique se o badge "Administrador" aparece no header
-- 7. Teste o acesso à aba "Análises"
-- ============================================