# 🚀 Guia de Início Rápido

## Sistema de Registro - Nova Iguaçu/RJ

### ⚡ Instalação Rápida (2 minutos)

```bash
# 1. Entre na pasta do projeto
cd "APP min saúde"

# 2. Instale as dependências
npm install

# 3. Inicie o sistema
npm run dev
```

O sistema abrirá automaticamente no navegador em `http://localhost:3000`

---

## 📝 Primeiro Uso

### 1️⃣ Dados de Exemplo

Na primeira execução, o sistema perguntará se deseja carregar dados de exemplo:

- **SIM** → Carrega 5 registros de exemplo para testar
- **NÃO** → Começa com banco de dados vazio

💡 **Recomendação**: Aceite os dados de exemplo para explorar todas as funcionalidades!

---

### 2️⃣ Criar Primeiro Registro

1. Clique em **"Novo Registro"** no menu superior
2. Preencha os campos obrigatórios (marcados com `*`):
   - **URB**: Ex: `URB-001`
   - **Localidade**: Ex: `Centro`
   - **Endereço**: Ex: `Rua das Flores, 123`
   - **Quantidade de Animais**: Digite os números
   - **Data**: Hoje (preenchido automaticamente)
   - **Tutor**: Nome completo
   - **Telefone**: `(21) 98765-4321`
3. **Opcional**: Clique em "Capturar GPS" para adicionar localização
4. Clique em **"Salvar Registro"**

✅ Pronto! Seu primeiro registro foi criado.

---

### 3️⃣ Navegação Rápida

| Aba | O que faz |
|-----|-----------|
| 🏠 **Painel** | Veja estatísticas e gráficos |
| 📍 **Novo Registro** | Adicione novos dados |
| 📋 **Registros** | Liste, edite e exclua |
| 📊 **Análises** | Veja mapa e exporte dados |

---

## 🎯 Funcionalidades Essenciais

### ✏️ Editar Registro

1. Vá em **"Registros"**
2. Clique no ícone de lápis (✏️)
3. Faça as alterações
4. Clique em **"Atualizar Registro"**

### 🔍 Buscar Registros

1. Use a barra de busca no topo da tabela
2. Digite: endereço, tutor, localidade, URB ou telefone
3. Os resultados aparecem instantaneamente

### 🗺️ Ver no Mapa

1. Vá em **"Análises"**
2. Role até o mapa interativo
3. Clique nos marcadores para ver detalhes
4. Use os filtros para mostrar apenas cães ou gatos

### 💾 Exportar Dados

1. Vá em **"Análises"**
2. Role até **"Exportar Dados"**
3. Escolha o formato:
   - **CSV** → Para Excel
   - **JSON** → Backup completo
   - **SPSS** → Para análises estatísticas
   - **GeoJSON** → Para sistemas de mapa
4. O arquivo é baixado automaticamente

---

## 🔧 Comandos Úteis

```bash
# Iniciar desenvolvimento
npm run dev

# Criar versão de produção
npm run build

# Visualizar versão de produção
npm run preview

# Verificar erros de código
npm run lint
```

---

## 📱 Uso em Campo (Mobile)

### Captura de GPS

1. Ao criar registro, clique **"Capturar GPS"**
2. Permita acesso à localização no navegador
3. Aguarde alguns segundos
4. Coordenadas serão adicionadas automaticamente

### Modo Offline

✅ O sistema funciona sem internet!

- Dados são salvos localmente no navegador
- Todas as funcionalidades disponíveis
- Exportações funcionam normalmente
- Apenas o mapa requer internet (para os tiles)

---

## 🆘 Problemas Comuns

### ❌ Erro ao instalar

```bash
# Limpe o cache e reinstale
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ Porta 3000 já em uso

```bash
# O Vite escolherá outra porta automaticamente
# Ou edite vite.config.js para mudar a porta padrão
```

### ❌ GPS não funciona

- ✅ Use HTTPS (obrigatório para geolocalização)
- ✅ Permita acesso à localização no navegador
- ✅ Ative o GPS do dispositivo

### ❌ Dados sumiram após fechar navegador

- ✅ Não use modo anônimo/privado
- ✅ Não limpe dados de navegação do site
- ✅ Faça backup regular (exportação JSON)

---

## 💡 Dicas Pro

### 🎨 Personalização

Edite as cores do tema em `tailwind.config.js`:

```javascript
colors: {
  primary: '#1e40af', // Azul principal
  secondary: '#059669', // Verde secundário
}
```

### 🗄️ Backup Automático

Crie rotina de backup:

1. Vá em **"Análises"**
2. Clique em **"Backup Completo"**
3. Salve em local seguro (Google Drive, Dropbox, etc)
4. Repita semanalmente

### 📊 Análise Estatística

Para usar no SPSS/R/Python:

1. Exporte como **"SPSS"**
2. Importe no software estatístico
3. Variáveis já estão codificadas:
   - `CAES_M`, `CAES_F` → Cães macho/fêmea
   - `GATOS_M`, `GATOS_F` → Gatos macho/fêmea
   - `TEM_CAES`, `TEM_GATOS` → Variáveis dummy (0/1)

---

## 🎓 Próximos Passos

1. ✅ Explore o **Dashboard** para ver gráficos
2. ✅ Adicione pelo menos 10 registros reais
3. ✅ Teste os **filtros** na tabela de registros
4. ✅ Capture **coordenadas GPS** em pelo menos 5 registros
5. ✅ Veja os dados no **mapa interativo**
6. ✅ Faça uma **exportação CSV** e abra no Excel
7. ✅ Crie um **backup completo** dos dados

---

## 📚 Documentação Completa

Para mais informações, consulte:

- 📖 `README.md` → Documentação completa
- 🔧 `src/utils/validacao.js` → Regras de validação
- 📤 `src/utils/exportacao.js` → Formatos de exportação
- 🗃️ `src/store/useStore.js` → Estrutura de dados

---

## 🆘 Precisa de Ajuda?

- 📧 Email: [seu-email@exemplo.com]
- 🐛 Bugs: Abra uma issue no GitHub
- 💬 Dúvidas: Consulte o README.md completo

---

<div align="center">

**🐕 Sistema de Registro - Nova Iguaçu/RJ 🐈**

*Desenvolvido para pesquisa veterinária*

Versão 1.0.0 - 2024

</div>