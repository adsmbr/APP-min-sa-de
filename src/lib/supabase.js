import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger.js";

// Configuração do Supabase com variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as credenciais estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  logger.error("⚠️ ERRO: Credenciais do Supabase não configuradas!");
  logger.error("Por favor, configure o arquivo .env com suas credenciais");
}

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
    headers: { "x-my-custom-header": "sistema-nova-iguacu" },
  },
});

// ============================================
// HELPERS DE AUTENTICAÇÃO
// ============================================

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    logger.error("Erro ao verificar autenticação:", error);
    return false;
  }
};

/**
 * Obtém o usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    logger.error("Erro ao obter usuário:", error);
    return null;
  }
};

/**
 * Obtém o perfil completo do usuário
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error("Erro ao obter perfil:", error);
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
    return { success: true };
  } catch (error) {
    logger.error("Erro ao fazer logout:", error);
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
    logger.error("Erro ao atualizar registro:", error);
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
    return { success: true, error: null };
  } catch (error) {
    logger.error("Erro ao excluir registro:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// LISTENERS EM TEMPO REAL
// ============================================

/**
 * Inscrever-se para mudanças nos registros em tempo real
 */
export const subscribeToRegistros = (callback) => {
  const subscription = supabase
    .channel("registros-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "registros",
      },
      (payload) => {
        logger.debug("Mudança detectada:", payload);
        if (callback) callback(payload);
      },
    )
    .subscribe();

  // Retorna função para cancelar a inscrição
  return () => {
    subscription.unsubscribe();
  };
};

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Calcula estatísticas dos registros
 */
export const getEstatisticas = async () => {
  try {
    const { data: registros, error } = await supabase
      .from("registros")
      .select("*");

    if (error) throw error;

    const stats = {
      totalRegistros: registros.length,
      totalCaesMacho: 0,
      totalCaesFemea: 0,
      totalGatosMacho: 0,
      totalGatosFemea: 0,
      totalCaes: 0,
      totalGatos: 0,
      porLocalidade: {},
    };

    registros.forEach((reg) => {
      stats.totalCaesMacho += reg.caes_macho;
      stats.totalCaesFemea += reg.caes_femea;
      stats.totalGatosMacho += reg.gatos_macho;
      stats.totalGatosFemea += reg.gatos_femea;

      // Por localidade
      if (!stats.porLocalidade[reg.localidade]) {
        stats.porLocalidade[reg.localidade] = {
          total: 0,
          caes: 0,
          gatos: 0,
          registros: 0,
        };
      }

      stats.porLocalidade[reg.localidade].caes +=
        reg.caes_macho + reg.caes_femea;
      stats.porLocalidade[reg.localidade].gatos +=
        reg.gatos_macho + reg.gatos_femea;
      stats.porLocalidade[reg.localidade].total +=
        reg.caes_macho + reg.caes_femea + reg.gatos_macho + reg.gatos_femea;
      stats.porLocalidade[reg.localidade].registros += 1;
    });

    stats.totalCaes = stats.totalCaesMacho + stats.totalCaesFemea;
    stats.totalGatos = stats.totalGatosMacho + stats.totalGatosFemea;

    return { data: stats, error: null };
  } catch (error) {
    logger.error("Erro ao calcular estatísticas:", error);
    return { data: null, error: error.message };
  }
};

// Log de conexão bem-sucedida
logger.info("✅ Supabase configurado com sucesso!");
logger.info("📡 URL:", supabaseUrl);

export default supabase;
