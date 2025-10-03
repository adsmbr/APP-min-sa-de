import React from "react";
import { Shield, Lock, AlertCircle, ArrowLeft } from "lucide-react";

/**
 * Componente para exibir mensagem de acesso negado
 * Usado quando um usuário sem permissão tenta acessar um recurso restrito
 */
const AccessDenied = ({
  title = "Acesso Restrito",
  message = "Esta funcionalidade está disponível apenas para administradores.",
  onBack = null,
  showBackButton = true
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal */}
        <div className="card text-center">
          {/* Ícone de bloqueio */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full -ml-8">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h2>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Informações adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">
                  Você está logado como Funcionário
                </p>
                <p>
                  Para acessar esta funcionalidade, entre em contato com um
                  administrador do sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de funcionalidades restritas */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">
              Funcionalidades exclusivas para Administradores:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Exportação de dados (CSV, Excel, JSON, etc.)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Exclusão de registros
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Duplicação de registros
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Visualização de análises e relatórios
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Acesso ao mapa de distribuição
              </li>
            </ul>
          </div>

          {/* Botão de voltar */}
          {showBackButton && (
            <button
              onClick={onBack || (() => window.history.back())}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}

          {/* Informação adicional */}
          <p className="text-xs text-gray-500 mt-4">
            Caso acredite que isto seja um erro, entre em contato com o
            administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
