import React, { useState } from 'react';
import { Reading } from '../../types';

interface ManualPaymentModalProps {
  reading: Reading;
  onSave: (valorAjustado: number, observacao: string) => Promise<void>;
  onClose: () => void;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ reading, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [valorAjustado, setValorAjustado] = useState(reading.valor_total.toString());
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validação
    const valor = parseFloat(valorAjustado);
    if (isNaN(valor) || valor < 0) {
      setError('Valor inválido');
      return;
    }

    if (!observacao.trim() || observacao.trim().length < 10) {
      setError('Observação deve ter pelo menos 10 caracteres');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSave(valor, observacao.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao regularizar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-t-[2.5rem] rounded-b-[1rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-surface-dark z-10 p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black tracking-tighter">Regularizar Pagamento</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Confirmar pagamento manual
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {/* Cliente e Valor Original */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Cliente
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                {reading.cliente_nome}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Valor Original
              </span>
              <span className="text-lg font-black text-primary">
                R$ {Number(reading.valor_total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <span className="material-symbols-outlined text-amber-600 text-xl flex-shrink-0">warning</span>
            <div>
              <p className="text-[10px] font-black uppercase text-amber-700 mb-1">Atenção</p>
              <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                Esta ação registrará um pagamento manual. Use apenas para pagamentos confirmados
                (dinheiro, transferência, etc.). Uma observação detalhada é obrigatória.
              </p>
            </div>
          </div>

          {/* Valor Ajustado */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Valor Recebido
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                R$
              </span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-black py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary/30"
                placeholder="0.00"
                value={valorAjustado}
                onChange={(e) => setValorAjustado(e.target.value)}
              />
            </div>
            {parseFloat(valorAjustado) !== reading.valor_total && (
              <p className="text-[9px] text-orange-500 ml-1 font-bold">
                ⚠️ Valor diferente do original (desconto ou ajuste aplicado)
              </p>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Observação (Obrigatória)
            </label>
            <textarea
              required
              minLength={10}
              rows={4}
              className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-medium py-4 px-5 focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Ex: Pagamento recebido em dinheiro no valor de R$ 150,00. Cliente solicitou desconto de R$ 10,00 devido a..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
            <div className="flex justify-between items-center ml-1">
              <p className="text-[9px] text-slate-400">
                Mínimo 10 caracteres
              </p>
              <p className={`text-[9px] font-bold ${observacao.length >= 10 ? 'text-green-600' : 'text-slate-400'}`}>
                {observacao.length} caracteres
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start">
              <span className="material-symbols-outlined text-red-600 text-sm">error</span>
              <p className="text-[11px] font-bold text-red-700 flex-1">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black py-5 rounded-[1.5rem] active:scale-95 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined font-bold">payments</span>
                  Regularizar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPaymentModal;
