
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Client, Reading } from '../../types';

const NewReading: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    leitura_anterior: 0,
    leitura_atual: 0,
    valor_kwh: 1.19,
    desconto_percentual: 0,
    data_anterior: '',
    data_atual: new Date().toISOString().split('T')[0],
    vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacoes: ''
  });

  const [calc, setCalc] = useState({
    consumo: 0,
    total: 0
  });

  useEffect(() => {
    supabase.clients.list().then(setClients).catch(console.error);
  }, []);

  useEffect(() => {
    const consumo = Math.max(0, form.leitura_atual - form.leitura_anterior);
    const subtotal = consumo * form.valor_kwh;
    const total = subtotal * (1 - (form.desconto_percentual / 100));
    setCalc({ consumo, total });
  }, [form]);

  const handleClientSelect = async (client: Client) => {
    setSelectedClient(client);
    setSearch(client.nome);
    try {
      const lastReading = await supabase.readings.getLastByClient(client.id);
      if (lastReading) {
        setForm(prev => ({
          ...prev,
          leitura_anterior: Number(lastReading.leitura_atual),
          data_anterior: lastReading.data_atual
        }));
      } else {
        setForm(prev => ({ ...prev, leitura_anterior: 0, data_anterior: '' }));
      }
    } catch (err) {
      console.error("Erro ao buscar última leitura:", err);
    }
  };

  const handleSave = async () => {
    if (!selectedClient) {
      alert('Por favor, selecione uma unidade/cliente.');
      return;
    }
    if (form.leitura_atual <= 0) {
      alert('Informe a leitura atual.');
      return;
    }

    setLoading(true);
    try {
      const newReading: Partial<Reading> = {
        cliente_id: selectedClient.id,
        cliente_nome: selectedClient.nome,
        leitura_anterior: form.leitura_anterior,
        leitura_atual: form.leitura_atual,
        valor_kwh: form.valor_kwh,
        desconto_percentual: form.desconto_percentual,
        data_anterior: form.data_anterior || new Date().toISOString().split('T')[0],
        data_atual: form.data_atual,
        vencimento: form.vencimento,
        valor_total: calc.total,
        consumo_periodo: calc.consumo,
        // Corrigido: 'Sincronizado' não é um valor válido para o tipo de status definido em types.ts
        status: 'Pendente',
        observacoes: form.observacoes
      };

      await supabase.readings.save(newReading);
      alert('Leitura sincronizada com sucesso!');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar: " + (err.message || "Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.id_medidor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl">
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="text-primary text-sm font-bold">Cancelar</button>
        <h1 className="text-xs font-black tracking-widest uppercase text-center flex-1">Coletor de Dados</h1>
        <div className="w-16"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-60">
        <div className="px-4 py-4">
          <label className="block mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Selecionar Unidade</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">search</span>
            </div>
            <input 
              className="block w-full pl-10 pr-4 py-4 rounded-xl border-none bg-white dark:bg-surface-dark shadow-sm text-sm font-bold focus:ring-2 focus:ring-primary" 
              placeholder="Nome ou Medidor..." 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedClient && e.target.value !== selectedClient.nome) setSelectedClient(null);
              }}
            />
          </div>

          {!selectedClient && search.length > 0 && (
            <div className="mt-1 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
              {filteredClients.map(c => (
                <div key={c.id} onClick={() => handleClientSelect(c)} className="p-4 border-b last:border-0 border-slate-100 dark:border-slate-800 active:bg-primary active:text-white">
                  <p className="text-sm font-black">{c.nome}</p>
                  <p className="text-xs opacity-60 font-mono">{c.id_medidor} • {c.tipo_tensao}</p>
                </div>
              ))}
            </div>
          )}

          {selectedClient && (
            <div className="mt-3 bg-primary text-white rounded-xl p-4 flex items-center gap-4 shadow-lg shadow-primary/20 animate-in fade-in slide-in-from-top-2">
              <div className="bg-white/20 p-2 rounded-full">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-black leading-tight truncate">{selectedClient.nome}</p>
                <p className="text-[10px] opacity-80 font-mono">{selectedClient.id_medidor} • {selectedClient.tipo_tensao}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 mb-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2 ml-1">
            <span className="material-symbols-outlined text-[16px]">speed</span>
            Registro do Medidor
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Anterior</span>
                <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg py-3 px-4 font-mono font-bold text-slate-400 border border-slate-100 dark:border-slate-700">
                  {form.leitura_anterior}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-primary uppercase">Leitura Atual</span>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="w-full bg-white dark:bg-slate-900 border-2 border-primary/30 focus:border-primary rounded-lg py-3 px-4 font-mono font-bold text-lg text-primary focus:ring-0" 
                  value={form.leitura_atual || ''}
                  onChange={(e) => setForm({ ...form, leitura_atual: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-4 rounded-lg flex justify-between items-center border border-primary/10">
              <span className="text-xs font-black text-primary uppercase">Consumo Período</span>
              <span className="text-xl font-black text-primary">{calc.consumo} kWh</span>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2 ml-1">
            <span className="material-symbols-outlined text-[16px]">payments</span>
            Faturamento Especial
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">R$ por kWh</span>
                <input step="0.01" type="number" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" value={form.valor_kwh} onChange={e => setForm({...form, valor_kwh: Number(e.target.value)})} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Desconto (%)</span>
                <input type="number" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" value={form.desconto_percentual} onChange={e => setForm({...form, desconto_percentual: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Data de Vencimento</span>
              <input type="date" className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" value={form.vencimento} onChange={e => setForm({...form, vencimento: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="px-4 mb-10">
          <textarea 
            className="w-full bg-white dark:bg-surface-dark border-none rounded-xl shadow-sm p-4 text-sm font-medium h-24 focus:ring-2 focus:ring-primary" 
            placeholder="Observações de campo..."
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
        </div>
      </main>

      {/* Rodapé fixo aprimorado */}
      <footer className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 p-6 pb-12 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Calculado</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">R$ {calc.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${selectedClient ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {selectedClient ? 'Unidade Ok' : 'Pendente'}
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={!selectedClient || loading}
          className="w-full h-16 bg-primary hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-base rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <>
              <span className="material-symbols-outlined font-bold">cloud_upload</span>
              Sincronizar Leitura
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default NewReading;
