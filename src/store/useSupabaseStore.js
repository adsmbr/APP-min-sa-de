import { create } from "zustand";
import {
  supabase,
  getRegistros as fetchRegistros,
  criarRegistro,
  atualizarRegistro as updateRegistro,
  excluirRegistro as deleteRegistro,
  getEstatisticas as fetchEstatisticas,
} from "../lib/supabase";
import { logger } from "../utils/logger";

const useSupabaseStore = create((set, get) => ({
  // Estado inicial
  registros: [],
  registroEditando: null,
  filtros: {
    busca: "",
    localidade: "",
    dataInicio: "",
    dataFim: "",
    tipoAnimal: "todos", // todos, caes, gatos
  },
  paginaAtual: 1,
  registrosPorPagina: 10,
  ordenacao: {
    campo: "data",
    direcao: "desc", // asc ou desc
  },
  estatisticas: {
    totalRegistros: 0,
    totalCaesMacho: 0,
    totalCaesFemea: 0,
    totalGatosMacho: 0,
    totalGatosFemea: 0,
    totalCaes: 0,
    totalGatos: 0,
    porLocalidade: {},
  },
  loading: false,
  error: null,

  // Carregar registros do Supabase
  carregarRegistros: async () => {
    logger.debug("📊 useSupabaseStore: Carregando registros...");
    set({ loading: true, error: null });
    try {
      const { data, error } = await fetchRegistros();
      if (error) throw new Error(error);

      // Transformar dados do Supabase para formato do sistema
      const registrosTransformados = (data || []).map((reg) => ({
        id: reg.id,
        urb: reg.urb,
        localidade: reg.localidade,
        endereco: reg.endereco,
        caesMacho: reg.caes_macho,
        caesFemea: reg.caes_femea,
        gatosMacho: reg.gatos_macho,
        gatosFemea: reg.gatos_femea,
        data: reg.data,
        tutor: reg.tutor,
        telefone: reg.telefone,
        coordenadas:
          reg.latitude && reg.longitude
            ? { lat: reg.latitude, lng: reg.longitude }
            : null,
        criadoEm: reg.criado_em,
        atualizadoEm: reg.atualizado_em,
        criadoPor: reg.criado_por,
      }));

      logger.info(
        `✅ useSupabaseStore: ${registrosTransformados.length} registros carregados`,
      );
      set({ registros: registrosTransformados, loading: false });
      get().calcularEstatisticas();
      return registrosTransformados;
    } catch (error) {
      logger.error("❌ useSupabaseStore: Erro ao carregar registros:", error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Adicionar registro
  adicionarRegistro: async (registro) => {
    logger.debug("➕ useSupabaseStore: Adicionando registro...", registro);
    set({ loading: true, error: null });
    try {
      // Transformar dados para formato do Supabase
      const registroSupabase = {
        urb: registro.urb,
        localidade: registro.localidade,
        endereco: registro.endereco,
        caes_macho: registro.caesMacho || 0,
        caes_femea: registro.caesFemea || 0,
        gatos_macho: registro.gatosMacho || 0,
        gatos_femea: registro.gatosFemea || 0,
        data: registro.data,
        tutor: registro.tutor,
        telefone: registro.telefone,
        latitude: registro.coordenadas?.lat || null,
        longitude: registro.coordenadas?.lng || null,
      };

      const { data, error } = await criarRegistro(registroSupabase);
      if (error) throw new Error(error);

      logger.info(
        "✅ useSupabaseStore: Registro adicionado, recarregando lista...",
      );
      // Recarregar registros
      await get().carregarRegistros();
      set({ loading: false });

      return data?.[0];
    } catch (error) {
      logger.error("❌ useSupabaseStore: Erro ao adicionar registro:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Atualizar registro
  atualizarRegistro: async (id, dadosAtualizados) => {
    set({ loading: true, error: null });
    try {
      // Transformar dados para formato do Supabase
      const registroSupabase = {
        urb: dadosAtualizados.urb,
        localidade: dadosAtualizados.localidade,
        endereco: dadosAtualizados.endereco,
        caes_macho: dadosAtualizados.caesMacho || 0,
        caes_femea: dadosAtualizados.caesFemea || 0,
        gatos_macho: dadosAtualizados.gatosMacho || 0,
        gatos_femea: dadosAtualizados.gatosFemea || 0,
        data: dadosAtualizados.data,
        tutor: dadosAtualizados.tutor,
        telefone: dadosAtualizados.telefone,
        latitude: dadosAtualizados.coordenadas?.lat || null,
        longitude: dadosAtualizados.coordenadas?.lng || null,
      };

      const { error } = await updateRegistro(id, registroSupabase);
      if (error) throw new Error(error);

      // Recarregar registros
      await get().carregarRegistros();
      set({ registroEditando: null, loading: false });
    } catch (error) {
      logger.error("Erro ao atualizar registro:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Excluir registro
  excluirRegistro: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await deleteRegistro(id);
      if (error) throw new Error(error);

      // Recarregar registros
      await get().carregarRegistros();
      set({ loading: false });
    } catch (error) {
      logger.error("Erro ao excluir registro:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Duplicar registro
  duplicarRegistro: async (id) => {
    const registro = get().registros.find((reg) => reg.id === id);
    if (registro) {
      const {
        id: _,
        criadoEm,
        atualizadoEm,
        criadoPor,
        ...dadosParaDuplicar
      } = registro;
      return await get().adicionarRegistro(dadosParaDuplicar);
    }
  },

  // Definir registro para edição
  setRegistroEditando: (registro) => {
    set({ registroEditando: registro });
  },

  // Cancelar edição
  cancelarEdicao: () => {
    set({ registroEditando: null });
  },

  // Verificar duplicata
  verificarDuplicata: (endereco, data, idAtual = null) => {
    const registros = get().registros;
    return registros.some(
      (reg) =>
        reg.endereco.toLowerCase().trim() === endereco.toLowerCase().trim() &&
        reg.data === data &&
        reg.id !== idAtual,
    );
  },

  // Filtros
  setFiltros: (novosFiltros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...novosFiltros },
      paginaAtual: 1,
    }));
  },

  limparFiltros: () => {
    set({
      filtros: {
        busca: "",
        localidade: "",
        dataInicio: "",
        dataFim: "",
        tipoAnimal: "todos",
      },
      paginaAtual: 1,
    });
  },

  // Paginação
  setPaginaAtual: (pagina) => {
    set({ paginaAtual: pagina });
  },

  setRegistrosPorPagina: (quantidade) => {
    set({ registrosPorPagina: quantidade, paginaAtual: 1 });
  },

  // Ordenação
  setOrdenacao: (campo) => {
    set((state) => ({
      ordenacao: {
        campo,
        direcao:
          state.ordenacao.campo === campo && state.ordenacao.direcao === "asc"
            ? "desc"
            : "asc",
      },
    }));
  },

  // Obter registros filtrados
  getRegistrosFiltrados: () => {
    const { registros, filtros, ordenacao } = get();
    let registrosFiltrados = [...registros];

    // Aplicar busca geral
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      registrosFiltrados = registrosFiltrados.filter(
        (reg) =>
          reg.localidade.toLowerCase().includes(buscaLower) ||
          reg.endereco.toLowerCase().includes(buscaLower) ||
          reg.tutor.toLowerCase().includes(buscaLower) ||
          reg.urb.toLowerCase().includes(buscaLower) ||
          reg.telefone.includes(buscaLower),
      );
    }

    // Filtrar por localidade
    if (filtros.localidade) {
      registrosFiltrados = registrosFiltrados.filter(
        (reg) => reg.localidade === filtros.localidade,
      );
    }

    // Filtrar por período
    if (filtros.dataInicio) {
      registrosFiltrados = registrosFiltrados.filter(
        (reg) => reg.data >= filtros.dataInicio,
      );
    }

    if (filtros.dataFim) {
      registrosFiltrados = registrosFiltrados.filter(
        (reg) => reg.data <= filtros.dataFim,
      );
    }

    // Filtrar por tipo de animal
    if (filtros.tipoAnimal === "caes") {
      registrosFiltrados = registrosFiltrados.filter(
        (reg) => reg.caesMacho > 0 || reg.caesFemea > 0,
      );
    } else if (filtros.tipoAnimal === "gatos") {
      registrosFiltrados = registrosFiltrados.filter(
        (reg) => reg.gatosMacho > 0 || reg.gatosFemea > 0,
      );
    }

    // Aplicar ordenação
    registrosFiltrados.sort((a, b) => {
      let valorA = a[ordenacao.campo];
      let valorB = b[ordenacao.campo];

      if (ordenacao.campo === "data") {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      } else if (typeof valorA === "string") {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      if (valorA < valorB) return ordenacao.direcao === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === "asc" ? 1 : -1;
      return 0;
    });

    return registrosFiltrados;
  },

  // Obter registros paginados
  getRegistrosPaginados: () => {
    const { paginaAtual, registrosPorPagina } = get();
    const registrosFiltrados = get().getRegistrosFiltrados();

    const inicio = (paginaAtual - 1) * registrosPorPagina;
    const fim = inicio + registrosPorPagina;

    return {
      registros: registrosFiltrados.slice(inicio, fim),
      total: registrosFiltrados.length,
      totalPaginas: Math.ceil(registrosFiltrados.length / registrosPorPagina),
      paginaAtual,
    };
  },

  // Obter localidades únicas
  getLocalidades: () => {
    const registros = get().registros;
    const localidades = [...new Set(registros.map((reg) => reg.localidade))];
    return localidades.sort();
  },

  // Calcular estatísticas
  calcularEstatisticas: () => {
    const registros = get().registros;

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
      stats.totalCaesMacho += reg.caesMacho || 0;
      stats.totalCaesFemea += reg.caesFemea || 0;
      stats.totalGatosMacho += reg.gatosMacho || 0;
      stats.totalGatosFemea += reg.gatosFemea || 0;

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
        (reg.caesMacho || 0) + (reg.caesFemea || 0);
      stats.porLocalidade[reg.localidade].gatos +=
        (reg.gatosMacho || 0) + (reg.gatosFemea || 0);
      stats.porLocalidade[reg.localidade].total +=
        (reg.caesMacho || 0) +
        (reg.caesFemea || 0) +
        (reg.gatosMacho || 0) +
        (reg.gatosFemea || 0);
      stats.porLocalidade[reg.localidade].registros += 1;
    });

    stats.totalCaes = stats.totalCaesMacho + stats.totalCaesFemea;
    stats.totalGatos = stats.totalGatosMacho + stats.totalGatosFemea;

    set({ estatisticas: stats });
  },

  // Subscrever a mudanças em tempo real
  subscribeToChanges: () => {
    const channel = supabase
      .channel("registros-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registros",
        },
        () => {
          logger.debug("Mudança detectada, recarregando registros...");
          get().carregarRegistros();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },
}));

export default useSupabaseStore;
