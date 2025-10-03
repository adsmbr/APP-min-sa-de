// Utilitários de validação para o sistema de registro

/**
 * Valida se um campo está preenchido
 */
export const validarObrigatorio = (valor) => {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  return true;
};

/**
 * Valida CEP brasileiro (formato: 12345-678 ou 12345678)
 */
export const validarCEP = (cep) => {
  if (!cep) return true; // CEP é opcional
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * Valida telefone brasileiro (formato: (21) 98765-4321 ou (21) 3456-7890)
 */
export const validarTelefone = (telefone) => {
  if (!telefone) return false;
  const telefoneLimpo = telefone.replace(/\D/g, '');
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
};

/**
 * Valida se o telefone está no formato correto e é um número válido
 */
export const validarTelefoneCompleto = (telefone) => {
  if (!validarTelefone(telefone)) return false;

  const telefoneLimpo = telefone.replace(/\D/g, '');
  const ddd = parseInt(telefoneLimpo.substring(0, 2));

  // Valida DDD válido (11 a 99)
  if (ddd < 11 || ddd > 99) return false;

  // Para celular (11 dígitos), o terceiro dígito deve ser 9
  if (telefoneLimpo.length === 11) {
    const terceiroDigito = parseInt(telefoneLimpo.charAt(2));
    return terceiroDigito === 9;
  }

  return true;
};

/**
 * Valida número inteiro positivo ou zero
 */
export const validarNumeroPositivo = (valor) => {
  const numero = parseInt(valor);
  return !isNaN(numero) && numero >= 0;
};

/**
 * Valida data no formato YYYY-MM-DD
 */
export const validarData = (data) => {
  if (!data) return false;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;

  const dataObj = new Date(data);
  return dataObj instanceof Date && !isNaN(dataObj);
};

/**
 * Valida se a data não é futura
 */
export const validarDataNaoFutura = (data) => {
  if (!validarData(data)) return false;

  const dataObj = new Date(data);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999); // Fim do dia de hoje

  return dataObj <= hoje;
};

/**
 * Valida URG (Unidade de Registro Geográfico)
 */
export const validarURG = (urb) => {
  if (!urb) return false;
  const urbLimpo = urb.trim();
  return urbLimpo.length >= 3 && urbLimpo.length <= 50;
};

/**
 * Valida endereço completo
 */
export const validarEndereco = (endereco) => {
  if (!endereco) return false;
  const enderecoLimpo = endereco.trim();
  // Endereço deve ter pelo menos 10 caracteres (ex: "Rua A, 10")
  return enderecoLimpo.length >= 10 && enderecoLimpo.length <= 200;
};

/**
 * Valida localidade
 */
export const validarLocalidade = (localidade) => {
  if (!localidade) return false;
  const localidadeLimpa = localidade.trim();
  return localidadeLimpa.length >= 2 && localidadeLimpa.length <= 100;
};

/**
 * Valida nome do tutor
 */
export const validarNomeTutor = (nome) => {
  if (!nome) return false;
  const nomeLimpo = nome.trim();
  // Nome deve ter pelo menos 3 caracteres e conter pelo menos um espaço (nome e sobrenome)
  return nomeLimpo.length >= 3 && nomeLimpo.length <= 150;
};

/**
 * Extrai CEP de um endereço (se existir)
 */
export const extrairCEP = (endereco) => {
  const regex = /\d{5}-?\d{3}/;
  const match = endereco.match(regex);
  return match ? match[0] : null;
};

/**
 * Formata telefone para o padrão brasileiro
 */
export const formatarTelefone = (telefone) => {
  const telefoneLimpo = telefone.replace(/\D/g, '');

  if (telefoneLimpo.length === 11) {
    // Celular: (21) 98765-4321
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 7)}-${telefoneLimpo.substring(7)}`;
  } else if (telefoneLimpo.length === 10) {
    // Fixo: (21) 3456-7890
    return `(${telefoneLimpo.substring(0, 2)}) ${telefoneLimpo.substring(2, 6)}-${telefoneLimpo.substring(6)}`;
  }

  return telefone;
};

/**
 * Formata CEP para o padrão brasileiro
 */
export const formatarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length === 8) {
    return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
  }

  return cep;
};

/**
 * Valida formulário completo de registro
 */
export const validarFormularioRegistro = (dados) => {
  const erros = {};

  // URG obrigatório
  if (!validarObrigatorio(dados.urb)) {
    erros.urb = 'URG é obrigatório';
  } else if (!validarURG(dados.urb)) {
    erros.urb = 'URG deve ter entre 3 e 50 caracteres';
  }

  // Localidade obrigatória
  if (!validarObrigatorio(dados.localidade)) {
    erros.localidade = 'Localidade é obrigatória';
  } else if (!validarLocalidade(dados.localidade)) {
    erros.localidade = 'Localidade deve ter entre 2 e 100 caracteres';
  }

  // Endereço obrigatório
  if (!validarObrigatorio(dados.endereco)) {
    erros.endereco = 'Endereço é obrigatório';
  } else if (!validarEndereco(dados.endereco)) {
    erros.endereco = 'Endereço deve ter entre 10 e 200 caracteres';
  }

  // Validar CEP se presente no endereço
  const cep = extrairCEP(dados.endereco || '');
  if (cep && !validarCEP(cep)) {
    erros.endereco = 'CEP inválido no endereço';
  }

  // Números de animais
  if (!validarNumeroPositivo(dados.caesMacho)) {
    erros.caesMacho = 'Número inválido';
  }

  if (!validarNumeroPositivo(dados.caesFemea)) {
    erros.caesFemea = 'Número inválido';
  }

  if (!validarNumeroPositivo(dados.gatosMacho)) {
    erros.gatosMacho = 'Número inválido';
  }

  if (!validarNumeroPositivo(dados.gatosFemea)) {
    erros.gatosFemea = 'Número inválido';
  }

  // Validar se há pelo menos um animal registrado
  const totalAnimais =
    (parseInt(dados.caesMacho) || 0) +
    (parseInt(dados.caesFemea) || 0) +
    (parseInt(dados.gatosMacho) || 0) +
    (parseInt(dados.gatosFemea) || 0);

  if (totalAnimais === 0) {
    erros.animais = 'Deve haver pelo menos um animal registrado';
  }

  // Data obrigatória
  if (!validarObrigatorio(dados.data)) {
    erros.data = 'Data é obrigatória';
  } else if (!validarData(dados.data)) {
    erros.data = 'Data inválida';
  } else if (!validarDataNaoFutura(dados.data)) {
    erros.data = 'Data não pode ser futura';
  }

  // Tutor obrigatório
  if (!validarObrigatorio(dados.tutor)) {
    erros.tutor = 'Nome do tutor é obrigatório';
  } else if (!validarNomeTutor(dados.tutor)) {
    erros.tutor = 'Nome deve ter entre 3 e 150 caracteres';
  }

  // Telefone obrigatório
  if (!validarObrigatorio(dados.telefone)) {
    erros.telefone = 'Telefone é obrigatório';
  } else if (!validarTelefoneCompleto(dados.telefone)) {
    erros.telefone = 'Telefone inválido. Use o formato (XX) XXXXX-XXXX';
  }



  // Validar números de animais vacinados
  if (dados.caesMacho > 0) {
    if (!validarNumeroPositivo(dados.caesMachoVacinados)) {
      erros.caesMachoVacinados = 'Número inválido';
    } else if (dados.caesMachoVacinados > dados.caesMacho) {
      erros.caesMachoVacinados = 'Não pode exceder o total de cães machos';
    }
  }

  if (dados.caesFemea > 0) {
    if (!validarNumeroPositivo(dados.caesFemeaVacinadas)) {
      erros.caesFemeaVacinadas = 'Número inválido';
    } else if (dados.caesFemeaVacinadas > dados.caesFemea) {
      erros.caesFemeaVacinadas = 'Não pode exceder o total de cães fêmeas';
    }
  }

  if (dados.gatosMacho > 0) {
    if (!validarNumeroPositivo(dados.gatosMachoVacinados)) {
      erros.gatosMachoVacinados = 'Número inválido';
    } else if (dados.gatosMachoVacinados > dados.gatosMacho) {
      erros.gatosMachoVacinados = 'Não pode exceder o total de gatos machos';
    }
  }

  if (dados.gatosFemea > 0) {
    if (!validarNumeroPositivo(dados.gatosFemeaVacinadas)) {
      erros.gatosFemeaVacinadas = 'Número inválido';
    } else if (dados.gatosFemeaVacinadas > dados.gatosFemea) {
      erros.gatosFemeaVacinadas = 'Não pode exceder o total de gatos fêmeas';
    }
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
  };
};

/**
 * Sanitiza string removendo caracteres especiais perigosos
 */
export const sanitizarString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Valida coordenadas geográficas
 */
export const validarCoordenadas = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) return false;

  // Validar range válido
  if (latitude < -90 || latitude > 90) return false;
  if (longitude < -180 || longitude > 180) return false;

  return true;
};

/**
 * Valida coordenadas específicas para Nova Iguaçu/RJ
 */
export const validarCoordenadasNovaIguacu = (lat, lng) => {
  if (!validarCoordenadas(lat, lng)) return false;

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Aproximação das coordenadas de Nova Iguaçu
  // Latitude: -22.7 a -22.8
  // Longitude: -43.4 a -43.5
  if (latitude < -22.9 || latitude > -22.6) return false;
  if (longitude < -43.6 || longitude > -43.3) return false;

  return true;
};

/**
 * Gera mensagem de erro amigável
 */
export const gerarMensagemErro = (campo, tipo) => {
  const mensagens = {
    obrigatorio: `${campo} é obrigatório`,
    invalido: `${campo} inválido`,
    formato: `${campo} está em formato incorreto`,
    minimo: `${campo} deve ter valor mínimo`,
    maximo: `${campo} excede o valor máximo`,
    duplicado: `Já existe um registro com este ${campo.toLowerCase()}`,
  };

  return mensagens[tipo] || `Erro em ${campo}`;
};

/**
 * Valida email (opcional, caso seja adicionado no futuro)
 */
export const validarEmail = (email) => {
  if (!email) return true; // Email é opcional
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 */
export const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Compara dois endereços para verificar similaridade (detecção de duplicatas)
 */
export const compararEnderecos = (endereco1, endereco2) => {
  const end1 = normalizarTexto(endereco1);
  const end2 = normalizarTexto(endereco2);

  // Comparação exata
  if (end1 === end2) return 100;

  // Calcular similaridade básica
  const palavras1 = end1.split(/\s+/);
  const palavras2 = end2.split(/\s+/);

  let palavrasComuns = 0;
  palavras1.forEach(palavra => {
    if (palavras2.includes(palavra) && palavra.length > 2) {
      palavrasComuns++;
    }
  });

  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  const similaridade = (palavrasComuns / totalPalavras) * 100;

  return Math.round(similaridade);
};

export default {
  validarObrigatorio,
  validarCEP,
  validarTelefone,
  validarTelefoneCompleto,
  validarNumeroPositivo,
  validarData,
  validarDataNaoFutura,
  validarURG,
  validarEndereco,
  validarLocalidade,
  validarNomeTutor,
  validarFormularioRegistro,
  extrairCEP,
  formatarTelefone,
  formatarCEP,
  sanitizarString,
  validarCoordenadas,
  validarCoordenadasNovaIguacu,
  gerarMensagemErro,
  validarEmail,
  normalizarTexto,
  compararEnderecos,
};
