
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Reading, Client } from '../../types';
import ManualPaymentModal from './ManualPaymentModal';

const ReadingDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reading, setReading] = useState<Reading | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRole, setUserRole] = useState<'tecnico' | 'cliente'>('tecnico');
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

  const fetchData = async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email?.toLowerCase() || '';
      if (email !== 'bwasistemas@gmail.com' && !email.includes('tecnico')) {
        setUserRole('cliente');
      }

      const foundReading = await supabase.readings.getById(id);
      if (foundReading) {
        setReading(foundReading);
        const clients = await supabase.clients.list();
        const cFound = clients.find(c => c.id === foundReading.cliente_id);
        if (cFound) setClient(cFound);
      }
    } catch (err) {
      console.error("Erro fetchData:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleMarkAsPaid = async () => {
    if (!id || !reading || actionLoading) return;

    if (!window.confirm(`CONFIRMAR RECEBIMENTO?\n\nValor: R$ ${Number(reading.valor_total).toFixed(2)}\nCliente: ${reading.cliente_nome}`)) return;

    setActionLoading(true);
    try {
      await supabase.readings.markAsPaid(id);
      // Feedback visual IMEDIATO mudando o estado local
      setReading(prev => prev ? { ...prev, status: 'Pago', pago_em: new Date().toISOString() } : null);
      alert("PAGAMENTO CONFIRMADO!");
      await fetchData(false); 
    } catch (err: any) {
      console.error("Erro técnico:", err);
      alert("ERRO AO SALVAR: Certifique-se de que o RLS está desativado no Supabase.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualPayment = async (valorAjustado: number, observacao: string) => {
    if (!id || !reading || actionLoading) return;

    setActionLoading(true);
    try {
      await supabase.readings.markAsPaidManual(id, valorAjustado, observacao);
      setReading(prev => prev ? {
        ...prev,
        status: 'Pago',
        pago_em: new Date().toISOString(),
        observacoes: observacao
      } : null);
      setShowManualPaymentModal(false);
      alert("PAGAMENTO REGULARIZADO MANUALMENTE!");
      await fetchData(false);
    } catch (err: any) {
      console.error("Erro ao regularizar:", err);
      alert(`ERRO: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  if (loading && !reading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscando Fatura...</p>
    </div>
  );

  if (!reading) return (
    <div className="p-10 text-center font-black uppercase text-slate-400">
      <span className="material-symbols-outlined text-5xl mb-2">error</span>
      <p>Fatura não encontrada.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-primary text-xs font-black uppercase underline">Voltar</button>
    </div>
  );

  const isPaid = reading.status === 'Pago';
  const isCanceled = reading.status === 'Cancelada';
  const isOverdue = reading.status === 'Vencido';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col relative overflow-x-hidden text-slate-900 font-sans shadow-2xl">
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .max-w-md { max-width: 100% !important; width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
          main { padding: 30px !important; }
          .rounded-3xl { border-radius: 15px !important; }
          .bg-slate-50 { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; }
          .text-primary { color: #1152d4 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100 print:hidden">
        <button onClick={() => navigate(-1)} className="text-primary p-2 active:scale-75 transition-transform">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-widest flex-1 text-center">Detalhamento Financeiro</h1>
        <button onClick={handlePrint} className="text-slate-400 p-3 active:bg-slate-100 rounded-full transition-all">
          <span className="material-symbols-outlined">print</span>
        </button>
      </header>

      <main className="flex-1 p-8 space-y-8 pb-40">
        <div className="relative text-center space-y-1">
          {isPaid && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-green-500/20 text-green-500 font-black px-12 py-6 rounded-3xl -rotate-12 uppercase text-6xl pointer-events-none z-0 animate-in zoom-in duration-300">
              PAGO
            </div>
          )}
          {isCanceled && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-slate-400/20 text-slate-400 font-black px-12 py-6 rounded-3xl -rotate-12 uppercase text-4xl pointer-events-none z-0 animate-in zoom-in duration-300">
              CANCELADA
            </div>
          )}
          <h2 className="text-primary text-4xl font-black uppercase tracking-tighter relative z-10">SM ENGENHARIA</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] relative z-10">Soluções Inteligentes</p>
        </div>

        <div className={`rounded-3xl p-6 flex flex-col gap-4 border shadow-inner relative z-10 ${isCanceled ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase text-slate-400">Vencimento</span>
               <span className={`text-xl font-black ${isOverdue && !isPaid && !isCanceled ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>{reading.vencimento}</span>
            </div>
            <div className="text-right flex flex-col">
               <span className="text-[9px] font-black uppercase text-slate-400">Total Líquido</span>
               <span className="text-3xl font-black text-primary tracking-tighter">R$ {Number(reading.valor_total).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2">
             <span className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${isPaid ? 'bg-green-500 text-white' : isCanceled ? 'bg-slate-400 text-white' : isOverdue ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
               Status: {reading.status.toUpperCase()}
             </span>
          </div>
          {reading.observacoes && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-amber-600 text-sm">info</span>
                <div>
                  <p className="text-[9px] font-black uppercase text-amber-600 mb-1">Observação</p>
                  <p className="text-[11px] font-medium text-amber-800">{reading.observacoes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="space-y-4">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
             <span className="material-symbols-outlined text-sm">person</span> Dados do Cliente
           </h4>
           <div className="bg-white p-5 rounded-2xl border-2 border-slate-50 space-y-1 shadow-sm">
              <p className="font-black text-base uppercase tracking-tight">{reading.cliente_nome}</p>
              <p className="text-[11px] font-medium text-slate-500 leading-snug">{client?.endereco || 'Endereço da Unidade Consumidora.'}</p>
              <p className="text-[10px] font-bold text-slate-400 pt-2 font-mono uppercase">Medidor: {client?.id_medidor || reading.id.toString().substring(0,4)}</p>
           </div>
        </section>

        <section className="space-y-4">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
             <span className="material-symbols-outlined text-sm">analytics</span> Demonstrativo
           </h4>
           <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 text-center text-[10px] font-black uppercase bg-slate-100 text-slate-500 py-3">
                 <span>Leitura Ant.</span>
                 <span>Leitura Atual</span>
              </div>
              <div className="grid grid-cols-2 text-center py-6 border-b border-slate-50">
                 <span className="text-xl font-black text-slate-300 font-mono">{reading.leitura_anterior}</span>
                 <span className="text-xl font-black text-primary font-mono">{reading.leitura_atual}</span>
              </div>
              <div className="p-5 flex justify-between items-center bg-slate-50/50">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400">Consumo no Mês</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{reading.consumo_periodo} <span className="text-xs font-bold text-slate-400">kWh</span></span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase text-green-600">Desconto Solar</span>
                    <span className="text-xl font-black text-green-600">-{reading.desconto_percentual}%</span>
                 </div>
              </div>
           </div>
        </section>

        <div className="pt-12 text-center space-y-2 opacity-50 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">SM ENGENHARIA ELÉTRICA</p>
          <p className="text-[8px] font-bold">CREA-MG: MG-249011 • Montes Claros - MG</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 p-6 pb-12 flex flex-col gap-3 print:hidden z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {userRole === 'tecnico' && !isPaid && !isCanceled ? (
          <>
            <button
              type="button"
              onClick={() => setShowManualPaymentModal(true)}
              disabled={actionLoading}
              className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              {actionLoading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">payments</span>
                  Regularizar Pagamento
                </>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleMarkAsPaid(); }}
              disabled={actionLoading}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Confirmar Valor Integral
            </button>
          </>
        ) : isPaid ? (
           <div className="w-full h-16 bg-green-50 text-green-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-green-100 animate-in fade-in">
             <span className="material-symbols-outlined text-xl">verified</span> 
             PAGO EM {reading.pago_em ? new Date(reading.pago_em).toLocaleDateString('pt-BR') : 'RECONHECIDO'}
           </div>
        ) : isCanceled ? (
           <div className="w-full h-16 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-slate-200">
             <span className="material-symbols-outlined text-xl">block</span> 
             FATURA CANCELADA
           </div>
        ) : (
           <button 
             type="button"
             onClick={() => window.alert("Instrução: Solicite o pagamento via PIX Copia e Cola ao cliente.")}
             className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all"
           >
             <span className="material-symbols-outlined">qr_code_2</span> Pagar via PIX
           </button>
        )}
      </div>

      {showManualPaymentModal && reading && (
        <ManualPaymentModal
          reading={reading}
          onSave={handleManualPayment}
          onClose={() => setShowManualPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default ReadingDetails;
