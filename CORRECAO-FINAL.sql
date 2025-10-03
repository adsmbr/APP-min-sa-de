-- ============================================
-- CORREÇÃO FINAL E VERIFICAÇÃO DE ROLE
-- ============================================
-- Este script garante que o usuário 'simeimontijo@gmail.com' tenha a role de 'admin'.

-- PASSO 1: ATUALIZAR DIRETAMENTE O PERFIL DO USUÁRIO
-- Esta é a correção definitiva para garantir que o usuário tenha a role correta.
UPDATE public.profiles
SET
    role = 'admin'
WHERE
    email = 'simeimontijo@gmail.com';

-- PASSO 2: VERIFICAR A ATUALIZAÇÃO
-- Esta query confirma que a atualização foi bem-sucedida.
SELECT
    '=== VERIFICAÇÃO DE ADMIN ===' as info,
    email,
    nome_completo,
    role,
    CASE
        WHEN role = 'admin' THEN '✅ ADMIN CONFIGURADO CORRETAMENTE'
        ELSE '❌ FALHA NA ATUALIZAÇÃO'
    END as status
FROM public.profiles
WHERE email = 'simeimontijo@gmail.com';

-- PASSO 3: CONTAR O NÚMERO TOTAL DE ADMINS
SELECT
    '=== TOTAL DE ADMINISTRADORES ===' as info,
    COUNT(*) as total_admins
FROM public.profiles
WHERE role = 'admin';