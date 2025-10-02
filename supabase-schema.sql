-- ============================================
-- SCHEMA DO BANCO DE DADOS
-- Sistema de Registro - Ministério da Saúde
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para suporte a coordenadas geográficas

-- ============================================
-- TABELA: profiles
-- Armazena informações adicionais dos usuários
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    cargo TEXT,
    avatar_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- TABELA: registros
-- Armazena os registros de distribuição espacial de animais
-- ============================================

CREATE TABLE IF NOT EXISTS public.registros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    urb TEXT NOT NULL,
    localidade TEXT NOT NULL,
    endereco TEXT NOT NULL,
    caes_macho INTEGER DEFAULT 0 CHECK (caes_macho >= 0),
    caes_femea INTEGER DEFAULT 0 CHECK (caes_femea >= 0),
    gatos_macho INTEGER DEFAULT 0 CHECK (gatos_macho >= 0),
    gatos_femea INTEGER DEFAULT 0 CHECK (gatos_femea >= 0),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    tutor TEXT,
    telefone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para registros
CREATE INDEX IF NOT EXISTS idx_registros_localidade ON public.registros(localidade);
CREATE INDEX IF NOT EXISTS idx_registros_data ON public.registros(data);
CREATE INDEX IF NOT EXISTS idx_registros_endereco ON public.registros(endereco);
CREATE INDEX IF NOT EXISTS idx_registros_criado_por ON public.registros(criado_por);
CREATE INDEX IF NOT EXISTS idx_registros_criado_em ON public.registros(criado_em DESC);

-- Índice geoespacial (se PostGIS estiver habilitado)
CREATE INDEX IF NOT EXISTS idx_registros_location ON public.registros
    USING GIST(ST_MakePoint(longitude, latitude));

-- ============================================
-- TRIGGER: Atualizar timestamp automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em profiles
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Aplicar trigger em registros
DROP TRIGGER IF EXISTS set_updated_at_registros ON public.registros;
CREATE TRIGGER set_updated_at_registros
    BEFORE UPDATE ON public.registros
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TRIGGER: Criar profile automaticamente ao registrar usuário
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome_completo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================

-- Usuários podem ver todos os perfis
DROP POLICY IF EXISTS "Profiles são visíveis para usuários autenticados" ON public.profiles;
CREATE POLICY "Profiles são visíveis para usuários autenticados"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Permitir inserção de perfil (para o trigger)
DROP POLICY IF EXISTS "Permitir criação de perfil via trigger" ON public.profiles;
CREATE POLICY "Permitir criação de perfil via trigger"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- POLICIES: registros
-- ============================================

-- Usuários autenticados podem ver todos os registros
DROP POLICY IF EXISTS "Registros são visíveis para usuários autenticados" ON public.registros;
CREATE POLICY "Registros são visíveis para usuários autenticados"
    ON public.registros
    FOR SELECT
    TO authenticated
    USING (true);

-- Usuários autenticados podem inserir registros
DROP POLICY IF EXISTS "Usuários autenticados podem criar registros" ON public.registros;
CREATE POLICY "Usuários autenticados podem criar registros"
    ON public.registros
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = criado_por);

-- Usuários podem atualizar registros que criaram
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros" ON public.registros;
CREATE POLICY "Usuários podem atualizar seus próprios registros"
    ON public.registros
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = criado_por)
    WITH CHECK (auth.uid() = criado_por);

-- Usuários podem deletar registros que criaram
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON public.registros;
CREATE POLICY "Usuários podem deletar seus próprios registros"
    ON public.registros
    FOR DELETE
    TO authenticated
    USING (auth.uid() = criado_por);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para buscar estatísticas
CREATE OR REPLACE FUNCTION public.get_estatisticas()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_registros', COUNT(*),
        'total_caes_macho', COALESCE(SUM(caes_macho), 0),
        'total_caes_femea', COALESCE(SUM(caes_femea), 0),
        'total_gatos_macho', COALESCE(SUM(gatos_macho), 0),
        'total_gatos_femea', COALESCE(SUM(gatos_femea), 0),
        'total_caes', COALESCE(SUM(caes_macho + caes_femea), 0),
        'total_gatos', COALESCE(SUM(gatos_macho + gatos_femea), 0),
        'localidades_unicas', COUNT(DISTINCT localidade)
    )
    INTO stats
    FROM public.registros;

    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Você pode adicionar dados iniciais aqui se necessário
-- Por exemplo, localidades padrão, etc.

-- ============================================
-- GRANTS (Permissões)
-- ============================================

-- Garantir permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Para verificar se tudo foi criado corretamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
