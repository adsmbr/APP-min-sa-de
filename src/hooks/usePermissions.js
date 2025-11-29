import { useMemo } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { logger } from '../utils/logger.js';

/**
 * Hook customizado para gerenciar permissões baseadas em roles
 *
 * Roles disponíveis:
 * - admin: Acesso completo (exportações, exclusões, relatórios)
 * - funcionario: Apenas cadastros (sem exportações, exclusões, relatórios)
 */
const usePermissions = () => {
  const { user, profile } = useAuth();

  // Determinar o role atual do usuário
  const userRole = useMemo(() => {
    if (!profile) {
      logger.debug("🔍 [PERMISSIONS] Profile não encontrado");
      return null;
    }
    const role = profile.role || 'funcionario';
    logger.debug("🔍 [PERMISSIONS] Role determinado:", role);
    return role;
  }, [profile]);

  // Verificar se o usuário é admin
  const isAdmin = useMemo(() => {
    const adminStatus = userRole === 'admin';
    logger.debug("🔍 [PERMISSIONS] Verificação isAdmin:", { userRole, isAdmin: adminStatus });
    return adminStatus;
  }, [userRole]);

  // Verificar se o usuário é funcionário
  const isFuncionario = useMemo(() => {
    return userRole === 'funcionario';
  }, [userRole]);

  // Permissões específicas
  const permissions = useMemo(() => {
    return {
      // Permissões de leitura
      canViewDashboard: true, // Todos podem ver o dashboard
      canViewRegistros: true, // Todos podem ver registros
      canViewAnalises: isAdmin, // Apenas admins podem ver análises detalhadas

      // Permissões de escrita
      canCreateRegistro: true, // Todos podem criar registros
      canEditRegistro: true, // Todos podem editar (com RLS no backend)
      canDeleteRegistro: isAdmin, // Apenas admins podem deletar
      canDuplicateRegistro: isAdmin, // Apenas admins podem duplicar

      // Permissões de exportação e relatórios
      canExportData: isAdmin, // Apenas admins podem exportar
      canExportExcel: isAdmin, // Apenas admins podem exportar Excel
      canExportPDF: isAdmin, // Apenas admins podem exportar PDF
      canViewReports: isAdmin, // Apenas admins podem ver relatórios
      canViewStatistics: isAdmin, // Apenas admins podem ver estatísticas detalhadas

      // Permissões de gerenciamento
      canManageUsers: isAdmin, // Apenas admins podem gerenciar usuários
      canViewAudit: isAdmin, // Apenas admins podem ver auditoria
      canChangeSettings: isAdmin, // Apenas admins podem alterar configurações

      // Permissões de tabela/listagem
      canBulkDelete: isAdmin, // Apenas admins podem fazer exclusões em massa
      canBulkEdit: isAdmin, // Apenas admins podem fazer edições em massa

      // Permissões de localização
      canViewMap: isAdmin, // Apenas admins podem ver mapa
      canExportMap: isAdmin, // Apenas admins podem exportar mapa
    };
  }, [isAdmin]);

  // Função auxiliar para verificar uma permissão específica
  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  // Função para verificar múltiplas permissões (retorna true se tiver TODAS)
  const hasAllPermissions = (...permissionList) => {
    return permissionList.every(permission => hasPermission(permission));
  };

  // Função para verificar múltiplas permissões (retorna true se tiver ALGUMA)
  const hasAnyPermission = (...permissionList) => {
    return permissionList.some(permission => hasPermission(permission));
  };

  // Obter rótulo amigável do role
  const getRoleLabel = useMemo(() => {
    const labels = {
      admin: 'Administrador',
      funcionario: 'Funcionário',
    };
    return labels[userRole] || 'Usuário';
  }, [userRole]);

  // Obter cor do badge do role
  const getRoleColor = useMemo(() => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      funcionario: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[userRole] || 'bg-gray-100 text-gray-800 border-gray-300';
  }, [userRole]);

  // Verificar se o usuário tem permissão para acessar uma aba específica
  const canAccessTab = (tabId) => {
    const tabPermissions = {
      dashboard: true, // Todos podem acessar
      formulario: true, // Todos podem acessar
      registros: true, // Todos podem acessar
      analises: isAdmin, // Apenas admins
      relatorios: isAdmin, // Apenas admins (se existir)
      configuracoes: isAdmin, // Apenas admins (se existir)
      usuarios: isAdmin, // Apenas admins (se existir)
    };
    return tabPermissions[tabId] !== false;
  };

  return {
    // Informações do usuário
    user,
    profile,
    userRole,

    // Verificações de role
    isAdmin,
    isFuncionario,

    // Permissões
    permissions,

    // Funções auxiliares
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessTab,

    // Helpers de UI
    getRoleLabel,
    getRoleColor,
  };
};

export default usePermissions;
