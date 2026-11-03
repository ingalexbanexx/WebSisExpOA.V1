import React from 'react';
import {
  Inbox,
  FilePlus,
  Search,
  LayoutDashboard,
  ShieldAlert,
  Building,
  User,
  Phone,
  Clock,
  ArrowRightLeft,
  Archive,
  FileCheck,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabType =
  | 'bandeja'
  | 'iniciar'
  | 'resoluciones'
  | 'busqueda'
  | 'dashboard'
  | 'admin'
  | 'auditoria';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  bandejaSubTab?: 'pendientes' | 'mi_poder' | 'iniciados' | 'todos';
  setBandejaSubTab?: (subTab: 'pendientes' | 'mi_poder' | 'iniciados' | 'todos') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  bandejaSubTab = 'pendientes',
  setBandejaSubTab,
}) => {
  const { usuarioActual, departamentos, expedientes, resoluciones, roles } = useApp();

  const depto = departamentos.find((d) => d.id === usuarioActual.departamentoId);
  const rolInfo = roles[usuarioActual.rolId];

  // Contadores
  const pasesPendientes = expedientes.filter((exp) =>
    (exp.pases || []).some(
      (p) =>
        p.usuarioReceptorId === usuarioActual.id &&
        p.estadoPase === 'pendiente' &&
        p.esUltimoPase
    )
  ).length;

  const enMiPoder = expedientes.filter((exp) => {
    if (exp.estado === 'archivado') return false;
    const ultimoPase = exp.pases?.find((p) => p.esUltimoPase);
    if (ultimoPase) {
      return (
        ultimoPase.usuarioReceptorId === usuarioActual.id &&
        ultimoPase.estadoPase === 'recepcionado'
      );
    }
    return exp.usuarioInicioId === usuarioActual.id && exp.estado === 'iniciado';
  }).length;

  const iniciadosPorMi = expedientes.filter(
    (exp) => exp.usuarioInicioId === usuarioActual.id
  ).length;

  // Resoluciones visibles para este usuario
  const resolucionesVisibles = resoluciones.filter((r) => {
    if (r.esPublica) return true;
    return usuarioActual.rolId === 'admin' || usuarioActual.rolId === 'superadmin' || r.usuarioId === usuarioActual.id;
  }).length;

  const esAdminOSuper = usuarioActual.rolId === 'admin' || usuarioActual.rolId === 'superadmin';
  const esSuperUsuario = usuarioActual.rolId === 'superadmin';

  return (
    <aside className="w-64 bg-[#2C394B] text-slate-200 flex flex-col shrink-0 border-r border-[#082032] min-h-[calc(100vh-65px)]">
      {/* Navegación Principal */}
      <div className="p-4 flex-1 space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
            Módulos del Sistema
          </p>
          <nav className="space-y-1">
            {/* Bandeja de Entrada */}
            <button
              id="nav-tab-bandeja"
              onClick={() => setActiveTab('bandeja')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'bandeja'
                  ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-[#FC4F46]" />
                <span>Bandeja de Entrada</span>
              </div>
              {pasesPendientes > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#FC4F46] text-white">
                  {pasesPendientes}
                </span>
              )}
            </button>

            {/* Sub-navegación si Bandeja está activa */}
            {activeTab === 'bandeja' && setBandejaSubTab && (
              <div className="ml-5 pl-3 border-l-2 border-[#082032] py-1 space-y-1 text-xs">
                <button
                  onClick={() => setBandejaSubTab('pendientes')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    bandejaSubTab === 'pendientes'
                      ? 'text-[#FC4F46] font-bold bg-[#082032]'
                      : 'text-slate-300 hover:text-white hover:bg-[#082032]/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Pases a Recepcionar
                  </span>
                  {pasesPendientes > 0 && (
                    <span className="bg-[#FC4F46] text-white font-mono text-[10px] px-1.5 rounded-full">
                      {pasesPendientes}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBandejaSubTab('mi_poder')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    bandejaSubTab === 'mi_poder'
                      ? 'text-white font-bold bg-[#082032]'
                      : 'text-slate-300 hover:text-white hover:bg-[#082032]/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3 h-3" /> En mi Poder / Activos
                  </span>
                  <span className="bg-[#082032] text-slate-300 font-mono text-[10px] px-1.5 rounded">
                    {enMiPoder}
                  </span>
                </button>

                <button
                  onClick={() => setBandejaSubTab('iniciados')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    bandejaSubTab === 'iniciados'
                      ? 'text-white font-bold bg-[#082032]'
                      : 'text-slate-300 hover:text-white hover:bg-[#082032]/40'
                  }`}
                >
                  <span>Iniciados por Mí</span>
                  <span className="bg-[#082032] text-slate-300 font-mono text-[10px] px-1.5 rounded">
                    {iniciadosPorMi}
                  </span>
                </button>

                <button
                  onClick={() => setBandejaSubTab('todos')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded transition-colors text-left cursor-pointer ${
                    bandejaSubTab === 'todos'
                      ? 'text-white font-bold bg-[#082032]'
                      : 'text-slate-300 hover:text-white hover:bg-[#082032]/40'
                  }`}
                >
                  <span>Todos los Expedientes</span>
                  <span className="bg-[#082032] text-slate-300 font-mono text-[10px] px-1.5 rounded">
                    {expedientes.length}
                  </span>
                </button>
              </div>
            )}

            {/* Iniciar Expediente */}
            <button
              id="nav-tab-iniciar"
              onClick={() => setActiveTab('iniciar')}
              disabled={!rolInfo?.permisos.puedeIniciar}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'iniciar'
                  ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                  : !rolInfo?.permisos.puedeIniciar
                  ? 'text-slate-500 cursor-not-allowed opacity-60'
                  : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
              }`}
              title={
                !rolInfo?.permisos.puedeIniciar
                  ? 'Su rol actual no permite iniciar expedientes (requiere iniciador o admin)'
                  : undefined
              }
            >
              <div className="flex items-center gap-2.5">
                <FilePlus className="w-4 h-4 text-[#FC4F46]" />
                <span>Iniciar Expediente</span>
              </div>
              {!rolInfo?.permisos.puedeIniciar && (
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Bloqueado
                </span>
              )}
            </button>

            {/* Módulo de Resoluciones (Requisito 4) */}
            <button
              id="nav-tab-resoluciones"
              onClick={() => setActiveTab('resoluciones')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'resoluciones'
                  ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#FC4F46]" />
                <span>Resoluciones</span>
              </div>
              <span className="bg-[#082032] text-slate-300 font-mono text-[10px] px-1.5 rounded">
                {resolucionesVisibles}
              </span>
            </button>

            {/* Búsqueda Avanzada y Reportes */}
            <button
              id="nav-tab-busqueda"
              onClick={() => setActiveTab('busqueda')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'busqueda'
                  ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-[#FC4F46]" />
              <span>Búsqueda & Reportes</span>
            </button>
          </nav>
        </div>

        {/* Dashboard Analítico Configurable (Para Administradores y SuperUsuarios - Requisito 6) */}
        {esAdminOSuper && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
              Analítica y Control
            </p>
            <nav className="space-y-1">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#FC4F46]" />
                <span>Dashboard Analítico</span>
              </button>
            </nav>
          </div>
        )}

        {/* SECCIÓN GESTIÓN Y AUDITORÍA: EXCLUSIVA PARA SUPERUSUARIOS (Requisito 1: ni siquiera los Administradores) */}
        {esSuperUsuario && (
          <div className="pt-2 border-t border-[#082032]/60">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FC4F46]">
                Gestión & Auditoría
              </p>
              <span className="text-[9px] bg-[#082032] text-slate-300 px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                SuperUser
              </span>
            </div>
            <nav className="space-y-1">
              {/* Gestión del Sistema (CRUD Deptos y Usuarios) */}
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4 text-[#FC4F46]" />
                <span>Gestión del Sistema</span>
              </button>

              {/* Auditoría Inmutable */}
              <button
                id="nav-tab-auditoria"
                onClick={() => setActiveTab('auditoria')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'auditoria'
                    ? 'bg-[#082032] text-white border-l-4 border-[#FC4F46] shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-[#082032]/50 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#FC4F46]" />
                <span>Logs de Auditoría</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Tarjeta inferior con datos de la dependencia del usuario */}
      <div className="p-4 border-t border-[#082032] bg-[#082032]/70 text-xs">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Building className="w-3.5 h-3.5 text-[#FC4F46]" />
          <span className="font-semibold text-slate-300">Dependencia Asignada</span>
        </div>
        <p className="font-medium text-white truncate">{depto?.nombre}</p>
        <div className="mt-2.5 pt-2 border-t border-[#2C394B] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Phone className="w-3 h-3" />
            {depto?.telefonoInterno || 'Int. 2100'}
          </span>
          <span className="bg-[#2C394B] px-1.5 py-0.5 rounded text-slate-200 font-mono">
            {depto?.codigo}
          </span>
        </div>
      </div>
    </aside>
  );
};
