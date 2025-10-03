import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      registros: [],
      registroEditando: null,
      filtros: {
        busca: '',
        localidade: '',
        dataInicio: '',
        dataFim: '',
        tipoAnimal: 'todos', // todos, caes, gatos
      },
      paginaAtual: 1,
      registrosPorPagina: 10,
      ordenacao: {
        campo: 'data',
        direcao: 'desc', // asc ou desc
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
      offline: false,
      ultimoBackup: null,

      // Ações - CRUD de Registros
      adicionarRegistro: (registro) => {
        const novoRegistro = {
          ...registro,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
        };

        set((state) => ({
          registros: [...state.registros, novoRegistro],
        }));

        get().calcularEstatisticas();
        return novoRegistro;
      },

      atualizarRegistro: (id, dadosAtualizados) => {
        set((state) => ({
          registros: state.registros.map((reg) =>
            reg.id === id
              ? { ...reg, ...dadosAtualizados, atualizadoEm: new Date().toISOString() }
              : reg
          ),
          registroEditando: null,
        }));

        get().calcularEstatisticas();
      },

      excluirRegistro: (id) => {
        set((state) => ({
          registros: state.registros.filter((reg) => reg.id !== id),
        }));

        get().calcularEstatisticas();
      },

      duplicarRegistro: (id) => {
        const registro = get().registros.find((reg) => reg.id === id);
        if (registro) {
          const { id: _, criadoEm, atualizadoEm, ...dadosParaDuplicar } = registro;
          return get().adicionarRegistro(dadosParaDuplicar);
        }
      },

      setRegistroEditando: (registro) => {
        set({ registroEditando: registro });
      },

      cancelarEdicao: () => {
        set({ registroEditando: null });
      },

      // Verificar duplicatas
      verificarDuplicata: (endereco, data, idAtual = null) => {
        const registros = get().registros;
        return registros.some(
          (reg) =>
            reg.endereco.toLowerCase().trim() === endereco.toLowerCase().trim() &&
            reg.data === data &&
            reg.id !== idAtual
        );
      },

      // Filtros e Busca
      setFiltros: (novosFiltros) => {
        set((state) => ({
          filtros: { ...state.filtros, ...novosFiltros },
          paginaAtual: 1, // Reset para primeira página ao filtrar
        }));
      },

      limparFiltros: () => {
        set({
          filtros: {
            busca: '',
            localidade: '',
            dataInicio: '',
            dataFim: '',
            tipoAnimal: 'todos',
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
              state.ordenacao.campo === campo && state.ordenacao.direcao === 'asc'
                ? 'desc'
                : 'asc',
          },
        }));
      },

      // Obter registros filtrados e ordenados
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
              reg.telefone.includes(buscaLower)
          );
        }

        // Filtrar por localidade específica
        if (filtros.localidade) {
          registrosFiltrados = registrosFiltrados.filter(
            (reg) => reg.localidade === filtros.localidade
          );
        }

        // Filtrar por período de data
        if (filtros.dataInicio) {
          registrosFiltrados = registrosFiltrados.filter(
            (reg) => reg.data >= filtros.dataInicio
          );
        }

        if (filtros.dataFim) {
          registrosFiltrados = registrosFiltrados.filter(
            (reg) => reg.data <= filtros.dataFim
          );
        }

        // Filtrar por tipo de animal
        if (filtros.tipoAnimal === 'caes') {
          registrosFiltrados = registrosFiltrados.filter(
            (reg) => reg.caesMacho > 0 || reg.caesFemea > 0
          );
        } else if (filtros.tipoAnimal === 'gatos') {
          registrosFiltrados = registrosFiltrados.filter(
            (reg) => reg.gatosMacho > 0 || reg.gatosFemea > 0
          );
        }

        // Aplicar ordenação
        registrosFiltrados.sort((a, b) => {
          let valorA = a[ordenacao.campo];
          let valorB = b[ordenacao.campo];

          // Tratamento especial para diferentes tipos de dados
          if (ordenacao.campo === 'data') {
            valorA = new Date(valorA);
            valorB = new Date(valorB);
          } else if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
          }

          if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
          if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
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
          stats.totalCaesMacho += reg.caesMacho;
          stats.totalCaesFemea += reg.caesFemea;
          stats.totalGatosMacho += reg.gatosMacho;
          stats.totalGatosFemea += reg.gatosFemea;

          // Por localidade
          if (!stats.porLocalidade[reg.localidade]) {
            stats.porLocalidade[reg.localidade] = {
              total: 0,
              caes: 0,
              gatos: 0,
              registros: 0,
            };
          }

          stats.porLocalidade[reg.localidade].caes += reg.caesMacho + reg.caesFemea;
          stats.porLocalidade[reg.localidade].gatos += reg.gatosMacho + reg.gatosFemea;
          stats.porLocalidade[reg.localidade].total +=
            reg.caesMacho + reg.caesFemea + reg.gatosMacho + reg.gatosFemea;
          stats.porLocalidade[reg.localidade].registros += 1;
        });

        stats.totalCaes = stats.totalCaesMacho + stats.totalCaesFemea;
        stats.totalGatos = stats.totalGatosMacho + stats.totalGatosFemea;

        set({ estatisticas: stats });
      },

      // Importar dados
      importarDados: (dados) => {
        try {
          const dadosParseados = typeof dados === 'string' ? JSON.parse(dados) : dados;

          if (Array.isArray(dadosParseados)) {
            set({ registros: dadosParseados });
            get().calcularEstatisticas();
            return { sucesso: true, mensagem: `${dadosParseados.length} registros importados com sucesso!` };
          }

          return { sucesso: false, mensagem: 'Formato de dados inválido' };
        } catch (error) {
          return { sucesso: false, mensagem: `Erro ao importar: ${error.message}` };
        }
      },

      // Limpar todos os dados
      limparTodosDados: () => {
        set({
          registros: [],
          registroEditando: null,
          paginaAtual: 1,
        });
        get().calcularEstatisticas();
      },

      // Backup
      criarBackup: () => {
        const { registros } = get();
        const backup = {
          data: new Date().toISOString(),
          versao: '1.0.0',
          registros,
        };

        set({ ultimoBackup: backup.data });
        return backup;
      },

      // Status offline
      setOffline: (status) => {
        set({ offline: status });
      },

      // Carregar dados de exemplo para testes
      carregarDadosExemplo: () => {
        const dadosExemplo = [
          {
            id: '1',
            urb: 'URG-001',
            localidade: 'Centro',
            endereco: 'Rua da Conceição, 123',
            caesMacho: 2,
            caesFemea: 1,
            gatosMacho: 0,
            gatosFemea: 1,
            data: '2024-01-15',
            tutor: 'Maria Silva Santos',
            telefone: '(21) 98765-4321',
            coordenadas: { lat: -22.7545, lng: -43.4510 },
            criadoEm: '2024-01-15T10:30:00.000Z',
            atualizadoEm: '2024-01-15T10:30:00.000Z',
          },
          {
            id: '2',
            urb: 'URG-002',
            localidade: 'Comércio',
            endereco: 'Av. Nilo Peçanha, 456',
            caesMacho: 1,
            caesFemea: 2,
            gatosMacho: 1,
            gatosFemea: 0,
            data: '2024-01-16',
            tutor: 'João Pedro Oliveira',
            telefone: '(21) 97654-3210',
            coordenadas: { lat: -22.7560, lng: -43.4520 },
            criadoEm: '2024-01-16T11:45:00.000Z',
            atualizadoEm: '2024-01-16T11:45:00.000Z',
          },
          {
            id: '3',
            urb: 'URG-003',
            localidade: 'Posse',
            endereco: 'Rua Irmã Beata, 789',
            caesMacho: 3,
            caesFemea: 2,
            gatosMacho: 2,
            gatosFemea: 3,
            data: '2024-01-17',
            tutor: 'Ana Paula Costa',
            telefone: '(21) 96543-2109',
            coordenadas: { lat: -22.7575, lng: -43.4530 },
            criadoEm: '2024-01-17T14:20:00.000Z',
            atualizadoEm: '2024-01-17T14:20:00.000Z',
          },
          {
            id: '4',
            urb: 'URG-004',
            localidade: 'Centro',
            endereco: 'Rua Coronel Bernardino de Melo, 321',
            caesMacho: 0,
            caesFemea: 1,
            gatosMacho: 1,
            gatosFemea: 2,
            data: '2024-01-18',
            tutor: 'Carlos Eduardo Souza',
            telefone: '(21) 95432-1098',
            coordenadas: { lat: -22.7550, lng: -43.4515 },
            criadoEm: '2024-01-18T09:15:00.000Z',
            atualizadoEm: '2024-01-18T09:15:00.000Z',
          },
          {
            id: '5',
            urb: 'URG-005',
            localidade: 'Comércio',
            endereco: 'Rua Ataíde Pimenta de Morais, 654',
            caesMacho: 2,
            caesFemea: 2,
            gatosMacho: 0,
            gatosFemea: 0,
            data: '2024-01-19',
            tutor: 'Fernanda Lima Rodrigues',
            telefone: '(21) 94321-0987',
            coordenadas: { lat: -22.7565, lng: -43.4525 },
            criadoEm: '2024-01-19T16:30:00.000Z',
            atualizadoEm: '2024-01-19T16:30:00.000Z',
          },
        ];

        set({ registros: dadosExemplo });
        get().calcularEstatisticas();
      },
    }),
    {
      name: 'nova-iguacu-storage',
      version: 1,
    }
  )
);

export default useStore;
