# 🤝 Guia de Contribuição

## Sistema de Registro de Distribuição Espacial de Animais - Nova Iguaçu/RJ

Obrigado por seu interesse em contribuir com este projeto! Este guia ajudará você a começar.

---

## 📋 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Posso Contribuir?](#-como-posso-contribuir)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Processo de Desenvolvimento](#-processo-de-desenvolvimento)
- [Padrões de Código](#-padrões-de-código)
- [Commits e Pull Requests](#-commits-e-pull-requests)
- [Reportar Bugs](#-reportar-bugs)
- [Sugerir Melhorias](#-sugerir-melhorias)
- [Documentação](#-documentação)

---

## 📜 Código de Conduta

### Nosso Compromisso

Este projeto é dedicado a fornecer uma experiência livre de assédio para todos, independentemente de:

- Idade
- Tamanho corporal
- Deficiência
- Etnia
- Identidade e expressão de gênero
- Nível de experiência
- Nacionalidade
- Aparência pessoal
- Raça
- Religião
- Identidade e orientação sexual

### Comportamento Esperado

✅ Use linguagem acolhedora e inclusiva
✅ Respeite pontos de vista diferentes
✅ Aceite críticas construtivas
✅ Foque no que é melhor para a comunidade
✅ Mostre empatia com outros membros

### Comportamento Inaceitável

❌ Uso de linguagem ou imagens sexualizadas
❌ Comentários ofensivos ou depreciativos
❌ Assédio público ou privado
❌ Publicação de informações privadas de outros
❌ Conduta antiética ou não profissional

---

## 💡 Como Posso Contribuir?

### 🐛 Reportar Bugs

Encontrou um bug? Ajude-nos a melhorar!

1. **Verifique** se o bug já não foi reportado nas [Issues](https://github.com/seu-usuario/seu-repo/issues)
2. **Abra uma nova Issue** com o template de bug
3. **Descreva** o problema detalhadamente
4. **Inclua** steps para reproduzir
5. **Adicione** screenshots se aplicável

### ✨ Sugerir Funcionalidades

Tem uma ideia para melhorar o sistema?

1. **Verifique** se a sugestão já não existe
2. **Abra uma Issue** com o template de feature
3. **Explique** por que seria útil
4. **Descreva** como deveria funcionar

### 🔧 Contribuir com Código

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** seguindo os padrões
5. **Teste** suas mudanças
6. **Commit** com mensagens descritivas
7. **Push** para seu fork
8. **Abra** um Pull Request

### 📝 Melhorar Documentação

- Corrigir erros de digitação
- Adicionar exemplos
- Melhorar explicações
- Traduzir documentação

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Git
- Editor de código (VS Code recomendado)

### Instalação

```bash
# 1. Fork o repositório no GitHub

# 2. Clone seu fork
git clone https://github.com/SEU-USUARIO/sistema-nova-iguacu.git
cd sistema-nova-iguacu

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL/sistema-nova-iguacu.git

# 4. Instale as dependências
npm install

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

### VS Code - Extensões Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## 🔄 Processo de Desenvolvimento

### 1. Sincronize com Upstream

Sempre sincronize antes de começar:

```bash
git checkout main
git fetch upstream
git merge upstream/main
```

### 2. Crie uma Branch

Use nomes descritivos:

```bash
# Para novas features
git checkout -b feature/nome-da-feature

# Para correções de bugs
git checkout -b fix/nome-do-bug

# Para documentação
git checkout -b docs/o-que-mudou

# Para melhorias
git checkout -b enhancement/nome-melhoria
```

### 3. Desenvolva

- Escreva código limpo e legível
- Comente quando necessário
- Siga os padrões do projeto
- Teste suas mudanças

### 4. Teste

```bash
# Rodar linting
npm run lint

# Testar build
npm run build

# Testar preview
npm run preview
```

### 5. Commit

```bash
git add .
git commit -m "tipo: descrição curta

Descrição detalhada do que foi feito e por quê.

Closes #123"
```

### 6. Push

```bash
git push origin nome-da-sua-branch
```

### 7. Pull Request

1. Vá para o GitHub
2. Clique em "New Pull Request"
3. Preencha o template
4. Aguarde review

---

## 📐 Padrões de Código

### JavaScript/React

#### Nomenclatura

```javascript
// Components: PascalCase
const FormularioRegistro = () => { ... }

// Functions: camelCase
const validarTelefone = (telefone) => { ... }

// Constants: UPPER_SNAKE_CASE
const MAX_REGISTROS_POR_PAGINA = 50;

// Variables: camelCase
const totalAnimais = 0;
```

#### Estrutura de Componentes

```javascript
import React, { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';
import useStore from '../store/useStore';

// Props com destructuring
const MeuComponente = ({ prop1, prop2, onAction }) => {
  // 1. Hooks de estado
  const [estado, setEstado] = useState('');

  // 2. Hooks de efeito
  useEffect(() => {
    // código
  }, [dependencias]);

  // 3. Funções auxiliares
  const handleAction = () => {
    // código
  };

  // 4. Early returns
  if (!prop1) return null;

  // 5. Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

export default MeuComponente;
```

#### Boas Práticas

```javascript
// ✅ Bom
const totalCaes = caesMacho + caesFemea;

// ❌ Ruim
const total = a + b;

// ✅ Bom - Destructuring
const { urb, localidade, endereco } = registro;

// ❌ Ruim
const urb = registro.urb;
const localidade = registro.localidade;

// ✅ Bom - Arrow functions
const calcularTotal = (a, b) => a + b;

// ✅ Bom - Template literals
const mensagem = `Total de animais: ${total}`;

// ❌ Ruim
const mensagem = 'Total de animais: ' + total;
```

### CSS/Tailwind

```jsx
// ✅ Bom - Classes organizadas
<div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-md">

// ❌ Ruim - Desorganizado
<div className="p-4 shadow-md flex bg-white items-center rounded-lg gap-4 justify-between">

// Use classes customizadas para repetição
// Em index.css:
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all;
}

// No componente:
<button className="btn btn-primary">
```

### Comentários

```javascript
// ✅ Bom - Explica o porquê
// Usamos debounce para evitar muitas chamadas à API
const debouncedSearch = useDebounce(searchTerm, 500);

// ❌ Ruim - Explica o óbvio
// Define o estado como vazio
const [state, setState] = useState('');

// ✅ Bom - JSDoc para funções complexas
/**
 * Valida telefone brasileiro (fixo ou celular)
 * @param {string} telefone - Telefone no formato (XX) XXXXX-XXXX
 * @returns {boolean} True se válido
 */
const validarTelefone = (telefone) => { ... }
```

---

## 📝 Commits e Pull Requests

### Formato de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

#### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição de testes
- `chore`: Manutenção, build, etc

#### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(formulario): adiciona validação de CEP"

# Correção de bug
git commit -m "fix(tabela): corrige ordenação de datas"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Múltiplas linhas
git commit -m "feat(dashboard): adiciona gráfico de evolução temporal

- Implementa gráfico de barras por mês
- Adiciona filtro de período
- Melhora performance com useMemo

Closes #45"
```

### Template de Pull Request

```markdown
## Descrição

Breve descrição das mudanças.

## Tipo de Mudança

- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] 📝 Documentação
- [ ] 🎨 Estilo/UI

## Como Testar

1. Passo 1
2. Passo 2
3. Passo 3

## Screenshots (se aplicável)

![Antes](url)
![Depois](url)

## Checklist

- [ ] Código segue os padrões do projeto
- [ ] Testei localmente
- [ ] Adicionei/atualizei documentação
- [ ] Código passa no lint
- [ ] Build funciona
- [ ] Testei em mobile
- [ ] Testei em diferentes navegadores
```

---

## 🐛 Reportar Bugs

### Template de Issue de Bug

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [Windows 11]
- Browser: [Chrome 120]
- Versão: [1.0.0]

**Informações Adicionais**
Qualquer outra informação relevante.
```

---

## ✨ Sugerir Melhorias

### Template de Issue de Feature

```markdown
**A funcionalidade está relacionada a um problema?**
Descrição clara do problema. Ex: "Fico frustrado quando..."

**Descreva a solução desejada**
Descrição clara do que você quer que aconteça.

**Descreva alternativas consideradas**
Outras soluções ou funcionalidades consideradas.

**Contexto Adicional**
Screenshots, mockups, ou contexto adicional.

**Prioridade**
- [ ] Alta
- [ ] Média
- [ ] Baixa
```

---

## 📚 Documentação

### O que Documentar

- **README.md**: Visão geral, instalação, uso básico
- **QUICKSTART.md**: Início rápido
- **Código**: Comentários em funções complexas
- **Componentes**: Props, uso, exemplos
- **APIs**: Endpoints, parâmetros, respostas

### Estilo de Documentação

```markdown
# Use títulos hierárquicos

## Seção Principal

### Subseção

- Use listas quando apropriado
- Seja claro e conciso
- Adicione exemplos

\`\`\`javascript
// Código bem formatado
const exemplo = () => {
  return 'código';
};
\`\`\`

> Use blockquotes para notas importantes

⚠️ Use emojis para chamar atenção
```

---

## 🧪 Testes

### Testando Localmente

```bash
# Rodar em modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

### Checklist de Testes

- [ ] Funciona em desktop
- [ ] Funciona em tablet
- [ ] Funciona em mobile
- [ ] Funciona no Chrome
- [ ] Funciona no Firefox
- [ ] Funciona no Safari
- [ ] Funciona no Edge
- [ ] Formulários validam corretamente
- [ ] Dados persistem após refresh
- [ ] Exportações funcionam
- [ ] Não há erros no console
- [ ] Performance é adequada

---

## 🎯 Áreas que Precisam de Ajuda

### Alta Prioridade

- [ ] Implementar sincronização com Google Drive
- [ ] Adicionar modo PWA
- [ ] Melhorar acessibilidade (WCAG AAA)
- [ ] Adicionar testes automatizados

### Média Prioridade

- [ ] Implementar impressão de relatórios
- [ ] Adicionar mais tipos de gráficos
- [ ] Melhorar validações
- [ ] Adicionar modo escuro

### Baixa Prioridade

- [ ] Tradução para inglês/espanhol
- [ ] Atalhos de teclado
- [ ] Animações adicionais
- [ ] Easter eggs 🥚

---

## 📞 Contato

### Onde Buscar Ajuda

- **Issues**: Para bugs e features
- **Discussions**: Para perguntas gerais
- **Email**: [seu-email@exemplo.com]

### Canais de Comunicação

- 💬 [Discord/Slack](link)
- 📧 Email: [seu-email@exemplo.com]
- 🐦 Twitter: [@seu-usuario](link)

---

## 🏆 Contribuidores

Este projeto existe graças a todas as pessoas que contribuem!

<!-- Lista de contribuidores será gerada automaticamente -->

---

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.

---

## 🙏 Agradecimentos

Obrigado por considerar contribuir com este projeto! Cada contribuição, não importa quão pequena, faz diferença.

### Como Seu Nome Aparecerá

Todos os contribuidores são adicionados à lista de colaboradores automaticamente. Seu perfil do GitHub será vinculado.

---

<div align="center">

**🐕🐈 Sistema de Registro - Nova Iguaçu/RJ**

*Desenvolvido com ❤️ pela comunidade*

[⬆ Voltar ao topo](#-guia-de-contribuição)

</div>