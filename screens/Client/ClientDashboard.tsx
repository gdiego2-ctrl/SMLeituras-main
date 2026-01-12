
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Reading, Pagamento } from '../../types';
import { paymentService } from '../../services/paymentService';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ClientDashboardProps {
  onLogout: () => void;
  user: any;
}

type TabType = 'home' | 'consumption' | 'help';

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Reading | null>(null);

  // Novos estados para pagamento real
  const [currentPayment, setCurrentPayment] = useState<Pagamento | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<RealtimeChannel | null>(null);
  const [pixExpired, setPixExpired] = useState(false);

  useEffect(() => {
    const fetchClientReadings = async () => {
      try {
        const allReadings = await supabase.readings.list();
        const clients = await supabase.clients.list();
        const myClient = clients.find(c => c.email.toLowerCase() === user.email.toLowerCase());
        
        if (myClient) {
          const filtered = allReadings.filter(r => r.cliente_id === myClient.id);
          setReadings(filtered);
        } else {
          // Fallback para fins de visualização caso o e-mail não bata exatamente com um cliente na lista 'clientes'
          setReadings(allReadings.slice(0, 6));
        }
      } catch (err) {
        console.error("Erro ao carregar dados do cliente:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientReadings();
  }, [user.email]);

  const currentInvoice = readings[0];

  // Função para atualizar readings sem reload completo da página
  const refreshReadings = async () => {
    try {
      const allReadings = await supabase.readings.list();
      const clients = await supabase.clients.list();
      const myClient = clients.find(c => c.email.toLowerCase() === user.email.toLowerCase());

      if (myClient) {
        const filtered = allReadings.filter(r => r.cliente_id === myClient.id);
        setReadings(filtered);
      } else {
        setReadings(allReadings.slice(0, 6));
      }
    } catch (err) {
      console.error("Erro ao atualizar leituras:", err);
    }
  };

  // Limpar subscription ao fechar modal
  useEffect(() => {
    return () => {
      if (paymentChannel) {
        paymentService.unsubscribe(paymentChannel);
      }
    };
  }, [paymentChannel]);

  // CORREÇÃO #1: Polling fallback - verifica status a cada 5 segundos caso Realtime falhe
  useEffect(() => {
    if (!currentPayment || paymentSuccess || pixExpired || isCreatingPayment) return;

    console.log('Iniciando polling fallback para pagamento:', currentPayment.id);

    const pollInterval = setInterval(async () => {
      try {
        const status = await paymentService.checkPaymentStatus(currentPayment.id);
        console.log('Polling - Status verificado:', status);

        if (status === 'approved') {
          console.log('Pagamento aprovado detectado via polling!');
          setPaymentSuccess(true);
          clearInterval(pollInterval);

          // Atualizar readings sem reload completo
          setTimeout(async () => {
            await refreshReadings();
            setShowPaymentModal(false);
          }, 3000);
        } else if (status === 'rejected' || status === 'cancelled') {
          setPaymentError('Pagamento não aprovado');
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Erro ao verificar status via polling:', error);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => {
      console.log('Limpando polling interval');
      clearInterval(pollInterval);
    };
  }, [currentPayment, paymentSuccess, pixExpired, isCreatingPayment]);

  // CORREÇÃO #2: Detectar expiração de PIX
  useEffect(() => {
    if (!currentPayment?.expira_em || paymentSuccess) return;

    const expiryTime = new Date(currentPayment.expira_em).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Se já expirou
    if (timeUntilExpiry <= 0) {
      console.log('PIX já expirado');
      setPixExpired(true);
      setPaymentError('Código PIX expirado. Clique no botão abaixo para gerar um novo código.');
      return;
    }

    console.log(`PIX expira em ${Math.round(timeUntilExpiry / 1000)} segundos`);

    // Configurar timeout para quando expirar
    const expiryTimeout = setTimeout(() => {
      console.log('PIX expirou!');
      setPixExpired(true);
      setPaymentError('Código PIX expirado. Clique no botão abaixo para gerar um novo código.');
    }, timeUntilExpiry);

    return () => {
      clearTimeout(expiryTimeout);
    };
  }, [currentPayment, paymentSuccess]);

  const handleOpenPayment = async (reading: Reading) => {
    setSelectedInvoice(reading);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setPaymentError(null);
    setCurrentPayment(null);
    setPixExpired(false);
    setIsCreatingPayment(true);

    try {
      console.log('Criando pagamento PIX...');

      const response = await paymentService.createPixPayment({
        leituraId: reading.id,
        valor: reading.valor_total,
        email: user.email,
        nome: user.name,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar pagamento');
      }

      console.log('Pagamento criado:', response.pagamentoId);

      setCurrentPayment({
        id: response.pagamentoId,
        leitura_id: reading.id,
        qr_code: response.qrCode,
        qr_code_base64: response.qrCodeBase64,
        status: response.status as any,
        expira_em: response.expiraEm,
      } as Pagamento);

      // Assinar atualizações em tempo real
      const channel = paymentService.subscribeToPaymentUpdates(
        response.pagamentoId,
        (status) => {
          console.log('Status do pagamento atualizado:', status);

          if (status === 'approved') {
            setPaymentSuccess(true);
            // CORREÇÃO #3: Atualizar sem reload completo
            setTimeout(async () => {
              await refreshReadings();
              setShowPaymentModal(false);
            }, 3000);
          } else if (status === 'rejected' || status === 'cancelled') {
            setPaymentError('Pagamento não aprovado');
          }
        }
      );

      setPaymentChannel(channel);

    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      setPaymentError(error.message || 'Erro ao gerar código PIX. Tente novamente.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  // Função para gerar novo PIX quando o anterior expirar
  const handleGenerateNewPix = async () => {
    if (!selectedInvoice) return;

    // Limpar estado anterior
    setPixExpired(false);
    setPaymentError(null);
    setCurrentPayment(null);
    if (paymentChannel) {
      await paymentService.unsubscribe(paymentChannel);
      setPaymentChannel(null);
    }

    // Gerar novo PIX
    setIsCreatingPayment(true);

    try {
      console.log('Gerando novo código PIX...');

      const response = await paymentService.createPixPayment({
        leituraId: selectedInvoice.id,
        valor: selectedInvoice.valor_total,
        email: user.email,
        nome: user.name,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar pagamento');
      }

      console.log('Novo pagamento criado:', response.pagamentoId);

      setCurrentPayment({
        id: response.pagamentoId,
        leitura_id: selectedInvoice.id,
        qr_code: response.qrCode,
        qr_code_base64: response.qrCodeBase64,
        status: response.status as any,
        expira_em: response.expiraEm,
      } as Pagamento);

      // Assinar atualizações em tempo real
      const channel = paymentService.subscribeToPaymentUpdates(
        response.pagamentoId,
        (status) => {
          console.log('Status do pagamento atualizado:', status);

          if (status === 'approved') {
            setPaymentSuccess(true);
            setTimeout(async () => {
              await refreshReadings();
              setShowPaymentModal(false);
            }, 3000);
          } else if (status === 'rejected' || status === 'cancelled') {
            setPaymentError('Pagamento não aprovado');
          }
        }
      );

      setPaymentChannel(channel);

    } catch (error: any) {
      console.error('Erro ao gerar novo PIX:', error);
      setPaymentError(error.message || 'Erro ao gerar novo código PIX. Tente novamente.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {currentInvoice ? (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-dark shadow-2xl border border-white/5 p-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 size-40 bg-primary/20 blur-[60px] rounded-full" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">electric_bolt</span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Fatura em Aberto</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">
                Pendente
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter">R$ {Number(currentInvoice.valor_total).toFixed(2)}</span>
              <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-wider">Vencimento: {currentInvoice.vencimento}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleOpenPayment(currentInvoice)}
                className="flex-1 h-14 bg-primary hover:bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined font-bold text-xl">payments</span> Pagar via PIX
              </button>
              <button 
                onClick={() => navigate(`/fatura/${currentInvoice.id}`)}
                className="size-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-dark rounded-3xl border border-dashed border-border-dark p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-6xl mb-4">verified</span>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Suas contas estão em dia!</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 bg-surface-dark border border-white/5 shadow-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <span className="material-symbols-outlined text-primary text-xl">speed</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Consumo</span>
          </div>
          <p className="text-2xl font-black">{currentInvoice?.consumo_periodo || 0} <span className="text-xs font-bold text-slate-500">kWh</span></p>
        </div>
        <div className="rounded-3xl p-6 bg-surface-dark border border-white/5 shadow-lg">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <span className="material-symbols-outlined text-secondary text-xl">trending_up</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Economia</span>
          </div>
          <p className="text-2xl font-black">{currentInvoice?.desconto_percentual || 0}% <span className="text-xs font-bold text-slate-500">Solar</span></p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Faturas Recentes</h3>
          <span className="material-symbols-outlined text-slate-600 text-xl">history</span>
        </div>
        <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-xl">
          {readings.length > 0 ? readings.map(r => (
            <div 
              key={r.id} 
              onClick={() => navigate(`/fatura/${r.id}`)}
              className="flex items-center justify-between p-5 active:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-400 border border-white/5">
                  <span className="material-symbols-outlined text-xl">receipt_long</span>
                </div>
                <div>
                  <p className="font-black text-sm">{r.data_atual}</p>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{r.consumo_periodo} kWh consumidos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-primary">R$ {Number(r.valor_total).toFixed(2)}</span>
                <span className="material-symbols-outlined text-slate-700">chevron_right</span>
              </div>
            </div>
          )) : (
            <p className="p-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">Sem registros no momento</p>
          )}
        </div>
      </section>
    </div>
  );

  const renderConsumption = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 px-2 text-center">Evolução de Consumo (kWh)</h3>
        <div className="flex items-end justify-between h-48 px-2 gap-2">
          {readings.length > 0 ? readings.slice(0, 6).reverse().map((r, i) => {
            const maxConsumo = Math.max(...readings.map(read => read.consumo_periodo)) || 1;
            const height = (r.consumo_periodo / maxConsumo) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-4 flex-1 group">
                <div className="relative w-full bg-slate-800/50 rounded-2xl overflow-hidden h-36 flex items-end">
                   <div 
                     className="w-full bg-primary transition-all duration-1000 group-hover:bg-blue-400 shadow-[0_0_20px_rgba(17,82,212,0.4)]" 
                     style={{ height: `${Math.max(10, height)}%` }}
                   />
                </div>
                <span className="text-[10px] font-black uppercase text-slate-500">{r.data_atual.split('-')[1]}/{r.data_atual.split('-')[0].substr(2)}</span>
              </div>
            );
          }) : (
             <div className="flex-1 text-center py-20 text-slate-600 text-[10px] font-black uppercase">Dados insuficientes</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">Análise de Eficiência</h3>
        <div className="bg-surface-dark rounded-3xl border border-white/5 divide-y divide-white/5 shadow-lg">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-2xl">event_repeat</span>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-500">Média Diária</span>
                  <span className="text-lg font-black">{currentInvoice ? (currentInvoice.consumo_periodo / 30).toFixed(1) : 0} kWh</span>
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-xs font-black text-green-500">-4.2%</span>
               <span className="text-[9px] font-bold text-slate-600 uppercase">vs mês ant.</span>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <span className="material-symbols-outlined text-secondary bg-secondary/10 p-3 rounded-2xl">eco</span>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-500">Sustentabilidade</span>
                  <span className="text-lg font-black">Carbono Zero</span>
               </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">Impacto OK</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex gap-4">
         <span className="material-symbols-outlined text-primary text-3xl shrink-0">tips_and_updates</span>
         <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-1">Dica SM Engenharia</span>
            <p className="text-sm text-blue-100/80 font-medium leading-snug">
               Identificamos que seu consumo é maior no horário de ponta. Evite ligar chuveiros elétricos entre 18h e 21h para otimizar sua fatura.
            </p>
         </div>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-surface-dark rounded-[2.5rem] p-10 border border-white/5 text-center shadow-2xl">
         <div className="size-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/30">
            <span className="material-symbols-outlined text-primary text-4xl">support_agent</span>
         </div>
         <h3 className="text-xl font-black mb-2 tracking-tight">Central de Ajuda</h3>
         <p className="text-slate-400 text-sm font-medium mb-10">Suporte técnico especializado para sua unidade consumidora.</p>
         
         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => window.open('https://wa.me/5538999999999?text=Olá, sou cliente da SM Engenharia e preciso de ajuda.')}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-white/10"
            >
               <span className="material-symbols-outlined text-green-500 text-4xl">chat</span>
               <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
            </button>
            <button 
              onClick={() => window.location.href = 'mailto:atendimento@smengenharia.com'}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all hover:bg-white/10"
            >
               <span className="material-symbols-outlined text-blue-400 text-4xl">mail</span>
               <span className="text-[10px] font-black uppercase tracking-widest">E-mail</span>
            </button>
         </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-4">Perguntas Frequentes</h3>
         <div className="space-y-3">
            {[
              { q: "Como meu desconto solar é aplicado?", a: "O desconto é calculado com base na energia injetada pelo sistema fotovoltaico no consórcio de geração da SM Engenharia, reduzindo o valor líquido do seu kWh." },
              { q: "Qual o prazo para compensação do PIX?", a: "A baixa é automática e instantânea no nosso sistema assim que o pagamento é confirmado pelo banco." },
              { q: "O que fazer em caso de falta de energia?", a: "Em caso de interrupção geral, verifique seus disjuntores. Caso persista, entre em contato com a CEMIG e nos informe para monitoramento técnico." }
            ].map((item, i) => (
              <details key={i} className="bg-surface-dark rounded-2xl border border-white/5 p-6 group transition-all">
                <summary className="list-none flex justify-between items-center cursor-pointer font-black text-sm pr-2">
                   {item.q}
                   <span className="material-symbols-outlined text-slate-600 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed font-medium bg-slate-800/30 p-4 rounded-xl border border-white/5">
                   {item.a}
                </p>
              </details>
            ))}
         </div>
      </div>

      <div className="flex flex-col items-center py-10 text-slate-600">
         <span className="material-symbols-outlined text-xl mb-2">verified_user</span>
         <p className="text-[10px] font-black uppercase tracking-widest mb-1">SM Engenharia Elétrica LTDA</p>
         <p className="text-[9px] font-bold">CNPJ: 00.000.000/0001-00 • MG</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-dark text-white font-sans pb-32 flex flex-col">
      <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-border-dark px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-14 rounded-2xl ring-4 ring-primary/20 bg-cover bg-center shadow-2xl border-2 border-white/10" style={{ backgroundImage: 'url("https://picsum.photos/seed/client_sm/200")' }} />
              <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 rounded-full border-4 border-background-dark shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-0.5">Olá, Cliente</span>
              <h2 className="text-xl font-black leading-tight tracking-tight truncate max-w-[200px]">{user.name}</h2>
            </div>
          </div>
          <button onClick={onLogout} className="size-12 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center text-red-500 active:scale-90 transition-all shadow-lg hover:bg-red-500/10">
            <span className="material-symbols-outlined text-2xl">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-hidden">
        {loading && !showPaymentModal ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
            <div className="relative">
               <span className="material-symbols-outlined animate-spin text-primary text-5xl">sync</span>
               <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full"></div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Sincronizando Central...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'consumption' && renderConsumption()}
            {activeTab === 'help' && renderHelp()}
          </>
        )}
      </main>

      {/* Payment Mock Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-[3rem] p-10 pb-14 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-700">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black tracking-tighter">Fatura PIX</h2>
              <button onClick={() => setShowPaymentModal(false)} className="size-12 flex items-center justify-center bg-slate-100 rounded-2xl active:scale-90 transition-all">
                <span className="material-symbols-outlined text-slate-900">close</span>
              </button>
            </div>

            {paymentSuccess ? (
              <div className="flex flex-col items-center py-10 animate-in zoom-in duration-500 text-center">
                <div className="size-28 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-green-100/50">
                  <span className="material-symbols-outlined text-6xl font-bold animate-bounce">check</span>
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Obrigado!</h3>
                <p className="text-slate-500 text-sm font-semibold px-4 leading-relaxed">
                  Seu pagamento foi processado com sucesso pela rede SM Engenharia.
                </p>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-12 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
                >
                  Concluído
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {isCreatingPayment ? (
                  <div className="flex flex-col items-center py-20 text-center">
                    <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4">sync</span>
                    <p className="text-slate-600 font-bold text-sm">Gerando código PIX...</p>
                    <p className="text-slate-400 text-xs mt-2">Aguarde alguns instantes</p>
                  </div>
                ) : paymentError ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500 mb-4">
                      {pixExpired ? 'schedule' : 'error'}
                    </span>
                    <h3 className="text-xl font-black mb-2">
                      {pixExpired ? 'Código PIX Expirado' : 'Erro ao gerar PIX'}
                    </h3>
                    <p className="text-slate-600 text-sm px-4">{paymentError}</p>
                    <div className="mt-6 flex gap-3 w-full">
                      {pixExpired ? (
                        <button
                          onClick={handleGenerateNewPix}
                          className="flex-1 px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined">refresh</span>
                          Gerar Novo Código
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          className="flex-1 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
                        >
                          Fechar
                        </button>
                      )}
                    </div>
                  </div>
                ) : currentPayment ? (
                  <>
                    <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <div className="size-56 bg-white p-4 rounded-3xl border-2 border-slate-200 mb-6 shadow-xl">
                        <img
                          src={`data:image/png;base64,${currentPayment.qr_code_base64}`}
                          alt="QR Code PIX"
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Total a Pagar</span>
                      <p className="text-4xl font-black tracking-tighter text-slate-900">
                        R$ {selectedInvoice ? Number(selectedInvoice.valor_total).toFixed(2) : '0,00'}
                      </p>
                      {currentPayment.expira_em && (
                        <p className="text-xs text-red-600 mt-2 font-bold">
                          Expira: {new Date(currentPayment.expira_em).toLocaleString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          if (currentPayment.qr_code) {
                            navigator.clipboard.writeText(currentPayment.qr_code);
                            alert("Código PIX copiado! Cole no app do seu banco.");
                          }
                        }}
                        className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-200"
                      >
                        <span className="material-symbols-outlined text-xl">content_copy</span>
                        Copiar Código Copia e Cola
                      </button>

                      <p className="text-[10px] text-center text-slate-500 leading-relaxed">
                        Abra o app do seu banco, escolha PIX e cole o código copiado.
                        A confirmação é automática e leva poucos segundos.
                      </p>
                    </div>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                       Ambiente de pagamento seguro SM Engenharia
                    </p>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 pb-12 pt-4 px-10 z-50">
        <div className="flex justify-between items-center max-w-xs mx-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'home' ? 'text-primary scale-110' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'home' ? 'fill-1' : ''}`}>home</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
          </button>
          <button 
            onClick={() => setActiveTab('consumption')}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'consumption' ? 'text-primary scale-110' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'consumption' ? 'fill-1' : ''}`}>analytics</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Consumo</span>
          </button>
          <button 
            onClick={() => setActiveTab('help')}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'help' ? 'text-primary scale-110' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'help' ? 'fill-1' : ''}`}>support_agent</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Ajuda</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ClientDashboard;
