import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

// Configuração do Supabase com variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as credenciais estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  logger.error("⚠️ ERRO: Credenciais do Supabase não configuradas!");
  logger.error("Por favor, configure o arquivo .env com suas credenciais");
}

// Criar cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    // Configurações de timeout mais adequadas
    flowType: 'pkce',
    debug: import.meta.env.VITE_APP_ENV === 'development',
  },
  db: {
    schema: "public",
  },
  global: {
    headers: { 
      "x-my-custom-header": "sistema-nova-iguacu",
      "x-client-info": "webapp-v1.0"
    },
    // Configurações de fetch com timeouts mais adequados e retry
    fetch: async (url, options = {}) => {
      const maxRetries = 2;
      let attempt = 0;
      
      while (attempt <= maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            logger.warn(`⏰ Timeout na tentativa ${attempt + 1} para ${url}`);
            controller.abort();
          }, 25000); // 25 segundos de timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          // Se a resposta for bem-sucedida, retornar
          if (response.ok || response.status < 500) {
            return response;
          }
          
          // Para erros 5xx, tentar novamente
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          
        } catch (error) {
          attempt++;
          
          // Se for o último retry ou erro não recuperável, lançar erro
          if (attempt > maxRetries || 
              (error.name !== 'AbortError' && 
               !error.message?.includes('fetch') &&
               !error.message?.includes('HTTP 5'))) {
            logger.error(`❌ Falha definitiva após ${attempt} tentativas:`, error.message);
            throw error;
          }
          
          // Aguardar antes do próximo retry (backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          logger.debug(`🔄 Tentativa ${attempt} falhou, aguardando ${delay}ms antes do retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  },
  // Configurações de realtime com timeouts adequados
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
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
    logger.debug("🚪 [SUPABASE] Iniciando signOut no Supabase...");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error("❌ [SUPABASE] Erro no signOut:", error);
      throw error;
    }
    
    logger.debug("✅ [SUPABASE] SignOut realizado com sucesso");
    return { success: true };
  } catch (error) {
    logger.error("❌ [SUPABASE] Erro ao fazer logout:", error);
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
