import React, { useState } from 'react';
import {
  FileText,
  Bell,
  Search,
  Shield,
  RotateCcw,
  ChevronDown,
  UserCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenSearch: (query?: string) => void;
  onOpenPendingPases: () => void;
  onOpenIniciar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenPendingPases,
  onOpenIniciar,
}) => {
  const {
    usuarioActual,
    usuarios,
    switchUsuario,
    departamentos,
    expedientes,
    restablecerDatos,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const deptoActual = departamentos.find((d) => d.id === usuarioActual.departamentoId);

  // Calcular pases pendientes para este usuario
  const pasesPendientesCount = expedientes.reduce((acc, exp) => {
    const pend = (exp.pases || []).some(
      (p) =>
        p.usuarioReceptorId === usuarioActual.id &&
        p.estadoPase === 'pendiente' &&
        p.esUltimoPase
    );
    return pend ? acc + 1 : acc;
  }, 0);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      onOpenSearch(quickQuery.trim());
    }
  };

  const getRolBadgeColor = (rolId: string) => {
    switch (rolId) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'iniciador':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pase':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#082032] border-b border-[#2C394B] shadow-md text-white">
      {/* Top Banner de Gobierno / Repartición */}
      <div className="bg-[#051522] text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-[#2C394B]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FC4F46] animate-pulse"></span>
          <span className="font-bold tracking-wider text-slate-100">
            REPARTICIÓN 2100
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300">
            Sistema Oficial de Gestión de Expedientes Digitales (SIGED)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-300 hidden md:inline">
            Ejercicio Activo: <strong className="text-white font-mono">2026</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <button
            id="btn-restablecer-datos"
            onClick={() => {
              if (confirmReset) {
                restablecerDatos();
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
                setTimeout(() => setConfirmReset(false), 3500);
              }
            }}
            title="Restablece datos iniciales de prueba"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#FC4F46]" />
            <span>{confirmReset ? '¿Confirmar reinicio demo?' : 'Restablecer Demo'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Identidad */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FC4F46] text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-serif">
                SIGED
              </span>
              <span className="text-xs bg-[#2C394B] text-slate-200 font-semibold px-2 py-0.5 rounded border border-[#2C394B]">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block">
              Mesa de Entradas y Trazabilidad Documental
            </p>
          </div>
        </div>

        {/* Buscador Rápido de Expediente */}
        <form
          onSubmit={handleQuickSearchSubmit}
          className="flex-1 max-w-md hidden md:flex items-center relative"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="input-quick-search"
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Buscar por Clave (ej: 2100-1-2026) o Asunto..."
            className="w-full pl-9 pr-20 py-2 bg-[#2C394B]/90 hover:bg-[#2C394B] focus:bg-[#2C394B] text-sm text-white placeholder-slate-400 rounded-lg border border-[#2C394B] focus:border-[#FC4F46] focus:ring-2 focus:ring-[#FC4F46]/30 outline-none transition-all font-sans"
          />
          <button
            type="submit"
            id="btn-quick-search-submit"
            className="absolute right-1.5 px-2.5 py-1 text-xs font-bold text-[#FC4F46] hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            Buscar
          </button>
        </form>

        {/* Acciones & Perfil */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón Nuevo Expediente (Acción rápida destacada CTA) */}
          <button
            id="btn-nav-iniciar-expediente"
            onClick={onOpenIniciar}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FC4F46] hover:bg-[#e03e36] active:bg-[#c9332c] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span className="text-sm leading-none">+</span>
            <span>Nuevo Expediente</span>
          </button>

          {/* Notificación de Pases Pendientes */}
          <button
            id="btn-nav-pending-pases"
            onClick={onOpenPendingPases}
            className={`relative p-2 rounded-lg border transition-colors cursor-pointer ${
              pasesPendientesCount > 0
                ? 'bg-[#FC4F46]/20 border-[#FC4F46]/60 text-[#FC4F46] hover:bg-[#FC4F46]/30'
                : 'border-[#2C394B] text-slate-300 hover:bg-[#2C394B] hover:text-white'
            }`}
            title={`${pasesPendientesCount} pases pendientes de recepción`}
          >
            <Bell className="w-4 h-4" />
            {pasesPendientesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FC4F46] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {pasesPendientesCount}
              </span>
            )}
          </button>

          {/* Selector de Usuario / Rol (Permite probar como Iniciador, Admin, Pase) */}
          <div className="relative">
            <button
              id="btn-user-switcher"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#2C394B] bg-[#2C394B]/60 hover:bg-[#2C394B] transition-colors cursor-pointer text-left text-white"
            >
              <div className="w-8 h-8 rounded-full bg-[#082032] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-[#2C394B]">
                {usuarioActual.avatarUrl ? (
                  <img
                    src={usuarioActual.avatarUrl}
                    alt={usuarioActual.username}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  usuarioActual.firstName.charAt(0)
                )}
              </div>

              <div className="hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight">
                    {usuarioActual.firstName} {usuarioActual.lastName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${getRolBadgeColor(
                      usuarioActual.rolId
                    )}`}
                  >
                    {usuarioActual.rolId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[140px]">
                  {deptoActual?.nombre || 'Sin Departamento'}
                </p>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown de cambio rápido de usuario/rol */}
            {userDropdownOpen && (
              <div
                id="dropdown-user-switcher-menu"
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Simular Usuario / Probar Roles
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cambie de usuario para evaluar permisos de inicio, pase, recepción y archivo.
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {usuarios.map((u) => {
                    const depto = departamentos.find((d) => d.id === u.departamentoId);
                    const isCurrent = u.id === usuarioActual.id;

                    return (
                      <button
                        key={u.id}
                        id={`btn-switch-user-${u.id}`}
                        onClick={() => {
                          switchUsuario(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden border border-slate-200">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.username}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.firstName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                              {u.firstName} {u.lastName}
                              {isCurrent && (
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                              {depto?.codigo}: {depto?.nombre}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${getRolBadgeColor(
                            u.rolId
                          )}`}
                        >
                          {u.rolId}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    Reglas Django RBAC activas
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {usuarioActual.id}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
