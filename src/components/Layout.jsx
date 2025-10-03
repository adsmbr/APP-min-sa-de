import React, { useState, useEffect } from "react";
import {
  Dog,
  Cat,
  MapPin,
  Menu,
  X,
  Download,
  Home,
  Table,
  BarChart3,
  Wifi,
  WifiOff,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useAuth } from "./auth/AuthProvider";
import usePermissions from "../hooks/usePermissions";
import { logger } from "../utils/logger.js";

const Layout = ({ children, activeTab, onTabChange, onLogout }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const { user, profile } = useAuth();
  const { getRoleLabel, getRoleColor, isAdmin, canAccessTab } =
    usePermissions();

  // Log para debug do role
  useEffect(() => {
    logger.debug("🎭 [LAYOUT] Estado do usuário:", {
      user: !!user,
      profile: profile,
      role: profile?.role,
      isAdmin: isAdmin,
      getRoleLabel: getRoleLabel,
      getRoleColor: getRoleColor
    });
  }, [user, profile, isAdmin, getRoleLabel, getRoleColor]); // Agora as funções são memoizadas

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const allTabs = [
    { id: "dashboard", label: "Painel", icon: Home },
    { id: "formulario", label: "Novo Registro", icon: MapPin },
    { id: "registros", label: "Registros", icon: Table },
    { id: "analises", label: "Análises", icon: BarChart3 },
  ];

  // Filtrar tabs baseado em permissões
  const tabs = allTabs.filter((tab) => canAccessTab(tab.id));

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMenuAberto(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-700 text-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Dog className="w-8 h-8" />
                <Cat className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold leading-tight">
                  Sistema de Registro
                </h1>
                <p className="text-xs md:text-sm text-primary-100">
                  Nova Iguaçu/RJ
                </p>
              </div>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {/* Informação do Usuário */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-2 text-white border-r border-primary-400 mr-2">
                  <User className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.nome_completo || user.email}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 w-fit ${getRoleColor}`}
                    >
                      {profile?.role === 'admin' && <Shield className="w-3 h-3" />}
                      {getRoleLabel}
                    </span>
                  </div>
                </div>
              )}
              {/* Botão de Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:bg-primary-600 transition-all"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              )}
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-primary shadow-md"
                        : "text-white hover:bg-primary-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden p-2 rounded-lg hover:bg-primary-600 transition-colors"
              aria-label="Menu"
            >
              {menuAberto ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Menu Mobile */}
          {menuAberto && (
            <nav className="lg:hidden pb-4 animate-fadeIn">
              <div className="flex flex-col gap-2">
                {/* Informação do Usuário Mobile */}
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-primary-600 rounded-lg">
                    <User className="w-5 h-5" />
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium">
                        {profile?.nome_completo || user.email}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 w-fit mt-1 ${getRoleColor}`}
                      >
                        {isAdmin && <Shield className="w-3 h-3" />}
                        {getRoleLabel}
                      </span>
                    </div>
                  </div>
                )}
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-white text-primary"
                          : "text-white hover:bg-primary-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                {/* Botão de Logout Mobile */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white hover:bg-red-600 transition-all mt-2 border-t border-primary-400 pt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="animate-fadeIn">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 font-medium">
                Sistema de Registro de Distribuição Espacial de Animais
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Desenvolvido para pesquisa veterinária - Nova Iguaçu/RJ
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-primary" />
                <Cat className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-xs text-gray-500">
                © {new Date().getFullYear()} - Versão 1.0.0
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Indicador de Status Online/Offline */}
      {!online && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">Modo Offline</span>
        </div>
      )}

      {/* Toast temporário quando volta online */}
      {online && (
        <div className="hidden">
          {/* Espaço para implementação futura de toast de reconexão */}
        </div>
      )}
    </div>
  );
};

export default Layout;
