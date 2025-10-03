import React from 'react';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';

const OfflineMode = ({ onRetry, isRetrying = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conexão Indisponível
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Wifi className="w-4 h-4" />
            <span>Aguardando conexão...</span>
          </div>

          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Tentando reconectar...' : 'Tentar Novamente'}</span>
          </button>

          <div className="text-xs text-gray-400 mt-4">
            <p>Dicas para resolver:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>Verifique sua conexão com a internet</li>
              <li>Recarregue a página (F5)</li>
              <li>Aguarde alguns minutos e tente novamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;