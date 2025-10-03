-- ============================================
-- CORRIGIR SISTEMA DE VACINAÇÃO INDIVIDUAL
-- Sistema de Registro - Ministério da Saúde
-- ============================================

-- Remover o campo vacinado genérico (se existir)
ALTER TABLE public.registros DROP COLUMN IF EXISTS vacinado;

-- Adicionar campos específicos para cada categoria de animal
-- Cada campo representa quantos animais daquela categoria estão vacinados

-- Cães Machos Vacinados
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS caes_macho_vacinados INTEGER NOT NULL DEFAULT 0;

-- Cães Fêmeas Vacinadas  
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS caes_femea_vacinadas INTEGER NOT NULL DEFAULT 0;

-- Gatos Machos Vacinados
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS gatos_macho_vacinados INTEGER NOT NULL DEFAULT 0;

-- Gatos Fêmeas Vacinadas
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS gatos_femea_vacinadas INTEGER NOT NULL DEFAULT 0;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.registros.caes_macho_vacinados IS 'Quantidade de cães machos vacinados neste registro';
COMMENT ON COLUMN public.registros.caes_femea_vacinadas IS 'Quantidade de cães fêmeas vacinadas neste registro';
COMMENT ON COLUMN public.registros.gatos_macho_vacinados IS 'Quantidade de gatos machos vacinados neste registro';
COMMENT ON COLUMN public.registros.gatos_femea_vacinadas IS 'Quantidade de gatos fêmeas vacinadas neste registro';

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_registros_caes_macho_vacinados ON public.registros(caes_macho_vacinados);
CREATE INDEX IF NOT EXISTS idx_registros_caes_femea_vacinadas ON public.registros(caes_femea_vacinadas);
CREATE INDEX IF NOT EXISTS idx_registros_gatos_macho_vacinados ON public.registros(gatos_macho_vacinados);
CREATE INDEX IF NOT EXISTS idx_registros_gatos_femea_vacinadas ON public.registros(gatos_femea_vacinadas);

-- Adicionar constraints para garantir que o número de vacinados não exceda o total
ALTER TABLE public.registros 
ADD CONSTRAINT check_caes_macho_vacinados 
CHECK (caes_macho_vacinados >= 0 AND caes_macho_vacinados <= caes_macho);

ALTER TABLE public.registros 
ADD CONSTRAINT check_caes_femea_vacinadas 
CHECK (caes_femea_vacinadas >= 0 AND caes_femea_vacinadas <= caes_femea);

ALTER TABLE public.registros 
ADD CONSTRAINT check_gatos_macho_vacinados 
CHECK (gatos_macho_vacinados >= 0 AND gatos_macho_vacinados <= gatos_macho);

ALTER TABLE public.registros 
ADD CONSTRAINT check_gatos_femea_vacinadas 
CHECK (gatos_femea_vacinadas >= 0 AND gatos_femea_vacinadas <= gatos_femea);

-- ============================================
-- ATUALIZAR POLÍTICAS RLS
-- ============================================

-- Política para SELECT (leitura)
DROP POLICY IF EXISTS "Usuários podem ver todos os registros" ON public.registros;
CREATE POLICY "Usuários podem ver todos os registros" 
ON public.registros FOR SELECT 
TO authenticated 
USING (true);

-- Política para INSERT (criação)
DROP POLICY IF EXISTS "Usuários podem criar registros" ON public.registros;
CREATE POLICY "Usuários podem criar registros" 
ON public.registros FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = criado_por);

-- Política para UPDATE (atualização)
DROP POLICY IF EXISTS "Usuários podem atualizar seus registros" ON public.registros;
CREATE POLICY "Usuários podem atualizar seus registros" 
ON public.registros FOR UPDATE 
TO authenticated 
USING (auth.uid() = criado_por)
WITH CHECK (auth.uid() = criado_por);

-- Política para DELETE (exclusão)
DROP POLICY IF EXISTS "Usuários podem excluir seus registros" ON public.registros;
CREATE POLICY "Usuários podem excluir seus registros" 
ON public.registros FOR DELETE 
TO authenticated 
USING (auth.uid() = criado_por);

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar estrutura da tabela
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'registros'
  AND column_name LIKE '%vacinado%'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'registros'
  AND constraint_name LIKE '%vacinado%';

-- ============================================
-- FIM DO SCRIPT
-- ============================================