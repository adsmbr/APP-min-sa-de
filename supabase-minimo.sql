-- Tabela de perfis
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de registros
CREATE TABLE IF NOT EXISTS registros (
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

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Ver perfis" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserir perfil" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Atualizar perfil" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies para registros
CREATE POLICY "Ver registros" ON registros FOR SELECT TO authenticated USING (true);
CREATE POLICY "Criar registro" ON registros FOR INSERT TO authenticated WITH CHECK (auth.uid() = criado_por);
CREATE POLICY "Atualizar registro" ON registros FOR UPDATE TO authenticated USING (auth.uid() = criado_por);
CREATE POLICY "Deletar registro" ON registros FOR DELETE TO authenticated USING (auth.uid() = criado_por);

-- Funcao criar profile automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, nome_completo)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novo usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
