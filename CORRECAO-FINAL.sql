-- ============================================
-- CORREÇÃO FINAL - SISTEMA DE REGISTROS
-- ============================================
-- Este script corrige todos os problemas:
-- 1. Relação entre registros e profiles
-- 2. Policies que estão bloqueando acesso
-- 3. Perfil de usuário faltando
-- ============================================

-- PASSO 1: GARANTIR QUE AS TABELAS EXISTEM
-- ============================================

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    cargo TEXT,
    avatar_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela registros
CREATE TABLE IF NOT EXISTS public.registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urb TEXT NOT NULL,
    localidade TEXT NOT NULL,
    endereco TEXT NOT NULL,
    caes_macho INTEGER DEFAULT 0,
    caes_femea INTEGER DEFAULT 0,
    gatos_macho INTEGER DEFAULT 0,
    gatos_femea INTEGER DEFAULT 0,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tutor TEXT,
    telefone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 2: REMOVER TODAS AS POLICIES ANTIGAS
-- ============================================

-- Remover policies de registros
DROP POLICY IF EXISTS "Ver registros" ON registros;
DROP POLICY IF EXISTS "Criar registro" ON registros;
DROP POLICY IF EXISTS "Atualizar registro" ON registros;
DROP POLICY IF EXISTS "Deletar registro" ON registros;
DROP POLICY IF EXISTS "Registros são visíveis para usuários autenticados" ON registros;
DROP POLICY IF EXISTS "Usuários autenticados podem criar registros" ON registros;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON registros;
DROP POLICY IF EXISTS "registros_select" ON registros;
DROP POLICY IF EXISTS "registros_insert" ON registros;
DROP POLICY IF EXISTS "registros_update" ON registros;
DROP POLICY IF EXISTS "registros_delete" ON registros;
DROP POLICY IF EXISTS "registros_select_all" ON registros;
DROP POLICY IF EXISTS "registros_insert_own" ON registros;
DROP POLICY IF EXISTS "registros_update_own" ON registros;
DROP POLICY IF EXISTS "registros_delete_own" ON registros;

-- Remover policies de profiles
DROP POLICY IF EXISTS "Ver perfis" ON profiles;
DROP POLICY IF EXISTS "Inserir perfil" ON profiles;
DROP POLICY IF EXISTS "Atualizar perfil" ON profiles;
DROP POLICY IF EXISTS "Profiles são visíveis para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir criação de perfil via trigger" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_any" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- PASSO 3: HABILITAR RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- PASSO 4: CRIAR POLICIES CORRETAS PARA PROFILES
-- ============================================

-- Permitir que usuários autenticados vejam TODOS os perfis
CREATE POLICY "profiles_allow_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuários autenticados insiram perfis (necessário para trigger e registro)
CREATE POLICY "profiles_allow_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "profiles_allow_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PASSO 5: CRIAR POLICIES CORRETAS PARA REGISTROS
-- ============================================

-- Permitir que usuários autenticados vejam TODOS os registros
CREATE POLICY "registros_allow_select"
ON public.registros
FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuários autenticados insiram registros
-- O criado_por deve ser o próprio usuário OU pode ser NULL (para compatibilidade)
CREATE POLICY "registros_allow_insert"
ON public.registros
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = criado_por OR criado_por IS NULL
);

-- Permitir que usuários atualizem seus próprios registros
CREATE POLICY "registros_allow_update_own"
ON public.registros
FOR UPDATE
TO authenticated
USING (auth.uid() = criado_por OR criado_por IS NULL)
WITH CHECK (auth.uid() = criado_por OR criado_por IS NULL);

-- Permitir que usuários deletem seus próprios registros
CREATE POLICY "registros_allow_delete_own"
ON public.registros
FOR DELETE
TO authenticated
USING (auth.uid() = criado_por OR criado_por IS NULL);

-- PASSO 6: CRIAR PERFIS PARA USUÁRIOS EXISTENTES
-- ============================================

-- Inserir perfis para todos os usuários que ainda não têm
INSERT INTO public.profiles (id, email, nome_completo)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'nome_completo', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- PASSO 7: CRIAR TRIGGER PARA NOVOS USUÁRIOS
-- ============================================

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome_completo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASSO 8: ATUALIZAR REGISTROS SEM CRIADOR
-- ============================================

-- Se você quiser atribuir registros sem criador ao primeiro usuário
-- (descomente se necessário)
-- UPDATE public.registros
-- SET criado_por = (SELECT id FROM auth.users LIMIT 1)
-- WHERE criado_por IS NULL;

-- PASSO 9: CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_registros_localidade ON public.registros(localidade);
CREATE INDEX IF NOT EXISTS idx_registros_data ON public.registros(data);
CREATE INDEX IF NOT EXISTS idx_registros_criado_por ON public.registros(criado_por);
CREATE INDEX IF NOT EXISTS idx_registros_criado_em ON public.registros(criado_em DESC);

-- PASSO 10: GARANTIR PERMISSÕES
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.registros TO authenticated;

-- PASSO 11: VERIFICAÇÕES
-- ============================================

-- Verificar se as tabelas existem
SELECT
    'Tabelas criadas:' as status,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'registros')
ORDER BY table_name;

-- Verificar policies criadas
SELECT
    'Policies criadas:' as status,
    tablename,
    policyname,
    cmd as operacao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'registros')
ORDER BY tablename, policyname;

-- Verificar se seu perfil existe
SELECT
    'Seu perfil:' as status,
    id,
    email,
    nome_completo
FROM public.profiles
WHERE id = auth.uid();

-- Contar registros
SELECT
    'Total de registros:' as status,
    COUNT(*) as total
FROM public.registros;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- PRÓXIMOS PASSOS:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Verifique as queries de verificação no final
-- 3. Faça logout e login novamente no sistema
-- 4. Tente criar um novo registro
-- 5. Verifique se os registros aparecem na lista

-- Se ainda houver problemas, execute:
-- SELECT * FROM public.profiles WHERE id = auth.uid();
-- SELECT * FROM public.registros ORDER BY criado_em DESC LIMIT 5;
