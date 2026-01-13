
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserSession, UserRole } from './types';
import { supabaseClient, isMissingConfig } from './supabase';

// Lazy load screens for code splitting
const Login = lazy(() => import('./screens/Login'));
const TechDashboard = lazy(() => import('./screens/Technician/Dashboard'));
const NewReading = lazy(() => import('./screens/Technician/NewReading'));
const ReadingHistory = lazy(() => import('./screens/Technician/ReadingHistory'));
const ReadingDetails = lazy(() => import('./screens/Technician/ReadingDetails'));
const ManageClients = lazy(() => import('./screens/Technician/ManageClients'));
const ClientDetails = lazy(() => import('./screens/Technician/ClientDetails'));
const ClientHistory = lazy(() => import('./screens/Technician/ClientHistory'));
const ClientDashboard = lazy(() => import('./screens/Client/ClientDashboard'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-primary text-white gap-4">
    <span className="material-symbols-outlined animate-spin text-5xl">sync</span>
    <p className="font-bold tracking-widest uppercase text-xs">Carregando...</p>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>({ user: null });
  const [loading, setLoading] = useState(true);

  const getRoleFromUser = (user: any): UserRole => {
    const email = user.email?.toLowerCase() || '';
    // Lista de emails de administradores/técnicos
    const adminEmails = ['bwasistemas@gmail.com', 'gdiego2@gmail.com'];

    if (adminEmails.includes(email) || email.includes('tecnico')) {
      return 'tecnico';
    }
    return 'cliente';
  };

  const getUserDisplayName = (email: string): string => {
    if (email === 'bwasistemas@gmail.com') return 'Administrador SM';
    if (email === 'gdiego2@gmail.com') return 'Diego Admin';
    return email.split('@')[0] || 'Usuário';
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: getUserDisplayName(session.user.email || ''),
            role: getRoleFromUser(session.user)
          }
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: getUserDisplayName(session.user.email || ''),
            role: getRoleFromUser(session.user)
          }
        });
      } else {
        setSession({ user: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    setSession({ user: null });
  }

  // Show config error screen if environment variables are missing
  if (isMissingConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-600 text-white gap-6 p-8">
        <span className="material-symbols-outlined text-7xl">error</span>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black mb-4">ERRO DE CONFIGURAÇÃO</h1>
          <p className="text-sm mb-4">
            As variáveis de ambiente do Supabase não estão configuradas.
          </p>
          <div className="bg-white/10 rounded-xl p-4 text-left text-xs font-mono mb-4">
            <p className="mb-2 font-bold">Variáveis obrigatórias:</p>
            <p>• VITE_SUPABASE_URL</p>
            <p>• VITE_SUPABASE_ANON_KEY</p>
          </div>
          <div className="text-xs text-white/80">
            <p className="mb-2">Se você está no <strong>Vercel</strong>:</p>
            <p>Configure as variáveis em Settings → Environment Variables</p>
            <p className="mt-4">Se você está em <strong>desenvolvimento local</strong>:</p>
            <p>Copie .env.example para .env.local e preencha os valores</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-primary text-white gap-4">
      <span className="material-symbols-outlined animate-spin text-5xl">sync</span>
      <p className="font-bold tracking-widest uppercase text-xs">Carregando SM Engenharia...</p>
    </div>
  );

  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/login"
            element={session.user ? <Navigate to="/" /> : <Login onLogin={() => {}} />}
          />
        
        <Route 
          path="/" 
          element={
            !session.user ? (
              <Navigate to="/login" />
            ) : session.user.role === 'tecnico' ? (
              <TechDashboard onLogout={handleLogout} user={session.user} />
            ) : (
              <ClientDashboard onLogout={handleLogout} user={session.user} />
            )
          } 
        />

        {/* Rotas de Técnico */}
        <Route path="/nova-leitura" element={session.user?.role === 'tecnico' ? <NewReading /> : <Navigate to="/" />} />
        <Route path="/historico" element={session.user?.role === 'tecnico' ? <ReadingHistory /> : <Navigate to="/" />} />
        <Route path="/leitura/:id" element={session.user?.role === 'tecnico' ? <ReadingDetails /> : <Navigate to="/" />} />
        <Route path="/clientes" element={session.user?.role === 'tecnico' ? <ManageClients /> : <Navigate to="/" />} />
        <Route path="/cliente/:id" element={session.user?.role === 'tecnico' ? <ClientDetails /> : <Navigate to="/" />} />
        <Route path="/cliente/:id/historico" element={session.user?.role === 'tecnico' ? <ClientHistory /> : <Navigate to="/" />} />

        {/* Rotas de Cliente - Reutiliza visualização de fatura */}
        <Route path="/fatura/:id" element={session.user?.role === 'cliente' ? <ReadingDetails /> : <Navigate to="/" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
