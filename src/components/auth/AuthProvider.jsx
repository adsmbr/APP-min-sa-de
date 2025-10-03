import { createContext, useContext, useState, useEffect } from "react";
import { supabase, getUserProfile, signOut } from "../../lib/supabase";
import { logger } from '../../utils/logger.js';

// Criar contexto de autenticação
const AuthContext = createContext({});

// Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Buscar perfil do usuário
  const fetchProfile = async (userId) => {
    try {
      logger.debug("👤 [PROFILE] Buscando perfil para userId:", userId);
      const profileData = await getUserProfile(userId);
      logger.debug("👤 [PROFILE] Dados do perfil recebidos:", profileData);
      logger.debug("👤 [PROFILE] Role do usuário:", profileData?.role);
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
    let timeoutId;

    const initializeAuth = async () => {
      try {
        logger.debug("🔐 Inicializando autenticação...");

        // Timeout de 5 segundos para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Timeout ao conectar com Supabase")),
            5000,
          );
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: sessionData, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ]);

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (sessionError) {
          throw sessionError;
        }

        if (!mounted) return;

        if (sessionData?.session?.user) {
          logger.debug("✅ Sessão encontrada");
          setUser(sessionData.session.user);

          try {
            await fetchProfile(sessionData.session.user.id);
          } catch (err) {
            logger.warn("⚠️ Erro ao buscar perfil (não crítico):", err);
          }
        } else {
          logger.debug("ℹ️ Nenhuma sessão ativa - mostrando tela de login");
        }

        logger.debug("✅ Loading concluído");
        if (mounted) setLoading(false);
      } catch (error) {
        logger.error("❌ Erro ao inicializar autenticação:", error);
        if (mounted) {
          logger.debug("🛑 Parando loading devido ao erro");
          setLoading(false);
        }
      }
    };

    // Timeout adicional como fallback
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        logger.error(
          "❌ Timeout geral - forçando fim do loading após 10 segundos",
        );
        setLoading(false);
      }
    }, 10000);

    initializeAuth().finally(() => {
      logger.debug("🏁 Inicialização finalizada");
      clearTimeout(fallbackTimeout);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug("🔄 Auth state changed:", event);

      if (!mounted) return;

      if (session?.user) {
        logger.debug("✅ Sessão ativa detectada");
        setUser(session.user);
        try {
          await fetchProfile(session.user.id);
        } catch (err) {
          logger.warn("⚠️ Erro ao buscar perfil após mudança de auth:", err);
        }
      } else {
        logger.debug("🚪 Sessão encerrada");
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
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
      
      logger.debug("🚪 [LOGOUT] Chamando signOut do Supabase...");
      const result = await signOut();
      
      logger.debug("🚪 [LOGOUT] Resultado do signOut:", result);
      
      if (result.success) {
        logger.debug("🚪 [LOGOUT] SignOut bem-sucedido, limpando estado local...");
        setUser(null);
        setProfile(null);
        logger.debug("🚪 [LOGOUT] Estado limpo - User:", null, "Profile:", null);
        logger.debug("✅ [LOGOUT] Logout realizado com sucesso");
        return { success: true };
      } else {
        logger.error("❌ [LOGOUT] Erro no signOut:", result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error("❌ [LOGOUT] Erro no logout:", error);
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

export default AuthProvider;
