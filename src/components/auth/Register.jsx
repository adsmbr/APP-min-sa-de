import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Register = ({ onRegisterSuccess, onToggleLogin }) => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [etapa, setEtapa] = useState('formulario'); // formulario, sucesso

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErro(''); // Limpar erro ao digitar
  };

  const validarFormulario = () => {
    // Nome completo
    if (!formData.nomeCompleto.trim()) {
      setErro('Por favor, informe seu nome completo');
      return false;
    }

    if (formData.nomeCompleto.trim().length < 3) {
      setErro('Nome deve ter pelo menos 3 caracteres');
      return false;
    }

    // Email
    if (!formData.email.trim()) {
      setErro('Por favor, informe seu email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro('Email inválido');
      return false;
    }

    // Senha
    if (!formData.senha) {
      setErro('Por favor, informe uma senha');
      return false;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Validações de força da senha
    const temNumero = /\d/.test(formData.senha);
    const temLetra = /[a-zA-Z]/.test(formData.senha);

    if (!temNumero || !temLetra) {
      setErro('A senha deve conter letras e números');
      return false;
    }

    // Confirmar senha
    if (!formData.confirmarSenha) {
      setErro('Por favor, confirme sua senha');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.senha,
        options: {
          data: {
            nome_completo: formData.nomeCompleto.trim(),
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            nome_completo: formData.nomeCompleto.trim(),
            role: 'pesquisador', // Role padrão
          },
        ]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          // Não vamos bloquear o cadastro por isso
        }

        // Verificar se precisa confirmar email
        if (authData.session) {
          // Login automático (confirmação de email desabilitada)
          setMensagem('Conta criada com sucesso!');
          setTimeout(() => {
            if (onRegisterSuccess) onRegisterSuccess(authData.user);
          }, 1000);
        } else {
          // Precisa confirmar email
          setEtapa('sucesso');
        }
      }
    } catch (error) {
      console.error('Erro no registro:', error);

      if (error.message.includes('User already registered')) {
        setErro('Este email já está cadastrado. Faça login ou recupere sua senha.');
      } else if (error.message.includes('Password should be')) {
        setErro('Senha muito fraca. Use pelo menos 6 caracteres com letras e números.');
      } else {
        setErro('Erro ao criar conta: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tela de sucesso (quando precisa confirmar email)
  if (etapa === 'sucesso') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card text-center animate-fadeIn">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Conta Criada com Sucesso!
              </h2>
              <p className="text-gray-600 mb-4">
                Enviamos um email de confirmação para:
              </p>
              <p className="text-primary font-semibold mb-4">{formData.email}</p>
              <p className="text-sm text-gray-500">
                Por favor, verifique sua caixa de entrada e clique no link de confirmação
                para ativar sua conta.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onToggleLogin}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar para Login
              </button>

              <p className="text-xs text-gray-500">
                Não recebeu o email? Verifique sua pasta de spam ou entre em contato com
                o administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de registro
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🐕</span>
            <span className="text-5xl">🐈</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
          <p className="text-gray-600">
            Nova Iguaçu/RJ - Pesquisa Veterinária
          </p>
        </div>

        {/* Card de Registro */}
        <div className="card animate-fadeIn">
          <div className="card-header border-b border-gray-200 pb-4 mb-6">
            <UserPlus className="w-6 h-6 text-primary" />
            <span>Cadastro de Novo Usuário</span>
          </div>

          {/* Mensagens de Erro/Sucesso */}
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{erro}</span>
            </div>
          )}

          {mensagem && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{mensagem}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div className="form-group">
              <label htmlFor="nomeCompleto" className="label label-required">
                <User className="w-4 h-4 inline mr-1" />
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="input"
                placeholder="Maria Silva Santos"
                disabled={loading}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label label-required">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="seu-email@exemplo.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="form-group">
              <label htmlFor="senha" className="label label-required">
                <Lock className="w-4 h-4 inline mr-1" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use pelo menos 6 caracteres com letras e números
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="form-group">
              <label htmlFor="confirmarSenha" className="label label-required">
                <Lock className="w-4 h-4 inline mr-1" />
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Digite a senha novamente"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5"></div>
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Criar Conta</span>
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Já tem uma conta?</span>
            </div>
          </div>

          {/* Botão de Voltar ao Login */}
          <button
            type="button"
            onClick={onToggleLogin}
            disabled={loading}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Login</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Ao criar uma conta, você concorda em seguir</p>
          <p className="mt-1">as diretrizes de uso do sistema</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
