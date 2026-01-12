
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Client } from '../../types';
import EditClientModal from './EditClientModal';

const ClientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClient = async () => {
    if (id) {
      const list = await supabase.clients.list();
      const found = list.find(c => c.id === id);
      if (found) setClient(found);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleSendInvite = () => {
    if (!client) return;
    const message = `Olá ${client.nome}, aqui é da SM Engenharia Elétrica!\n\nSeu cadastro de faturamento já está pronto. Para acessar suas faturas e consumo:\n\n1. Acesse o App\n2. Faça login com:\n   E-mail: ${client.email}\n   Senha: (fornecida anteriormente)\n\nQualquer dúvida, estamos à disposição!`;
    window.open(`https://wa.me/${client.contato.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
  };

  const handleSaveEdit = async (updatedData: Partial<Client>) => {
    if (!client) return;

    try {
      // Save using the existing save function with id
      await supabase.clients.save({ id: client.id, ...updatedData });

      // Refresh client data
      await fetchClient();

      setShowEditModal(false);
      alert('✅ Cliente atualizado com sucesso!');
    } catch (err: any) {
      console.error('Error updating client:', err);
      alert('❌ Erro ao atualizar cliente: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    // Step 1: Check if client can be deactivated (no pending invoices)
    try {
      const { canDelete, message } = await supabase.clients.canDeleteClient(client.id);

      if (!canDelete) {
        alert(`❌ Não é possível desativar: ${message}`);
        return;
      }

      // Step 2: Confirm deactivation
      const confirmMessage = `⚠️ ATENÇÃO!\n\nVocê está prestes a DESATIVAR:\n• Cliente: ${client.nome}\n• Email: ${client.email}\n• ID Medidor: ${client.id_medidor}\n\nO cliente será marcado como INATIVO e não aparecerá nas listagens.\n✅ O cliente pode ser REATIVADO posteriormente.\n✅ As faturas pagas serão mantidas.\n\nDeseja continuar?`;

      if (!confirm(confirmMessage)) {
        return;
      }

      // Step 3: Soft delete - Mark as inactive
      setIsDeleting(true);
      await supabase.clients.save({
        id: client.id,
        status: 'inativo'
      });

      alert('✅ Cliente desativado com sucesso!\n\nPara reativar, edite o cliente e mude o status para "ativo".');
      navigate('/clientes');
    } catch (err: any) {
      console.error('Error deactivating client:', err);
      alert('❌ Erro ao desativar cliente: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!client) return <div className="p-8 text-center">Cliente não encontrado.</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark flex flex-col relative">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/90 dark:bg-surface-dark/90 px-4 py-3 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => navigate(-1)} className="text-primary flex items-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-base font-black flex-1 text-center">Perfil da Unidade</h2>
        <button
          onClick={() => setShowEditModal(true)}
          className="text-primary text-xs font-black uppercase active:scale-90 transition-transform"
        >
          Editar
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <div className="flex flex-col items-center pt-6 pb-8 px-4">
          <div className="relative">
            <div 
              className="rounded-3xl h-24 w-24 shadow-2xl ring-4 ring-white dark:ring-slate-800 mb-4 bg-cover bg-center overflow-hidden flex items-center justify-center bg-primary/10"
            >
               <span className="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
            <div className="absolute bottom-4 right-0 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full h-5 w-5 shadow-lg" />
          </div>
          <h1 className="text-xl font-black text-center tracking-tight">{client.nome}</h1>
          <div className="flex gap-2 mt-2">
            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] rounded-lg font-black uppercase tracking-widest text-slate-500">#{client.id.substr(0,4)}</span>
            <span className="bg-green-50 dark:bg-green-900/20 px-2.5 py-1 text-[10px] rounded-lg font-black uppercase tracking-widest text-green-700">Unidade Ativa</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <button 
            onClick={handleSendInvite}
            className="w-full bg-green-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-green-200 active:scale-95 transition-all mb-4"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">key</span>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tighter leading-none">Liberar Acesso</span>
                <span className="text-[10px] font-bold opacity-80 uppercase">Enviar instruções via WhatsApp</span>
              </div>
            </div>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <div className="px-4 mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-2">Dados Técnicos</h3>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">ID Medidor</span>
                <span className="text-sm font-black font-mono">{client.id_medidor}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">speed</span>
            </div>
            <div className="flex items-center justify-between p-5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">Tipo de Tensão</span>
                <span className="text-sm font-black">{client.tipo_tensao}</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">electric_meter</span>
            </div>
          </div>
        </div>

        <div className="px-4 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-2">Localização e Contato</h3>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            <div className="p-5 flex items-start gap-3">
              <div className="bg-primary/5 rounded-xl p-3 text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">location_on</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase text-slate-400">Endereço Unidade</span>
                 <p className="text-sm font-bold leading-snug">{client.endereco}</p>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black uppercase text-slate-400">E-mail Financeiro</span>
                <span className="text-sm font-bold truncate">{client.email}</span>
              </div>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-[20px] text-slate-500">mail</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 flex flex-col gap-3 pb-6">
          <button
            onClick={() => navigate(`/cliente/${id}/historico`)}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">analytics</span>
            Histórico Completo
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full bg-white dark:bg-surface-dark border border-orange-100 text-orange-600 font-black py-4 rounded-2xl active:scale-[0.98] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Desativando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">block</span>
                Desativar Cliente
              </>
            )}
          </button>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ClientDetails;
