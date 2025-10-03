import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Calendar,
  MapPin,
  Dog,
  Cat,
  Phone,
  User,
} from "lucide-react";
import useSupabaseStore from "../store/useSupabaseStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import usePermissions from "../hooks/usePermissions";

const TabelaRegistros = ({ onEdit }) => {
  const {
    getRegistrosPaginados,
    getLocalidades,
    excluirRegistro,
    duplicarRegistro,
    setRegistroEditando,
    filtros,
    setFiltros,
    limparFiltros,
    paginaAtual,
    setPaginaAtual,
    registrosPorPagina,
    setRegistrosPorPagina,
    ordenacao,
    setOrdenacao,
    carregarRegistros,
    loading,
  } = useSupabaseStore();

  const { permissions } = usePermissions();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [registroParaExcluir, setRegistroParaExcluir] = useState(null);

  // Carregar registros do Supabase ao montar o componente
  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  const { registros, total, totalPaginas } = getRegistrosPaginados();
  const localidades = getLocalidades();

  const handleBuscaChange = (e) => {
    setFiltros({ busca: e.target.value });
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ [campo]: valor });
  };

  const handleOrdenacao = (campo) => {
    setOrdenacao(campo);
  };

  const handleEditar = (registro) => {
    setRegistroEditando(registro);
    if (onEdit) onEdit();
  };

  const handleDuplicar = (id) => {
    const novoDuplicado = duplicarRegistro(id);
    if (novoDuplicado) {
      alert("✅ Registro duplicado com sucesso! Você pode editá-lo agora.");
    }
  };

  const confirmarExclusao = (registro) => {
    setRegistroParaExcluir(registro);
  };

  const handleExcluir = () => {
    if (registroParaExcluir) {
      excluirRegistro(registroParaExcluir.id);
      setRegistroParaExcluir(null);
      alert("🗑️ Registro excluído com sucesso!");
    }
  };

  const cancelarExclusao = () => {
    setRegistroParaExcluir(null);
  };

  const formatarData = (dataString) => {
    try {
      const [ano, mes, dia] = dataString.split("-");
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataString;
    }
  };

  const renderIconeOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return ordenacao.direcao === "asc" ? (
      <ArrowUp className="w-4 h-4 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary" />
    );
  };

  const temFiltrosAtivos = () => {
    return (
      filtros.busca ||
      filtros.localidade ||
      filtros.dataInicio ||
      filtros.dataFim ||
      filtros.tipoAnimal !== "todos"
    );
  };

  return (
    <div className="space-y-4">
      {/* Header com Busca e Filtros */}
      <div className="card">
        <div className="space-y-4">
          {/* Barra de Busca */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por localidade, endereço, tutor, URG ou telefone..."
                value={filtros.busca}
                onChange={handleBuscaChange}
                className="input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`btn ${mostrarFiltros ? "btn-primary" : "btn-outline"} flex items-center gap-2`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {temFiltrosAtivos() && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Painel de Filtros Avançados */}
          {mostrarFiltros && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por Localidade */}
                <div>
                  <label className="label">
                    <MapPin className="w-4 h-4 inline" /> Localidade
                  </label>
                  <select
                    value={filtros.localidade}
                    onChange={(e) =>
                      handleFiltroChange("localidade", e.target.value)
                    }
                    className="input"
                  >
                    <option value="">Todas</option>
                    {localidades.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Data Início */}
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline" /> Data Início
                  </label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) =>
                      handleFiltroChange("dataInicio", e.target.value)
                    }
                    className="input"
                  />
                </div>

                {/* Filtro por Data Fim */}
                <div>
                  <label className="label">
                    <Calendar className="w-4 h-4 inline" /> Data Fim
                  </label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) =>
                      handleFiltroChange("dataFim", e.target.value)
                    }
                    className="input"
                  />
                </div>

                {/* Filtro por Tipo de Animal */}
                <div>
                  <label className="label">Tipo de Animal</label>
                  <select
                    value={filtros.tipoAnimal}
                    onChange={(e) =>
                      handleFiltroChange("tipoAnimal", e.target.value)
                    }
                    className="input"
                  >
                    <option value="todos">Todos</option>
                    <option value="caes">🐕 Apenas Cães</option>
                    <option value="gatos">🐈 Apenas Gatos</option>
                  </select>
                </div>
              </div>

              {/* Botão Limpar Filtros */}
              {temFiltrosAtivos() && (
                <div className="flex justify-end">
                  <button
                    onClick={limparFiltros}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Informações e Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{registros.length}</span> de{" "}
          <span className="font-semibold">{total}</span> registros
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Por página:</label>
          <select
            value={registrosPorPagina}
            onChange={(e) => setRegistrosPorPagina(parseInt(e.target.value))}
            className="input py-1 px-2 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Indicador de Loading */}
      {loading && (
        <div className="card text-center py-12">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando registros...</p>
        </div>
      )}

      {/* Tabela de Registros */}
      {!loading && registros.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum registro encontrado
          </h3>
          <p className="text-gray-500">
            {temFiltrosAtivos()
              ? "Tente ajustar os filtros de busca"
              : "Adicione um novo registro para começar"}
          </p>
        </div>
      ) : !loading ? (
        <>
          {/* Tabela Desktop */}
          <div className="hidden lg:block table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => handleOrdenacao("urb")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      URG {renderIconeOrdenacao("urb")}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleOrdenacao("localidade")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Localidade {renderIconeOrdenacao("localidade")}
                    </button>
                  </th>
                  <th>Endereço</th>
                  <th className="text-center">🐕 Cães</th>
                  <th className="text-center">🐈 Gatos</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">💉 Vacinado</th>
                  <th>
                    <button
                      onClick={() => handleOrdenacao("data")}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Data {renderIconeOrdenacao("data")}
                    </button>
                  </th>
                  <th>Tutor</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => {
                  const totalAnimais =
                    registro.caesMacho +
                    registro.caesFemea +
                    registro.gatosMacho +
                    registro.gatosFemea;

                  return (
                    <tr key={registro.id}>
                      <td className="font-medium">{registro.urb}</td>
                      <td>{registro.localidade}</td>
                      <td
                        className="max-w-xs truncate"
                        title={registro.endereco}
                      >
                        {registro.endereco}
                      </td>
                      <td className="text-center">
                        {registro.caesMacho + registro.caesFemea}
                        <span className="text-xs text-gray-500 ml-1">
                          (M:{registro.caesMacho} F:{registro.caesFemea})
                        </span>
                      </td>
                      <td className="text-center">
                        {registro.gatosMacho + registro.gatosFemea}
                        <span className="text-xs text-gray-500 ml-1">
                          (M:{registro.gatosMacho} F:{registro.gatosFemea})
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-primary">
                          {totalAnimais}
                        </span>
                      </td>
                      <td className="text-center">
                        {(() => {
                          const totalVacinados = (registro.caesMachoVacinados || 0) + 
                                                (registro.caesFemeaVacinadas || 0) + 
                                                (registro.gatosMachoVacinados || 0) + 
                                                (registro.gatosFemeaVacinadas || 0);
                          const percentual = totalAnimais > 0 ? Math.round((totalVacinados / totalAnimais) * 100) : 0;
                          
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`badge ${
                                percentual === 100 ? 'badge-success' : 
                                percentual > 0 ? 'badge-warning' : 'badge-error'
                              }`}>
                                {totalVacinados}/{totalAnimais}
                              </span>
                              <span className="text-xs text-gray-500">
                                {percentual}%
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td>{formatarData(registro.data)}</td>
                      <td className="max-w-xs truncate" title={registro.tutor}>
                        {registro.tutor}
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEditar(registro)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {permissions.canDuplicateRegistro && (
                            <button
                              onClick={() => handleDuplicar(registro.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                          {permissions.canDeleteRegistro && (
                            <button
                              onClick={() => confirmarExclusao(registro)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden space-y-3">
            {registros.map((registro) => {
              const totalAnimais =
                registro.caesMacho +
                registro.caesFemea +
                registro.gatosMacho +
                registro.gatosFemea;

              return (
                <div key={registro.id} className="card animate-fadeIn">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="badge badge-primary">
                          {registro.urb}
                        </span>
                        <h3 className="font-semibold text-gray-900 mt-1">
                          {registro.localidade}
                        </h3>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {totalAnimais}
                      </span>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">
                          {registro.endereco}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Dog className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {registro.caesMacho + registro.caesFemea}
                          </span>
                          <span className="text-xs text-gray-500">
                            (M:{registro.caesMacho} F:{registro.caesFemea})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Cat className="w-4 h-4 text-secondary" />
                          <span className="font-medium">
                            {registro.gatosMacho + registro.gatosFemea}
                          </span>
                          <span className="text-xs text-gray-500">
                            (M:{registro.gatosMacho} F:{registro.gatosFemea})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{registro.tutor}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {registro.telefone}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          💉 Status de Vacinação
                        </div>
                        
                        {(() => {
                          const totalVacinados = (registro.caesMachoVacinados || 0) + 
                                                (registro.caesFemeaVacinadas || 0) + 
                                                (registro.gatosMachoVacinados || 0) + 
                                                (registro.gatosFemeaVacinadas || 0);
                          const percentual = totalAnimais > 0 ? Math.round((totalVacinados / totalAnimais) * 100) : 0;
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Vacinados:</span>
                                <span className={`font-bold ${
                                  percentual === 100 ? 'text-green-600' : 
                                  percentual > 0 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {totalVacinados}/{totalAnimais} ({percentual}%)
                                </span>
                              </div>
                              
                              {/* Detalhamento por categoria */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {registro.caesMacho > 0 && (
                                  <div className="flex justify-between">
                                    <span>🐕♂️ Cães M:</span>
                                    <span>{registro.caesMachoVacinados || 0}/{registro.caesMacho}</span>
                                  </div>
                                )}
                                {registro.caesFemea > 0 && (
                                  <div className="flex justify-between">
                                    <span>🐕♀️ Cães F:</span>
                                    <span>{registro.caesFemeaVacinadas || 0}/{registro.caesFemea}</span>
                                  </div>
                                )}
                                {registro.gatosMacho > 0 && (
                                  <div className="flex justify-between">
                                    <span>🐈♂️ Gatos M:</span>
                                    <span>{registro.gatosMachoVacinados || 0}/{registro.gatosMacho}</span>
                                  </div>
                                )}
                                {registro.gatosFemea > 0 && (
                                  <div className="flex justify-between">
                                    <span>🐈♀️ Gatos F:</span>
                                    <span>{registro.gatosFemeaVacinadas || 0}/{registro.gatosFemea}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatarData(registro.data)}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditar(registro)}
                        className="flex-1 btn btn-outline btn-lg flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      {permissions.canDuplicateRegistro && (
                        <button
                          onClick={() => handleDuplicar(registro.id)}
                          className="btn btn-outline btn-lg"
                          title="Duplicar"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      )}
                      {permissions.canDeleteRegistro && (
                        <button
                          onClick={() => confirmarExclusao(registro)}
                          className="btn btn-danger btn-lg"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="btn btn-outline flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((page) => {
                // Mostrar primeira página, última página, página atual e adjacentes
                return (
                  page === 1 ||
                  page === totalPaginas ||
                  Math.abs(page - paginaAtual) <= 1
                );
              })
              .map((page, index, array) => {
                // Adicionar "..." entre números não consecutivos
                const showEllipsis = index > 0 && page - array[index - 1] > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setPaginaAtual(page)}
                      className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                        paginaAtual === page
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="btn btn-outline flex items-center gap-1"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {registroParaExcluir && (
        <div className="modal-backdrop" onClick={cancelarExclusao}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card max-w-md w-full mx-4 animate-fadeIn">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  Confirmar Exclusão
                </h3>

                <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p>
                    <span className="font-medium">URG:</span>{" "}
                    {registroParaExcluir.urb}
                  </p>
                  <p>
                    <span className="font-medium">Localidade:</span>{" "}
                    {registroParaExcluir.localidade}
                  </p>
                  <p>
                    <span className="font-medium">Endereço:</span>{" "}
                    {registroParaExcluir.endereco}
                  </p>
                </div>

                <p className="text-gray-600">
                  Esta ação não pode ser desfeita. Tem certeza que deseja
                  excluir este registro?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={cancelarExclusao}
                    className="flex-1 btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExcluir}
                    className="flex-1 btn btn-danger"
                  >
                    Sim, Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabelaRegistros;
