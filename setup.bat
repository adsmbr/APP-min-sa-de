@echo off
chcp 65001 >nul
title Sistema de Registro - Nova Iguaçu - Setup
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   🐕🐈 SISTEMA DE REGISTRO DE DISTRIBUIÇÃO ESPACIAL DE ANIMAIS   ║
echo ║                      NOVA IGUAÇU/RJ                              ║
echo ║                                                                   ║
echo ║                    Script de Instalação                          ║
echo ║                       Versão 1.0.0                               ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo.

REM Verificar se Node.js está instalado
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERRO: Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js antes de continuar:
    echo https://nodejs.org/
    echo.
    echo Recomendado: Node.js 18 ou superior
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo ✅ Node.js encontrado: %NODE_VERSION%
echo.

REM Verificar se npm está instalado
echo [2/4] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERRO: npm não encontrado!
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
echo ✅ npm encontrado: v%NPM_VERSION%
echo.
echo.

REM Verificar se já existe node_modules
if exist "node_modules" (
    echo ⚠️  Pasta node_modules já existe!
    echo.
    set /p REINSTALL="Deseja reinstalar as dependências? (S/N): "
    if /i "!REINSTALL!"=="S" (
        echo.
        echo 🗑️  Removendo node_modules...
        rmdir /s /q node_modules 2>nul
        if exist "package-lock.json" (
            del /q package-lock.json 2>nul
        )
        echo ✅ Limpeza concluída!
        echo.
    ) else (
        echo.
        echo ⏭️  Pulando instalação de dependências...
        echo.
        goto :skip_install
    )
)

REM Instalar dependências
echo [3/4] Instalando dependências...
echo.
echo 📦 Isso pode levar alguns minutos...
echo.

npm install

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ ERRO: Falha ao instalar dependências!
    echo.
    echo Tente executar manualmente:
    echo   npm install
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas com sucesso!
echo.

:skip_install

REM Verificar arquivos essenciais
echo [4/4] Verificando arquivos do projeto...
if not exist "package.json" (
    color 0C
    echo ❌ Arquivo package.json não encontrado!
    pause
    exit /b 1
)
if not exist "index.html" (
    color 0C
    echo ❌ Arquivo index.html não encontrado!
    pause
    exit /b 1
)
if not exist "vite.config.js" (
    color 0C
    echo ❌ Arquivo vite.config.js não encontrado!
    pause
    exit /b 1
)
echo ✅ Todos os arquivos encontrados!
echo.
echo.

REM Instalação concluída
color 0A
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║              ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅              ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 O sistema está pronto para uso!
echo.
echo 📋 Comandos disponíveis:
echo.
echo   npm run dev      - Iniciar servidor de desenvolvimento
echo   npm run build    - Criar versão de produção
echo   npm run preview  - Visualizar versão de produção
echo   npm run lint     - Verificar código
echo.
echo.

REM Perguntar se deseja iniciar o servidor
set /p START_DEV="🚀 Deseja iniciar o servidor de desenvolvimento agora? (S/N): "

if /i "%START_DEV%"=="S" (
    echo.
    echo 🚀 Iniciando servidor de desenvolvimento...
    echo.
    echo 📱 O sistema abrirá automaticamente no seu navegador
    echo 🌐 Geralmente em: http://localhost:3000
    echo.
    echo ⚠️  Para parar o servidor, pressione Ctrl+C
    echo.
    timeout /t 3 /nobreak >nul
    npm run dev
) else (
    echo.
    echo 👍 Tudo pronto!
    echo.
    echo Para iniciar o servidor manualmente, execute:
    echo   npm run dev
    echo.
    echo 📖 Consulte o README.md para mais informações.
    echo.
)

echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 🐕🐈 Sistema de Registro - Nova Iguaçu/RJ
echo    Desenvolvido para pesquisa veterinária
echo.
pause
