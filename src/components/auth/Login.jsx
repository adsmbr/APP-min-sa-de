import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger.js';

const Login = ({ onLoginSuccess, onToggleRegister }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    // Validações básicas
    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) throw error;

      if (data.user) {
        setMensagem('Login realizado com sucesso!');

        // Verificar se o perfil existe, se não, criar
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Perfil não existe, criar um
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: data.user.email,
              nome_completo: data.user.email.split('@')[0],
              role: 'pesquisador',
            },
          ]);
        }

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(data.user);
        }, 500);
      }
    } catch (error) {
      logger.error('Erro no login:', error);

      if (error.message.includes('Invalid login credentials')) {
        setErro('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setErro('Por favor, confirme seu email antes de fazer login');
      } else {
        setErro('Erro ao fazer login: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEsqueciSenha = async () => {
    if (!email) {
      setErro('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    setErro('');
    setMensagem('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMensagem('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      setErro('Erro ao enviar email de recuperação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-5xl">🐕</span>
            <span className="text-5xl">🐈</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Registro
          </h1>
          <p className="text-gray-600">
            Nova Iguaçu/RJ - Pesquisa Veterinária
          </p>
        </div>

        {/* Card de Login */}
        <div className="card animate-fadeIn">
          <div className="card-header border-b border-gray-200 pb-4 mb-6">
            <LogIn className="w-6 h-6 text-primary" />
            <span>Fazer Login</span>
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
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{mensagem}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu-email@exemplo.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="form-group">
              <label htmlFor="senha" className="label">
                <Lock className="w-4 h-4 inline mr-1" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
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
            </div>

            {/* Esqueci minha senha */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleEsqueciSenha}
                className="text-sm text-primary hover:text-primary-700 transition-colors"
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
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
              <span className="px-2 bg-white text-gray-500">Não tem uma conta?</span>
            </div>
          </div>

          {/* Botão de Registro */}
          <button
            type="button"
            onClick={onToggleRegister}
            disabled={loading}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Criar Conta</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Desenvolvido para pesquisa veterinária</p>
          <p className="mt-1">Nova Iguaçu/RJ - 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
