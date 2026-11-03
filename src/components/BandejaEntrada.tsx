import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  ArrowRightLeft,
  FilePlus2,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Send,
  Archive,
  ArrowRight,
  Eye,
  AlertCircle,
  Building,
  Layers,
} from 'lucide-react';
import { Expediente, EstadoExpediente } from '../types';
import { useApp } from '../context/AppContext';

interface BandejaEntradaProps {
  subTab: 'pendientes' | 'mi_poder' | 'iniciados' | 'todos';
  setSubTab: (subTab: 'pendientes' | 'mi_poder' | 'iniciados' | 'todos') => void;
  onOpenDetalle: (exp: Expediente) => void;
  onOpenCrearPase: (exp: Expediente) => void;
  onOpenRecepcionarPase: (paseId: number) => void;
  onOpenArchivar: (exp: Expediente) => void;
  onOpenIniciar: () => void;
}

export const BandejaEntrada: React.FC<BandejaEntradaProps> = ({
  subTab,
  setSubTab,
  onOpenDetalle,
  onOpenCrearPase,
  onOpenRecepcionarPase,
  onOpenArchivar,
  onOpenIniciar,
}) => {
  const {
    expedientes,
    usuarioActual,
    getDepartamento,
    getUsuario,
    calcularTotalFojas,
    roles,
  } = useApp();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const rolInfo = roles[usuarioActual.rolId];

  // 1. Pases Pendientes de Recepción para el usuario actual
  const pasesPendientes = expedientes.filter((exp) =>
    (exp.pases || []).some(
      (p) =>
        p.usuarioReceptorId === usuarioActual.id &&
        p.estadoPase === 'pendiente' &&
        p.esUltimoPase
    )
  );

  // 2. Expedientes en mi poder / Activos
  const expedientesEnMiPoder = expedientes.filter((exp) => {
    if (exp.estado === 'archivado') return false;
    const ultimoPase = exp.pases?.find((p) => p.esUltimoPase);
    if (ultimoPase) {
      return (
        ultimoPase.usuarioReceptorId === usuarioActual.id &&
        ultimoPase.estadoPase === 'recepcionado'
      );
    }
    return exp.usuarioInicioId === usuarioActual.id && exp.estado === 'iniciado';
  });

  // 3. Iniciados por mí
  const expedientesIniciados = expedientes.filter(
    (exp) => exp.usuarioInicioId === usuarioActual.id
  );

  // Seleccionar lista según subTab
  let listadoActual: Expediente[] = [];
  if (subTab === 'pendientes') {
    listadoActual = pasesPendientes;
  } else if (subTab === 'mi_poder') {
    listadoActual = expedientesEnMiPoder;
  } else if (subTab === 'iniciados') {
    listadoActual = expedientesIniciados;
  } else {
    listadoActual = expedientes;
  }

  // Filtrado interno
  const listadoFiltrado = listadoActual.filter((exp) => {
    if (filterEstado !== 'todos' && exp.estado !== filterEstado) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matchClave = exp.claveUnica.toLowerCase().includes(q);
      const matchAsunto = exp.asunto.toLowerCase().includes(q);
      const matchTramite = exp.tramiteInicio.toLowerCase().includes(q);
      return matchClave || matchAsunto || matchTramite;
    }
    return true;
  });

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Bandeja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bandeja de Entrada y Movimientos
            </h1>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              {listadoFiltrado.length} trámites
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestione las actuaciones administrativas bajo custodia o pendientes de recepción.
          </p>
        </div>

        {rolInfo?.permisos.puedeIniciar && (
          <button
            id="btn-bandeja-nuevo-expediente"
            onClick={onOpenIniciar}
            className="px-4 py-2 bg-[#FC4F46] hover:bg-[#e03e36] active:bg-[#c9332c] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <span className="text-base leading-none">+</span>
            <span>Iniciar Nuevo Expediente</span>
          </button>
        )}
      </div>

      {/* Tarjetas / Tabs de Estado Rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          id="tab-btn-pendientes"
          onClick={() => setSubTab('pendientes')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            subTab === 'pendientes'
              ? 'bg-[#FC4F46]/10 border-[#FC4F46] ring-2 ring-[#FC4F46]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FC4F46]" />
              Pases a Recepcionar
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                pasesPendientes.length > 0
                  ? 'bg-[#FC4F46] text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pasesPendientes.length}
            </span>
          </div>
          <p className="text-2xl font-black text-[#082032] mt-2 font-mono">
            {pasesPendientes.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Trámites remitidos a usted pendientes de ingreso formal
          </p>
        </button>

        <button
          id="tab-btn-mi-poder"
          onClick={() => setSubTab('mi_poder')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            subTab === 'mi_poder'
              ? 'bg-[#2C394B]/10 border-[#2C394B] ring-2 ring-[#2C394B]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#082032]" />
              En mi Poder / Activos
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-[#082032] text-white">
              {expedientesEnMiPoder.length}
            </span>
          </div>
          <p className="text-2xl font-black text-[#082032] mt-2 font-mono">
            {expedientesEnMiPoder.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Expedientes listos para emitir pase, dictaminar o archivar
          </p>
        </button>

        <button
          id="tab-btn-iniciados"
          onClick={() => setSubTab('iniciados')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            subTab === 'iniciados'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <FilePlus2 className="w-3.5 h-3.5 text-emerald-600" />
              Iniciados por Mí
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-100 text-emerald-800">
              {expedientesIniciados.length}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {expedientesIniciados.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Actuaciones creadas en su dependencia
          </p>
        </button>

        <button
          id="tab-btn-todos"
          onClick={() => setSubTab('todos')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            subTab === 'todos'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-slate-700" />
              Todos los Expedientes
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-slate-200 text-slate-800">
              {expedientes.length}
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {expedientes.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Registro total de la Repartición 2100
          </p>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda en Lista */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar por Clave, Asunto o Trámite..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          >
            <option value="todos">Todos los Estados</option>
            <option value="iniciado">Iniciado</option>
            <option value="pase">En Pase</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal de Expedientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {listadoFiltrado.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              No se encontraron expedientes en esta vista
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {subTab === 'pendientes'
                ? '¡Excelente! No tiene pases pendientes de recepción asignados en este momento.'
                : 'No existen trámites coincidentes con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F5] border-b border-slate-300 text-[#082032] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3">Clave Única</th>
                  <th className="px-4 py-3">Asunto y Trámite</th>
                  <th className="px-4 py-3">Iniciador / Origen</th>
                  <th className="px-4 py-3">Ubicación Actual</th>
                  <th className="px-3 py-3 text-center">Fojas</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listadoFiltrado.map((exp) => {
                  const deptoInicio = getDepartamento(exp.departamentoInicioId);
                  const deptoActual = getDepartamento(exp.departamentoActualId);
                  const usuarioTitular = getUsuario(exp.usuarioActualId);
                  const totalFojas = calcularTotalFojas(exp);

                  const ultimoPase = exp.pases?.find((p) => p.esUltimoPase);
                  const esReceptorPendiente =
                    ultimoPase &&
                    ultimoPase.usuarioReceptorId === usuarioActual.id &&
                    ultimoPase.estadoPase === 'pendiente';

                  const esPoseedor = ultimoPase
                    ? ultimoPase.usuarioReceptorId === usuarioActual.id &&
                      ultimoPase.estadoPase === 'recepcionado'
                    : exp.usuarioInicioId === usuarioActual.id && exp.estado === 'iniciado';

                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-[#F3F4F5]/80 transition-colors ${
                        esReceptorPendiente ? 'bg-[#FC4F46]/5' : ''
                      }`}
                    >
                      {/* Clave Única */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#082032]">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#082032] shrink-0" />
                          <button
                            onClick={() => onOpenDetalle(exp)}
                            className="hover:underline hover:text-[#FC4F46] cursor-pointer"
                          >
                            {exp.claveUnica}
                          </button>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block ml-5">
                          {formatDate(exp.fechaInicio)}
                        </span>
                      </td>

                      {/* Asunto y Trámite */}
                      <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                        <button
                          onClick={() => onOpenDetalle(exp)}
                          className="text-left group cursor-pointer block"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 line-clamp-1">
                            {exp.asunto}
                          </p>
                          <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                            {exp.tramiteInicio}
                          </span>
                        </button>
                      </td>

                      {/* Iniciador / Origen */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">
                          {deptoInicio?.codigo}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-[140px]">
                          {deptoInicio?.nombre}
                        </span>
                      </td>

                      {/* Ubicación Actual */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {deptoActual?.codigo}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {usuarioTitular
                            ? `${usuarioTitular.firstName} ${usuarioTitular.lastName}`
                            : 'Mesa de Entradas'}
                        </span>
                      </td>

                      {/* Fojas */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {totalFojas}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            exp.estado === 'archivado'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : exp.estado === 'pase'
                              ? esReceptorPendiente
                                ? 'bg-amber-500 text-white border-amber-600 animate-pulse font-extrabold'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {exp.estado === 'archivado'
                            ? 'Archivado'
                            : exp.estado === 'pase'
                            ? esReceptorPendiente
                              ? 'Pase Pendiente'
                              : 'En Pase'
                            : 'Iniciado'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {esReceptorPendiente && ultimoPase && (
                            <button
                              id={`btn-recepcionar-list-${exp.id}`}
                              onClick={() => onOpenRecepcionarPase(ultimoPase.id)}
                              className="px-2.5 py-1 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                              title="Recepcionar formalmente este pase"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Recepcionar</span>
                            </button>
                          )}

                          {esPoseedor && exp.estado !== 'archivado' && (
                            <>
                              <button
                                id={`btn-pasear-list-${exp.id}`}
                                onClick={() => onOpenCrearPase(exp)}
                                className="px-2.5 py-1 bg-[#082032] hover:bg-[#2C394B] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Emitir pase a otro departamento"
                              >
                                <Send className="w-3 h-3 text-[#FC4F46]" />
                                <span>Pasear</span>
                              </button>

                              <button
                                id={`btn-archivar-list-${exp.id}`}
                                onClick={() => onOpenArchivar(exp)}
                                className="p-1 text-slate-600 hover:text-[#B71C1C] hover:bg-[#F3F4F5] rounded-lg transition-colors cursor-pointer"
                                title="Archivar expediente en caja física"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            id={`btn-ver-detalle-list-${exp.id}`}
                            onClick={() => onOpenDetalle(exp)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver expediente y hoja de ruta completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
