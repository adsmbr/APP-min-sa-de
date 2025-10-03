import React, { useState, useEffect } from "react";
import {
  MapPin,
  Save,
  X,
  Loader2,
  AlertCircle,
  Check,
  LocateFixed,
  Map,
  Calendar,
  User,
  Phone,
} from "lucide-react";
import { logger } from "../utils/logger";
import InputMask from "react-input-mask";
import useSupabaseStore from "../store/useSupabaseStore";
import {
  validarFormularioRegistro,
  formatarTelefone,
  sanitizarString,
} from "../utils/validacao";

const FormularioRegistro = ({ onSuccess, onCancel }) => {
  const {
    adicionarRegistro,
    atualizarRegistro,
    registroEditando,
    cancelarEdicao,
    verificarDuplicata,
    getLocalidades,
  } = useSupabaseStore();

  const localidadesExistentes = getLocalidades();

  // Estado inicial do formulário
  const estadoInicial = {
    urb: "",
    localidade: "",
    endereco: "",
    latitude: "", // Adicionado para geolocalização
    longitude: "", // Adicionado para geolocalização
    caesMacho: 0,
    caesFemea: 0,
    gatosMacho: 0,
    gatosFemea: 0,
    data: new Date().toISOString().split("T")[0],
    tutor: "",
    telefone: "",
  };

  const [formData, setFormData] = useState(estadoInicial);

  const [erros, setErros] = useState({});
  const [tocado, setTocado] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [avisosDuplicata, setAvisosDuplicata] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false); // Novo estado para carregamento do GPS
  const [locationError, setLocationError] = useState(null); // Novo estado para erros de geolocalização
  const [showManualCoords, setShowManualCoords] = useState(false); // Novo estado para mostrar campos manuais

  const [sugestoesLocalidade, setSugestoesLocalidade] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Carregar dados se estiver editando
  useEffect(() => {
    if (registroEditando) {
      setFormData(registroEditando);
    }
  }, [registroEditando]);

  // Validação em tempo real
  useEffect(() => {
    if (Object.keys(tocado).length > 0) {
      const resultado = validarFormularioRegistro(formData);
      let errosAtuais = { ...resultado.erros };

      // Validação de Latitude
      if (tocado.latitude && formData.latitude !== "") {
        const lat = parseFloat(formData.latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errosAtuais.latitude =
            "Latitude inválida (ex: -23.55052). Deve ser um número entre -90 e 90.";
        } else {
          delete errosAtuais.latitude;
        }
      } else if (tocado.latitude && formData.latitude === "") {
        // Latitude é opcional, então vazia não é um erro se tocada e não preenchida
        delete errosAtuais.latitude;
      }

      // Validação de Longitude
      if (tocado.longitude && formData.longitude !== "") {
        const lon = parseFloat(formData.longitude);
        if (isNaN(lon) || lon < -180 || lon > 180) {
          errosAtuais.longitude =
            "Longitude inválida (ex: -46.633308). Deve ser um número entre -180 e 180.";
        } else {
          delete errosAtuais.longitude;
        }
      } else if (tocado.longitude && formData.longitude === "") {
        // Longitude é opcional, então vazia não é um erro se tocada e não preenchida
        delete errosAtuais.longitude;
      }

      setErros(errosAtuais);
    }
  }, [formData, tocado]);

  // Verificar duplicatas quando endereço ou data mudam
  useEffect(() => {
    if (formData.endereco && formData.data && tocado.endereco) {
      const isDuplicata = verificarDuplicata(
        formData.endereco,
        formData.data,
        registroEditando?.id,
      );

      if (isDuplicata) {
        setAvisosDuplicata(
          "⚠️ Atenção: Já existe um registro com este endereço e data!",
        );
      } else {
        setAvisosDuplicata("");
      }
    }
  }, [
    formData.endereco,
    formData.data,
    tocado.endereco,
    verificarDuplicata,
    registroEditando,
  ]);

  // Auto-complete para localidades
  useEffect(() => {
    if (formData.localidade && formData.localidade.length >= 2) {
      const sugestoes = localidadesExistentes.filter((loc) =>
        loc.toLowerCase().includes(formData.localidade.toLowerCase()),
      );
      setSugestoesLocalidade(sugestoes);
    } else {
      setSugestoesLocalidade([]);
    }
  }, [formData.localidade, localidadesExistentes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorProcessado = value;

    // Processar números
    if (["caesMacho", "caesFemea", "gatosMacho", "gatosFemea"].includes(name)) {
      valorProcessado = parseInt(value) || 0;
      if (valorProcessado < 0) valorProcessado = 0;
    }

    // Sanitizar strings (exceto endereço e tutor que precisam de espaços)
    if (
      typeof valorProcessado === "string" &&
      name !== "endereco" &&
      name !== "tutor"
    ) {
      valorProcessado = sanitizarString(valorProcessado);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: valorProcessado,
    }));
  };

  const handleBlur = (campo) => {
    setTocado((prev) => ({
      ...prev,
      [campo]: true,
    }));
  };

  const handleLocalidadeSelect = (localidade) => {
    setFormData((prev) => ({ ...prev, localidade }));
    setMostrarSugestoes(false);
    setSugestoesLocalidade([]);
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
          setGettingLocation(false);
          setShowManualCoords(true); // Exibir campos manuais após obter localização
        },
        (error) => {
          logger.error("Erro ao obter localização:", error);
          let errorMessage = "Não foi possível obter a localização. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Permissão negada pelo usuário.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Informação de localização indisponível.";
              break;
            case error.TIMEOUT:
              errorMessage +=
                "Tempo limite excedido ao tentar obter localização.";
              break;
            default:
              errorMessage += "Erro desconhecido.";
              break;
          }
          setLocationError(errorMessage + " Por favor, insira manualmente.");
          setGettingLocation(false);
          setShowManualCoords(true); // Sempre exibir campos manuais em caso de erro
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setLocationError(
        "Geolocalização não é suportada por este navegador. Por favor, insira manualmente.",
      );
      setGettingLocation(false);
      setShowManualCoords(true);
    }
    // Marcar campos como tocados para validação inicial se a opção manual for forçada
    setTocado((prev) => ({ ...prev, latitude: true, longitude: true }));
  };

  const handleManualCoordChange = (e) => {
    const { name, value } = e.target;
    // Permite dígitos, ponto decimal e sinal de menos
    const numericValue = value.replace(/[^0-9.-]/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
    // Marcar campo como tocado para ativar validação em tempo real
    setTocado((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos os campos como tocados
    const todosCampos = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTocado(todosCampos);

    // Validar formulário
    const resultado = validarFormularioRegistro(formData);

    if (!resultado.valido) {
      setErros(resultado.erros);
      // Scroll para o primeiro erro
      const primeiroErro = document.querySelector(".input-error");
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return; // Sair da função se a validação falhar
    }

    setSalvando(true);

    try {
      // Processar dados antes de salvar
      const dadosParaSalvar = {
        ...formData,
        telefone: formatarTelefone(formData.telefone),
      };

      if (registroEditando) {
        await atualizarRegistro(registroEditando.id, dadosParaSalvar);
        setMensagemSucesso("✅ Registro atualizado com sucesso!");
      } else {
        await adicionarRegistro(dadosParaSalvar);
        setMensagemSucesso("✅ Registro adicionado com sucesso!");
      }

      // Resetar formulário
      setTimeout(() => {
        handleLimpar();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      alert("Erro ao salvar registro: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleLimpar = () => {
    setFormData(estadoInicial);
    setErros({});
    setTocado({});
    setMensagemSucesso("");
    setAvisosDuplicata("");
    if (registroEditando) {
      cancelarEdicao();
    }
  };

  const handleCancelar = () => {
    handleLimpar();
    if (onCancel) onCancel();
  };

  const totalAnimais =
    formData.caesMacho +
    formData.caesFemea +
    formData.gatosMacho +
    formData.gatosFemea;

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Header */}
      <div className="card-header border-b border-gray-200 pb-4">
        <MapPin className="w-6 h-6 text-primary" />
        <span>{registroEditando ? "Editar Registro" : "Novo Registro"}</span>
      </div>

      {/* Mensagens de Sucesso */}
      {mensagemSucesso && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 animate-fadeIn flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-medium">{mensagemSucesso}</span>
        </div>
      )}

      {/* Avisos de Duplicata */}
      {avisosDuplicata && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 animate-fadeIn flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{avisosDuplicata}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Identificação */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Identificação da Área
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* URB */}
            <div className="form-group">
              <label htmlFor="urb" className="label label-required">
                    URG (Unidade de Registro Geográfico)
              </label>
              <input
                type="text"
                id="urb"
                name="urb"
                value={formData.urb}
                onChange={handleChange}
                onBlur={() => handleBlur("urb")}
                className={`input ${erros.urb && tocado.urb ? "input-error" : ""}`}
                placeholder="Ex: URG-001"
                maxLength={50}
              />
              {erros.urb && tocado.urb && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.urb}
                </p>
              )}
            </div>

            {/* Localidade */}
            <div className="form-group relative">
              <label htmlFor="localidade" className="label label-required">
                Localidade/Bairro
              </label>
              <input
                type="text"
                id="localidade"
                name="localidade"
                value={formData.localidade}
                onChange={handleChange}
                onBlur={() => handleBlur("localidade")}
                onFocus={() => setMostrarSugestoes(true)}
                className={`input ${erros.localidade && tocado.localidade ? "input-error" : ""}`}
                placeholder="Ex: Centro, Posse, Comércio"
                maxLength={100}
                autoComplete="off"
              />
              {erros.localidade && tocado.localidade && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.localidade}
                </p>
              )}

              {/* Sugestões de Auto-complete */}
              {mostrarSugestoes && sugestoesLocalidade.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {sugestoesLocalidade.map((sugestao, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocalidadeSelect(sugestao)}
                      className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors"
                    >
                      {sugestao}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="form-group">
            <label htmlFor="endereco" className="label label-required">
              Endereço Completo
            </label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              onBlur={() => handleBlur("endereco")}
              className={`input ${erros.endereco && tocado.endereco ? "input-error" : ""}`}
              placeholder="Ex: Rua da Conceição, 123, Centro"
              maxLength={200}
            />
            {erros.endereco && tocado.endereco && (
              <p className="error-message">
                <AlertCircle className="w-4 h-4" />
                {erros.endereco}
              </p>
            )}
          </div>

          {/* Seção de Geolocalização (NOVO) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <LocateFixed className="w-5 h-5 text-primary" />
              Coordenadas de Geolocalização (Opcional)
            </h3>
            <p className="text-sm text-gray-600">
              Obtenha automaticamente via GPS ou insira manualmente.
            </p>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {gettingLocation ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Obtendo localização...
                </>
              ) : (
                <>
                  <LocateFixed className="w-5 h-5" />
                  Obter Localização Atual
                </>
              )}
            </button>

            {locationError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg animate-fadeIn flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{locationError}</span>
              </div>
            )}

            {(showManualCoords || formData.latitude || formData.longitude) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Latitude */}
                <div className="form-group">
                  <label htmlFor="latitude" className="label">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleManualCoordChange}
                    onBlur={() => handleBlur("latitude")}
                    className={`input ${erros.latitude && tocado.latitude ? "input-error" : ""}`}
                    placeholder="-22.906847"
                    maxLength={20}
                  />
                  {erros.latitude && tocado.latitude && (
                    <p className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {erros.latitude}
                    </p>
                  )}
                </div>

                {/* Longitude */}
                <div className="form-group">
                  <label htmlFor="longitude" className="label">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleManualCoordChange}
                    onBlur={() => handleBlur("longitude")}
                    className={`input ${erros.longitude && tocado.longitude ? "input-error" : ""}`}
                    placeholder="-43.172897"
                    maxLength={20}
                  />
                  {erros.longitude && tocado.longitude && (
                    <p className="error-message">
                      <AlertCircle className="w-4 h-4" />
                      {erros.longitude}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção 2: Animais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🐕🐈</span>
            Quantidade de Animais
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Cães Macho */}
            <div className="form-group">
              <label htmlFor="caesMacho" className="label">
                🐕 Cães Macho
              </label>
              <input
                type="number"
                id="caesMacho"
                name="caesMacho"
                value={formData.caesMacho}
                onChange={handleChange}
                onBlur={() => handleBlur("caesMacho")}
                className={`input ${erros.caesMacho && tocado.caesMacho ? "input-error" : ""}`}
                min="0"
                max="999"
              />
              {erros.caesMacho && tocado.caesMacho && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.caesMacho}
                </p>
              )}
            </div>

            {/* Cães Fêmea */}
            <div className="form-group">
              <label htmlFor="caesFemea" className="label">
                🐕 Cães Fêmea
              </label>
              <input
                type="number"
                id="caesFemea"
                name="caesFemea"
                value={formData.caesFemea}
                onChange={handleChange}
                onBlur={() => handleBlur("caesFemea")}
                className={`input ${erros.caesFemea && tocado.caesFemea ? "input-error" : ""}`}
                min="0"
                max="999"
              />
              {erros.caesFemea && tocado.caesFemea && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.caesFemea}
                </p>
              )}
            </div>

            {/* Gatos Macho */}
            <div className="form-group">
              <label htmlFor="gatosMacho" className="label">
                🐈 Gatos Macho
              </label>
              <input
                type="number"
                id="gatosMacho"
                name="gatosMacho"
                value={formData.gatosMacho}
                onChange={handleChange}
                onBlur={() => handleBlur("gatosMacho")}
                className={`input ${erros.gatosMacho && tocado.gatosMacho ? "input-error" : ""}`}
                min="0"
                max="999"
              />
              {erros.gatosMacho && tocado.gatosMacho && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.gatosMacho}
                </p>
              )}
            </div>

            {/* Gatos Fêmea */}
            <div className="form-group">
              <label htmlFor="gatosFemea" className="label">
                🐈 Gatos Fêmea
              </label>
              <input
                type="number"
                id="gatosFemea"
                name="gatosFemea"
                value={formData.gatosFemea}
                onChange={handleChange}
                onBlur={() => handleBlur("gatosFemea")}
                className={`input ${erros.gatosFemea && tocado.gatosFemea ? "input-error" : ""}`}
                min="0"
                max="999"
              />
              {erros.gatosFemea && tocado.gatosFemea && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.gatosFemea}
                </p>
              )}
            </div>
          </div>

          {/* Resumo de Animais */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                Total de Animais:
              </span>
              <span className="text-2xl font-bold text-primary">
                {totalAnimais}
              </span>
            </div>
            {erros.animais && (
              <p className="error-message mt-2">
                <AlertCircle className="w-4 h-4" />
                {erros.animais}
              </p>
            )}
          </div>
        </div>

        {/* Seção 3: Dados do Tutor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Dados do Tutor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="form-group">
              <label htmlFor="data" className="label label-required">
                <Calendar className="w-4 h-4 inline" /> Data do Registro
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                onBlur={() => handleBlur("data")}
                className={`input ${erros.data && tocado.data ? "input-error" : ""}`}
                max={new Date().toISOString().split("T")[0]}
              />
              {erros.data && tocado.data && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.data}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="form-group">
              <label htmlFor="telefone" className="label label-required">
                <Phone className="w-4 h-4 inline" /> Telefone
              </label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone}
                onChange={handleChange}
                onBlur={() => handleBlur("telefone")}
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    type="tel"
                    id="telefone"
                    name="telefone"
                    className={`input ${erros.telefone && tocado.telefone ? "input-error" : ""}`}
                    placeholder="(21) 98765-4321"
                  />
                )}
              </InputMask>
              {erros.telefone && tocado.telefone && (
                <p className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {erros.telefone}
                </p>
              )}
            </div>
          </div>

          {/* Nome do Tutor */}
          <div className="form-group">
            <label htmlFor="tutor" className="label label-required">
              Nome Completo do Tutor
            </label>
            <input
              type="text"
              id="tutor"
              name="tutor"
              value={formData.tutor}
              onChange={handleChange}
              onBlur={() => handleBlur("tutor")}
              className={`input ${erros.tutor && tocado.tutor ? "input-error" : ""}`}
              placeholder="Ex: Maria Silva Santos"
              maxLength={150}
            />
            {erros.tutor && tocado.tutor && (
              <p className="error-message">
                <AlertCircle className="w-4 h-4" />
                {erros.tutor}
              </p>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={salvando}
            className="btn btn-primary btn-lg flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {salvando
              ? "Salvando..."
              : registroEditando
                ? "Atualizar Registro"
                : "Salvar Registro"}
          </button>

          <button
            type="button"
            onClick={handleLimpar}
            disabled={salvando}
            className="btn btn-outline flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Limpar
          </button>

          {(registroEditando || onCancel) && (
            <button
              type="button"
              onClick={handleCancelar}
              disabled={salvando}
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistro;
