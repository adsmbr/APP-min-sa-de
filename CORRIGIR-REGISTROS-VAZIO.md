# 🔧 Corrigir Problema: Registros Não Aparecem na Interface

## ⚠️ Problema

- ✅ Registros são salvos no Supabase
- ❌ Registros NÃO aparecem na página "Registros" ou "Dashboard"
- ❌ A lista fica vazia mesmo depois de salvar

**Causa:** As **policies de RLS** (Row Level Security) estão bloqueando a visualização dos registros.

---

## 🚀 Solução Rápida

### **Passo 1: Acessar o Supabase**

1. Acesse: https://supabase.com/dashboard
2. Entre no projeto: **wypnotezypjdjjznkcyd**
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**

### **Passo 2: Executar o Script**

Copie e cole este script completo:

```sql
-- Remover policies antigas
DROP POLICY IF EXISTS "Ver registros" ON registros;
DROP POLICY IF EXISTS "Criar registro" ON registros;
DROP POLICY IF EXISTS "Atualizar registro" ON registros;
DROP POLICY IF EXISTS "Deletar registro" ON registros;
DROP POLICY IF EXISTS "Registros são visíveis para usuários autenticados" ON registros;
DROP POLICY IF EXISTS "Usuários autenticados podem criar registros" ON registros;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros" ON registros;

-- Garantir que RLS está ativo
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Criar policies corretas
CREATE POLICY "registros_select_all" ON registros
FOR SELECT TO authenticated USING (true);

CREATE POLICY "registros_insert_own" ON registros
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "registros_update_own" ON registros
FOR UPDATE TO authenticated
USING (auth.uid() = criado_por)
WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "registros_delete_own" ON registros
FOR DELETE TO authenticated
USING (auth.uid() = criado_por);
```

### **Passo 3: Executar**

1. Clique em **RUN** (▶️) ou pressione `Ctrl + Enter`
2. Aguarde terminar (2-3 segundos)
3. Deve aparecer: "Success. No rows returned"

### **Passo 4: Verificar**

Execute esta query para confirmar:

```sql
SELECT * FROM registros LIMIT 10;
```

**Deve mostrar os registros salvos!** ✅

---

## 🧪 Testar no Sistema

1. Acesse: https://adsmbr.github.io/APP-min-sa-de/
2. Faça login
3. Vá em **"Registros"** ou **"Dashboard"**
4. Os registros devem aparecer agora! 🎉

---

## 🔍 Alternativa: Desabilitar RLS (Apenas para Testes)

Se você quiser testar rapidamente SEM segurança (não recomendado para produção):

```sql
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
```

Isso fará com que todos os registros apareçam sem restrições.

**⚠️ ATENÇÃO:** Isso remove toda a segurança! Use apenas para testes.

Para reativar depois:

```sql
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Checklist

Depois de executar o script:

- [ ] Script executado sem erros
- [ ] Query `SELECT * FROM registros` mostra dados
- [ ] Acessou o sistema e fez login
- [ ] Página "Registros" mostra a lista
- [ ] Dashboard mostra estatísticas
- [ ] Consegue criar novos registros

---

## 🆘 Se Ainda Não Funcionar

### **1. Verificar no Console do Navegador**

1. Pressione **F12**
2. Vá na aba **Console**
3. Recarregue a página (`F5`)
4. Procure por erros em vermelho

### **2. Testar Manualmente no Supabase**

Execute no SQL Editor:

```sql
-- Ver quantos registros existem
SELECT COUNT(*) FROM registros;

-- Ver as policies ativas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'registros';

-- Testar como usuário autenticado
SELECT * FROM registros WHERE criado_por = auth.uid();
```

### **3. Verificar se o usuário está autenticado**

No Console do navegador, digite:

```javascript
console.log(await supabase.auth.getUser());
```

Deve mostrar seus dados de usuário.

---

## 📞 Próximos Passos

1. Execute o script de correção de policies
2. Teste o sistema
3. Se os registros aparecerem: ✅ Problema resolvido!
4. Se ainda não aparecer: Me envie os logs do Console (F12)

---

**Última atualização:** Script de correção de policies criado para resolver visualização de registros.