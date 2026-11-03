import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Download,
  Building,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Archive,
  BarChart3,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Expediente, Resolucion } from '../types';
import { useApp } from '../context/AppContext';

interface ReporteIndicadoresPrintProps {
  isOpen: boolean;
  onClose: () => void;
  expedientes: Expediente[];
  resoluciones: Resolucion[];
  filtrosAplicados: {
    periodo: string;
    fechaDesde?: string;
    fechaHasta?: string;
    departamentoNombre?: string;
    estadoFiltro?: string;
    tramiteFiltro?: string;
    demoraFiltro?: string;
  };
}

export const ReporteIndicadoresPrint: React.FC<ReporteIndicadoresPrintProps> = ({
  isOpen,
  onClose,
  expedientes,
  resoluciones,
  filtrosAplicados,
}) => {
  const {
    getDepartamento,
    getUsuario,
    calcularTotalFojas,
    configInstitucional,
    usuarioActual,
    departamentos,
  } = useApp();

  const [incluirDetalleTablas, setIncluirDetalleTablas] = useState(true);
  const [seccionFiltroEstado, setSeccionFiltroEstado] = useState<'todos' | 'iniciado' | 'pase' | 'archivado' | 'agregado'>('todos');

  if (!isOpen) return null;

  const now = new Date();
  const fechaGeneracion = now.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const codigoReporte = `REP-IND-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  // Métricas Clave
  const totalExpedientes = expedientes.length;
  const expedientesIniciados = expedientes.filter((e) => e.estado === 'iniciado');
  const expedientesPase = expedientes.filter((e) => e.estado === 'pase');
  const expedientesArchivados = expedientes.filter((e) => e.estado === 'archivado');
  const expedientesAgregados = expedientes.filter((e) => e.estado === 'agregado');

  const enTramiteActivo = expedientesIniciados.length + expedientesPase.length;
  const totalFojas = expedientes.reduce((acc, exp) => acc + calcularTotalFojas(exp), 0);

  // Alerta de Demora (> 4 días sin actualización)
  const expedientesDemorados = expedientes.filter((e) => {
    if (e.estado === 'archivado') return false;
    const last = new Date(e.updatedAt);
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 4;
  });

  // Distribución por Departamento
  const distribucionPorDepto = departamentos
    .map((d) => {
      const cantidad = expedientes.filter((e) => e.departamentoActualId === d.id).length;
      return { ...d, cantidad };
    })
    .filter((d) => d.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad);

  // Resoluciones
  const resolucionesPublicas = resoluciones.filter((r) => r.esPublica).length;
  const resolucionesReservadas = resoluciones.filter((r) => !r.esPublica).length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Clave Unica',
      'Estado',
      'Fecha Inicio',
      'Departamento Origen',
      'Departamento Actual',
      'Tramite / Asunto',
      'Fojas Totales',
      'Dias Ultima Actividad',
    ];

    const rows = expedientes.map((e) => {
      const deptoOrigen = getDepartamento(e.departamentoInicioId)?.nombre || 'N/A';
      const deptoActual = getDepartamento(e.departamentoActualId)?.nombre || 'N/A';
      const diasInactivo = Math.floor(
        (now.getTime() - new Date(e.updatedAt).getTime()) / (1000 * 3600 * 24)
      );
      return [
        `"${e.claveUnica}"`,
        `"${e.estado.toUpperCase()}"`,
        `"${e.fechaInicio.split('T')[0]}"`,
        `"${deptoOrigen}"`,
        `"${deptoActual}"`,
        `"${(e.asunto || e.tramiteInicio).replace(/"/g, '""')}"`,
        calcularTotalFojas(e),
        diasInactivo,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Expedientes_${codigoReporte}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatearFechaCorta = (fechaStr: string) => {
    if (!fechaStr) return '-';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  const getDiasDesde = (fechaStr: string) => {
    try {
      const diff = (now.getTime() - new Date(fechaStr).getTime()) / (1000 * 3600 * 24);
      return Math.floor(diff);
    } catch {
      return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:overflow-visible">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:my-0 relative">
        {/* Barra superior de control y acciones (oculta al imprimir) */}
        <div className="px-6 py-3.5 bg-[#082032] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#2C394B] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2C394B] flex items-center justify-center text-[#FC4F46]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">
                Reporte Oficial de Indicadores y Expedientes por Estado
              </span>
              <span className="text-[11px] text-slate-300">
                Formato A4 Ejecutivo para Descarga o Impresión PDF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-300 flex items-center gap-1.5 mr-2 cursor-pointer bg-[#2C394B]/70 px-2.5 py-1.5 rounded-lg border border-slate-600">
              <input
                type="checkbox"
                checked={incluirDetalleTablas}
                onChange={(e) => setIncluirDetalleTablas(e.target.checked)}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Incluir Tablas de Expedientes</span>
            </label>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-[#2C394B] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-600"
              title="Descargar datos en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Imprimir o Generar PDF oficial mediante el navegador"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#2C394B] transition-colors ml-1 cursor-pointer"
              title="Cerrar vista preliminar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Marca de agua institucional de fondo */}
        {configInstitucional?.habilitarMarcaDeAgua && configInstitucional?.logoGobiernoUrl && (
          <div
            className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0"
            style={{
              opacity: configInstitucional.marcaDeAguaOpacidad || 0.05,
              transform:
                configInstitucional.marcaDeAguaPosicion === 'diagonal'
                  ? 'rotate(-18deg)'
                  : 'none',
            }}
          >
            <img
              src={configInstitucional.logoGobiernoUrl}
              alt="Marca de agua institucional"
              style={{
                width: `${configInstitucional.marcaDeAguaEscala || 65}%`,
                maxHeight: '75%',
              }}
              className="object-contain filter grayscale"
            />
          </div>
        )}

        {/* Contenido Imprimible del Reporte */}
        <div className="p-6 sm:p-10 text-slate-900 bg-white space-y-6 print:p-6 print:space-y-4 relative z-10 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* 1. ENCABEZADO INSTITUCIONAL */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logos Institucionales Dinámicos */}
              <div className="flex items-center gap-4">
                {configInstitucional?.mostrarLogoGobiernoEncabezado !== false &&
                  configInstitucional?.logoGobiernoUrl && (
                    <img
                      src={configInstitucional.logoGobiernoUrl}
                      alt="Escudo de Gobierno"
                      className="w-14 h-16 object-contain shrink-0"
                    />
                  )}
                <div>
                  <h1 className="text-xs tracking-[0.2em] uppercase font-black text-slate-700">
                    {configInstitucional?.nombreGobierno || 'PROVINCIA DE JUJUY'}
                  </h1>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase font-sans">
                    {configInstitucional?.nombreReparticion || 'OFICINA ANTICORRUPCIÓN'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {configInstitucional?.subtituloReparticion ||
                      'Sistema Integrado de Gestión de Expedientes Digitales (SIGED)'}
                  </p>
                </div>
              </div>

              {/* Logo de la Repartición y Código Oficial */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] font-bold text-slate-800">
                    {codigoReporte}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Emisión: <strong>{fechaGeneracion}</strong>
                  </p>
                </div>
                {configInstitucional?.mostrarLogoReparticionEncabezado !== false &&
                  configInstitucional?.logoReparticionUrl && (
                    <img
                      src={configInstitucional.logoReparticionUrl}
                      alt="Logo de la Repartición"
                      className="w-12 h-14 object-contain shrink-0"
                    />
                  )}
              </div>
            </div>

            {/* Título Principal del Reporte */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#082032] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#FC4F46]" />
                  INFORME ANALÍTICO DE INDICADORES DE GESTIÓN Y EXPEDIENTES
                </h3>
                <p className="text-[11px] text-slate-600">
                  Resumen de volumen operativo, métricas de trámite, foliación acumulada y distribución por estado
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span>Generado por: </span>
                <strong className="text-slate-900">
                  {usuarioActual.firstName} {usuarioActual.lastName}
                </strong>
                <span className="text-slate-500"> ({usuarioActual.rolId.toUpperCase()})</span>
              </div>
            </div>

            {/* Cuadro de Parámetros de Filtro Aplicados */}
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#FC4F46]" />
                Parámetros del Reporte:
              </span>
              <span>
                Período: <strong>{filtrosAplicados.periodo}</strong>
                {filtrosAplicados.fechaDesde && ` (Desde: ${filtrosAplicados.fechaDesde})`}
                {filtrosAplicados.fechaHasta && ` (Hasta: ${filtrosAplicados.fechaHasta})`}
              </span>
              <span>
                Área/Dpto: <strong>{filtrosAplicados.departamentoNombre || 'Todos los departamentos'}</strong>
              </span>
              {filtrosAplicados.estadoFiltro && filtrosAplicados.estadoFiltro !== 'todos' && (
                <span>
                  Estado Filtro: <strong>{filtrosAplicados.estadoFiltro.toUpperCase()}</strong>
                </span>
              )}
              {filtrosAplicados.demoraFiltro && filtrosAplicados.demoraFiltro !== 'todos' && (
                <span>
                  Filtro Demora: <strong>{filtrosAplicados.demoraFiltro.toUpperCase()}</strong>
                </span>
              )}
            </div>
          </div>

          {/* 2. MATRIZ DE INDICADORES CLAVE (KPIs EJECUTIVOS) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>1. Resumen Ejecutivo de Indicadores Clave</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Base analítica: {totalExpedientes} expediente{totalExpedientes === 1 ? '' : 's'}
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Expedientes</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">{totalExpedientes}</span>
                <span className="text-[10px] text-slate-500">100% del universo</span>
              </div>

              <div className="border border-blue-200 rounded-lg p-2.5 bg-blue-50/60 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">En Trámite Activo</span>
                <span className="text-2xl font-black text-blue-900 block mt-0.5">{enTramiteActivo}</span>
                <span className="text-[10px] text-blue-700 font-medium">
                  {totalExpedientes > 0 ? `${Math.round((enTramiteActivo / totalExpedientes) * 100)}%` : '0%'} activos
                </span>
              </div>

              <div className="border border-emerald-200 rounded-lg p-2.5 bg-emerald-50/60 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Iniciados Recientes</span>
                <span className="text-2xl font-black text-emerald-900 block mt-0.5">{expedientesIniciados.length}</span>
                <span className="text-[10px] text-emerald-700 font-medium">En espera de pase</span>
              </div>

              <div className="border border-purple-200 rounded-lg p-2.5 bg-purple-50/60 text-center">
                <span className="text-[10px] font-bold text-purple-700 uppercase block">En Pase Continuo</span>
                <span className="text-2xl font-black text-purple-900 block mt-0.5">{expedientesPase.length}</span>
                <span className="text-[10px] text-purple-700 font-medium">Circulación interna</span>
              </div>

              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Archivados / Guarda</span>
                <span className="text-2xl font-black text-slate-800 block mt-0.5">{expedientesArchivados.length}</span>
                <span className="text-[10px] text-slate-600 font-medium">
                  {totalExpedientes > 0 ? `${Math.round((expedientesArchivados.length / totalExpedientes) * 100)}%` : '0%'} resueltos
                </span>
              </div>

              <div className={`border rounded-lg p-2.5 text-center ${expedientesDemorados.length > 0 ? 'border-red-200 bg-red-50/70' : 'border-slate-300 bg-slate-50'}`}>
                <span className={`text-[10px] font-bold uppercase block ${expedientesDemorados.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                  Alerta Demora
                </span>
                <span className={`text-2xl font-black block mt-0.5 ${expedientesDemorados.length > 0 ? 'text-red-700' : 'text-slate-800'}`}>
                  {expedientesDemorados.length}
                </span>
                <span className={`text-[10px] font-medium ${expedientesDemorados.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                  {expedientesDemorados.length > 0 ? '> 4 días inmóviles' : 'Al día'}
                </span>
              </div>
            </div>

            {/* Sub-indicadores secundarios: Fojas y Resoluciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#082032] text-white flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Foliación Oficial Acumulada</span>
                    <span className="text-[11px] text-slate-500">Total de fojas físicas y electrónicas auditadas</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black text-slate-900">{totalFojas}</span>
                  <span className="text-[10px] text-slate-500 block">Fojas totales</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#2C394B] text-white flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Marco de Resoluciones Oficiales</span>
                    <span className="text-[11px] text-slate-500">Actos administrativos emitidos en el sistema</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 block">{resolucionesPublicas} Públicas</span>
                    <span className="text-[10px] text-slate-500">Acceso ciudadano</span>
                  </div>
                  <div className="border-l border-slate-300 pl-3">
                    <span className="text-xs font-bold text-amber-700 block">{resolucionesReservadas} Reservadas</span>
                    <span className="text-[10px] text-slate-500">Carácter reservado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DISTRIBUCIÓN OPERATIVA POR DEPARTAMENTO */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>2. Carga Operativa Actual por Departamento</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Ubicación física/digital de los expedientes
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {distribucionPorDepto.slice(0, 8).map((dep) => (
                <div key={dep.id} className="border border-slate-200 bg-slate-50 rounded p-2 flex justify-between items-center">
                  <div className="truncate mr-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">{dep.codigo}</span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block" title={dep.nombre}>
                      {dep.nombre}
                    </span>
                  </div>
                  <span className="bg-[#082032] text-white text-[11px] font-bold px-2 py-0.5 rounded font-mono shrink-0">
                    {dep.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TABLAS DETALLADAS DE EXPEDIENTES POR ESTADO (Requisito fundamental) */}
          {incluirDetalleTablas && (
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FC4F46]" />
                  <span>3. Detalle Exhaustivo de Expedientes Agrupados por Estado</span>
                </h4>

                {/* Filtro interactivo en pantalla (oculto en print) */}
                <div className="flex items-center gap-1.5 print:hidden">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Filtrar tabla:</span>
                  {(['todos', 'iniciado', 'pase', 'archivado', 'agregado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSeccionFiltroEstado(st)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        seccionFiltroEstado === st
                          ? 'bg-[#082032] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'todos' ? 'Todos' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABLA 1: EXPEDIENTES INICIADOS */}
              {(seccionFiltroEstado === 'todos' || seccionFiltroEstado === 'iniciado') && (
                <div className="space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between bg-emerald-900 text-white px-3 py-1.5 rounded-t-lg">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Expedientes en Estado "Iniciado" (Recién Ingresados)
                    </span>
                    <span className="text-[11px] font-mono bg-emerald-800 px-2 py-0.2 rounded font-bold">
                      Total: {expedientesIniciados.length}
                    </span>
                  </div>

                  {expedientesIniciados.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-slate-200 rounded-b-lg bg-slate-50 italic">
                      No hay expedientes en estado 'Iniciado' en la selección actual.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-300 rounded-b-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-3">Clave Única</th>
                            <th className="py-1.5 px-3">Fecha Inicio</th>
                            <th className="py-1.5 px-3">Departamento Origen</th>
                            <th className="py-1.5 px-3">Iniciador</th>
                            <th className="py-1.5 px-3">Trámite / Asunto</th>
                            <th className="py-1.5 px-3 text-center">Fojas</th>
                            <th className="py-1.5 px-3 text-center">Inactividad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {expedientesIniciados.map((exp) => {
                            const depto = getDepartamento(exp.departamentoInicioId);
                            const user = getUsuario(exp.usuarioInicioId);
                            const dias = getDiasDesde(exp.updatedAt);
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                  {exp.claveUnica}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {formatearFechaCorta(exp.fechaInicio)}
                                </td>
                                <td className="py-2 px-3 font-medium text-slate-800">
                                  {depto?.nombre || 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {user ? `${user.firstName} ${user.lastName}` : 'N/A'}
                                </td>
                                <td className="py-2 px-3 max-w-xs truncate text-slate-700" title={exp.asunto}>
                                  <span className="font-semibold block">{exp.tramiteInicio}</span>
                                  <span className="text-[10px] text-slate-500 truncate block">{exp.asunto}</span>
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                                  {calcularTotalFojas(exp)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${dias >= 4 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                                    {dias === 0 ? 'Hoy' : `${dias} d`}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLA 2: EXPEDIENTES EN PASE */}
              {(seccionFiltroEstado === 'todos' || seccionFiltroEstado === 'pase') && (
                <div className="space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between bg-[#082032] text-white px-3 py-1.5 rounded-t-lg">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      Expedientes en Estado "En Pase / En Trámite" (Circulación Activa)
                    </span>
                    <span className="text-[11px] font-mono bg-[#2C394B] px-2 py-0.2 rounded font-bold">
                      Total: {expedientesPase.length}
                    </span>
                  </div>

                  {expedientesPase.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-slate-200 rounded-b-lg bg-slate-50 italic">
                      No hay expedientes en estado 'Pase' en la selección actual.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-300 rounded-b-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-3">Clave Única</th>
                            <th className="py-1.5 px-3">Dpto. Actual</th>
                            <th className="py-1.5 px-3">Último Movimiento</th>
                            <th className="py-1.5 px-3">Trámite / Objeto</th>
                            <th className="py-1.5 px-3 text-center">Pases Reg.</th>
                            <th className="py-1.5 px-3 text-center">Fojas Totales</th>
                            <th className="py-1.5 px-3 text-center">Estado Pase</th>
                            <th className="py-1.5 px-3 text-center">Alerta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {expedientesPase.map((exp) => {
                            const deptoActual = getDepartamento(exp.departamentoActualId);
                            const ultimoPase = exp.pases?.[exp.pases.length - 1];
                            const dias = getDiasDesde(exp.updatedAt);
                            return (
                              <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                  {exp.claveUnica}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {deptoActual?.nombre || 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-slate-600 text-[10px]">
                                  {formatearFechaCorta(exp.updatedAt)}
                                </td>
                                <td className="py-2 px-3 max-w-xs truncate text-slate-700" title={exp.asunto}>
                                  <span className="font-semibold block">{exp.tramiteInicio}</span>
                                  <span className="text-[10px] text-slate-500 truncate block">{exp.asunto}</span>
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                                  {exp.pases?.length || 0}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                                  {calcularTotalFojas(exp)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                                    ultimoPase?.estadoPase === 'recepcionado'
                                      ? 'bg-blue-100 text-blue-800'
                                      : ultimoPase?.estadoPase === 'rechazado'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {ultimoPase?.estadoPase || 'en tránsito'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {dias >= 4 ? (
                                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                      <AlertTriangle className="w-3 h-3 text-red-600" />
                                      {dias}d demorado
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-700 font-medium">
                                      Al día ({dias}d)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLA 3: EXPEDIENTES ARCHIVADOS / FINALIZADOS */}
              {(seccionFiltroEstado === 'todos' || seccionFiltroEstado === 'archivado') && (
                <div className="space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-1.5 rounded-t-lg">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5 text-slate-300" />
                      Expedientes en Estado "Archivado" (Concluidos en Guarda Documental)
                    </span>
                    <span className="text-[11px] font-mono bg-slate-700 px-2 py-0.2 rounded font-bold">
                      Total: {expedientesArchivados.length}
                    </span>
                  </div>

                  {expedientesArchivados.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 border border-slate-200 rounded-b-lg bg-slate-50 italic">
                      No hay expedientes archivados en la selección actual.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-300 rounded-b-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[9.5px]">
                          <tr>
                            <th className="py-1.5 px-3">Clave Única</th>
                            <th className="py-1.5 px-3">Fecha Archivado</th>
                            <th className="py-1.5 px-3">N° Caja / Guarda</th>
                            <th className="py-1.5 px-3">Trámite Concluido</th>
                            <th className="py-1.5 px-3">Fojas Finales</th>
                            <th className="py-1.5 px-3">Observación de Archivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {expedientesArchivados.map((exp) => (
                            <tr key={exp.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {exp.claveUnica}
                              </td>
                              <td className="py-2 px-3 text-slate-600">
                                {formatearFechaCorta(exp.archivado?.fechaArchivado || exp.updatedAt)}
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                                  {exp.archivado?.nroCaja || 'C-GENERAL'}
                                </span>
                              </td>
                              <td className="py-2 px-3 max-w-xs truncate text-slate-700" title={exp.asunto}>
                                <span className="font-semibold block">{exp.tramiteInicio}</span>
                                <span className="text-[10px] text-slate-500 truncate block">{exp.asunto}</span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {exp.archivado?.fojasArchivado || calcularTotalFojas(exp)}
                              </td>
                              <td className="py-2 px-3 text-[10px] text-slate-600 italic">
                                {exp.archivado?.observacion || 'Trámite finalizado y archivado reglamentariamente.'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TABLA 4: EXPEDIENTES AGREGADOS (si los hay) */}
              {(seccionFiltroEstado === 'todos' || seccionFiltroEstado === 'agregado') && expedientesAgregados.length > 0 && (
                <div className="space-y-2 break-inside-avoid">
                  <div className="flex items-center justify-between bg-amber-900 text-white px-3 py-1.5 rounded-t-lg">
                    <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-amber-300" />
                      Expedientes en Estado "Agregado / Acumulado"
                    </span>
                    <span className="text-[11px] font-mono bg-amber-800 px-2 py-0.2 rounded font-bold">
                      Total: {expedientesAgregados.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-300 rounded-b-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase text-[9.5px]">
                        <tr>
                          <th className="py-1.5 px-3">Clave Única</th>
                          <th className="py-1.5 px-3">Fecha Actualización</th>
                          <th className="py-1.5 px-3">Trámite</th>
                          <th className="py-1.5 px-3">Asunto</th>
                          <th className="py-1.5 px-3 text-center">Fojas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {expedientesAgregados.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">
                              {exp.claveUnica}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {formatearFechaCorta(exp.updatedAt)}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {exp.tramiteInicio}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {exp.asunto}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                              {calcularTotalFojas(exp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. FIRMA DE RESPONSABILIDAD Y PIE DE PÁGINA */}
          <div className="pt-6 border-t-2 border-slate-900 space-y-6 break-inside-avoid">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2 px-4">
                <span className="font-bold text-slate-900 block font-sans">
                  {usuarioActual.firstName} {usuarioActual.lastName}
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Responsable de Emisión • Rol: {usuarioActual.rolId.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Firma y Sello Digital Verificado
                </span>
              </div>

              <div className="border-t border-slate-400 pt-2 px-4">
                <span className="font-bold text-slate-900 block font-sans">
                  AUTORIDAD SUPERIOR / SUPERVISIÓN
                </span>
                <span className="text-[11px] text-slate-600 block">
                  {configInstitucional?.nombreReparticion || 'Oficina Anticorrupción'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {configInstitucional?.nombreGobierno || 'Gobierno de la Provincia de Jujuy'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <span>
                {configInstitucional?.textoPiePagina ||
                  'Documento electrónico oficial emitido por el SIGED conforme a la Ley de Procedimiento Administrativo Electrónico.'}
              </span>
              <span className="font-mono">
                {codigoReporte} • {fechaGeneracion}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
