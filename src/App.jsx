import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import FormularioRegistro from "./components/FormularioRegistro";
import TabelaRegistros from "./components/TabelaRegistros";
import Analises from "./components/Analises";
import AccessDenied from "./components/AccessDenied";
import usePermissions from "./hooks/usePermissions";
import { logger } from "./utils/logger.js";

// Componente principal protegido (só acessível após login)
function AppContent() {
  const { user, loading, logout } = useAuth();
  const { permissions } = usePermissions();
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [mostrarAuth, setMostrarAuth] = useState("login"); // 'login' ou 'register'
  const [error, setError] = useState(null);

  // Debug: Log para verificar se o app está carregando
  useEffect(() => {
    logger.info("🚀 App carregado!");
    logger.info("📍 Base URL:", import.meta.env.BASE_URL);
    logger.info(
      "🔑 Supabase URL:",
      import.meta.env.VITE_SUPABASE_URL ? "Configurado" : "NÃO CONFIGURADO",
    );

    // Verificar se as variáveis de ambiente estão configuradas
    if (
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      setError(
        "Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.",
      );
    }
  }, []);

  const handleTabChange = (tab) => {
    setAbaAtiva(tab);
  };

  const handleFormularioSuccess = () => {
    // Após salvar, vai para registros
    setAbaAtiva("registros");
  };

  const handleEditarRegistro = () => {
    // Quando clicar em editar, vai para o formulário
    setAbaAtiva("formulario");
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erro de Configuração
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600">
              <strong>Para desenvolvedores:</strong>
              <br />
              Verifique se as variáveis de ambiente estão configuradas:
              <br />
              • VITE_SUPABASE_URL
              <br />• VITE_SUPABASE_ANON_KEY
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center max-w-md p-6">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-4">Carregando sistema...</p>
          <p className="text-sm text-gray-500">
            Se ficar muito tempo aqui, pressione F5 ou abra o Console (F12) para
            ver detalhes.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Aguarde até 5 segundos...
          </p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login/registro
  if (!user) {
    if (mostrarAuth === "register") {
      return (
        <Register
          onRegisterSuccess={() => {
            // Após registro bem-sucedido, usuário já está logado
            // O AuthProvider cuida disso automaticamente
          }}
          onToggleLogin={() => setMostrarAuth("login")}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={() => {
          // Após login bem-sucedido, usuário já está logado
          // O AuthProvider cuida disso automaticamente
        }}
        onToggleRegister={() => setMostrarAuth("register")}
      />
    );
  }

  // Usuário autenticado - mostrar aplicação normal
  const renderConteudo = () => {
    switch (abaAtiva) {
      case "dashboard":
        return <Dashboard />;

      case "formulario":
        return (
          <FormularioRegistro
            onSuccess={handleFormularioSuccess}
            onCancel={() => setAbaAtiva("registros")}
          />
        );

      case "registros":
        return <TabelaRegistros onEdit={handleEditarRegistro} />;

      case "analises":
        // Verificar se o usuário tem permissão para acessar análises
        if (!permissions.canViewAnalises) {
          return (
            <AccessDenied
              title="Acesso Restrito - Análises"
              message="A página de Análises está disponível apenas para administradores do sistema."
              onBack={() => setAbaAtiva("dashboard")}
            />
          );
        }
        return <Analises />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      activeTab={abaAtiva}
      onTabChange={handleTabChange}
      onLogout={logout}
    >
      {renderConteudo()}
    </Layout>
  );
}

// Componente raiz com Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
