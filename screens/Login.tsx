
import React, { useState } from 'react';
import { supabaseClient } from '../supabase';

interface LoginProps {
  onLogin: (role: any, email: string) => void;
}

const Login: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar operação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[430px] h-full min-h-screen bg-background-light dark:bg-background-dark flex flex-col overflow-hidden shadow-2xl mx-auto">
      <div className="absolute top-0 left-0 w-full h-[35vh] bg-primary rounded-b-[40px] z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-12 pb-6 w-full h-full justify-center">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3">
            <span className="material-symbols-outlined text-primary text-4xl">electric_bolt</span>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight text-center">SM Engenharia</h1>
          <p className="text-blue-100 text-sm mt-2 opacity-90 uppercase tracking-widest font-bold text-[10px]">Gestão de Faturamento</p>
        </div>

        <div className="bg-white dark:bg-[#1a2234] rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700/50">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Acesso ao Sistema
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail Cadastrado</label>
              <div className="group flex w-full items-stretch rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div className="flex items-center justify-center pl-4 pr-2 text-gray-400">
                  <span className="material-symbols-outlined text-[22px]">mail</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none text-gray-900 dark:text-white h-12 focus:ring-0 text-sm font-bold" 
                  placeholder="seu@email.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Sua Senha
              </label>
              <div className="group flex w-full items-stretch rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <div className="flex items-center justify-center pl-4 pr-2 text-gray-400">
                  <span className="material-symbols-outlined text-[22px]">lock</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none text-gray-900 dark:text-white h-12 focus:ring-0 text-sm font-bold" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-gray-400"
                >
                  <span className="material-symbols-outlined text-[22px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-700 disabled:bg-slate-400 text-white font-black rounded-xl h-14 mt-2 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase text-sm tracking-wider"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span>Entrar Agora</span>
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] font-bold text-slate-400 mt-6 text-center leading-relaxed">
            Não possui acesso? Entre em contato com o administrador da <span className="text-primary">SM Engenharia</span>.
          </p>
        </div>

        <div className="mt-auto pt-8 flex flex-col items-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">SM Engenharia Elétrica © 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
