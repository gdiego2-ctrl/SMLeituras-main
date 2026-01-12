import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Client, Reading, PaymentHistoryItem, ClientHistorySummary, ConsumptionData } from '../../types';
import ConsumptionChart from './ConsumptionChart';

const ClientHistory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [summary, setSummary] = useState<ClientHistorySummary | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [clientsData, summaryData, readingsData, paymentsData, consumptionDataResult] = await Promise.all([
          supabase.clients.list(),
          supabase.history.getClientSummary(id),
          supabase.readings.getByClientId(id),
          supabase.payments.getByClientId(id),
          supabase.history.getConsumptionData(id)
        ]);

        setClient(clientsData.find(c => c.id === id) || null);
        setSummary(summaryData);
        setReadings(readingsData);
        setPayments(paymentsData);
        setConsumptionData(consumptionDataResult);
      } catch (err) {
        console.error('Error loading client history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Carregando histórico...
        </p>
      </div>
    );
  }

  if (!client || !summary) {
    return (
      <div className="p-10 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">error</span>
        <p className="font-black uppercase text-slate-400">Cliente não encontrado</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary text-xs font-black uppercase underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago': return 'bg-green-500 text-white';
      case 'Vencido': return 'bg-red-500 text-white';
      case 'Pendente': return 'bg-orange-400 text-white';
      case 'Cancelada': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-700';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate(-1)}
          className="text-primary p-2 active:scale-75 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-widest flex-1 text-center">
          Histórico Completo
        </h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      <main className="flex-1 p-6 space-y-6 pb-20">
        {/* Client Name */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {client.nome}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            ID: {client.id_medidor}
          </p>
        </div>

        {/* Financial Summary Cards */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">payments</span>
            Resumo Financeiro
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Faturado */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">receipt_long</span>
                <p className="text-[9px] font-black uppercase text-slate-500">Total Faturado</p>
              </div>
              <p className="text-2xl font-black text-blue-600">
                R$ {summary.totalBilled.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {summary.invoiceCount} {summary.invoiceCount === 1 ? 'fatura' : 'faturas'}
              </p>
            </div>

            {/* Total Pago */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                <p className="text-[9px] font-black uppercase text-slate-500">Total Pago</p>
              </div>
              <p className="text-2xl font-black text-green-600">
                R$ {summary.totalPaid.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {summary.paidInvoiceCount} {summary.paidInvoiceCount === 1 ? 'paga' : 'pagas'}
              </p>
            </div>

            {/* Em Aberto */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-orange-600 text-lg">schedule</span>
                <p className="text-[9px] font-black uppercase text-slate-500">Em Aberto</p>
              </div>
              <p className="text-2xl font-black text-orange-600">
                R$ {summary.totalOutstanding.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {summary.pendingInvoiceCount + summary.overdueInvoiceCount} pendentes
              </p>
            </div>

            {/* Média Mensal */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-600 text-lg">trending_up</span>
                <p className="text-[9px] font-black uppercase text-slate-500">Média Mensal</p>
              </div>
              <p className="text-2xl font-black text-slate-600">
                R$ {summary.monthlyAverage.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                por mês
              </p>
            </div>
          </div>
        </section>

        {/* Consumption Chart */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            Consumo Mensal
          </h3>
          <ConsumptionChart data={consumptionData} />
        </section>

        {/* Invoice List */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">receipt</span>
            Todas as Faturas ({readings.length})
          </h3>

          {readings.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">description</span>
              <p className="text-sm font-bold text-slate-400">Nenhuma fatura encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readings.map(reading => (
                <div
                  key={reading.id}
                  onClick={() => navigate(`/leitura/${reading.id}`)}
                  className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(reading.data_atual).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {reading.consumo_periodo} kWh consumidos
                      </p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${getStatusColor(reading.status)}`}>
                      {reading.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-sm">event</span>
                      <span className="text-[10px] font-bold">
                        Venc: {new Date(reading.vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-lg font-black text-primary">
                      R$ {Number(reading.valor_total).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment History */}
        <section>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">history</span>
            Histórico de Pagamentos ({payments.length})
          </h3>

          {payments.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">payment</span>
              <p className="text-sm font-bold text-slate-400">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div
                  key={payment.id}
                  className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${payment.isManual ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {payment.tipoPagamento === 'manual' ? '💵 Manual' : '📱 PIX'}
                        </span>
                        {payment.observacao && (
                          <span className="material-symbols-outlined text-amber-600 text-sm" title={payment.observacao}>
                            info
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        R$ {payment.valor.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(payment.dataRegistro).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(payment.dataRegistro).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {payment.observacao && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-2 italic">
                          "{payment.observacao}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ClientHistory;
