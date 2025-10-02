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

        // Timeout de 5 segundos para evitar loading infinito
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error("Timeout ao conectar com Supabase")),
            5000,
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
              console.warn("⚠️ Erro ao buscar perfil (não crítico):", err);
            });
          } else {
            console.log("ℹ️ Nenhuma sessão ativa - mostrando tela de login");
          }

          console.log("✅ Loading concluído");
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        if (mounted) {
          // SEMPRE parar o loading, mesmo com erro
          console.log("🛑 Parando loading devido ao erro");
          setLoading(false);
          setUser(null);
          setProfile(null);
          setSession(null);

          // Se for timeout, mostrar mensagem específica
          if (error.message && error.message.includes("Timeout")) {
            console.error(
              "⏱️ TIMEOUT: Supabase não respondeu em 5 segundos. Mostrando tela de login.",
            );
          }
        }
      } finally {
        // Garantir que loading sempre para
        if (mounted && timeoutId) {
          clearTimeout(timeoutId);
        }
        console.log("🏁 Inicialização finalizada");
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("🔄 Auth state changed:", event);

      if (mounted) {
        setSession(currentSession);

        if (currentSession) {
          console.log("✅ Sessão ativa detectada");
          setUser(currentSession.user);
          fetchProfile(currentSession.user.id).catch((err) => {
            console.warn("⚠️ Erro ao buscar perfil após mudança de auth:", err);
          });
        } else {
          console.log("🚪 Sessão encerrada");
          setUser(null);
          setProfile(null);
        }

        // Sempre garantir que loading para
        if (get().loading) {
          setLoading(false);
        }
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
      console.log("🔐 Tentando fazer login...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log("✅ Login bem-sucedido");
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
      console.log("📝 Tentando registrar novo usuário...");
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
        console.log("✅ Usuário registrado, criando perfil...");
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
          console.error("❌ Erro ao criar perfil:", profileError);
        } else {
          console.log("✅ Perfil criado com sucesso");
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
      console.log("🚪 Fazendo logout...");
      await signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log("✅ Logout bem-sucedido");
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
