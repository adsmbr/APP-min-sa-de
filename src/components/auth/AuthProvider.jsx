import React, { createContext, useContext, useState, useEffect } from "react";
import {
  supabase,
  getCurrentUser,
  getUserProfile,
  signOut,
} from "../../lib/supabase";

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
      const profileData = await getUserProfile(userId);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }
  };

  // Carregar sessão inicial
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Inicializando autenticação...");

        // Timeout de 10 segundos para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Timeout ao conectar com Supabase")),
            10000,
          );
        });

        // Obter sessão atual com timeout
        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session: currentSession },
          error,
        } = await Promise.race([sessionPromise, timeoutPromise]);

        clearTimeout(timeoutId);

        if (error) throw error;

        if (mounted) {
          if (currentSession) {
            console.log("✅ Sessão encontrada");
            setSession(currentSession);
            setUser(currentSession.user);

            // Buscar perfil (não bloqueia o loading se falhar)
            fetchProfile(currentSession.user.id).catch((err) => {
              console.warn("⚠️ Erro ao buscar perfil:", err);
            });
          } else {
            console.log("ℹ️ Nenhuma sessão ativa");
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        if (mounted) {
          // Mesmo com erro, parar o loading para permitir acesso
          setLoading(false);
          setUser(null);
          setProfile(null);

          // Se for timeout, mostrar alerta
          if (error.message.includes("Timeout")) {
            console.error(
              "⏱️ Timeout: Não foi possível conectar ao Supabase. Verifique sua conexão.",
            );
          }
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);

      if (mounted) {
        setSession(currentSession);

        if (currentSession) {
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id);
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  };

  // Função de registro
  const register = async (email, password, nomeCompleto) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome_completo: nomeCompleto.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Criar perfil
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email,
            nome_completo: nomeCompleto.trim(),
            role: "pesquisador",
          },
        ]);

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
        }

        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: error.message };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      return { success: false, error: error.message };
    }
  };

  // Verificar se é admin
  const isAdmin = () => {
    return profile?.role === "admin";
  };

  // Verificar se é coordenador
  const isCoordenador = () => {
    return profile?.role === "coordenador" || profile?.role === "admin";
  };

  // Verificar se pode editar registro
  const canEdit = (registroCriadoPor) => {
    // Admin e coordenador podem editar tudo
    if (isAdmin() || isCoordenador()) return true;
    // Pesquisador só pode editar próprios registros
    return registroCriadoPor === user?.id;
  };

  // Verificar se pode excluir registro
  const canDelete = (registroCriadoPor) => {
    // Apenas admin e coordenador podem excluir
    return isAdmin() || isCoordenador();
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
    isCoordenador,
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
