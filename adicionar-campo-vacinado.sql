-- ============================================
-- ADICIONAR CAMPO VACINADO À TABELA REGISTROS
-- Sistema de Registro - Ministério da Saúde
-- ============================================

-- Adicionar coluna vacinado à tabela registros
-- Tipo BOOLEAN com valor padrão FALSE (não vacinado)
-- NOT NULL para garantir que sempre tenha um valor
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS vacinado BOOLEAN NOT NULL DEFAULT FALSE;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.registros.vacinado IS 'Status de vacinação dos animais registrados: TRUE = Sim, FALSE = Não';

-- Criar índice para otimizar consultas por status de vacinação
CREATE INDEX IF NOT EXISTS idx_registros_vacinado ON public.registros(vacinado);

-- Verificar se a coluna foi adicionada corretamente
-- Execute esta query para confirmar:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'registros' AND column_name = 'vacinado';

-- ============================================
-- ATUALIZAR POLÍTICAS RLS (se necessário)
-- ============================================

-- As políticas RLS existentes devem automaticamente incluir o novo campo
-- Mas vamos garantir que as políticas estejam atualizadas

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
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Atualizar alguns registros existentes para teste
-- DESCOMENTE as linhas abaixo se quiser definir alguns registros como vacinados
-- UPDATE public.registros SET vacinado = TRUE WHERE id IN (
--   SELECT id FROM public.registros ORDER BY criado_em DESC LIMIT 3
-- );

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
ORDER BY ordinal_position;

-- Verificar se há registros na tabela
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN vacinado = TRUE THEN 1 END) as vacinados,
  COUNT(CASE WHEN vacinado = FALSE THEN 1 END) as nao_vacinados
FROM public.registros;

-- ============================================
-- FIM DO SCRIPT
-- ============================================