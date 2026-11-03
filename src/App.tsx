import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { BandejaEntrada } from './components/BandejaEntrada';
import { BusquedaAvanzada } from './components/BusquedaAvanzada';
import { ResolucionesView } from './components/ResolucionesView';
import { ConfigurableDashboard } from './components/ConfigurableDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuditoriaView } from './components/AuditoriaView';
import { DetalleExpedienteModal } from './components/DetalleExpedienteModal';
import { IniciarExpedienteModal } from './components/IniciarExpedienteModal';
import { CrearPaseModal } from './components/CrearPaseModal';
import { RecepcionarPaseModal } from './components/RecepcionarPaseModal';
import { ArchivarExpedienteModal } from './components/ArchivarExpedienteModal';
import { CaratulaOficialPrint } from './components/CaratulaOficialPrint';
import { Expediente } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { expedientes, usuarioActual } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('bandeja');
  const [bandejaSubTab, setBandejaSubTab] = useState<'pendientes' | 'mi_poder' | 'iniciados' | 'todos'>('pendientes');
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  // Modales
  const [selectedExpedienteId, setSelectedExpedienteId] = useState<number | null>(null);
  const [expedienteParaPase, setExpedienteParaPase] = useState<Expediente | null>(null);
  const [paseIdParaRecepcion, setPaseIdParaRecepcion] = useState<number | null>(null);
  const [expedienteParaArchivar, setExpedienteParaArchivar] = useState<Expediente | null>(null);
  const [expedienteParaPrint, setExpedienteParaPrint] = useState<Expediente | null>(null);
  const [iniciarModalOpen, setIniciarModalOpen] = useState(false);

  // Toast Notificación
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Requisito 1: Gestión y Auditoría SOLO para superadmin
  useEffect(() => {
    if (usuarioActual.rolId !== 'superadmin') {
      if (activeTab === 'admin' || activeTab === 'auditoria') {
        setActiveTab('bandeja');
      }
    }
  }, [usuarioActual.rolId, activeTab]);

  // Mantener actualizado el expediente seleccionado de detalle si cambian los datos en Context
  const selectedExpediente = selectedExpedienteId
    ? expedientes.find((e) => e.id === selectedExpedienteId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#F3F4F5] text-[#082032] font-serif flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-rose-900 text-white border-rose-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Barra de Navegación Superior */}
      <Navbar
        onOpenSearch={(q) => {
          setSearchInitialQuery(q || '');
          setActiveTab('busqueda');
        }}
        onOpenPendingPases={() => {
          setActiveTab('bandeja');
          setBandejaSubTab('pendientes');
        }}
        onOpenIniciar={() => setIniciarModalOpen(true)}
      />

      {/* Cuerpo Principal: Sidebar + Contenido */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'iniciar') {
              setIniciarModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          bandejaSubTab={bandejaSubTab}
          setBandejaSubTab={setBandejaSubTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'bandeja' && (
            <BandejaEntrada
              subTab={bandejaSubTab}
              setSubTab={setBandejaSubTab}
              onOpenDetalle={(exp) => setSelectedExpedienteId(exp.id)}
              onOpenCrearPase={(exp) => setExpedienteParaPase(exp)}
              onOpenRecepcionarPase={(pId) => setPaseIdParaRecepcion(pId)}
              onOpenArchivar={(exp) => setExpedienteParaArchivar(exp)}
              onOpenIniciar={() => setIniciarModalOpen(true)}
            />
          )}

          {activeTab === 'resoluciones' && (
            <ResolucionesView
              onOpenDetalleExpediente={(expId) => setSelectedExpedienteId(expId)}
            />
          )}

          {activeTab === 'busqueda' && (
            <BusquedaAvanzada
              initialQuery={searchInitialQuery}
              onOpenDetalle={(exp) => setSelectedExpedienteId(exp.id)}
            />
          )}

          {activeTab === 'dashboard' && (
            <ConfigurableDashboard
              onOpenDetalleExpediente={(expId) => setSelectedExpedienteId(expId)}
            />
          )}

          {/* Exclusivo SuperUsuario (Requisito 1) */}
          {activeTab === 'admin' && usuarioActual.rolId === 'superadmin' && (
            <AdminDashboard />
          )}

          {activeTab === 'auditoria' && usuarioActual.rolId === 'superadmin' && (
            <AuditoriaView />
          )}
        </main>
      </div>

      {/* Modales del Sistema */}
      <DetalleExpedienteModal
        expediente={selectedExpediente}
        onClose={() => setSelectedExpedienteId(null)}
        onOpenCrearPase={(exp) => setExpedienteParaPase(exp)}
        onOpenRecepcionarPase={(pId) => setPaseIdParaRecepcion(pId)}
        onOpenArchivar={(exp) => setExpedienteParaArchivar(exp)}
        onOpenPrintCaratula={(exp) => setExpedienteParaPrint(exp)}
      />

      <IniciarExpedienteModal
        isOpen={iniciarModalOpen}
        onClose={() => setIniciarModalOpen(false)}
        onSuccess={(clave) => {
          showToast(`Expediente ${clave} iniciado correctamente.`);
          setActiveTab('bandeja');
          setBandejaSubTab('iniciados');
        }}
      />

      <CrearPaseModal
        expediente={expedienteParaPase}
        isOpen={!!expedienteParaPase}
        onClose={() => setExpedienteParaPase(null)}
        onSuccess={() => {
          showToast('Pase oficial emitido y registrado en la hoja de ruta.');
        }}
      />

      <RecepcionarPaseModal
        paseId={paseIdParaRecepcion}
        isOpen={!!paseIdParaRecepcion}
        onClose={() => setPaseIdParaRecepcion(null)}
        onSuccess={() => {
          showToast('Pase recepcionado formalmente.');
        }}
      />

      <ArchivarExpedienteModal
        expediente={expedienteParaArchivar}
        isOpen={!!expedienteParaArchivar}
        onClose={() => setExpedienteParaArchivar(null)}
        onSuccess={() => {
          showToast('Expediente archivado en custodia física.');
        }}
      />

      <CaratulaOficialPrint
        expediente={expedienteParaPrint}
        isOpen={!!expedienteParaPrint}
        onClose={() => setExpedienteParaPrint(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
