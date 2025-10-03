-- ============================================
-- SCRIPT DE VERIFICAÇÃO DE ROLES
-- ============================================
-- Este script verifica se os roles estão configurados corretamente

-- 1. VERIFICAR TODOS OS USUÁRIOS E SEUS ROLES
SELECT 
    '=== USUÁRIOS E ROLES ===' as info,
    p.id,
    p.email,
    p.nome_completo,
    p.role,
    p.criado_em
FROM public.profiles p
ORDER BY p.role DESC, p.criado_em ASC;

-- 2. CONTAR USUÁRIOS POR ROLE
SELECT 
    '=== CONTAGEM POR ROLE ===' as info,
    role,
    COUNT(*) as total
FROM public.profiles
GROUP BY role
ORDER BY role;

-- 3. VERIFICAR SE OS EMAILS DOS ADMINS ESTÃO CORRETOS
SELECT 
    '=== VERIFICAÇÃO DOS ADMINS ESPECÍFICOS ===' as info,
    p.email,
    p.nome_completo,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ É ADMIN'
        ELSE '❌ NÃO É ADMIN'
    END as status_admin
FROM public.profiles p
WHERE p.email IN (
    'arimalaco@gmail.com',
    'simeimontijo@gmail.com'
)
ORDER BY p.email;

-- 4. VERIFICAR POLICIES ATIVAS
SELECT 
    '=== POLICIES DE SEGURANÇA ===' as info,
    tablename,
    policyname,
    cmd as operacao,
    CASE
        WHEN policyname LIKE '%admin%' THEN 'Requer Admin'
        WHEN policyname LIKE '%role%' THEN 'Baseado em Role'
        ELSE 'Todos autenticados'
    END as nivel_acesso
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'registros', 'auditoria')
ORDER BY tablename, policyname;

-- 5. TESTAR PERMISSÕES (execute como usuário logado)
-- Esta query mostra o role do usuário atual
SELECT 
    '=== MEU PERFIL ATUAL ===' as info,
    p.id,
    p.email,
    p.nome_completo,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '🛡️ ADMINISTRADOR - Acesso Completo'
        WHEN p.role = 'funcionario' THEN '👤 FUNCIONÁRIO - Apenas Cadastros'
        ELSE '❓ ROLE DESCONHECIDO'
    END as nivel_acesso
FROM public.profiles p
WHERE p.id = auth.uid();

-- 6. VERIFICAR SE A COLUNA ROLE EXISTE E TEM O TIPO CORRETO
SELECT 
    '=== ESTRUTURA DA TABELA PROFILES ===' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name = 'role';

-- 7. VERIFICAR SE O ENUM user_role EXISTE
SELECT 
    '=== ENUM user_role ===' as info,
    enumlabel as valores_possiveis
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role'
);