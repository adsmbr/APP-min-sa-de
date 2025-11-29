import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { 
      "x-my-custom-header": "sistema-nova-iguacu",
    },
  }
});

// ============================================
// HELPERS DE AUTENTICAÇÃO
// ============================================

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    logger.error("❌ Erro ao verificar autenticação:", error);
    return false;
  }
};

/**
 * Obtém o usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error("❌ Erro ao obter usuário atual:", error);
    return null;
  }
};

/**
 * Obtém o perfil completo do usuário
 */
export const getUserProfile = async (userId) => {
  try {
    logger.debug("🔍 [SUPABASE] Buscando perfil na tabela profiles para userId:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      logger.error("❌ [SUPABASE] Erro na query do perfil:", error);
      throw error;
    }
    
    logger.debug("✅ [SUPABASE] Perfil encontrado:", data);
    return data;
  } catch (error) {
    logger.error("❌ [SUPABASE] Erro ao obter perfil:", error);
    return null;
  }
};

/**
 * Faz logout do usuário
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logger.info("✅ Logout realizado com sucesso");
    return { success: true };
  } catch (error) {
    logger.error("❌ Erro ao fazer logout:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// HELPERS DE REGISTROS
// ============================================

/**
 * Busca todos os registros (com filtros opcionais)
 */
export const getRegistros = async (filtros = {}) => {
  try {
    logger.debug("🔍 Buscando registros...", filtros);

    let query = supabase
      .from("registros")
      .select("*")
      .order("criado_em", { ascending: false });

    // Aplicar filtros se existirem
    if (filtros.localidade) {
      query = query.eq("localidade", filtros.localidade);
    }
    if (filtros.dataInicio) {
      query = query.gte("data", filtros.dataInicio);
    }
    if (filtros.dataFim) {
      query = query.lte("data", filtros.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erro ao buscar registros:", error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} registros encontrados`);
    return { data, error: null };
  } catch (error) {
    console.error("❌ Erro ao buscar registros:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Cria um novo registro
 */
export const criarRegistro = async (registro) => {
  try {
    logger.debug("📝 Tentando criar registro...", registro);

    const user = await getCurrentUser();
    logger.debug("👤 Usuário atual:", user ? user.id : "NULL");

    if (!user) {
      logger.error("❌ Usuário não autenticado!");
      throw new Error("Usuário não autenticado");
    }

    const registroComUsuario = {
      ...registro,
      criado_por: user.id,
    };

    logger.debug("💾 Salvando registro:", registroComUsuario);

    const { data, error } = await supabase
      .from("registros")
      .insert([registroComUsuario])
      .select();

    if (error) {
      logger.error("❌ Erro do Supabase:", error);
      throw error;
    }

    logger.debug("✅ Registro criado com sucesso!", data);
    return { data, error: null };
  } catch (error) {
    logger.error("❌ Erro ao criar registro:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Atualiza um registro existente
 */
export const atualizarRegistro = async (id, dadosAtualizados) => {
  try {
    const { data, error } = await supabase
      .from("registros")
      .update(dadosAtualizados)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error("❌ Erro ao atualizar registro:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Exclui um registro
 */
export const excluirRegistro = async (id) => {
  try {
    const { error } = await supabase.from("registros").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("❌ Erro ao excluir registro:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscreve a mudanças nos registros (tempo real)
 */
export const subscribeToRegistros = (callback) => {
  return supabase
    .channel("registros")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "registros",
      },
      callback
    )
    .subscribe();
};

/**
 * Obtém estatísticas dos registros
 */
export const getEstatisticas = async () => {
  try {
    const { data: registros, error } = await supabase
      .from("registros")
      .select("*");

    if (error) throw error;

    const stats = {
      totalRegistros: registros.length,
      totalCaesMacho: registros.reduce((sum, r) => sum + (r.caes_macho || 0), 0),
      totalCaesFemea: registros.reduce((sum, r) => sum + (r.caes_femea || 0), 0),
      totalGatosMacho: registros.reduce((sum, r) => sum + (r.gatos_macho || 0), 0),
      totalGatosFemea: registros.reduce((sum, r) => sum + (r.gatos_femea || 0), 0),
      porLocalidade: {},
    };

    stats.totalCaes = stats.totalCaesMacho + stats.totalCaesFemea;
    stats.totalGatos = stats.totalGatosMacho + stats.totalGatosFemea;

    // Agrupar por localidade
    registros.forEach((registro) => {
      const loc = registro.localidade;
      if (!stats.porLocalidade[loc]) {
        stats.porLocalidade[loc] = {
          totalRegistros: 0,
          totalCaes: 0,
          totalGatos: 0,
        };
      }
      stats.porLocalidade[loc].totalRegistros++;
      stats.porLocalidade[loc].totalCaes += (registro.caes_macho || 0) + (registro.caes_femea || 0);
      stats.porLocalidade[loc].totalGatos += (registro.gatos_macho || 0) + (registro.gatos_femea || 0);
    });

    return { data: stats, error: null };
  } catch (error) {
    logger.error("❌ Erro ao obter estatísticas:", error);
    return { data: null, error: error.message };
  }
};

logger.info("✅ Supabase configurado");

export default supabase;
