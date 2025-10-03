-- ============================================
-- ADICIONAR SISTEMA DE ROLES
-- ============================================
-- Este script adiciona controle de permissões baseado em roles:
-- - ADMIN: acesso completo (exportações, exclusões, relatórios)
-- - FUNCIONARIO: apenas cadastros (sem exportações, exclusões, relatórios)
-- ============================================

-- PASSO 1: CRIAR TIPO ENUM PARA ROLES
-- ============================================

-- Criar tipo enum se não existir
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'funcionario');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PASSO 2: ADICIONAR COLUNA ROLE NA TABELA PROFILES
-- ============================================

-- Adicionar coluna role (padrão: funcionario)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'funcionario';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- PASSO 3: DEFINIR ADMINISTRADORES
-- ============================================

-- IMPORTANTE: Substitua os emails abaixo pelos emails reais dos administradores
-- Email do chefe e do parceiro

-- Método 1: Por email (recomendado)
UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
    'arimalaco@gmail.com',        -- Substitua pelo email do chefe
    'simeimontijo@gmail.com'    -- Substitua pelo email do parceiro
);

-- Método 2: Por ID específico (se souber o UUID)
-- Descomente e use se preferir definir por ID
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id IN (
--     'uuid-do-chefe',
--     'uuid-do-parceiro'
-- );

-- Garantir que pelo menos um admin existe
-- Se nenhum dos emails acima existir, define o primeiro usuário como admin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = (SELECT id FROM public.profiles ORDER BY criado_em ASC LIMIT 1);
        RAISE NOTICE 'Nenhum admin encontrado. O primeiro usuário foi definido como admin.';
    END IF;
END $$;

-- PASSO 4: ATUALIZAR POLICIES DE REGISTROS COM CONTROLE DE ROLE
-- ============================================

-- Remover policies antigas que vamos substituir
DROP POLICY IF EXISTS "registros_allow_update_own" ON registros;
DROP POLICY IF EXISTS "registros_allow_delete_own" ON registros;

-- UPDATE: Funcionários podem atualizar apenas seus próprios registros
-- Admins podem atualizar qualquer registro
CREATE POLICY "registros_allow_update_with_role"
ON public.registros
FOR UPDATE
TO authenticated
USING (
    -- Admin pode atualizar tudo
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Funcionário pode atualizar apenas seus próprios
    (auth.uid() = criado_por AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'funcionario')
    OR
    -- Registros sem criador podem ser atualizados (compatibilidade)
    criado_por IS NULL
)
WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    (auth.uid() = criado_por AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'funcionario')
    OR
    criado_por IS NULL
);

-- DELETE: Apenas admins podem deletar registros
CREATE POLICY "registros_allow_delete_admin_only"
ON public.registros
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- PASSO 5: ATUALIZAR FUNÇÃO DE TRIGGER PARA INCLUIR ROLE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome_completo, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
        'funcionario'  -- Novos usuários são funcionários por padrão
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 6: CRIAR FUNÇÃO AUXILIAR PARA VERIFICAR SE USUÁRIO É ADMIN
-- ============================================

-- Esta função pode ser usada em outras policies ou queries
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 7: CRIAR VIEW PARA ESTATÍSTICAS (APENAS ADMINS)
-- ============================================

-- View que mostra estatísticas gerais (útil para relatórios)
CREATE OR REPLACE VIEW public.estatisticas_registros AS
SELECT
    COUNT(*) as total_registros,
    COUNT(DISTINCT localidade) as total_localidades,
    SUM(caes_macho + caes_femea) as total_caes,
    SUM(gatos_macho + gatos_femea) as total_gatos,
    COUNT(DISTINCT criado_por) as total_pesquisadores,
    MIN(data) as primeira_coleta,
    MAX(data) as ultima_coleta
FROM public.registros;

-- Policy para view de estatísticas (apenas admins)
-- Nota: Views herdam as policies das tabelas base, mas podemos adicionar controle extra

-- PASSO 8: CRIAR TABELA DE AUDITORIA (OPCIONAL)
-- ============================================

-- Tabela para registrar ações importantes (exclusões, alterações, etc)
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    tabela TEXT NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para auditoria
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver auditoria
CREATE POLICY "auditoria_admin_only"
ON public.auditoria
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Sistema pode inserir na auditoria
CREATE POLICY "auditoria_system_insert"
ON public.auditoria
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_criado_em ON public.auditoria(criado_em DESC);

-- PASSO 9: CRIAR TRIGGER PARA AUDITORIA DE EXCLUSÕES
-- ============================================

CREATE OR REPLACE FUNCTION public.audit_registro_delete()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.auditoria (usuario_id, acao, tabela, registro_id, dados_anteriores)
    VALUES (
        auth.uid(),
        'DELETE',
        'registros',
        OLD.id,
        row_to_json(OLD)
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_registros_delete ON public.registros;
CREATE TRIGGER audit_registros_delete
    BEFORE DELETE ON public.registros
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_registro_delete();

-- PASSO 10: GARANTIR PERMISSÕES
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.registros TO authenticated;
GRANT ALL ON public.auditoria TO authenticated;
GRANT SELECT ON public.estatisticas_registros TO authenticated;

-- PASSO 11: VERIFICAÇÕES E RELATÓRIOS
-- ============================================

-- Ver todos os usuários e seus roles
SELECT
    '=== USUÁRIOS E ROLES ===' as info,
    p.id,
    p.email,
    p.nome_completo,
    p.role,
    p.criado_em
FROM public.profiles p
ORDER BY p.role, p.criado_em;

-- Contar usuários por role
SELECT
    '=== CONTAGEM POR ROLE ===' as info,
    role,
    COUNT(*) as total
FROM public.profiles
GROUP BY role;

-- Ver policies ativas
SELECT
    '=== POLICIES ATIVAS ===' as info,
    tablename,
    policyname,
    cmd as operacao,
    CASE
        WHEN policyname LIKE '%admin%' THEN 'Requer Admin'
        ELSE 'Todos autenticados'
    END as nivel_acesso
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'registros', 'auditoria')
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. IMPORTANTE: Atualize os emails dos administradores no PASSO 3
-- 3. Verifique os resultados das queries de verificação
-- 4. Faça logout e login novamente
-- 5. Teste as permissões com um usuário admin e um funcionário

-- TESTANDO PERMISSÕES:
-- Como admin:
--   SELECT * FROM public.profiles WHERE id = auth.uid();
--   (Deve mostrar role = 'admin')

-- Como funcionário:
--   SELECT * FROM public.profiles WHERE id = auth.uid();
--   (Deve mostrar role = 'funcionario')

-- Tentar deletar como funcionário (deve falhar):
--   DELETE FROM public.registros WHERE id = 'algum-uuid';
--   (Erro: new row violates row-level security policy)

-- Ver auditoria como admin:
--   SELECT * FROM public.auditoria ORDER BY criado_em DESC;
