import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Map as MapIcon,
  Filter,
  CheckCircle,
  AlertCircle,
  BarChart3,
  MapPin,
  Dog,
  Cat,
} from "lucide-react";
import useSupabaseStore from "../store/useSupabaseStore";
import {
  exportarParaCSV,
  exportarParaJSON,
  exportarParaSPSS,
  exportarParaGeoJSON,
  exportarEstatisticas,
  exportarPorLocalidade,
  gerarRelatorioTexto,
  criarBackupCompleto,
} from "../utils/exportacao";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Componente para ajustar o centro do mapa
function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const Analises = () => {
  const { registros, estatisticas, carregarRegistros, loading } =
    useSupabaseStore();
  const store = useSupabaseStore();

  const [filtroMapa, setFiltroMapa] = useState("todos"); // todos, caes, gatos
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  // Carregar registros do Supabase ao montar o componente
  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  // Centro do mapa (Nova Iguaçu/RJ)
  const centroNovaIguacu = [-22.7592, -43.4509];

  // Filtrar registros com coordenadas válidas
  const registrosComCoordenadas = useMemo(() => {
    return registros.filter((reg) => {
      if (!reg.coordenadas || !reg.coordenadas.lat || !reg.coordenadas.lng) {
        return false;
      }

      // Aplicar filtro de tipo de animal
      if (filtroMapa === "caes") {
        return reg.caesMacho > 0 || reg.caesFemea > 0;
      } else if (filtroMapa === "gatos") {
        return reg.gatosMacho > 0 || reg.gatosFemea > 0;
      }

      return true;
    });
  }, [registros, filtroMapa]);

  // Calcular centro médio dos marcadores
  const centroCalculado = useMemo(() => {
    if (registrosComCoordenadas.length === 0) return centroNovaIguacu;

    const somaLat = registrosComCoordenadas.reduce(
      (acc, reg) => acc + reg.coordenadas.lat,
      0,
    );
    const somaLng = registrosComCoordenadas.reduce(
      (acc, reg) => acc + reg.coordenadas.lng,
      0,
    );

    return [
      somaLat / registrosComCoordenadas.length,
      somaLng / registrosComCoordenadas.length,
    ];
  }, [registrosComCoordenadas]);

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: "", texto: "" }), 4000);
  };

  const handleExportar = async (tipo) => {
    setExportando(true);
    try {
      let sucesso = false;

      switch (tipo) {
        case "csv":
          sucesso = exportarParaCSV(registros);
          break;
        case "excel":
          sucesso = exportarParaCSV(registros, "registros-excel");
          break;
        case "json":
          sucesso = exportarParaJSON(registros);
          break;
        case "spss":
          sucesso = exportarParaSPSS(registros);
          break;
        case "geojson":
          sucesso = exportarParaGeoJSON(registros);
          break;
        case "estatisticas":
          sucesso = exportarEstatisticas(estatisticas);
          break;
        case "localidade":
          sucesso = exportarPorLocalidade(estatisticas);
          break;
        case "relatorio":
          sucesso = gerarRelatorioTexto(registros, estatisticas);
          break;
        case "backup":
          sucesso = criarBackupCompleto(store);
          break;
        default:
          break;
      }

      if (sucesso) {
        mostrarMensagem("sucesso", "✅ Arquivo exportado com sucesso!");
      }
    } catch (error) {
      mostrarMensagem("erro", "❌ Erro ao exportar: " + error.message);
    } finally {
      setExportando(false);
    }
  };

  const opcoesExportacao = [
    {
      id: "csv",
      titulo: "Exportar CSV",
      descricao: "Formato compatível com Excel",
      icone: FileSpreadsheet,
      cor: "text-green-600",
      bgHover: "hover:bg-green-50",
    },
    {
      id: "json",
      titulo: "Exportar JSON",
      descricao: "Backup completo dos dados",
      icone: FileJson,
      cor: "text-blue-600",
      bgHover: "hover:bg-blue-50",
    },
    {
      id: "spss",
      titulo: "Exportar SPSS",
      descricao: "Formato para análise estatística",
      icone: BarChart3,
      cor: "text-purple-600",
      bgHover: "hover:bg-purple-50",
    },
    {
      id: "geojson",
      titulo: "Exportar GeoJSON",
      descricao: "Análise geoespacial",
      icone: MapIcon,
      cor: "text-orange-600",
      bgHover: "hover:bg-orange-50",
    },
    {
      id: "estatisticas",
      titulo: "Estatísticas",
      descricao: "Resumo geral em CSV",
      icone: BarChart3,
      cor: "text-indigo-600",
      bgHover: "hover:bg-indigo-50",
    },
    {
      id: "localidade",
      titulo: "Por Localidade",
      descricao: "Análise por bairro",
      icone: MapPin,
      cor: "text-pink-600",
      bgHover: "hover:bg-pink-50",
    },
    {
      id: "relatorio",
      titulo: "Relatório Texto",
      descricao: "Relatório em formato TXT",
      icone: FileText,
      cor: "text-gray-600",
      bgHover: "hover:bg-gray-50",
    },
    {
      id: "backup",
      titulo: "Backup Completo",
      descricao: "Sistema completo em JSON",
      icone: Download,
      cor: "text-red-600",
      bgHover: "hover:bg-red-50",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner w-16 h-16 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Análises e Exportações
          </h2>
          <p className="text-gray-600 mt-1">
            Visualização geográfica e exportação de dados
          </p>
        </div>
        <MapIcon className="w-8 h-8 text-primary hidden md:block" />
      </div>

      {/* Mensagens */}
      {mensagem.texto && (
        <div
          className={`animate-fadeIn rounded-lg p-4 flex items-center gap-3 ${
            mensagem.tipo === "sucesso"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {mensagem.tipo === "sucesso" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{mensagem.texto}</span>
        </div>
      )}

      {/* Mapa Interativo */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-header">
            <MapPin className="w-5 h-5" />
            Distribuição Geográfica
          </h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`btn btn-sm ${mostrarFiltros ? "btn-primary" : "btn-outline"}`}
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {/* Filtros do Mapa */}
        {mostrarFiltros && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 animate-fadeIn">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFiltroMapa("todos")}
                className={`btn ${
                  filtroMapa === "todos" ? "btn-primary" : "btn-outline"
                }`}
              >
                Todos os Animais
              </button>
              <button
                onClick={() => setFiltroMapa("caes")}
                className={`btn ${
                  filtroMapa === "caes" ? "btn-primary" : "btn-outline"
                } flex items-center gap-2`}
              >
                <Dog className="w-4 h-4" />
                Apenas Cães
              </button>
              <button
                onClick={() => setFiltroMapa("gatos")}
                className={`btn ${
                  filtroMapa === "gatos" ? "btn-secondary" : "btn-outline"
                } flex items-center gap-2`}
              >
                <Cat className="w-4 h-4" />
                Apenas Gatos
              </button>
            </div>
          </div>
        )}

        {/* Estatísticas do Mapa */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Total com GPS</p>
            <p className="text-2xl font-bold text-primary">
              {registrosComCoordenadas.length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Sem GPS</p>
            <p className="text-2xl font-bold text-gray-700">
              {registros.length - registrosComCoordenadas.length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Cobertura</p>
            <p className="text-2xl font-bold text-purple-600">
              {registros.length > 0
                ? Math.round(
                    (registrosComCoordenadas.length / registros.length) * 100,
                  )
                : 0}
              %
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Animais Mapeados</p>
            <p className="text-2xl font-bold text-orange-600">
              {registrosComCoordenadas.reduce(
                (acc, reg) =>
                  acc +
                  reg.caesMacho +
                  reg.caesFemea +
                  reg.gatosMacho +
                  reg.gatosFemea,
                0,
              )}
            </p>
          </div>
        </div>

        {/* Container do Mapa */}
        {registrosComCoordenadas.length > 0 ? (
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
            <MapContainer
              center={centroCalculado}
              zoom={13}
              style={{ height: "500px", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={centroCalculado} />
              {registrosComCoordenadas.map((registro) => (
                <Marker
                  key={registro.id}
                  position={[
                    registro.coordenadas.lat,
                    registro.coordenadas.lng,
                  ]}
                >
                  <Popup>
                    <div className="space-y-2 p-2">
                      <h4 className="font-bold text-gray-900">
                        {registro.localidade}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {registro.endereco}
                      </p>
                      <div className="border-t pt-2 mt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">🐕 Cães:</span>{" "}
                            {registro.caesMacho + registro.caesFemea}
                          </div>
                          <div>
                            <span className="font-medium">🐈 Gatos:</span>{" "}
                            {registro.gatosMacho + registro.gatosFemea}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Tutor: {registro.tutor}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum registro com coordenadas GPS
            </h3>
            <p className="text-gray-500">
              Use o botão &quot;Capturar GPS&quot; no formulário de registro
              para adicionar coordenadas geográficas
            </p>
          </div>
        )}
      </div>

      {/* Opções de Exportação */}
      <div className="card">
        <h3 className="card-header border-b border-gray-200 pb-4 mb-4">
          <Download className="w-5 h-5" />
          Exportar Dados
        </h3>

        {registros.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhum dado disponível para exportação</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {opcoesExportacao.map((opcao) => {
              const Icone = opcao.icone;
              return (
                <button
                  key={opcao.id}
                  onClick={() => handleExportar(opcao.id)}
                  disabled={exportando}
                  className={`p-4 rounded-lg border-2 border-gray-200 ${opcao.bgHover} transition-all text-left hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${opcao.cor}`}>
                      <Icone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {opcao.titulo}
                      </h4>
                      <p className="text-xs text-gray-600">{opcao.descricao}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Informação sobre exportações */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Sobre as Exportações
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• CSV/Excel: Ideal para planilhas e análises básicas</li>
            <li>• JSON: Backup completo com todos os dados</li>
            <li>
              • SPSS: Formato específico para análises estatísticas avançadas
            </li>
            <li>• GeoJSON: Para sistemas de informação geográfica (SIG)</li>
            <li>• Backup Completo: Inclui todas as configurações do sistema</li>
          </ul>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="card">
        <h3 className="card-header border-b border-gray-200 pb-4 mb-4">
          <BarChart3 className="w-5 h-5" />
          Resumo Estatístico
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Total de Registros
            </p>
            <p className="text-3xl font-bold text-blue-900">
              {estatisticas.totalRegistros}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium mb-1">
              Total de Animais
            </p>
            <p className="text-3xl font-bold text-green-900">
              {estatisticas.totalCaes + estatisticas.totalGatos}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-sm text-purple-800 font-medium mb-1">
              Localidades
            </p>
            <p className="text-3xl font-bold text-purple-900">
              {Object.keys(estatisticas.porLocalidade).length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium mb-1">
              Densidade Média
            </p>
            <p className="text-3xl font-bold text-orange-900">
              {estatisticas.totalRegistros > 0
                ? (
                    (estatisticas.totalCaes + estatisticas.totalGatos) /
                    estatisticas.totalRegistros
                  ).toFixed(1)
                : 0}
            </p>
            <p className="text-xs text-orange-700 mt-1">animais/registro</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analises;
