
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Reading } from '../../types';

interface TechDashboardProps {
  onLogout: () => void;
  user: any;
}

const TechDashboard: React.FC<TechDashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [recentReadings, setRecentReadings] = useState<Reading[]>([]);
  const [metrics, setMetrics] = useState({ todayCount: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await supabase.readings.list();
        setRecentReadings(data.slice(0, 5));
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = data.filter(r => r.data_atual === today).length;
        
        const pendingAmount = data
          .filter(r => r.status !== 'Pago')
          .reduce((acc, curr) => acc + Number(curr.valor_total), 0);
        
        setMetrics({ todayCount, pendingAmount });
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 pt-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white shadow-lg">
              <span className="material-symbols-outlined">electric_bolt</span>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter">SM Engenharia</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-500">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="p-4 grid grid-cols-2 gap-4 mt-2">
        <div className="rounded-[2rem] p-6 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Coletas Hoje</p>
          <p className="text-3xl font-black text-primary">{metrics.todayCount}</p>
        </div>
        <div className="rounded-[2rem] p-6 bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">A Receber</p>
          <p className="text-xl font-black text-slate-800 dark:text-white">R$ {metrics.pendingAmount.toFixed(0)}</p>
        </div>
      </section>

      <section className="px-4 py-2">
        <button 
          onClick={() => navigate('/nova-leitura')}
          className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined font-bold">add_task</span>
          <span className="font-black uppercase text-sm tracking-widest">Nova Leitura</span>
        </button>
      </section>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Atividade Recente</h3>
          <button onClick={() => navigate('/historico')} className="text-xs font-black text-primary uppercase">Ver Tudo</button>
        </div>
        <div className="space-y-3">
          {recentReadings.map(r => (
            <div 
              key={r.id} 
              onClick={() => navigate(`/leitura/${r.id}`)}
              className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${r.status === 'Pago' ? 'bg-green-500' : r.status === 'Vencido' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-sm font-black truncate max-w-[140px]">{r.cliente_nome}</p>
                  <p className="text-[10px] font-bold text-slate-400">{r.data_atual} • {r.consumo_periodo} kWh</p>
                </div>
              </div>
              <span className="font-black text-sm">R$ {Number(r.valor_total).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pb-10 pt-4 px-8 z-50">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined fill-1">dashboard</span>
            <span className="text-[9px] font-black uppercase">Home</span>
          </button>
          <button onClick={() => navigate('/historico')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[9px] font-black uppercase">Faturas</span>
          </button>
          <button onClick={() => navigate('/clientes')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined">groups</span>
            <span className="text-[9px] font-black uppercase">Clientes</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default TechDashboard;
