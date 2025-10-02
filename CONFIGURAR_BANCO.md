# 🗄️ Configuração do Banco de Dados Supabase

Este guia explica como configurar o banco de dados no Supabase para o sistema funcionar corretamente.

## ⚠️ Problema Identificado

Se você está vendo o erro:
```
Erro ao salvar registro: Could not find the table 'public.registros' in the schema cache
```

É porque as tabelas do banco de dados ainda não foram criadas no Supabase.

---

## 🚀 Passos para Configurar

### **1. Acessar o Supabase**

1. Acesse: https://supabase.com/
2. Faça login na sua conta
3. Abra o projeto: **wypnotezypjdjjznkcyd**

### **2. Abrir o SQL Editor**

1. No painel lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **New Query** (Nova Consulta)

### **3. Executar o Script SQL**

1. Copie **TODO** o conteúdo do arquivo `supabase-schema.sql` (na raiz do projeto)
2. Cole no editor SQL do Supabase
3. Clique no botão **Run** (▶️ Executar) ou pressione `Ctrl + Enter`
4. Aguarde a execução completar

### **4. Verificar se as Tabelas foram Criadas**

1. No painel lateral, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ `profiles` - Perfis dos usuários
   - ✅ `registros` - Registros de animais

### **5. Verificar as Policies (Segurança)**

1. Clique em **Authentication** → **Policies**
2. Verifique se as policies estão ativas para:
   - `profiles`
   - `registros`

---

## 📋 O que o Script Cria

### **Tabelas:**

#### `profiles`
- Armazena informações dos usuários (nome, email, telefone, etc.)
- Criada automaticamente quando um usuário se registra

#### `registros`
- Armazena os registros de distribuição espacial de animais
- Campos: URB, localidade, endereço, quantidades de animais, data, etc.

### **Triggers:**
- ✅ Atualização automática de timestamps
- ✅ Criação automática de perfil ao registrar usuário

### **Políticas de Segurança (RLS):**
- ✅ Usuários autenticados podem ver todos os registros
- ✅ Usuários podem criar, editar e deletar apenas seus próprios registros
- ✅ Usuários podem ver todos os perfis mas editar apenas o próprio

### **Funções:**
- ✅ `get_estatisticas()` - Retorna estatísticas do sistema

---

## 🧪 Testar se Funcionou

### **Teste 1: Verificar Tabelas**
Execute no SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deve retornar: `profiles` e `registros`

### **Teste 2: Inserir Registro de Teste**
Execute no SQL Editor:
```sql
INSERT INTO registros (
    urb, 
    localidade, 
    endereco, 
    caes_macho, 
    caes_femea, 
    data
) VALUES (
    'URB-001', 
    'Centro', 
    'Rua Teste, 123', 
    2, 
    3, 
    CURRENT_DATE
);

SELECT * FROM registros;
```

Se aparecer o registro, está funcionando! ✅

### **Teste 3: Usar o Sistema**
1. Acesse o aplicativo
2. Faça login
3. Tente criar um novo registro
4. Deve salvar sem erros!

---

## 🔧 Problemas Comuns

### **Erro: "permission denied"**
**Solução:** As policies não foram criadas corretamente. Execute novamente a seção de POLICIES do script.

### **Erro: "relation already exists"**
**Solução:** As tabelas já existem. Você pode:
- Deletar as tabelas existentes: `DROP TABLE registros, profiles CASCADE;`
- Ou pular a criação de tabelas e executar apenas os triggers e policies

### **Erro: "function uuid_generate_v4() does not exist"**
**Solução:** Execute:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📞 Suporte

Se ainda estiver com problemas:
1. Verifique se você está logado no Supabase
2. Verifique se o projeto correto está selecionado
3. Verifique os logs de erro no SQL Editor
4. Entre em contato com o desenvolvedor

---

## ✅ Checklist Final

Antes de usar o sistema, confirme:

- [ ] Script SQL executado sem erros
- [ ] Tabela `profiles` criada
- [ ] Tabela `registros` criada
- [ ] Policies ativas em ambas as tabelas
- [ ] Teste de inserção funcionou
- [ ] Sistema permite criar registros sem erros

---

**Última atualização:** Após executar esses passos, o sistema estará totalmente funcional! 🎉