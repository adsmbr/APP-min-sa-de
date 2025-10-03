# 📋 Comandos Úteis - Sistema de Registro Nova Iguaçu

## 🚀 Comandos Principais

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Acessar: http://localhost:3000
```

### Build e Preview

```bash
# Criar build de produção
npm run build

# Visualizar build de produção localmente
npm run preview

# Acessar: http://localhost:4173
```

### Qualidade de Código

```bash
# Verificar erros de linting
npm run lint

# Corrigir erros automaticamente (se possível)
npm run lint -- --fix
```

---

## 📦 Gerenciamento de Dependências

### Instalar

```bash
# Instalar todas as dependências
npm install

# Instalar dependência específica
npm install nome-pacote

# Instalar dependência de desenvolvimento
npm install -D nome-pacote

# Instalar versão específica
npm install nome-pacote@1.0.0
```

### Atualizar

```bash
# Verificar pacotes desatualizados
npm outdated

# Atualizar todos os pacotes (dentro do range)
npm update

# Atualizar pacote específico
npm update nome-pacote

# Atualizar para última versão (quebra range)
npm install nome-pacote@latest
```

### Remover

```bash
# Remover dependência
npm uninstall nome-pacote

# Remover e atualizar package.json
npm uninstall --save nome-pacote
```

---

## 🧹 Limpeza e Manutenção

### Limpar Cache

```bash
# Limpar cache do npm
npm cache clean --force

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Windows CMD
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Limpar Build

```bash
# Remover pasta dist
rm -rf dist

# Windows
rmdir /s /q dist
```

---

## 🔍 Debugging e Testes

### Verificar Versões

```bash
# Versão do Node.js
node --version

# Versão do npm
npm --version

# Listar dependências instaladas
npm list

# Listar apenas dependências principais
npm list --depth=0

# Verificar informações do projeto
npm info
```

### Analisar Bundle

```bash
# Build com análise de bundle
npm run build -- --mode production

# Visualizar tamanho dos arquivos
npm run preview
```

---

## 🌐 Git (Controle de Versão)

### Básico

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push para remote
git push origin main
```

### Branches

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Mudar de branch
git checkout main

# Listar branches
git branch

# Deletar branch
git branch -d nome-branch
```

### Outros

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver diferenças
git diff

# Desfazer mudanças não commitadas
git checkout -- .

# Atualizar do remote
git pull origin main
```

---

## 📤 Deploy

### Vercel

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy produção
vercel --prod
```

### Netlify

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy produção
netlify deploy --prod
```

### GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

### Build Manual

```bash
# 1. Criar build
npm run build

# 2. Testar localmente
npm run preview

# 3. Copiar pasta dist/ para servidor
# (Via FTP, SSH, etc)
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Criar arquivo .env
echo "VITE_APP_NAME=Sistema Nova Iguaçu" > .env

# Usar no código
import.meta.env.VITE_APP_NAME
```

### Alterar Porta

```bash
# Editar vite.config.js
server: {
  port: 3001
}

# Ou via CLI
npm run dev -- --port 3001
```

---

## 📊 Análise de Performance

### Lighthouse

```bash
# Via Chrome DevTools
# 1. Abrir DevTools (F12)
# 2. Ir para aba Lighthouse
# 3. Clicar em "Generate report"
```

### Bundle Analyzer

```bash
# Instalar
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer()
]

# Build gerará stats.html
npm run build
```

---

## 🐛 Troubleshooting

### Erros Comuns

```bash
# Erro: "Cannot find module"
# Solução: Reinstalar dependências
npm install

# Erro: "Port already in use"
# Solução: Mudar porta ou matar processo
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Erro: "Permission denied"
# Solução: Executar com permissões adequadas
sudo npm install  # Linux/Mac

# Erro: Build falhando
# Solução: Limpar e rebuildar
npm run build -- --force
```

---

## 📱 Testes Mobile

### Usar IP Local

```bash
# 1. Descobrir seu IP local
# Windows:
ipconfig

# Linux/Mac:
ifconfig

# 2. Acessar de outro dispositivo
# http://SEU-IP:3000
# Exemplo: http://192.168.1.100:3000
```

### Configurar Vite para Aceitar Conexões Externas

```javascript
// vite.config.js
server: {
  host: '0.0.0.0',
  port: 3000
}
```

---

## 🔐 Segurança

### Auditar Dependências

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (quando possível)
npm audit fix

# Forçar correções (pode quebrar compatibilidade)
npm audit fix --force
```

---

## 📝 Documentação

### Gerar JSDoc

```bash
# Instalar
npm install -g jsdoc

# Gerar documentação
jsdoc src/**/*.js -d docs
```

---

## 🎯 Atalhos Úteis

| Comando | Descrição |
|---------|-----------|
| `Ctrl + C` | Parar servidor de desenvolvimento |
| `Ctrl + Shift + R` | Hard refresh no navegador |
| `F12` | Abrir DevTools do navegador |
| `Ctrl + Shift + I` | Inspecionar elemento |
| `Ctrl + Shift + J` | Console do navegador |

---

## 📞 Ajuda

```bash
# Ajuda do npm
npm help

# Ajuda de comando específico
npm help install

# Documentação online
npm docs nome-pacote

# Abrir homepage do pacote
npm home nome-pacote
```

---

<div align="center">

**🐕🐈 Sistema de Registro - Nova Iguaçu/RJ**

*Comandos rápidos para desenvolvimento*

</div>