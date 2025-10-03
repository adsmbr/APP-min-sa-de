-- ============================================
-- SCRIPT DE LIMPEZA COMPLETA DE EMAIL
-- ============================================
-- Este script remove completamente o email 'simeimontijo@gmail.com' 
-- de todas as tabelas do Supabase, incluindo auth.users e public.profiles

-- IMPORTANTE: Execute este script no SQL Editor do Supabase Dashboard
-- com privilégios de administrador

-- ============================================
-- PASSO 1: VERIFICAR DADOS EXISTENTES
-- ============================================

-- Verificar se o email existe na tabela auth.users
SELECT 
    '=== VERIFICAÇÃO AUTH.USERS ===' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'simeimontijo@gmail.com';

-- Verificar se o email existe na tabela public.profiles
SELECT 
    '=== VERIFICAÇÃO PUBLIC.PROFILES ===' as info,
    id,
    email,
    nome_completo,
    cargo,
    criado_em
FROM public.profiles 
WHERE email = 'simeimontijo@gmail.com';

-- Verificar registros criados por este usuário
SELECT 
    '=== REGISTROS CRIADOS PELO USUÁRIO ===' as info,
    COUNT(*) as total_registros
FROM public.registros r
JOIN auth.users u ON r.criado_por = u.id
WHERE u.email = 'simeimontijo@gmail.com';

-- ============================================
-- PASSO 2: LIMPEZA COMPLETA
-- ============================================

-- ATENÇÃO: Os comandos abaixo irão DELETAR PERMANENTEMENTE todos os dados
-- Descomente apenas quando tiver certeza de que deseja prosseguir

-- 2.1: Atualizar registros para não referenciar o usuário que será deletado
-- UPDATE public.registros 
-- SET criado_por = NULL 
-- WHERE criado_por IN (
--     SELECT id FROM auth.users WHERE email = 'simeimontijo@gmail.com'
-- );

-- 2.2: Deletar da tabela public.profiles (será deletado automaticamente pelo CASCADE)
-- DELETE FROM public.profiles 
-- WHERE email = 'simeimontijo@gmail.com';

-- 2.3: Deletar da tabela auth.users (isso irá deletar automaticamente o profile devido ao CASCADE)
-- DELETE FROM auth.users 
-- WHERE email = 'simeimontijo@gmail.com';

-- ============================================
-- PASSO 3: VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se a limpeza foi bem-sucedida
-- SELECT 
--     '=== VERIFICAÇÃO FINAL ===' as info,
--     CASE 
--         WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'simeimontijo@gmail.com')
--         AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'simeimontijo@gmail.com')
--         THEN '✅ EMAIL COMPLETAMENTE REMOVIDO DO SISTEMA'
--         ELSE '❌ AINDA EXISTEM REFERÊNCIAS DO EMAIL NO SISTEMA'
--     END as status;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Execute primeiro apenas as queries de VERIFICAÇÃO (PASSO 1)
-- 2. Analise os resultados para confirmar que é o usuário correto
-- 3. Descomente os comandos do PASSO 2 um por vez
-- 4. Execute os comandos de limpeza
-- 5. Execute a verificação final (PASSO 3)
-- 6. Tente recadastrar o email no sistema

-- ============================================
-- COMANDOS PARA EXECUÇÃO SEGURA (DESCOMENTE CONFORME NECESSÁRIO):
-- ============================================

/*
-- Comando 1: Atualizar registros órfãos
UPDATE public.registros 
SET criado_por = NULL 
WHERE criado_por IN (
    SELECT id FROM auth.users WHERE email = 'simeimontijo@gmail.com'
);

-- Comando 2: Deletar usuário (isso remove automaticamente o profile)
DELETE FROM auth.users 
WHERE email = 'simeimontijo@gmail.com';

-- Comando 3: Verificação final
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'simeimontijo@gmail.com')
        AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'simeimontijo@gmail.com')
        THEN '✅ EMAIL COMPLETAMENTE REMOVIDO DO SISTEMA'
        ELSE '❌ AINDA EXISTEM REFERÊNCIAS DO EMAIL NO SISTEMA'
    END as status;
*/