import React, { useState, useEffect } from 'react';
import { Client } from '../../types';

interface EditClientModalProps {
  client: Client;
  onSave: (updatedClient: Partial<Client>) => Promise<void>;
  onClose: () => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    nome: client.nome,
    endereco: client.endereco,
    contato: client.contato,
    id_medidor: client.id_medidor,
    tipo_tensao: client.tipo_tensao,
    status: client.status || 'ativo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Error saving client:', err);
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
              <h2 className="text-2xl font-black tracking-tighter">Editar Cliente</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Modificar dados cadastrais
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
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Nome Completo
            </label>
            <input
              required
              className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30"
              placeholder="Ex: João da Silva"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* ID Medidor e Tipo Tensão */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                ID Medidor
              </label>
              <input
                required
                className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30 font-mono"
                placeholder="0000"
                value={formData.id_medidor}
                onChange={(e) => setFormData({ ...formData, id_medidor: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Tipo Ligação
              </label>
              <select
                className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30 appearance-none"
                value={formData.tipo_tensao}
                onChange={(e) => setFormData({ ...formData, tipo_tensao: e.target.value as any })}
              >
                <option>Monofásico</option>
                <option>Bifásico</option>
                <option>Trifásico</option>
              </select>
            </div>
          </div>

          {/* Email - Read Only */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              E-mail (não pode ser alterado)
            </label>
            <input
              type="email"
              disabled
              className="w-full rounded-2xl border-none bg-slate-200 dark:bg-slate-700 text-sm font-bold py-4 px-5 opacity-60 cursor-not-allowed"
              value={client.email}
            />
            <p className="text-[9px] text-slate-400 ml-1">
              Email está vinculado à conta de acesso e não pode ser modificado
            </p>
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Telefone
            </label>
            <input
              required
              className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30"
              placeholder="(00) 00000-0000"
              value={formData.contato}
              onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
            />
          </div>

          {/* Endereço */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Endereço Completo
            </label>
            <input
              required
              className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30"
              placeholder="Rua, Número, Bairro"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Status da Unidade
            </label>
            <select
              className="w-full rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-sm font-bold py-4 px-5 focus:ring-2 focus:ring-primary/30 appearance-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="suspenso">Suspenso</option>
            </select>
            <p className="text-[9px] text-slate-400 ml-1">
              {formData.status === 'ativo' && '✅ Unidade em operação normal'}
              {formData.status === 'inativo' && '⏸️ Unidade temporariamente desativada'}
              {formData.status === 'suspenso' && '⛔ Unidade suspensa (pagamento pendente)'}
            </p>
          </div>

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
              className="flex-1 bg-primary hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined font-bold">save</span>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
