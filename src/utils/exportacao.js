// Utilitários de exportação de dados para o sistema de registro

import Papa from 'papaparse';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Exporta registros para CSV
 */
export const exportarParaCSV = (registros, nomeArquivo = 'registros-nova-iguacu') => {
  if (!registros || registros.length === 0) {
    alert('Não há registros para exportar');
    return false;
  }

  // Preparar dados para CSV
  const dadosParaExportar = registros.map((registro) => ({
    'URB': registro.urb,
    'Localidade': registro.localidade,
    'Endereço': registro.endereco,
    'Cães Macho': registro.caesMacho,
    'Cães Fêmea': registro.caesFemea,
    'Total Cães': registro.caesMacho + registro.caesFemea,
    'Gatos Macho': registro.gatosMacho,
    'Gatos Fêmea': registro.gatosFemea,
    'Total Gatos': registro.gatosMacho + registro.gatosFemea,
    'Total Animais': registro.caesMacho + registro.caesFemea + registro.gatosMacho + registro.gatosFemea,
    'Data': formatarDataParaExportacao(registro.data),
    'Tutor': registro.tutor,
    'Telefone': registro.telefone,
    'Latitude': registro.coordenadas?.lat || '',
    'Longitude': registro.coordenadas?.lng || '',
    'Data de Registro': formatarDataHoraParaExportacao(registro.criadoEm),
  }));

  // Converter para CSV usando PapaParse
  const csv = Papa.unparse(dadosParaExportar, {
    quotes: true,
    delimiter: ';', // Ponto e vírgula para compatibilidade com Excel em português
    header: true,
    encoding: 'UTF-8',
  });

  // Adicionar BOM para UTF-8 (necessário para Excel reconhecer acentos)
  const BOM = '\uFEFF';
  const csvComBOM = BOM + csv;

  // Criar blob e fazer download
  const blob = new Blob([csvComBOM], { type: 'text/csv;charset=utf-8;' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeCompleto = `${nomeArquivo}_${dataAtual}.csv`;

  downloadBlob(blob, nomeCompleto);

  return true;
};

/**
 * Exporta registros para Excel (formato CSV otimizado para Excel)
 */
export const exportarParaExcel = (registros, nomeArquivo = 'registros-nova-iguacu') => {
  return exportarParaCSV(registros, nomeArquivo);
};

/**
 * Exporta registros para JSON
 */
export const exportarParaJSON = (registros, nomeArquivo = 'registros-nova-iguacu') => {
  if (!registros || registros.length === 0) {
    alert('Não há registros para exportar');
    return false;
  }

  const dados = {
    exportadoEm: new Date().toISOString(),
    versao: '1.0.0',
    totalRegistros: registros.length,
    registros: registros,
  };

  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeCompleto = `${nomeArquivo}_${dataAtual}.json`;

  downloadBlob(blob, nomeCompleto);

  return true;
};

/**
 * Cria backup completo do sistema
 */
export const criarBackupCompleto = (store) => {
  const backup = {
    exportadoEm: new Date().toISOString(),
    versao: '1.0.0',
    sistema: 'Sistema de Registro - Nova Iguaçu',
    dados: {
      registros: store.registros,
      estatisticas: store.estatisticas,
      configuracoes: {
        filtros: store.filtros,
        ordenacao: store.ordenacao,
      },
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeArquivo = `backup-completo_${dataAtual}.json`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

/**
 * Exporta estatísticas para CSV
 */
export const exportarEstatisticas = (estatisticas) => {
  const dadosResumo = [
    { Métrica: 'Total de Registros', Valor: estatisticas.totalRegistros },
    { Métrica: 'Total de Cães Macho', Valor: estatisticas.totalCaesMacho },
    { Métrica: 'Total de Cães Fêmea', Valor: estatisticas.totalCaesFemea },
    { Métrica: 'Total de Cães', Valor: estatisticas.totalCaes },
    { Métrica: 'Total de Gatos Macho', Valor: estatisticas.totalGatosMacho },
    { Métrica: 'Total de Gatos Fêmea', Valor: estatisticas.totalGatosFemea },
    { Métrica: 'Total de Gatos', Valor: estatisticas.totalGatos },
    { Métrica: 'Total de Animais', Valor: estatisticas.totalCaes + estatisticas.totalGatos },
  ];

  const csv = Papa.unparse(dadosResumo, {
    quotes: true,
    delimiter: ';',
    header: true,
  });

  const BOM = '\uFEFF';
  const csvComBOM = BOM + csv;
  const blob = new Blob([csvComBOM], { type: 'text/csv;charset=utf-8;' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeArquivo = `estatisticas_${dataAtual}.csv`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

/**
 * Exporta dados por localidade para CSV
 */
export const exportarPorLocalidade = (estatisticas) => {
  const dadosPorLocalidade = Object.entries(estatisticas.porLocalidade).map(
    ([localidade, dados]) => ({
      'Localidade': localidade,
      'Total de Registros': dados.registros,
      'Total de Cães': dados.caes,
      'Total de Gatos': dados.gatos,
      'Total de Animais': dados.total,
      'Densidade Animal/Registro': (dados.total / dados.registros).toFixed(2),
    })
  );

  const csv = Papa.unparse(dadosPorLocalidade, {
    quotes: true,
    delimiter: ';',
    header: true,
  });

  const BOM = '\uFEFF';
  const csvComBOM = BOM + csv;
  const blob = new Blob([csvComBOM], { type: 'text/csv;charset=utf-8;' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeArquivo = `analise-localidade_${dataAtual}.csv`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

/**
 * Exporta dados para análise em SPSS
 */
export const exportarParaSPSS = (registros) => {
  if (!registros || registros.length === 0) {
    alert('Não há registros para exportar');
    return false;
  }

  // Preparar dados com variáveis categóricas codificadas
  const dadosParaSPSS = registros.map((registro, index) => ({
    'ID': index + 1,
    'URB': registro.urb,
    'LOCALIDADE': registro.localidade,
    'ENDERECO': registro.endereco,
    'CAES_M': registro.caesMacho,
    'CAES_F': registro.caesFemea,
    'GATOS_M': registro.gatosMacho,
    'GATOS_F': registro.gatosFemea,
    'TOTAL_CAES': registro.caesMacho + registro.caesFemea,
    'TOTAL_GATOS': registro.gatosMacho + registro.gatosFemea,
    'TOTAL_ANIMAIS': registro.caesMacho + registro.caesFemea + registro.gatosMacho + registro.gatosFemea,
    'DATA': registro.data,
    'TUTOR': registro.tutor,
    'TELEFONE': registro.telefone,
    'LAT': registro.coordenadas?.lat || '',
    'LONG': registro.coordenadas?.lng || '',
    'TEM_CAES': (registro.caesMacho + registro.caesFemea) > 0 ? 1 : 0,
    'TEM_GATOS': (registro.gatosMacho + registro.gatosFemea) > 0 ? 1 : 0,
    'TEM_AMBOS': ((registro.caesMacho + registro.caesFemea) > 0 && (registro.gatosMacho + registro.gatosFemea) > 0) ? 1 : 0,
  }));

  const csv = Papa.unparse(dadosParaSPSS, {
    quotes: true,
    delimiter: ',', // SPSS prefere vírgula
    header: true,
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeArquivo = `dados-spss_${dataAtual}.csv`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

/**
 * Exporta dados para análise geoespacial (GeoJSON)
 */
export const exportarParaGeoJSON = (registros) => {
  if (!registros || registros.length === 0) {
    alert('Não há registros para exportar');
    return false;
  }

  // Filtrar apenas registros com coordenadas
  const registrosComCoordenadas = registros.filter(
    (reg) => reg.coordenadas && reg.coordenadas.lat && reg.coordenadas.lng
  );

  if (registrosComCoordenadas.length === 0) {
    alert('Nenhum registro possui coordenadas geográficas');
    return false;
  }

  const geoJSON = {
    type: 'FeatureCollection',
    features: registrosComCoordenadas.map((registro) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [registro.coordenadas.lng, registro.coordenadas.lat], // GeoJSON usa [lng, lat]
      },
      properties: {
        id: registro.id,
        urb: registro.urb,
        localidade: registro.localidade,
        endereco: registro.endereco,
        caesMacho: registro.caesMacho,
        caesFemea: registro.caesFemea,
        gatosMacho: registro.gatosMacho,
        gatosFemea: registro.gatosFemea,
        totalAnimais: registro.caesMacho + registro.caesFemea + registro.gatosMacho + registro.gatosFemea,
        data: registro.data,
        tutor: registro.tutor,
      },
    })),
  };

  const json = JSON.stringify(geoJSON, null, 2);
  const blob = new Blob([json], { type: 'application/geo+json' });
  const dataAtual = format(new Date(), 'yyyy-MM-dd_HHmm');
  const nomeArquivo = `geojson_${dataAtual}.geojson`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

/**
 * Importa dados de arquivo CSV
 */
export const importarDeCSV = (arquivo) => {
  return new Promise((resolve, reject) => {
    Papa.parse(arquivo, {
      header: true,
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const registrosImportados = results.data.map((linha) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            urb: linha['URB'] || linha['urb'] || '',
            localidade: linha['Localidade'] || linha['localidade'] || '',
            endereco: linha['Endereço'] || linha['Endereco'] || linha['endereco'] || '',
            caesMacho: parseInt(linha['Cães Macho'] || linha['CAES_M'] || 0),
            caesFemea: parseInt(linha['Cães Fêmea'] || linha['CAES_F'] || 0),
            gatosMacho: parseInt(linha['Gatos Macho'] || linha['GATOS_M'] || 0),
            gatosFemea: parseInt(linha['Gatos Fêmea'] || linha['GATOS_F'] || 0),
            data: linha['Data'] || linha['DATA'] || '',
            tutor: linha['Tutor'] || linha['TUTOR'] || '',
            telefone: linha['Telefone'] || linha['TELEFONE'] || '',
            coordenadas: {
              lat: parseFloat(linha['Latitude'] || linha['LAT']) || null,
              lng: parseFloat(linha['Longitude'] || linha['LONG']) || null,
            },
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          }));

          resolve(registrosImportados);
        } catch (error) {
          reject(new Error('Erro ao processar arquivo CSV: ' + error.message));
        }
      },
      error: (error) => {
        reject(new Error('Erro ao ler arquivo CSV: ' + error.message));
      },
    });
  });
};

/**
 * Importa dados de arquivo JSON
 */
export const importarDeJSON = (arquivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);

        // Verificar se é um backup completo ou apenas registros
        let registros = [];
        if (Array.isArray(dados)) {
          registros = dados;
        } else if (dados.registros && Array.isArray(dados.registros)) {
          registros = dados.registros;
        } else if (dados.dados && dados.dados.registros) {
          registros = dados.dados.registros;
        }

        resolve(registros);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo JSON: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo JSON'));
    };

    reader.readAsText(arquivo);
  });
};

/**
 * Formata data para exportação (DD/MM/YYYY)
 */
const formatarDataParaExportacao = (data) => {
  if (!data) return '';
  try {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  } catch {
    return data;
  }
};

/**
 * Formata data e hora para exportação
 */
const formatarDataHoraParaExportacao = (dataISO) => {
  if (!dataISO) return '';
  try {
    return format(new Date(dataISO), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dataISO;
  }
};

/**
 * Faz download de um blob como arquivo
 */
const downloadBlob = (blob, nomeArquivo) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = nomeArquivo;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Limpar
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Gera relatório em texto simples
 */
export const gerarRelatorioTexto = (registros, estatisticas) => {
  const dataAtual = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  let texto = '='.repeat(70) + '\n';
  texto += 'RELATÓRIO DE DISTRIBUIÇÃO ESPACIAL DE ANIMAIS\n';
  texto += 'MUNICÍPIO DE NOVA IGUAÇU/RJ\n';
  texto += '='.repeat(70) + '\n\n';
  texto += `Data do Relatório: ${dataAtual}\n`;
  texto += `Total de Registros: ${estatisticas.totalRegistros}\n\n`;

  texto += '-'.repeat(70) + '\n';
  texto += 'RESUMO GERAL\n';
  texto += '-'.repeat(70) + '\n';
  texto += `Cães (Macho): ${estatisticas.totalCaesMacho}\n`;
  texto += `Cães (Fêmea): ${estatisticas.totalCaesFemea}\n`;
  texto += `Total de Cães: ${estatisticas.totalCaes}\n\n`;
  texto += `Gatos (Macho): ${estatisticas.totalGatosMacho}\n`;
  texto += `Gatos (Fêmea): ${estatisticas.totalGatosFemea}\n`;
  texto += `Total de Gatos: ${estatisticas.totalGatos}\n\n`;
  texto += `TOTAL GERAL DE ANIMAIS: ${estatisticas.totalCaes + estatisticas.totalGatos}\n\n`;

  texto += '-'.repeat(70) + '\n';
  texto += 'DISTRIBUIÇÃO POR LOCALIDADE\n';
  texto += '-'.repeat(70) + '\n';
  Object.entries(estatisticas.porLocalidade)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([localidade, dados]) => {
      texto += `\n${localidade}:\n`;
      texto += `  Registros: ${dados.registros}\n`;
      texto += `  Cães: ${dados.caes}\n`;
      texto += `  Gatos: ${dados.gatos}\n`;
      texto += `  Total: ${dados.total}\n`;
      texto += `  Densidade: ${(dados.total / dados.registros).toFixed(2)} animais/registro\n`;
    });

  texto += '\n' + '='.repeat(70) + '\n';
  texto += 'Desenvolvido para pesquisa veterinária - Nova Iguaçu/RJ\n';
  texto += '='.repeat(70) + '\n';

  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8;' });
  const nomeArquivo = `relatorio_${format(new Date(), 'yyyy-MM-dd_HHmm')}.txt`;

  downloadBlob(blob, nomeArquivo);

  return true;
};

export default {
  exportarParaCSV,
  exportarParaExcel,
  exportarParaJSON,
  criarBackupCompleto,
  exportarEstatisticas,
  exportarPorLocalidade,
  exportarParaSPSS,
  exportarParaGeoJSON,
  importarDeCSV,
  importarDeJSON,
  gerarRelatorioTexto,
};
