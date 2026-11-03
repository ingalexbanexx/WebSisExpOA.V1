import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  User,
  Clock,
  Terminal,
  X,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditoriaLog, AccionAuditoria } from '../types';

export const AuditoriaView: React.FC = () => {
  const { auditoriaLogs, getUsuario } = useApp();

  const [filterAccion, setFilterAccion] = useState<string>('TODAS');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);

  const logsFiltrados = auditoriaLogs.filter((log) => {
    if (filterAccion !== 'TODAS' && log.accion !== filterAccion) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matchTabla = log.tablaAfectada.toLowerCase().includes(q);
      const matchReg = log.registroId.toString().toLowerCase().includes(q);
      const u = getUsuario(log.usuarioId);
      const matchUser = u
        ? `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(q)
        : false;
      return matchTabla || matchReg || matchUser;
    }
    return true;
  });

  const getBadgeAccion = (accion: AccionAuditoria) => {
    switch (accion) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PASE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RECEPCION':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'ARCHIVO':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DESARCHIVO':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'RECHAZO':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'LOGIN':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#082032] tracking-tight">
              Registro Inmutable de Auditoría
            </h1>
            <span className="text-xs bg-[#082032] text-white font-bold px-2.5 py-0.5 rounded-full">
              {logsFiltrados.length} eventos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trazabilidad completa de operaciones administrativas, pases, cambios de estado e inicios de sesión.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-[#F3F4F5] px-3 py-1.5 rounded-xl border border-slate-200">
          <Terminal className="w-4 h-4 text-[#FC4F46]" />
          <span>Audit Logger Activo</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Buscar por Endpoint, Clave o Usuario..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAccion}
            onChange={(e) => setFilterAccion(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          >
            <option value="TODAS">Todas las Acciones</option>
            <option value="CREATE">CREATE (Inicio)</option>
            <option value="PASE">PASE (Emisión)</option>
            <option value="RECEPCION">RECEPCION (Aceptación)</option>
            <option value="ARCHIVO">ARCHIVO (Guarda)</option>
            <option value="DESARCHIVO">DESARCHIVO (Reactivación)</option>
            <option value="RECHAZO">RECHAZO (Devolución)</option>
            <option value="LOGIN">LOGIN (Sesión)</option>
            <option value="UPDATE">UPDATE (Modificación)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F5] text-[#082032] uppercase text-[10px] font-bold border-b border-slate-300">
              <tr>
                <th className="px-4 py-3">Marca de Tiempo</th>
                <th className="px-4 py-3 text-center">Acción</th>
                <th className="px-4 py-3">Endpoint / Módulo</th>
                <th className="px-4 py-3">Registro Afectado</th>
                <th className="px-4 py-3">Agente / Usuario</th>
                <th className="px-4 py-3">Dirección IP</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logsFiltrados.map((log) => {
                const u = getUsuario(log.usuarioId);
                return (
                  <tr key={log.id} className="hover:bg-[#F3F4F5]/80 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeAccion(
                          log.accion
                        )}`}
                      >
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-bold whitespace-nowrap">
                      {log.tablaAfectada}
                    </td>
                    <td className="px-4 py-3 text-[#082032] font-bold whitespace-nowrap">
                      {log.registroId}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-sans whitespace-nowrap">
                      {u ? `${u.firstName} ${u.lastName} (@${u.username})` : 'Sistema'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {log.ipAddress || '192.168.10.15'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2 py-1 bg-slate-100 hover:bg-[#F3F4F5] hover:text-[#FC4F46] text-slate-700 rounded font-sans text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Ver Payload
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Log (JSON Payload) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-[#082032] text-slate-200 w-full max-w-xl rounded-2xl shadow-2xl border border-[#2C394B] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C394B] pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#FC4F46]" />
                <h3 className="text-sm font-bold font-sans text-white">
                  Auditoría #{selectedLog.id} • {selectedLog.accion}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#2C394B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Ruta: {selectedLog.tablaAfectada}</span>
                <span>Registro: {selectedLog.registroId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fecha: {formatDate(selectedLog.timestamp)}</span>
                <span>IP: {selectedLog.ipAddress}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Datos Nuevos (JSON Payload):
              </span>
              <pre className="bg-slate-950 p-3.5 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 max-h-60">
                {JSON.stringify(selectedLog.datosNuevos || {}, null, 2)}
              </pre>
            </div>

            {selectedLog.datosAnteriores && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Datos Anteriores:
                </span>
                <pre className="bg-slate-950 p-3.5 rounded-xl text-[11px] font-mono text-amber-400 overflow-x-auto border border-slate-800 max-h-40">
                  {JSON.stringify(selectedLog.datosAnteriores, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-sans font-bold hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
