-- PARTE 1: CRIAR TABELAS
-- Execute esta parte primeiro

-- Tabela de perfis de usuários
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

-- Tabela de registros de animais
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
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 2: CRIAR INDICES
-- Execute após criar as tabelas

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_registros_localidade ON public.registros(localidade);
CREATE INDEX IF NOT EXISTS idx_registros_data ON public.registros(data);
CREATE INDEX IF NOT EXISTS idx_registros_endereco ON public.registros(endereco);
CREATE INDEX IF NOT EXISTS idx_registros_criado_por ON public.registros(criado_por);

-- PARTE 3: HABILITAR RLS
-- Execute após criar índices

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- PARTE 4: CRIAR POLICIES PARA PROFILES

DROP POLICY IF EXISTS "Profiles visíveis" ON public.profiles;
CREATE POLICY "Profiles visíveis"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Atualizar próprio perfil" ON public.profiles;
CREATE POLICY "Atualizar próprio perfil"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Inserir perfil" ON public.profiles;
CREATE POLICY "Inserir perfil"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- PARTE 5: CRIAR POLICIES PARA REGISTROS

DROP POLICY IF EXISTS "Registros visíveis" ON public.registros;
CREATE POLICY "Registros visíveis"
    ON public.registros FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Criar registros" ON public.registros;
CREATE POLICY "Criar registros"
    ON public.registros FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Atualizar próprios registros" ON public.registros;
CREATE POLICY "Atualizar próprios registros"
    ON public.registros FOR UPDATE
    TO authenticated
    USING (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Deletar próprios registros" ON public.registros;
CREATE POLICY "Deletar próprios registros"
    ON public.registros FOR DELETE
    TO authenticated
    USING (auth.uid() = criado_por);

-- PARTE 6: CRIAR FUNCAO PARA ATUALIZAR TIMESTAMP

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PARTE 7: CRIAR TRIGGERS DE TIMESTAMP

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_registros ON public.registros;
CREATE TRIGGER set_updated_at_registros
    BEFORE UPDATE ON public.registros
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- PARTE 8: CRIAR FUNCAO PARA NOVO USUARIO

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

-- PARTE 9: CRIAR TRIGGER PARA NOVO USUARIO

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- FIM DO SCRIPT
-- Verifique as tabelas em Table Editor
