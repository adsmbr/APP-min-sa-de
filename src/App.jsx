import React, { useState } from "react";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import FormularioRegistro from "./components/FormularioRegistro";
import TabelaRegistros from "./components/TabelaRegistros";
import Analises from "./components/Analises";

// Componente principal protegido (só acessível após login)
function AppContent() {
  const { user, loading, logout } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [mostrarAuth, setMostrarAuth] = useState("login"); // 'login' ou 'register'

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregando sistema...</p>
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
