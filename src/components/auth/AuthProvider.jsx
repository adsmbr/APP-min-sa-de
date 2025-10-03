import { createContext, useContext, useState, useEffect } from "react";
import { supabase, getUserProfile, signOut } from "../../lib/supabase";
import { logger } from '../../utils/logger.js';
import OfflineMode from './OfflineMode';

// Criar contexto de autenticação
const AuthContext = createContext({});

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Buscar perfil do usuário
  const fetchProfile = async (userId) => {
    try {
      logger.debug("👤 [PROFILE] Buscando perfil para userId:", userId);
      const profileData = await getUserProfile(userId);
      logger.debug("👤 [PROFILE] Dados do perfil recebidos:", profileData);
      
      if (profileData) {
        logger.info("👤 [PROFILE] Perfil do usuário carregado:", { email: profileData.email, role: profileData.role });
        setProfile(profileData);
        return profileData;
      }

      // Se não houver perfil, o usuário pode existir na autenticação, mas não na tabela de perfis.
      // Vamos criar um perfil para eles para garantir que o aplicativo funcione.
      logger.warn(`⚠️ [PROFILE] Perfil não encontrado para o userId: ${userId}. Criando um novo.`);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error("❌ [PROFILE] Não é possível criar o perfil, nenhum usuário autenticado encontrado.");
        return null;
      }

      // O papel padrão para novos perfis é 'funcionario'.
      // Os scripts SQL são responsáveis por elevar usuários específicos para 'admin'.
      let newRole = 'funcionario';
      let newName = user.email; // Nome padrão para o e-mail

      // --- Correção de dados temporária para usuário admin específico ---
      // Isso garante que a conta de administrador principal tenha o papel correto se estiver ausente.
      // Em um ambiente de produção, isso idealmente seria tratado por um script de banco de dados único.
      if (user.email === 'simeimontijo@gmail.com') {
          logger.info("✨ [PROFILE] Usuário admin específico 'simeimontijo@gmail.com' detectado. Definindo o papel como 'admin'.");
          newRole = 'admin';
          newName = 'Simei Moraes Montijo';
      }
      // --- Fim da correção temporária ---

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ id: user.id, email: user.email, role: newRole, nome: newName })
        .select()
        .single();

      if (createError) {
        // É possível que o perfil tenha sido criado em uma condição de corrida. Tente buscá-lo novamente.
        if (createError.code === '23505') { // Violação de unicidade
            logger.warn("⚠️ [PROFILE] A criação do perfil falhou devido a uma condição de corrida. Buscando novamente.");
            return await getUserProfile(userId);
        }
        logger.error("❌ [PROFILE] Erro ao criar novo perfil:", createError);
        throw createError;
      }

      logger.info(`✅ [PROFILE] Novo perfil criado para ${user.email} com o papel '${newRole}'.`);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      logger.error("❌ [PROFILE] Erro ao buscar ou criar perfil:", error);
      setProfile(null); // Limpar perfil em caso de erro
      return null;
    }
  };

  // Efeito para gerenciar o estado de autenticação
  useEffect(() => {
    setLoading(true);
    logger.debug("🔐 [AUTH] Iniciando verificação de sessão...");

    // 1. Obter a sessão inicial
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (initialSession) {
        logger.debug("✅ [AUTH] Sessão inicial encontrada.", { userId: initialSession.user.id });
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchProfile(initialSession.user.id);
      } else {
        logger.debug("ℹ️ [AUTH] Nenhuma sessão inicial encontrada.");
      }
      // Não definimos loading false aqui, deixamos o listener fazer isso
    }).catch(error => {
      logger.error("❌ [AUTH] Erro ao obter sessão inicial:", error);
    });

    // 2. Escutar por mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug(`🔄 [AUTH] Evento de autenticação: ${event}`);
        
        if (event === 'SIGNED_IN') {
          logger.debug("✅ [AUTH] Usuário entrou (SIGNED_IN).", { userId: session.user.id });
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          logger.debug("🚪 [AUTH] Usuário saiu (SIGNED_OUT).");
          setSession(null);
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED') {
          logger.debug("🔄 [AUTH] Token da sessão atualizado.");
          setSession(session);
          setUser(session.user); // Garante que o usuário está atualizado
        } else if (event === 'INITIAL_SESSION') {
            logger.debug("ℹ️ [AUTH] Sessão inicial processada pelo listener.");
            // Se a sessão existe, os dados já foram setados pelo getSession() ou serão pelo SIGNED_IN
            // Apenas garantimos que o loading termine.
        }

        // Finaliza o estado de carregamento após o primeiro evento ser processado
        if (loading) {
          setLoading(false);
          logger.debug("✅ [AUTH] Estado de carregamento finalizado.");
        }
      }
    );

    // Funções para lidar com o status online/offline
    const handleOnline = () => {
      logger.info("📶 Conexão restaurada (online).");
      setIsOffline(false);
    };
    const handleOffline = () => {
      logger.warn("📵 Conexão perdida (offline).");
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpeza ao desmontar o componente
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      logger.debug("🛑 [AUTH] Listener de autenticação removido.");
    };
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      logger.debug("🔐 Tentando fazer login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // O listener onAuthStateChange cuidará de atualizar o estado
      logger.debug("✅ Login bem-sucedido via API. Aguardando listener...");
      return { success: true, user: data.user };
    } catch (error) {
      logger.error("❌ Erro no login:", error.message);
      return { success: false, error: error.message };
    }
  };

  // Função de registro
  const register = async (email, password, userData) => {
    try {
      logger.debug("📝 Tentando registrar novo usuário...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
            role: userData.role || "funcionario",
          },
        },
      });

      if (error) throw error;
      // O listener onAuthStateChange cuidará de atualizar o estado após o email de confirmação (se houver)
      logger.debug("✅ Usuário registrado com sucesso via API.");
      return { success: true, user: data.user };
    } catch (error) {
      logger.error("❌ Erro no registro:", error);
      return { success: false, error: error.message };
    }
  };

  // Função de logout
  const logout = async () => {
    logger.debug("🚪 [LOGOUT] Iniciando processo de logout...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // O listener onAuthStateChange cuidará de limpar o estado
      logger.debug("✅ [LOGOUT] Chamada de signOut bem-sucedida. Aguardando listener...");
      return { success: true };
    } catch (error) {
      logger.error("❌ [LOGOUT] Erro ao fazer logout:", error.message);
      // Forçar limpeza local em caso de erro de rede no signOut
      setSession(null);
      setUser(null);
      setProfile(null);
      return { success: false, error: error.message };
    }
  };

  // Funções de verificação de permissão
  const isAdmin = () => profile?.role === "admin";
  const isFuncionario = () => profile?.role === "funcionario";
  const canEdit = (registroCriadoPor) => isAdmin() || registroCriadoPor === user?.id;
  const canDelete = (_registroCriadoPor) => isAdmin();

  // Atualizar perfil
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: "Usuário não autenticado" };
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data); // Atualiza o perfil localmente
      logger.debug("✅ Perfil atualizado com sucesso.");
      return { success: true, data };
    } catch (error) {
      logger.error("❌ Erro ao atualizar perfil:", error);
      return { success: false, error: error.message };
    }
  };

  // Se estiver offline, mostrar componente de modo offline
  if (isOffline) {
    return (
      <OfflineMode 
        onRetry={() => window.location.reload()} // Simplesmente recarregar a página ao tentar novamente
        isRetrying={loading}
      />
    );
  }

  // Valor do contexto
  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isFuncionario,
    canEdit,
    canDelete,
    login,
    register,
    logout,
    updateProfile,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthProvider;