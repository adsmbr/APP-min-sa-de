# 🚀 Guia Completo de Configuração do Supabase

## Sistema de Registro - Nova Iguaçu com Multi-Usuário

---

## 📋 Índice

1. [O que é Supabase?](#o-que-é-supabase)
2. [Por que usar Supabase?](#por-que-usar-supabase)
3. [Criar Conta e Projeto](#passo-1-criar-conta-e-projeto)
4. [Configurar Banco de Dados](#passo-2-configurar-banco-de-dados)
5. [Obter Credenciais](#passo-3-obter-credenciais)
6. [Configurar no Projeto](#passo-4-configurar-no-projeto)
7. [Testar Autenticação](#passo-5-testar-autenticação)
8. [Configurações Avançadas](#configurações-avançadas)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é Supabase?

Supabase é uma plataforma **Backend-as-a-Service** (BaaS) que fornece:

- 🗄️ **Banco de Dados PostgreSQL** (na nuvem)
- 🔐 **Sistema de Autenticação** (login/registro)
- 📡 **API REST automática** (sem escrever código backend)
- ⚡ **Realtime** (mudanças em tempo real)
- 💾 **Storage** (armazenamento de arquivos)
- 🆓 **Plano Gratuito** (perfeito para começar)

### Como funciona no seu sistema:

```
┌─────────────────────────────────────────┐
│  Navegador do Usuário                   │
│  ┌───────────────────────────────┐      │
│  │  Aplicação React              │      │
│  │  (Frontend)                   │      │
│  └─────────────┬─────────────────┘      │
└────────────────┼────────────────────────┘
                 │
                 ↓ (Chamadas API via JavaScript)
┌─────────────────────────────────────────┐
│  SUPABASE (Nuvem)                       │
│  ┌───────────────────────────────┐      │
│  │  Autenticação                 │      │
│  │  - Login/Logout               │      │
│  │  - Registro                   │      │
│  │  - Recuperação de senha       │      │
│  └───────────────────────────────┘      │
│  ┌───────────────────────────────┐      │
│  │  Banco PostgreSQL             │      │
│  │  - Tabela: profiles           │      │
│  │  - Tabela: registros          │      │
│  │  - Políticas de segurança     │      │
│  └───────────────────────────────┘      │
└─────────────────────────────────────────┘

Todos os usuários compartilham os mesmos dados!
```

---

## ✨ Por que usar Supabase?

| Antes (LocalStorage) | Depois (Supabase) |
|---------------------|-------------------|
| ❌ Dados isolados por usuário | ✅ Dados compartilhados |
| ❌ Sem autenticação | ✅ Login/Registro completo |
| ❌ Sem backup automático | ✅ Backup na nuvem |
| ❌ Sem sincronização | ✅ Tempo real |
| ❌ Limite de 5-10MB | ✅ Gigabytes disponíveis |
| ❌ Só funciona no navegador | ✅ API para mobile/desktop |

---

## 🚀 PASSO 1: Criar Conta e Projeto

### 1.1 Acessar Supabase

1. Abra o navegador
2. Acesse: **https://supabase.com**
3. Clique em **"Start your project"** (verde, canto superior direito)

### 1.2 Fazer Login

Você pode fazer login com:
- **GitHub** (recomendado - mais rápido)
- **Email** (se preferir)

**Escolha GitHub:**
1. Clique em **"Sign in with GitHub"**
2. Autorize o Supabase no GitHub
3. Pronto! Você está logado

### 1.3 Criar Novo Projeto

1. Você verá o dashboard do Supabase
2. Clique em **"New Project"** (botão verde)
3. Preencha as informações:

```
┌────────────────────────────────────────┐
│  Create a new project                  │
├────────────────────────────────────────┤
│  Organization: (selecione/crie uma)    │
│  Name: sistema-nova-iguacu            │
│  Database Password: ●●●●●●●●●●        │
│    (Anote esta senha!)                 │
│  Region: South America (São Paulo)     │
│  Pricing Plan: Free                    │
└────────────────────────────────────────┘
```

**⚠️ MUITO IMPORTANTE:**
- **Database Password**: Escolha uma senha forte e **ANOTE EM LOCAL SEGURO**
- Você precisará desta senha para acessar o banco diretamente
- Não confunda com a senha da sua conta Supabase!

4. Clique em **"Create new project"**
5. Aguarde ~2 minutos (o Supabase está criando seu banco de dados)

### 1.4 Projeto Criado!

Quando terminar, você verá o dashboard do projeto com:
- 📊 Statistics
- 🗄️ Database
- 🔐 Authentication
- 📡 API

---

## 🗄️ PASSO 2: Configurar Banco de Dados

Agora vamos criar as tabelas para armazenar os dados!

### 2.1 Abrir SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Você verá um editor de código SQL

### 2.2 Executar Script SQL

Copie e cole este script completo no editor:

```sql
-- ============================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS
-- Sistema de Registro - Nova Iguaçu/RJ
-- ============================================

-- 1. HABILITAR EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAR TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nome_completo TEXT NOT NULL,
  role TEXT DEFAULT 'pesquisador' CHECK (role IN ('admin', 'coordenador', 'pesquisador')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE REGISTROS
CREATE TABLE IF NOT EXISTS registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados do registro
  urb TEXT NOT NULL,
  localidade TEXT NOT NULL,
  endereco TEXT NOT NULL,
  caes_macho INTEGER DEFAULT 0 CHECK (caes_macho >= 0),
  caes_femea INTEGER DEFAULT 0 CHECK (caes_femea >= 0),
  gatos_macho INTEGER DEFAULT 0 CHECK (gatos_macho >= 0),
  gatos_femea INTEGER DEFAULT 0 CHECK (gatos_femea >= 0),
  data DATE NOT NULL,
  tutor TEXT NOT NULL,
  telefone TEXT NOT NULL,
  
  -- Coordenadas GPS (opcional)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Auditoria
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT total_animais_check CHECK (
    (caes_macho + caes_femea + gatos_macho + gatos_femea) > 0
  )
);

-- 4. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_registros_localidade ON registros(localidade);
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros(data);
CREATE INDEX IF NOT EXISTS idx_registros_criado_por ON registros(criado_por);
CREATE INDEX IF NOT EXISTS idx_registros_criado_em ON registros(criado_em);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA PARA PROFILES

-- Qualquer usuário autenticado pode ver todos os perfis
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 7. POLÍTICAS DE SEGURANÇA PARA REGISTROS

-- Qualquer usuário autenticado pode ver todos os registros
CREATE POLICY "Usuários autenticados podem ver registros"
  ON registros FOR SELECT
  USING (auth.role() = 'authenticated');

-- Qualquer usuário autenticado pode inserir registros
CREATE POLICY "Usuários autenticados podem inserir registros"
  ON registros FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem editar apenas registros criados por eles
CREATE POLICY "Usuários podem editar próprios registros"
  ON registros FOR UPDATE
  USING (auth.uid() = criado_por);

-- Apenas admins e coordenadores podem deletar registros
CREATE POLICY "Admins e coordenadores podem deletar registros"
  ON registros FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'coordenador')
    )
  );

-- 8. FUNÇÃO PARA ATUALIZAR TIMESTAMP AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGERS PARA ATUALIZAR TIMESTAMPS
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at
  BEFORE UPDATE ON registros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE APÓS CADASTRO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 12. INSERIR DADOS DE EXEMPLO (OPCIONAL)
INSERT INTO registros (
  urb, localidade, endereco, 
  caes_macho, caes_femea, gatos_macho, gatos_femea,
  data, tutor, telefone,
  latitude, longitude
) VALUES
  ('URB-001', 'Centro', 'Rua da Conceição, 123', 2, 1, 0, 1, '2024-01-15', 'Maria Silva Santos', '(21) 98765-4321', -22.7545, -43.4510),
  ('URB-002', 'Comércio', 'Av. Nilo Peçanha, 456', 1, 2, 1, 0, '2024-01-16', 'João Pedro Oliveira', '(21) 97654-3210', -22.7560, -43.4520),
  ('URB-003', 'Posse', 'Rua Irmã Beata, 789', 3, 2, 2, 3, '2024-01-17', 'Ana Paula Costa', '(21) 96543-2109', -22.7575, -43.4530)
ON CONFLICT DO NOTHING;

-- ============================================
-- CONFIGURAÇÃO CONCLUÍDA!
-- ============================================
```

### 2.3 Executar o Script

1. Com o script colado no editor
2. Clique em **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde alguns segundos
4. Você verá "Success. No rows returned" (está correto!)

### 2.4 Verificar Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver duas tabelas:
   - ✅ **profiles** (perfis de usuários)
   - ✅ **registros** (dados dos animais)

---

## 🔑 PASSO 3: Obter Credenciais

Agora vamos pegar as informações para conectar o projeto ao Supabase.

### 3.1 Acessar Configurações da API

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**

### 3.2 Copiar Credenciais

Você verá uma tela com várias informações. Copie estas duas:

```
┌────────────────────────────────────────┐
│  Project URL                           │
│  https://xxxxxxxxxxx.supabase.co      │
│  [Copy] ← clique aqui                 │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  Project API keys                      │
│                                        │
│  anon / public                         │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp... │
│  [Copy] ← clique aqui                 │
└────────────────────────────────────────┘
```

**Copie:**
1. **Project URL** → Cola em um arquivo de texto temporário
2. **anon public key** → Cola no mesmo arquivo

**⚠️ IMPORTANTE:**
- **NÃO copie** a "service_role" key (é secreta!)
- Use apenas a **"anon / public"** key

---

## ⚙️ PASSO 4: Configurar no Projeto

Agora vamos conectar sua aplicação ao Supabase!

### 4.1 Instalar Supabase

Abra o terminal na pasta do projeto:

```bash
cd "C:\Users\aliss\OneDrive\Área de Trabalho\Zed\APP min saúde"
npm install @supabase/supabase-js
```

### 4.2 Criar Arquivo .env

1. Na raiz do projeto, copie o arquivo `.env.example`:

**Windows (PowerShell):**
```bash
Copy-Item .env.example .env
```

**Linux/Mac:**
```bash
cp .env.example .env
```

2. Abra o arquivo `.env` no editor de código

3. Substitua os valores pelas suas credenciais:

```env
# Cole seu Project URL aqui
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co

# Cole sua anon/public key aqui
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Outras configurações
VITE_APP_NAME=Sistema de Registro - Nova Iguaçu
VITE_APP_ENV=development
```

### 4.3 Salvar e Reiniciar

1. Salve o arquivo `.env`
2. **Pare o servidor** (Ctrl+C no terminal)
3. **Inicie novamente**: `npm run dev`

---

## ✅ PASSO 5: Testar Autenticação

### 5.1 Configurar Email no Supabase

Por padrão, o Supabase requer confirmação de email. Para testes, vamos desabilitar:

1. No Supabase, vá em **"Authentication"** → **"Providers"**
2. Encontre **"Email"**
3. Desmarque **"Confirm email"**
4. Clique em **"Save"**

### 5.2 Criar Primeiro Usuário

1. Abra sua aplicação: `http://localhost:3000`
2. Você verá a tela de login
3. Clique em **"Criar Conta"**
4. Preencha:
   - **Nome**: Admin Sistema
   - **Email**: admin@novaiguacu.com
   - **Senha**: admin123
   - **Confirmar Senha**: admin123
5. Clique em **"Criar Conta"**
6. Você será logado automaticamente!

### 5.3 Verificar no Supabase

1. Volte ao Supabase Dashboard
2. Vá em **"Authentication"** → **"Users"**
3. Você deve ver seu usuário criado! ✅

### 5.4 Verificar Perfil

1. Vá em **"Table Editor"** → **"profiles"**
2. Você deve ver um registro com seu email ✅

---

## 🎛️ Configurações Avançadas

### Desabilitar Confirmação de Email (Desenvolvimento)

Já fizemos no Passo 5.1, mas para referência:

```
Authentication → Providers → Email
- ☐ Confirm email (desmarcar para desenvolvimento)
- ☐ Secure email change (desmarcar para desenvolvimento)
```

### Configurar Email de Produção

Para produção, você precisará configurar um provedor de email:

1. **Authentication** → **Settings**
2. **SMTP Settings**
3. Configure com:
   - Gmail
   - SendGrid
   - Mailgun
   - Ou outro provedor

### Adicionar URLs Permitidas

Se você fizer deploy, adicione a URL:

1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://seu-dominio.com`
3. **Redirect URLs**: Adicione URLs permitidas

### Criar Primeiro Admin Manualmente

1. Vá em **Table Editor** → **profiles**
2. Encontre seu usuário
3. Clique para editar
4. Mude **role** de `pesquisador` para `admin`
5. Salve

---

## 🔍 Visualizar Dados

### No Supabase Dashboard

**Ver Registros:**
1. **Table Editor** → **registros**
2. Você verá todos os registros em formato de tabela

**Ver Usuários:**
1. **Authentication** → **Users**
2. Lista de todos os usuários cadastrados

**Executar Queries:**
1. **SQL Editor** → **New Query**
2. Exemplo: `SELECT * FROM registros WHERE localidade = 'Centro'`

---

## 🐛 Troubleshooting

### Erro: "Invalid API key"

**Problema:** Credenciais incorretas

**Solução:**
1. Verifique se copiou a chave **anon/public** (não a service_role)
2. Verifique se não há espaços extras no `.env`
3. Reinicie o servidor após editar `.env`

### Erro: "relation 'profiles' does not exist"

**Problema:** Tabelas não foram criadas

**Solução:**
1. Volte ao **SQL Editor**
2. Execute o script SQL novamente
3. Verifique se as tabelas aparecem em **Table Editor**

### Erro: "Email not confirmed"

**Problema:** Confirmação de email está ativada

**Solução:**
1. **Authentication** → **Providers** → **Email**
2. Desmarque **"Confirm email"**
3. Tente cadastrar novamente

### Usuário não consegue criar registros

**Problema:** Políticas RLS muito restritivas

**Solução:**
1. **SQL Editor** → Nova query:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'registros';

-- Se necessário, recriar política de INSERT
DROP POLICY IF EXISTS "Usuários autenticados podem inserir registros" ON registros;
CREATE POLICY "Usuários autenticados podem inserir registros"
  ON registros FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### Dados não aparecem em tempo real

**Problema:** Realtime não habilitado

**Solução:**
1. **Database** → **Replication**
2. Encontre a tabela **registros**
3. Habilite a replicação

---

## 📊 Queries Úteis

### Ver todos os registros com nome do criador

```sql
SELECT 
  r.*,
  p.nome_completo as criador_nome,
  p.email as criador_email
FROM registros r
LEFT JOIN profiles p ON r.criado_por = p.id
ORDER BY r.criado_em DESC;
```

### Estatísticas por localidade

```sql
SELECT 
  localidade,
  COUNT(*) as total_registros,
  SUM(caes_macho + caes_femea) as total_caes,
  SUM(gatos_macho + gatos_femea) as total_gatos
FROM registros
GROUP BY localidade
ORDER BY total_registros DESC;
```

### Usuários mais ativos

```sql
SELECT 
  p.nome_completo,
  p.email,
  COUNT(r.id) as total_registros
FROM profiles p
LEFT JOIN registros r ON r.criado_por = p.id
GROUP BY p.id, p.nome_completo, p.email
ORDER BY total_registros DESC;
```

---

## 🎯 Próximos Passos

Agora que o Supabase está configurado:

1. ✅ Crie vários usuários de teste
2. ✅ Teste criar, editar e excluir registros
3. ✅ Verifique se os dados aparecem para todos os usuários
4. ✅ Teste em dispositivos diferentes
5. ✅ Configure emails para produção
6. ✅ Faça deploy da aplicação

---

## 📞 Suporte

**Documentação Oficial:**
- https://supabase.com/docs

**Comunidade:**
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

**Dúvidas sobre este projeto:**
- Consulte os outros arquivos .md na raiz do projeto

---

## 🎉 Parabéns!

Seu sistema agora está com:
- ✅ Banco de dados na nuvem
- ✅ Sistema de login completo
- ✅ Dados compartilhados entre usuários
- ✅ Backup automático
- ✅ Tempo real (opcional)
- ✅ API REST automática

**O sistema está pronto para uso em produção!** 🚀

---

<div align="center">

**🐕🐈 Sistema de Registro - Nova Iguaçu/RJ**

*Powered by Supabase*

</div>