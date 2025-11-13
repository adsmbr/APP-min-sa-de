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
  const [retryCount, setRetryCount] = useState(0);

  // Buscar perfil do usuário
  const fetchProfile = async (userId) => {
    try {
      logger.debug("👤 [PROFILE] Buscando perfil para userId:", userId);
      const profileData = await getUserProfile(userId);
      logger.debug("👤 [PROFILE] Dados do perfil recebidos:", profileData);
      logger.debug("👤 [PROFILE] Role do usuário:", profileData?.role);
      
      // Debug adicional para verificar o role
      if (!profileData) {
        logger.warn("⚠️ [DEBUG] Perfil não encontrado ou nulo!");
      }

      setProfile(profileData);
      return profileData;
    } catch (error) {
      logger.error("❌ [PROFILE] Erro ao buscar perfil:", error);
      return null;
    }
  };

  // Carregar sessão inicial
  useEffect(() => {
    let mounted = true;
    let authSubscription;
    let retryCount = 0;
    let loadingTimeoutId;
    const maxRetries = 5;

    // Garantir que o loading não fique infinito
    loadingTimeoutId = setTimeout(() => {
      if (mounted && loading) {
        logger.warn("⚠️ Timeout de carregamento atingido. Forçando saída do estado de loading.");
        setLoading(false);
      }
    }, 10000); // 10 segundos máximo de loading

    const initializeAuth = async () => {
      try {
        logger.debug("🔐 Inicializando autenticação...");
        logger.debug("🌐 URL Supabase:", import.meta.env.VITE_SUPABASE_URL);
        logger.debug("🔑 Chave configurada:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Sim" : "❌ Não");
        logger.debug("🔄 Tentativa:", retryCount + 1, "de", maxRetries);
        logger.debug("📡 Tentando obter sessão do Supabase...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error("❌ Erro ao obter sessão:", sessionError);
          logger.error("🔍 Tipo do erro:", sessionError.name);
          logger.error("📝 Mensagem do erro:", sessionError.message);

          // Se estiver offline de fato, sinalizar e aguardar eventos de rede
          if (!navigator.onLine) {
            logger.warn("⚠️ Dispositivo offline detectado. Aguardando reconexão...");
            if (mounted) {
              setIsOffline(true);
              setLoading(false);
            }
            return;
          }

          // Implementar retry apenas para erros de rede específicos
          if (retryCount < maxRetries &&
              (sessionError.message?.includes('fetch') ||
               sessionError.message?.includes('network') ||
               sessionError.message?.includes('Failed to fetch'))) {
            const retryDelay = 3000; // Delay fixo de 3s
            logger.debug(`🔄 Erro de rede detectado, tentando reconectar em ${retryDelay/1000}s...`);
            retryCount++;
            setTimeout(() => {
              if (mounted) {
                initializeAuth();
              }
            }, retryDelay);
            return;
          }

          // Se esgotaram as tentativas, continuar sem sessão
          logger.warn("⚠️ Continuando sem sessão ativa (modo offline)");
          if (mounted) {
            setLoading(false);
            setIsOffline(true);
          }
          return;
        }

        // Reset retry count em caso de sucesso
        retryCount = 0;
        setIsOffline(false);

        if (!mounted) return;

        if (sessionData?.session?.user) {
          logger.debug("✅ Sessão encontrada");
          setUser(sessionData.session.user);
          setSession(sessionData.session);

          try {
            await fetchProfile(sessionData.session.user.id);
          } catch (err) {
            logger.error("❌ Erro ao buscar perfil:", err);
          }
        } else {
          logger.debug("ℹ️ Nenhuma sessão ativa encontrada");
        }

        logger.debug("✅ Loading concluído");
        if (mounted) setLoading(false);
      } catch (error) {
        logger.error("❌ Erro ao inicializar autenticação:", error);
        logger.error("🔍 Stack trace:", error.stack);

        // Implementar retry com backoff exponencial para erros de conexão
        if (retryCount < maxRetries &&
            (error.message?.includes('Timeout') ||
             error.message?.includes('fetch') ||
             error.message?.includes('network') ||
             error.message?.includes('Failed to fetch') ||
             error.name === 'TypeError' ||
             error.name === 'AbortError')) {

          const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 10000);
          logger.debug(`🔄 Erro de conexão detectado, tentando novamente em ${retryDelay/1000}s...`);
          retryCount++;

          setTimeout(() => {
            if (mounted) {
              logger.debug("🔄 Executando nova tentativa de conexão...");
              initializeAuth();
            }
          }, retryDelay);
          return;
        }

        logger.error("🛑 Erro não recuperável ou máximo de tentativas atingido");
        if (mounted) {
          logger.debug("🛑 Parando loading devido ao erro");
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data: sessionData, error }) => {
          if (error) return;
          if (!mounted) return;
          if (sessionData?.session?.user) {
            setUser(sessionData.session.user);
            setSession(sessionData.session);
            fetchProfile(sessionData.session.user.id).catch(() => {});
          }
        });
      }
    };

    // Listeners de rede para manter estado offline/online e reprocessar sessão
    const handleOnline = () => {
      logger.info("📶 Conexão restaurada (online)");
      setIsOffline(false);
      initializeAuth();
    };
    const handleOffline = () => {
      logger.warn("📵 Conexão perdida (offline)");
      setIsOffline(true);
    };
    const handleFocus = () => {
      initializeAuth();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listener para mudanças de autenticação (configurado apenas uma vez)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug("🔄 Auth state changed:", event, session?.user?.id);

      if (!mounted) return;

      // Processar SIGNED_OUT para limpeza
      if (event === 'SIGNED_OUT') {
        logger.debug("🚪 Sessão encerrada via listener");
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false); // Importante: parar o loading após logout
        return;
      }

      // Processar SIGNED_IN para atualizar o usuário após login
      if (event === 'SIGNED_IN' && session?.user) {
        logger.debug("🔑 Usuário logado via listener");
        setUser(session.user);
        setSession(session);
        try {
          await fetchProfile(session.user.id);
        } catch (err) {
          logger.warn("⚠️ Erro ao buscar perfil após login:", err);
        }
        setLoading(false);
        return;
      }

      // Processar TOKEN_REFRESHED para manter a sessão
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        logger.debug("🔄 Token renovado");
        setUser(session.user);
        setSession(session);
        return;
      }

      // Ignorar outros eventos
      logger.debug("🔄 Ignorando evento:", event);
    });

    authSubscription = subscription;

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Dependências vazias para executar apenas uma vez

    // Função de login
  const login = async (email, password) => {
    try {
      logger.debug("🔐 Tentando fazer login...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        logger.debug("✅ Login bem-sucedido");
        setUser(data.user);
        await fetchProfile(data.user.id);
        return { success: true, user: data.user };
      }

      return { success: false, error: "Dados de login inválidos" };
    } catch (error) {
      logger.error("Erro no login:", error);
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

      if (data.user) {
        logger.debug("✅ Usuário registrado, criando perfil...");

        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              nome: userData.nome,
              email: email,
              role: userData.role || "funcionario",
            },
          ]);

        if (profileError) {
          logger.error("❌ Erro ao criar perfil:", profileError);
          throw profileError;
        }
        logger.debug("✅ Perfil criado com sucesso");

        return { success: true, user: data.user };
      }

      return { success: false, error: "Erro ao criar usuário" };
    } catch (error) {
      logger.error("Erro no registro:", error);
      return { success: false, error: error.message };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      logger.debug("🚪 [LOGOUT] Iniciando processo de logout...");
      logger.debug("🚪 [LOGOUT] Estado atual - User:", !!user, "Profile:", !!profile);

      // Primeiro limpar o estado local para feedback imediato
      setLoading(true);

      // Limpar estados imediatamente para garantir desconexão visual
      setUser(null);
      setProfile(null);
      setSession(null);

      logger.debug("🚪 [LOGOUT] Chamando signOut do Supabase...");
      const result = await signOut();

      const clearSupabaseAuthStorage = () => {
        try {
          const keys = Object.keys(window.localStorage);
          keys.forEach((k) => {
            if (k.startsWith('sb-')) {
              window.localStorage.removeItem(k);
            }
          });
        } catch (_) {}
      };

      logger.debug("🚪 [LOGOUT] Resultado do signOut:", result);

      if (result.success) {
        clearSupabaseAuthStorage();
        logger.debug("🚪 [LOGOUT] SignOut bem-sucedido, limpeza local concluída");
        setLoading(false); // Garantir que loading seja desativado
        logger.debug("✅ [LOGOUT] Logout realizado com sucesso");
        return { success: true };
      } else {
        logger.error("❌ [LOGOUT] Erro no signOut:", result.error);
        clearSupabaseAuthStorage();
        setLoading(false);
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error("❌ [LOGOUT] Erro no logout:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Verificar se é admin
  const isAdmin = () => {
    return profile?.role === "admin";
  };

  // Verificar se é funcionário
  const isFuncionario = () => {
    return profile?.role === "funcionario";
  };

  // Verificar se pode editar registro
  const canEdit = (registroCriadoPor) => {
    // Admin pode editar tudo
    if (isAdmin()) return true;
    // Funcionário só pode editar próprios registros
    return registroCriadoPor === user?.id;
  };

  // Verificar se pode excluir registro
  const canDelete = (_registroCriadoPor) => {
    // Apenas admin pode excluir
    return isAdmin();
  };

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

      setProfile(data);
      return { success: true, data };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, error: error.message };
    }
  };

  // Função para tentar reconectar
  const handleRetryConnection = async () => {
    logger.debug("🔄 Tentando reconectar...");
    // Se continuar offline segundo o navegador, apenas aguarde evento 'online'
    if (!navigator.onLine) {
      logger.warn("📵 Ainda sem conexão segundo o navegador. Aguardando reconexão...");
      setIsOffline(true);
      return;
    }
    setIsOffline(false);
    setLoading(true);
    setRetryCount(0);

    // Aguardar um pouco antes de tentar reconectar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tentar inicializar autenticação novamente
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      if (session) {
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    } catch (error) {
      logger.error("❌ Falha na reconexão:", error.message);
      setIsOffline(true);
      setLoading(false);
    }
  };

  // Se estiver offline, mostrar componente de modo offline
  if (isOffline) {
    return (
      <OfflineMode 
        onRetry={handleRetryConnection}
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
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export { useAuth };
export default AuthProvider;
