
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Reading } from '../../types';

const ReadingHistory: React.FC = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pendente' | 'Pago' | 'Vencido' | 'Cancelada'>('All');
  const [loading, setLoading] = useState(false);

  const fetchReadings = async () => {
    try {
      const data = await supabase.readings.list();
      setReadings(data);
    } catch (err) {
      console.error("Erro ao carregar leituras:", err);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const filtered = readings.filter(r => 
    r.cliente_nome.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || r.status === filter)
  );

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    if (!window.confirm('ATENÇÃO: Deseja realmente CANCELAR esta fatura? O registro será marcado como cancelado no sistema.')) return;
    
    setLoading(true);
    try {
      await supabase.readings.cancel(id);
      // Atualiza a lista local imediatamente
      await fetchReadings();
      alert("SUCESSO: Fatura cancelada.");
    } catch (err: any) {
      alert("FALHA: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent, reading: Reading) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `*SM Engenharia Elétrica - Fatura*\n\nCliente: ${reading.cliente_nome}\nConsumo: ${reading.consumo_periodo} kWh\nValor: R$ ${Number(reading.valor_total).toFixed(2)}\nVencimento: ${reading.vencimento}\n\nVisualize o PDF aqui: https://sm-gestao.v0.app/#/leitura/${reading.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-500';
      case 'Vencido': return 'bg-red-500';
      case 'Cancelada': return 'bg-slate-400';
      default: return 'bg-orange-500';
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-700';
      case 'Vencido': return 'bg-red-100 text-red-700';
      case 'Cancelada': return 'bg-slate-100 text-slate-500';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="material-symbols-outlined text-primary p-2">arrow_back</button>
          <h2 className="text-sm font-black flex-1 text-center tracking-widest uppercase">Histórico de Leituras</h2>
          <div className="w-10"></div>
        </div>
        
        <div className="px-4 pb-2">
          <div className="flex items-stretch rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-11 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex items-center justify-center pl-3 text-slate-400">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-sm focus:outline-none px-2 font-bold" 
              placeholder="Pesquisar cliente..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar pt-1">
          {['All', 'Pendente', 'Pago', 'Vencido', 'Cancelada'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex h-8 items-center rounded-full px-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500'}`}
            >
              {f === 'All' ? 'Todos' : f}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-24">
        {loading && readings.length === 0 ? (
           <div className="py-20 flex flex-col items-center text-slate-400">
             <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
             <p className="text-[10px] font-black uppercase mt-4">Sincronizando...</p>
           </div>
        ) : filtered.length > 0 ? filtered.map(reading => (
          <div 
            key={reading.id} 
            onClick={() => navigate(`/leitura/${reading.id}`)}
            className={`flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative active:scale-[0.98] transition-all cursor-pointer ${reading.status === 'Cancelada' ? 'opacity-60' : ''}`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(reading.status)}`} />
            <div className="p-4 pl-5">
              <div className="flex justify-between items-start mb-1">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${getBadgeClass(reading.status)}`}>
                  {reading.status}
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{reading.data_atual}</span>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div className="flex-1 pr-4">
                  <h3 className="text-base font-black leading-tight line-clamp-1">{reading.cliente_nome}</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 font-mono">Venc: {reading.vencimento}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary text-lg font-black tracking-tighter">R$ {Number(reading.valor_total).toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{reading.consumo_periodo} kWh</p>
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-slate-50 dark:bg-slate-800" />
            <div className="grid grid-cols-3 divide-x divide-slate-50 dark:divide-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/leitura/${reading.id}`); }} 
                className="flex flex-col items-center py-3 group active:bg-slate-200"
              >
                <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-colors">visibility</span>
                <span className="text-[9px] font-black uppercase text-slate-400 mt-1">Detalhes</span>
              </button>
              <button 
                type="button"
                onClick={(e) => handleShare(e, reading)} 
                className="flex flex-col items-center py-3 group active:bg-green-50 border-x border-slate-50 dark:border-slate-800"
              >
                <span className="material-symbols-outlined text-green-600 text-[20px] group-active:scale-125 transition-transform">share</span>
                <span className="text-[9px] font-black uppercase text-green-600 mt-1">Enviar</span>
              </button>
              <button 
                type="button"
                disabled={loading || reading.status === 'Cancelada'}
                onClick={(e) => handleCancel(e, reading.id)} 
                className="flex flex-col items-center py-3 group active:bg-slate-100 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-slate-600 transition-colors">block</span>
                <span className="text-[9px] font-black uppercase text-slate-400 mt-1">Cancelar</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-20">history</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma fatura encontrada</p>
          </div>
        )}
      </main>

      <button 
        onClick={() => navigate('/nova-leitura')}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>
    </div>
  );
};

export default ReadingHistory;
