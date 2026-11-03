import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Building,
  Calendar,
  Layers,
  Eye,
} from 'lucide-react';
import { Expediente } from '../types';
import { useApp } from '../context/AppContext';

interface BusquedaAvanzadaProps {
  initialQuery?: string;
  onOpenDetalle: (exp: Expediente) => void;
}

export const BusquedaAvanzada: React.FC<BusquedaAvanzadaProps> = ({
  initialQuery = '',
  onOpenDetalle,
}) => {
  const {
    expedientes,
    departamentos,
    usuarios,
    getDepartamento,
    getUsuario,
    calcularTotalFojas,
  } = useApp();

  const [codigoReparticion, setCodigoReparticion] = useState('2100');
  const [numeroExpediente, setNumeroExpediente] = useState('');
  const [anio, setAnio] = useState('');
  const [asunto, setAsunto] = useState(initialQuery);
  const [tramite, setTramite] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Filtrado multicriterio conforme a Roadmap Módulo 5
  const resultados = expedientes.filter((exp) => {
    if (codigoReparticion && exp.codigoReparticion !== codigoReparticion) return false;
    if (numeroExpediente && exp.numeroExpediente.toString() !== numeroExpediente.trim()) return false;
    if (anio && exp.anio.toString() !== anio.trim()) return false;
    if (asunto.trim() && !exp.asunto.toLowerCase().includes(asunto.trim().toLowerCase())) return false;
    if (tramite.trim() && !exp.tramiteInicio.toLowerCase().includes(tramite.trim().toLowerCase())) return false;
    if (estado && exp.estado !== estado) return false;

    if (departamentoId) {
      const depNum = Number(departamentoId);
      const enInicio = exp.departamentoInicioId === depNum;
      const enPases = (exp.pases || []).some(
        (p) => p.departamentoEmisorId === depNum || p.departamentoReceptorId === depNum
      );
      if (!enInicio && !enPases) return false;
    }

    if (usuarioId) {
      const uNum = Number(usuarioId);
      const enInicio = exp.usuarioInicioId === uNum;
      const enPases = (exp.pases || []).some(
        (p) => p.usuarioEmisorId === uNum || p.usuarioReceptorId === uNum
      );
      if (!enInicio && !enPases) return false;
    }

    if (fechaDesde) {
      const dExp = new Date(exp.fechaInicio).toISOString().split('T')[0];
      if (dExp < fechaDesde) return false;
    }

    if (fechaHasta) {
      const dExp = new Date(exp.fechaInicio).toISOString().split('T')[0];
      if (dExp > fechaHasta) return false;
    }

    return true;
  });

  const handleLimpiarFiltros = () => {
    setCodigoReparticion('2100');
    setNumeroExpediente('');
    setAnio('');
    setAsunto('');
    setTramite('');
    setDepartamentoId('');
    setUsuarioId('');
    setEstado('');
    setFechaDesde('');
    setFechaHasta('');
  };

  // Exportar a Excel (CSV con formato compatible y BOM UTF-8)
  const handleExportarExcel = () => {
    const headers = [
      'Clave Única',
      'Asunto Oficial',
      'Trámite de Inicio',
      'Departamento Iniciador',
      'Agente Iniciador',
      'Fecha Apertura',
      'Estado',
      'Fojas Totales',
      'Departamento Actual',
    ];

    const rows = resultados.map((exp) => {
      const dInicio = getDepartamento(exp.departamentoInicioId)?.nombre || '';
      const uInicio = getUsuario(exp.usuarioInicioId);
      const dActual = getDepartamento(exp.departamentoActualId)?.nombre || '';
      const totalF = calcularTotalFojas(exp);

      return [
        `"${exp.claveUnica}"`,
        `"${exp.asunto.replace(/"/g, '""')}"`,
        `"${exp.tramiteInicio.replace(/"/g, '""')}"`,
        `"${dInicio}"`,
        `"${uInicio ? `${uInicio.firstName} ${uInicio.lastName}` : ''}"`,
        `"${new Date(exp.fechaInicio).toLocaleDateString('es-AR')}"`,
        `"${exp.estado.toUpperCase()}"`,
        totalF,
        `"${dActual}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Expedientes_SIGED_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar lista completa filtrada a JSON estructurado (Requisito 5)
  const handleExportarJSON = () => {
    const dataToExport = {
      sistema: 'SIGED OA - Gobierno de la Provincia de Jujuy',
      fechaReporte: new Date().toISOString(),
      criteriosFiltro: {
        codigoReparticion,
        numeroExpediente,
        anio,
        asunto,
        tramite,
        departamentoId,
        usuarioId,
        estado,
        fechaDesde,
        fechaHasta,
      },
      totalRegistros: resultados.length,
      expedientes: resultados.map((exp) => ({
        ...exp,
        totalFojasCalculadas: calcularTotalFojas(exp),
        departamentoInicio: getDepartamento(exp.departamentoInicioId)?.nombre,
        departamentoActual: getDepartamento(exp.departamentoActualId)?.nombre,
        iniciador: getUsuario(exp.usuarioInicioId)?.username,
      })),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Expedientes_SIGED_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#082032] tracking-tight">
            Búsqueda Avanzada & Reportes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Localice actuaciones administrativas por cualquier campo y genere reportes oficiales en Excel, JSON y PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-excel"
            onClick={handleExportarExcel}
            className="px-3.5 py-2 bg-[#082032] hover:bg-[#2C394B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar a Hoja de Cálculo Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FC4F46]" />
            <span>Planilla Excel (CSV)</span>
          </button>

          <button
            id="btn-export-json"
            onClick={handleExportarJSON}
            className="px-3.5 py-2 border border-slate-300 hover:border-[#082032] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar listado a JSON Estructurado"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Lista JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#2C394B] hover:bg-[#082032] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Imprimir listado en PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Formulario de Búsqueda Multicriterio */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-[#082032] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FC4F46]" />
            Filtros Paramétricos
          </span>
          <button
            onClick={handleLimpiarFiltros}
            className="text-xs text-slate-500 hover:text-[#FC4F46] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer Filtros
          </button>
        </div>

        {/* Fila 1: Clave (Repartición - Número - Año) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Repartición
            </label>
            <input
              type="text"
              value={codigoReparticion}
              onChange={(e) => setCodigoReparticion(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              N° Correlativo
            </label>
            <input
              type="number"
              placeholder="Ej: 1, 2, 3..."
              value={numeroExpediente}
              onChange={(e) => setNumeroExpediente(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Ejercicio / Año
            </label>
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            >
              <option value="">Todos los años</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Estado de Trámite
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            >
              <option value="">Todos los Estados</option>
              <option value="iniciado">Iniciado</option>
              <option value="pase">En Pase</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Asunto y Trámite */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Palabras clave en Asunto
            </label>
            <input
              type="text"
              placeholder="Ej: Licitación, computadoras, bonificación..."
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Tipo de Trámite de Inicio
            </label>
            <input
              type="text"
              placeholder="Ej: Contratación, Reclamo, Convenio..."
              value={tramite}
              onChange={(e) => setTramite(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fila 3: Dependencia, Agente y Rango de Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Departamento Interviniente
            </label>
            <select
              value={departamentoId}
              onChange={(e) => setDepartamentoId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            >
              <option value="">Cualquier dependencia</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.codigo} - {d.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Agente Interviniente
            </label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            >
              <option value="">Cualquier usuario</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Fecha Inicio Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase">
              Fecha Inicio Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resultados de la búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Resultados Encontrados ({resultados.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Repartición 2100 • Total base: {expedientes.length}
          </span>
        </div>

        {resultados.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              No hay expedientes que coincidan con los criterios especificados
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Modifique los filtros o use &quot;Restablecer Filtros&quot; para reiniciar la búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F5] text-[#082032] uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3">Clave Única</th>
                  <th className="px-4 py-3">Asunto y Trámite</th>
                  <th className="px-4 py-3">Departamento Inicio</th>
                  <th className="px-4 py-3">Ubicación Actual</th>
                  <th className="px-3 py-3 text-center">Fojas</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultados.map((exp) => {
                  const dInicio = getDepartamento(exp.departamentoInicioId);
                  const dActual = getDepartamento(exp.departamentoActualId);
                  const totalFojas = calcularTotalFojas(exp);

                  return (
                    <tr key={exp.id} className="hover:bg-[#F3F4F5]/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#082032] whitespace-nowrap">
                        <button
                          onClick={() => onOpenDetalle(exp)}
                          className="hover:underline hover:text-[#FC4F46] cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#082032]" />
                          {exp.claveUnica}
                        </button>
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <p className="font-semibold text-slate-900 line-clamp-1">{exp.asunto}</p>
                        <span className="text-[11px] text-slate-500">{exp.tramiteInicio}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{dInicio?.codigo}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[130px]">
                          {dInicio?.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{dActual?.codigo}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[130px]">
                          {dActual?.nombre}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-800">
                        {totalFojas}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            exp.estado === 'archivado'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : exp.estado === 'pase'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {exp.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDetalle(exp)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
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
