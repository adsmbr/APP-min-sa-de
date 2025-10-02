# 🚀 Guia de Deploy - Sistema de Registro Nova Iguaçu

## Opções de Hospedagem

Este guia apresenta diferentes formas de fazer o deploy do sistema em produção.

---

## 📦 Preparação para Deploy

### 1. Build do Projeto

Antes de fazer deploy, gere a versão otimizada:

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos otimizados e minificados.

### 2. Teste Local da Build

```bash
npm run preview
```

Acesse `http://localhost:4173` para testar a versão de produção localmente.

---

## ☁️ Vercel (Recomendado)

### Por que Vercel?
- ✅ Deploy automático a cada commit
- ✅ HTTPS grátis
- ✅ CDN global
- ✅ Zero configuração
- ✅ Preview de pull requests

### Passo a Passo

#### Método 1: Via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy em produção
vercel --prod
```

#### Método 2: Via GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **"Deploy"**

### Variáveis de Ambiente (se necessário)

```env
# Exemplo de .env.production
VITE_APP_NAME=Sistema Nova Iguaçu
VITE_API_URL=https://sua-api.com
```

---

## 🌐 Netlify

### Por que Netlify?
- ✅ Interface simples
- ✅ Deploy contínuo
- ✅ Formulários integrados
- ✅ HTTPS automático

### Passo a Passo

#### Via Interface Web

1. Acesse [netlify.com](https://www.netlify.com)
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte ao GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Clique em **"Deploy site"**

#### Via CLI

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Inicializar
netlify init

# 4. Deploy
netlify deploy --prod
```

### Arquivo de Configuração

Crie `netlify.toml` na raiz:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## 🔷 GitHub Pages

### Por que GitHub Pages?
- ✅ Grátis
- ✅ Integrado ao GitHub
- ✅ Simples para projetos estáticos

### Passo a Passo

#### 1. Instalar gh-pages

```bash
npm install --save-dev gh-pages
```

#### 2. Adicionar Scripts no package.json

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Configurar Base no vite.config.js

```javascript
export default defineConfig({
  base: '/nome-do-repositorio/',
  plugins: [react()],
})
```

#### 4. Deploy

```bash
npm run deploy
```

#### 5. Configurar GitHub

1. Vá em **Settings** → **Pages**
2. Em **Source**, selecione **gh-pages branch**
3. Clique em **Save**

O site estará disponível em: `https://seu-usuario.github.io/nome-do-repositorio/`

---

## 🔶 Firebase Hosting

### Por que Firebase?
- ✅ CDN rápida
- ✅ Integração com outros serviços Firebase
- ✅ Grátis para projetos pequenos

### Passo a Passo

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar
firebase init hosting

# Configurações:
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No

# 4. Build e Deploy
npm run build
firebase deploy
```

### Arquivo firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 📊 Render

### Por que Render?
- ✅ Deploy automático
- ✅ HTTPS grátis
- ✅ Bom plano gratuito

### Passo a Passo

1. Acesse [render.com](https://render.com)
2. Clique em **"New"** → **"Static Site"**
3. Conecte ao repositório GitHub
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Clique em **"Create Static Site"**

---

## 🐳 Docker

### Por que Docker?
- ✅ Ambiente isolado
- ✅ Portabilidade
- ✅ Fácil deploy em VPS

### Dockerfile

Crie `Dockerfile` na raiz:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Docker Compose

Crie `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

### Comandos

```bash
# Build
docker build -t sistema-nova-iguacu .

# Run
docker run -d -p 80:80 sistema-nova-iguacu

# Com docker-compose
docker-compose up -d
```

---

## 🖥️ VPS / Servidor Próprio

### Requisitos
- Node.js 18+
- Nginx ou Apache
- PM2 (opcional)

### Deploy Manual

```bash
# 1. Conectar ao servidor
ssh usuario@seu-servidor.com

# 2. Clonar repositório
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo

# 3. Instalar dependências
npm install

# 4. Build
npm run build

# 5. Configurar Nginx
sudo nano /etc/nginx/sites-available/nova-iguacu
```

### Configuração Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/nova-iguacu/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/nova-iguacu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

---

## 🔒 Segurança

### Headers de Segurança

Adicione no nginx.conf:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.tile.openstreetmap.org;" always;
```

---

## 📊 Monitoramento

### Analytics (Opcional)

Se desejar adicionar analytics, instale:

```bash
npm install react-ga4
```

### Uptime Monitoring

Serviços gratuitos recomendados:
- UptimeRobot
- Pingdom
- StatusCake

---

## 🔄 CI/CD

### GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## ✅ Checklist Pré-Deploy

- [ ] Testar build local (`npm run build`)
- [ ] Testar preview (`npm run preview`)
- [ ] Verificar console do navegador (sem erros)
- [ ] Testar em mobile
- [ ] Verificar performance (Lighthouse)
- [ ] Configurar domínio customizado
- [ ] Configurar SSL/HTTPS
- [ ] Adicionar favicon
- [ ] Configurar meta tags SEO
- [ ] Testar offline (se PWA)
- [ ] Fazer backup dos dados

---

## 🚨 Troubleshooting

### Problema: Rotas não funcionam após deploy

**Solução**: Configure rewrite rules no servidor

```nginx
# Nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: Assets não carregam

**Solução**: Verifique o `base` no vite.config.js

```javascript
export default defineConfig({
  base: '/', // ou '/subpasta/' se em subdiretório
})
```

### Problema: CORS errors

**Solução**: Configure headers CORS no servidor

```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
```

---

## 📞 Suporte

Para dúvidas sobre deploy:

- 📖 [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- 📖 [Vercel Docs](https://vercel.com/docs)
- 📖 [Netlify Docs](https://docs.netlify.com/)

---

<div align="center">

**🚀 Sistema de Registro - Nova Iguaçu/RJ 🚀**

*Desenvolvido para pesquisa veterinária*

</div>