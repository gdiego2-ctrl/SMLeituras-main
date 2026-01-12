
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Client } from '../../types';

const ManageClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newClient, setNewClient] = useState<Partial<Client>>({
    nome: '',
    endereco: '',
    contato: '',
    id_medidor: '',
    tipo_tensao: 'Monofásico',
    email: ''
  });

  const fetchClients = async () => {
    try {
      const data = await supabase.clients.list();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!password || password.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!newClient.email || !newClient.nome) {
      alert("Email e nome são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Use createClientWithAuth to create both client record AND auth user
      await supabase.clients.createClientWithAuth(newClient as Omit<Client, 'id'>, password);

      setShowAddModal(false);
      setNewClient({
        nome: '',
        endereco: '',
        contato: '',
        id_medidor: '',
        tipo_tensao: 'Monofásico',
        email: ''
      });
      setPassword('');
      setShowPassword(false);

      await fetchClients();
      alert("Cliente e conta de acesso criados com sucesso!");
    } catch (err: any) {
      console.error("Catch Error:", err);
      alert("Atenção: " + (err.message || "Não foi possível salvar o cliente."));
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c => {
    // Filter out inactive clients by default
    const isActive = !c.status || c.status === 'ativo';
    const matchesSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
                          c.id_medidor.toLowerCase().includes(search.toLowerCase());
    return isActive && matchesSearch;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col relative">
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="material-symbols-outlined text-primary p-1 rounded-full active:bg-slate-100">arrow_back</button>
            <h1 className="text-lg font-black tracking-tight">Gerenciar Clientes</h1>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex w-full items-center rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 h-12 focus-within:ring-2 focus-within:ring-primary/20 shadow-sm transition-all">
            <div className="pl-4 text-slate-400">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-sm px-2 focus:ring-0 font-medium" 
              placeholder="Nome ou medidor..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-3 px-4 pb-32 pt-4">
        {filtered.length > 0 ? filtered.map(client => (
          <div 
            key={client.id}
            onClick={() => navigate(`/cliente/${client.id}`)}
            className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary group-active:bg-primary group-active:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl font-light">account_circle</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">{client.nome}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">UC {client.id_medidor}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{client.tipo_tensao}</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 mt-2">chevron_right</span>
            </div>
          </div>
        )) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-4 font-thin">person_search</span>
            <p className="text-sm font-bold uppercase tracking-widest">Nenhum cliente</p>
          </div>
        )}
      </main>

      {/* Modal de Adição */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-t-[2.5rem] rounded-b-[1rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tighter">Novo Cliente</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cadastrar unidade consumidora</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90 transition-all">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                <input required className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30" placeholder="Ex: João da Silva" value={newClient.nome} onChange={e => setNewClient({...newClient, nome: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ID Medidor</label>
                  <input required className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30 font-mono" placeholder="0000" value={newClient.id_medidor} onChange={e => setNewClient({...newClient, id_medidor: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo Ligação</label>
                  <select className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30 appearance-none" value={newClient.tipo_tensao} onChange={e => setNewClient({...newClient, tipo_tensao: e.target.value as any})}>
                    <option>Monofásico</option>
                    <option>Bifásico</option>
                    <option>Trifásico</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail para Fatura</label>
                <input type="email" required className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30" placeholder="cliente@email.com" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha Inicial (mín. 6 caracteres)</label>
                <div className="flex w-full items-center rounded-2xl border-none bg-slate-100 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/30">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border-none bg-transparent text-sm font-bold py-4 px-5 focus:ring-0"
                    placeholder="Digite a senha inicial do cliente"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 ml-1 mt-1">Esta senha será usada pelo cliente para acessar o sistema</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone</label>
                <input required className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30" placeholder="(00) 00000-0000" value={newClient.contato} onChange={e => setNewClient({...newClient, contato: e.target.value})} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço Completo</label>
                <input required className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30" placeholder="Rua, Número, Bairro" value={newClient.endereco} onChange={e => setNewClient({...newClient, endereco: e.target.value})} />
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined font-bold">person_add</span>
                    Confirmar Cadastro
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante Principal */}
      <div className="fixed bottom-10 left-0 right-0 px-6 flex justify-center z-40 pointer-events-none">
        <button 
          onClick={() => setShowAddModal(true)}
          className="pointer-events-auto flex items-center gap-3 bg-primary text-white shadow-[0_15px_40px_-10px_rgba(17,82,212,0.5)] rounded-2xl px-8 py-5 transition-all active:scale-90 hover:shadow-primary/60 border border-white/20"
        >
          <span className="material-symbols-outlined font-bold">add</span>
          <span className="text-base font-black uppercase tracking-wider">Novo Cliente</span>
        </button>
      </div>
    </div>
  );
};

export default ManageClients;
