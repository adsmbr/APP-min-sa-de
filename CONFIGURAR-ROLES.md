# 🔐 Guia de Configuração de Roles e Permissões

## Visão Geral

O sistema agora possui **controle de permissões baseado em roles** (funções):

### 👤 Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|------------|
| **admin** | Administrador | ✅ Acesso completo: cadastros, exclusões, exportações, relatórios, análises |
| **funcionario** | Funcionário | ✅ Apenas cadastros e visualização (sem exclusões, exportações ou análises) |

---

## 📋 Passo 1: Executar Script SQL

### 1.1. Acessar o Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 1.2. Executar o Script

1. Abra o arquivo `adicionar-roles.sql` no seu editor
2. **IMPORTANTE:** Antes de executar, localize o **PASSO 3** no script:

```sql
-- PASSO 3: DEFINIR ADMINISTRADORES
UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
    'seuemail@exemplo.com',        -- Substitua pelo email do chefe
    'emailparceiro@exemplo.com'    -- Substitua pelo email do parceiro
);
```

3. **Substitua** os emails de exemplo pelos emails reais dos administradores
4. Copie TODO o conteúdo do arquivo `adicionar-roles.sql`
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)

### 1.3. Verificar Execução

Após executar, você verá várias mensagens no console, incluindo:

- ✅ Lista de usuários e seus roles
- ✅ Contagem de admins e funcionários
- ✅ Policies ativas

**Exemplo de saída esperada:**

```
=== USUÁRIOS E ROLES ===
id                                   | email                  | role
-------------------------------------|------------------------|------------
abc123...                            | chefe@empresa.com      | admin
def456...                            | parceiro@empresa.com   | admin
ghi789...                            | funcionario@empresa.com| funcionario

=== CONTAGEM POR ROLE ===
role        | total
------------|------
admin       | 2
funcionario | 3
```

---

## 📧 Passo 2: Identificar Emails dos Administradores

### Opção A: Verificar Usuários Existentes

Execute esta query no SQL Editor:

```sql
SELECT id, email, nome_completo, role, criado_em
FROM public.profiles
ORDER BY criado_em ASC;
```

### Opção B: Listar Usuários do Auth

```sql
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at ASC;
```

### Definir Admins Manualmente

Se precisar ajustar após executar o script:

```sql
-- Por email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email-do-chefe@empresa.com';

-- Ou por ID (se souber o UUID)
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'uuid-do-usuario';
```

---

## 🧪 Passo 3: Testar Permissões

### 3.1. Testar como Admin

1. Faça login com uma conta de administrador
2. Verifique se aparecem:
   - ✅ Badge "Administrador" com ícone de escudo no header
   - ✅ Aba "Análises" no menu
   - ✅ Botões de **Duplicar** e **Excluir** na tabela de registros
   - ✅ Seção de **Exportar Dados** na página de Análises

### 3.2. Testar como Funcionário

1. Faça login com uma conta de funcionário
2. Verifique se:
   - ✅ Badge "Funcionário" aparece no header (sem ícone de escudo)
   - ❌ Aba "Análises" **NÃO** aparece no menu
   - ❌ Botões de **Duplicar** e **Excluir** **NÃO** aparecem na tabela
   - ✅ Botão "Editar" ainda aparece (para editar próprios registros)
   - ✅ Pode criar novos registros normalmente

### 3.3. Verificar Role no Console

Abra o console do navegador (F12) e execute:

```javascript
// Deve mostrar o role do usuário atual
console.log(window.location.href);
```

Ou verifique o badge no canto superior direito do sistema.

---

## 🔍 Passo 4: Verificações SQL

### Ver Policies Ativas

```sql
SELECT 
    tablename,
    policyname,
    cmd as operacao,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'registros', 'auditoria')
ORDER BY tablename, policyname;
```

### Ver Role de um Usuário Específico

```sql
SELECT 
    p.email,
    p.nome_completo,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN 'Acesso Completo'
        WHEN p.role = 'funcionario' THEN 'Apenas Cadastros'
        ELSE 'Role Desconhecido'
    END as nivel_acesso
FROM public.profiles p
WHERE p.email = 'email@exemplo.com';
```

### Verificar Últimas Exclusões (Auditoria)

```sql
SELECT 
    a.criado_em,
    p.email as usuario,
    p.role,
    a.acao,
    a.dados_anteriores->>'localidade' as localidade,
    a.dados_anteriores->>'endereco' as endereco
FROM public.auditoria a
LEFT JOIN public.profiles p ON a.usuario_id = p.id
WHERE a.acao = 'DELETE'
ORDER BY a.criado_em DESC
LIMIT 10;
```

---

## 🛠️ Resolução de Problemas

### Problema 1: Funcionário consegue excluir registros

**Causa:** Policies não foram aplicadas corretamente.

**Solução:**
```sql
-- Recriar a policy de exclusão
DROP POLICY IF EXISTS "registros_allow_delete_admin_only" ON registros;

CREATE POLICY "registros_allow_delete_admin_only"
ON public.registros
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
```

### Problema 2: Badge de role não aparece

**Causa:** Perfil não foi carregado ou não tem o campo `role`.

**Solução:**
```sql
-- Verificar se o campo existe
SELECT id, email, role FROM public.profiles LIMIT 5;

-- Se role está NULL, atualizar
UPDATE public.profiles
SET role = 'funcionario'
WHERE role IS NULL;
```

### Problema 3: Admin não consegue acessar Análises

**Causa:** Cache do navegador ou role não atualizado.

**Solução:**
1. Faça **logout** do sistema
2. Limpe o cache do navegador (Ctrl+Shift+Del)
3. Faça **login** novamente
4. Verifique no SQL se o role está correto:
   ```sql
   SELECT email, role FROM public.profiles WHERE email = 'seu@email.com';
   ```

### Problema 4: Erro "row violates row-level security policy"

**Causa:** Policies muito restritivas.

**Solução:**
```sql
-- Verificar qual policy está bloqueando
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'registros';

-- Reconstruir policies executando novamente o PASSO 4 do script
```

---

## 🔄 Alterar Role de um Usuário

### Promover Funcionário para Admin

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email@funcionario.com';
```

### Rebaixar Admin para Funcionário

```sql
UPDATE public.profiles
SET role = 'funcionario'
WHERE email = 'email@admin.com';
```

**⚠️ IMPORTANTE:** Após alterar um role:
1. O usuário deve fazer **logout**
2. Limpar cache do navegador
3. Fazer **login** novamente

---

## 📊 Monitoramento

### Criar uma View para Fácil Monitoramento

```sql
CREATE OR REPLACE VIEW public.monitoramento_usuarios AS
SELECT 
    p.id,
    p.email,
    p.nome_completo,
    p.role,
    p.criado_em as cadastrado_em,
    COUNT(r.id) as total_registros,
    MAX(r.criado_em) as ultimo_registro
FROM public.profiles p
LEFT JOIN public.registros r ON r.criado_por = p.id
GROUP BY p.id, p.email, p.nome_completo, p.role, p.criado_em
ORDER BY p.role, p.email;

-- Usar a view
SELECT * FROM public.monitoramento_usuarios;
```

---

## ✅ Checklist Final

Antes de considerar a configuração completa, verifique:

- [ ] Script SQL executado sem erros
- [ ] Emails dos administradores configurados corretamente
- [ ] Pelo menos 2 usuários com role 'admin'
- [ ] Admin consegue ver aba "Análises"
- [ ] Admin consegue excluir registros
- [ ] Admin consegue exportar dados
- [ ] Funcionário NÃO vê aba "Análises"
- [ ] Funcionário NÃO consegue excluir registros
- [ ] Funcionário NÃO vê botões de exportação
- [ ] Funcionário consegue criar e editar próprios registros
- [ ] Badge de role aparece corretamente no header
- [ ] Testado com logout/login em ambos os roles

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros JavaScript
2. Verifique os logs do Supabase (Dashboard > Logs)
3. Execute as queries de verificação deste guia
4. Se persistir, execute novamente o script `adicionar-roles.sql`

---

## 🎯 Próximos Passos (Opcional)

Caso queira expandir o sistema:

- [ ] Adicionar mais roles (coordenador, supervisor, etc.)
- [ ] Criar interface de gerenciamento de usuários
- [ ] Implementar notificações de ações importantes
- [ ] Configurar alertas para tentativas de acesso não autorizado
- [ ] Exportar logs de auditoria mensalmente

---

**Última atualização:** 2024
**Versão do sistema:** 1.0.0 com roles