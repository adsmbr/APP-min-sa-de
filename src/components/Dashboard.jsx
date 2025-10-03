import React, { useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  MapPin,
  Dog,
  Cat,
  Calendar,
  Users,
  Home,
  Activity,
} from "lucide-react";
import useSupabaseStore from "../store/useSupabaseStore";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const {
    estatisticas,
    registros,
    getLocalidades,
    carregarRegistros,
    loading,
  } = useSupabaseStore();

  // Carregar registros do Supabase ao montar o componente
  useEffect(() => {
    carregarRegistros();
  }, [carregarRegistros]);

  // Cores do tema
  const COLORS = {
    primary: "#1e40af",
    secondary: "#059669",
    dogs: "#3b82f6",
    cats: "#10b981",
    male: "#60a5fa",
    female: "#f472b6",
  };

  // Preparar dados para gráfico de barras por localidade
  const dadosPorLocalidade = useMemo(() => {
    return Object.entries(estatisticas.porLocalidade)
      .map(([localidade, dados]) => ({
        localidade,
        cães: dados.caes,
        gatos: dados.gatos,
        total: dados.total,
        registros: dados.registros,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 localidades
  }, [estatisticas.porLocalidade]);

  // Dados para gráfico de pizza (Cães vs Gatos)
  const dadosTipoAnimal = [
    { name: "Cães", value: estatisticas.totalCaes, color: COLORS.dogs },
    { name: "Gatos", value: estatisticas.totalGatos, color: COLORS.cats },
  ];

  // Dados para gráfico de pizza (Macho vs Fêmea)
  const dadosGenero = [
    {
      name: "Machos",
      value: estatisticas.totalCaesMacho + estatisticas.totalGatosMacho,
      color: COLORS.male,
    },
    {
      name: "Fêmeas",
      value: estatisticas.totalCaesFemea + estatisticas.totalGatosFemea,
      color: COLORS.female,
    },
  ];

  // Calcular registros por mês
  const registrosPorMes = useMemo(() => {
    const meses = {};
    registros.forEach((reg) => {
      if (reg.data) {
        const [ano, mes] = reg.data.split("-");
        const chave = `${ano}-${mes}`;
        if (!meses[chave]) {
          meses[chave] = { registros: 0, animais: 0 };
        }
        meses[chave].registros += 1;
        meses[chave].animais +=
          reg.caesMacho + reg.caesFemea + reg.gatosMacho + reg.gatosFemea;
      }
    });

    return Object.entries(meses)
      .map(([mes, dados]) => ({
        mes: format(new Date(mes + "-01"), "MMM/yy", { locale: ptBR }),
        registros: dados.registros,
        animais: dados.animais,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [registros]);

  // Calcular densidade média
  const densidadeMedia = useMemo(() => {
    if (estatisticas.totalRegistros === 0) return 0;
    const totalAnimais = estatisticas.totalCaes + estatisticas.totalGatos;
    return (totalAnimais / estatisticas.totalRegistros).toFixed(2);
  }, [estatisticas]);

  // Cards de estatísticas
  const statsCards = [
    {
      title: "Total de Registros",
      value: estatisticas.totalRegistros,
      icon: MapPin,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total de Cães",
      value: estatisticas.totalCaes,
      subtitle: `M: ${estatisticas.totalCaesMacho} | F: ${estatisticas.totalCaesFemea}`,
      icon: Dog,
      color: "bg-primary",
      bgLight: "bg-primary-50",
      textColor: "text-primary-600",
    },
    {
      title: "Total de Gatos",
      value: estatisticas.totalGatos,
      subtitle: `M: ${estatisticas.totalGatosMacho} | F: ${estatisticas.totalGatosFemea}`,
      icon: Cat,
      color: "bg-secondary",
      bgLight: "bg-secondary-50",
      textColor: "text-secondary-600",
    },
    {
      title: "Total de Animais",
      value: estatisticas.totalCaes + estatisticas.totalGatos,
      subtitle: `Densidade média: ${densidadeMedia} animais/registro`,
      icon: Activity,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Localidades",
      value: getLocalidades().length,
      icon: Home,
      color: "bg-orange-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Último Registro",
      value:
        registros.length > 0
          ? format(
              new Date(registros[registros.length - 1].data),
              "dd/MM/yyyy",
              { locale: ptBR },
            )
          : "-",
      icon: Calendar,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner w-16 h-16 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  if (estatisticas.totalRegistros === 0) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-2xl mx-auto">
          <div className="text-gray-400 mb-4">
            <Activity className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Bem-vindo ao Sistema de Registro
          </h3>
          <p className="text-gray-600 mb-6">
            Ainda não há dados para exibir. Comece adicionando seu primeiro
            registro!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Nova Iguaçu/RJ</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Painel de Controle
          </h2>
          <p className="text-gray-600 mt-1">
            Visão geral dos dados coletados em Nova Iguaçu/RJ
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-primary hidden md:block" />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgLight} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Distribuição por Localidade */}
        <div className="card">
          <h3 className="card-header">
            <MapPin className="w-5 h-5" />
            Distribuição por Localidade
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorLocalidade}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="localidade"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="cães" fill={COLORS.dogs} name="Cães" />
                <Bar dataKey="gatos" fill={COLORS.cats} name="Gatos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Cães vs Gatos */}
        <div className="card">
          <h3 className="card-header">
            <Activity className="w-5 h-5" />
            Distribuição por Tipo de Animal
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosTipoAnimal}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosTipoAnimal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Dog className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">
                {estatisticas.totalCaes} Cães
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cat className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">
                {estatisticas.totalGatos} Gatos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Macho vs Fêmea */}
        <div className="card">
          <h3 className="card-header">
            <Users className="w-5 h-5" />
            Distribuição por Gênero
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGenero}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGenero.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline de Registros */}
        {registrosPorMes.length > 0 && (
          <div className="card">
            <h3 className="card-header">
              <Calendar className="w-5 h-5" />
              Evolução Temporal
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="registros"
                    fill={COLORS.primary}
                    name="Registros"
                  />
                  <Bar
                    dataKey="animais"
                    fill={COLORS.secondary}
                    name="Animais"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Resumo por Localidade */}
      <div className="card">
        <h3 className="card-header">
          <Home className="w-5 h-5" />
          Detalhamento por Localidade
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localidade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🐕 Cães
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  🐈 Gatos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Animais
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Densidade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosPorLocalidade.map((local, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {local.localidade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {local.registros}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-blue-600 font-medium">
                    {local.cães}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                    {local.gatos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="badge badge-primary font-bold">
                      {local.total}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    {(local.total / local.registros).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e Observações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-primary-50 border-l-4 border-primary">
          <h4 className="font-semibold text-gray-900 mb-2">
            📊 Localidade Mais Populosa
          </h4>
          {dadosPorLocalidade.length > 0 && (
            <p className="text-gray-700">
              <span className="font-bold">
                {dadosPorLocalidade[0].localidade}
              </span>{" "}
              com {dadosPorLocalidade[0].total} animais registrados
            </p>
          )}
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-secondary-50 border-l-4 border-secondary">
          <h4 className="font-semibold text-gray-900 mb-2">
            🎯 Densidade Animal Média
          </h4>
          <p className="text-gray-700">
            <span className="font-bold">{densidadeMedia}</span> animais por
            registro
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
