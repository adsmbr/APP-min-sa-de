-- ============================================
-- CORRIGIR POLICIES - Permitir Visualização de Registros
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE (para testes)
-- Se você quiser testar sem RLS primeiro, descomente a linha abaixo:
-- ALTER TABLE registros DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLICIES EXISTENTES
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

-- 3. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLICIES CORRETAS

-- Policy SELECT: Todos usuários autenticados podem ver TODOS os registros
CREATE POLICY "registros_select_all"
ON registros
FOR SELECT
TO authenticated
USING (true);

-- Policy INSERT: Usuários autenticados podem criar registros
-- O criado_por deve ser o próprio usuário
CREATE POLICY "registros_insert_own"
ON registros
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = criado_por
);

-- Policy UPDATE: Usuários podem atualizar apenas seus próprios registros
CREATE POLICY "registros_update_own"
ON registros
FOR UPDATE
TO authenticated
USING (auth.uid() = criado_por)
WITH CHECK (auth.uid() = criado_por);

-- Policy DELETE: Usuários podem deletar apenas seus próprios registros
CREATE POLICY "registros_delete_own"
ON registros
FOR DELETE
TO authenticated
USING (auth.uid() = criado_por);

-- 5. FAZER O MESMO PARA PROFILES

DROP POLICY IF EXISTS "Ver perfis" ON profiles;
DROP POLICY IF EXISTS "Inserir perfil" ON profiles;
DROP POLICY IF EXISTS "Atualizar perfil" ON profiles;
DROP POLICY IF EXISTS "Profiles são visíveis para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir criação de perfil via trigger" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Todos podem ver todos os perfis
CREATE POLICY "profiles_select_all"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Usuários podem inserir (necessário para o trigger)
CREATE POLICY "profiles_insert_any"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. VERIFICAR SE AS POLICIES FORAM CRIADAS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('registros', 'profiles')
ORDER BY tablename, policyname;

-- 7. TESTAR MANUALMENTE (opcional)
-- Descomente para testar se consegue buscar registros:
-- SELECT * FROM registros LIMIT 5;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- INSTRUÇÕES:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Verifique se não há erros
-- 3. A última query deve mostrar as policies criadas
-- 4. Teste o sistema novamente
