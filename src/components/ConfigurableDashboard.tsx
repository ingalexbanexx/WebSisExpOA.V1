import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Filter,
  Calendar,
  Building,
  Users,
  FileText,
  Clock,
  Archive,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Download,
  BarChart3,
  Layers,
  Shield,
  FileCheck,
  Eye,
  RefreshCw,
  X,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expediente, Resolucion } from '../types';
import { ConfiguracionInstitucionalPanel } from './ConfiguracionInstitucionalPanel';
import { ReporteIndicadoresPrint } from './ReporteIndicadoresPrint';

interface ConfigurableDashboardProps {
  onOpenDetalleExpediente?: (id: number) => void;
}

export const ConfigurableDashboard: React.FC<ConfigurableDashboardProps> = ({
  onOpenDetalleExpediente,
}) => {
  const {
    expedientes,
    departamentos,
    usuarios,
    resoluciones,
    calcularTotalFojas,
    usuarioActual,
    configInstitucional,
  } = useApp();

  const [modalLogosOpen, setModalLogosOpen] = useState(false);
  const [modalReporteOpen, setModalReporteOpen] = useState(false);

  // FILTROS CONFIGURABLES (Requisito 6)
  const [periodoPreset, setPeriodoPreset] = useState<'todos' | 'hoy' | '7dias' | '30dias' | '2026' | 'custom'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [deptoFiltro, setDeptoFiltro] = useState<string>('todos');
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [tramiteFiltro, setTramiteFiltro] = useState<string>('todos');
  const [demoraFiltro, setDemoraFiltro] = useState<'todos' | 'al_dia' | 'moderada' | 'critica'>('todos');
  const [resolucionFiltro, setResolucionFiltro] = useState<'todas' | 'publicas' | 'reservadas'>('todas');

  // WIDGETS CONFIGURABLES (Activar / Desactivar paneles)
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [widgetsVisibles, setWidgetsVisibles] = useState({
    kpis: true,
    graficoEstados: true,
    volumenDeptos: true,
    alertasDemora: true,
    rankingUsuarios: true,
    balanceResoluciones: true,
    tiposTramite: true,
  });

  const toggleWidget = (widgetKey: keyof typeof widgetsVisibles) => {
    setWidgetsVisibles((prev) => ({
      ...prev,
      [widgetKey]: !prev[widgetKey],
    }));
  };

  // Filtrado reactivo de expedientes
  const expedientesFiltrados = useMemo(() => {
    const now = new Date();

    return expedientes.filter((exp) => {
      const expDate = new Date(exp.fechaInicio);

      // Filtro de Fecha
      if (periodoPreset === 'hoy') {
        const todayStr = now.toISOString().split('T')[0];
        if (exp.fechaInicio.split('T')[0] !== todayStr) return false;
      } else if (periodoPreset === '7dias') {
        const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (periodoPreset === '30dias') {
        const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (periodoPreset === '2026') {
        if (exp.anio !== 2026) return false;
      } else if (periodoPreset === 'custom') {
        if (fechaDesde && exp.fechaInicio.split('T')[0] < fechaDesde) return false;
        if (fechaHasta && exp.fechaInicio.split('T')[0] > fechaHasta) return false;
      }

      // Filtro de Departamento
      if (deptoFiltro !== 'todos') {
        const deptoIdNum = Number(deptoFiltro);
        if (exp.departamentoActualId !== deptoIdNum && exp.departamentoInicioId !== deptoIdNum) {
          return false;
        }
      }

      // Filtro de Estado
      if (estadoFiltro !== 'todos') {
        if (exp.estado !== estadoFiltro) return false;
      }

      // Filtro de Tipo de Trámite
      if (tramiteFiltro !== 'todos') {
        if (!exp.tramiteInicio.toLowerCase().includes(tramiteFiltro.toLowerCase())) return false;
      }

      // Filtro de Demora
      if (demoraFiltro !== 'todos') {
        const lastUpdated = new Date(exp.updatedAt);
        const diasInactivo = (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);
        if (demoraFiltro === 'al_dia' && diasInactivo > 3) return false;
        if (demoraFiltro === 'moderada' && (diasInactivo <= 3 || diasInactivo > 7)) return false;
        if (demoraFiltro === 'critica' && diasInactivo <= 7) return false;
      }

      return true;
    });
  }, [
    expedientes,
    periodoPreset,
    fechaDesde,
    fechaHasta,
    deptoFiltro,
    estadoFiltro,
    tramiteFiltro,
    demoraFiltro,
  ]);

  // Filtrado de resoluciones
  const resolucionesFiltradas = useMemo(() => {
    return resoluciones.filter((res) => {
      if (resolucionFiltro === 'publicas' && !res.esPublica) return false;
      if (resolucionFiltro === 'reservadas' && res.esPublica) return false;
      return true;
    });
  }, [resoluciones, resolucionFiltro]);

  // Métricas calculadas
  const totalFiltrados = expedientesFiltrados.length;
  const enTramite = expedientesFiltrados.filter((e) => e.estado === 'pase' || e.estado === 'iniciado').length;
  const archivados = expedientesFiltrados.filter((e) => e.estado === 'archivado').length;
  const totalFojasFiltradas = expedientesFiltrados.reduce(
    (acc, exp) => acc + calcularTotalFojas(exp),
    0
  );

  // Expedientes con alerta de demora (> 5 días)
  const expedientesEstancados = expedientesFiltrados
    .filter((e) => {
      if (e.estado === 'archivado') return false;
      const last = new Date(e.updatedAt);
      const diffDays = (new Date().getTime() - last.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 4;
    })
    .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  // Conteo por Departamento Actual
  const distribucionDeptos = departamentos
    .map((d) => {
      const cantidad = expedientesFiltrados.filter((e) => e.departamentoActualId === d.id).length;
      return { ...d, cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad);

  // Rendimiento de Usuarios en la muestra
  const rankingAgentes = usuarios
    .map((u) => {
      const iniciados = expedientesFiltrados.filter((e) => e.usuarioInicioId === u.id).length;
      const pases = expedientesFiltrados.reduce((acc, e) => {
        return acc + (e.pases || []).filter((p) => p.usuarioEmisorId === u.id).length;
      }, 0);
      return { ...u, iniciados, pases, total: iniciados + pases };
    })
    .filter((u) => u.total > 0)
    .sort((a, b) => b.total - a.total);

  // Reset de filtros
  const handleResetFilters = () => {
    setPeriodoPreset('todos');
    setFechaDesde('');
    setFechaHasta('');
    setDeptoFiltro('todos');
    setEstadoFiltro('todos');
    setTramiteFiltro('todos');
    setDemoraFiltro('todos');
    setResolucionFiltro('todas');
  };

  // Exportar métricas del dashboard a CSV
  const handleExportDashboardCSV = () => {
    const headers = ['Metrica', 'Valor'];
    const rows = [
      ['Total Expedientes Filtrados', totalFiltrados],
      ['Expedientes en Tramite Activo', enTramite],
      ['Expedientes Archivados', archivados],
      ['Fojas Totales Acumuladas', totalFojasFiltradas],
      ['Expedientes con Alerta de Demora', expedientesEstancados.length],
      ['Resoluciones Totales', resolucionesFiltradas.length],
      ['Resoluciones Publicas', resolucionesFiltradas.filter((r) => r.esPublica).length],
      ['Resoluciones Reservadas', resolucionesFiltradas.filter((r) => !r.esPublica).length],
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Dashboard_Metricas_SIGED_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#082032] text-white flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-[#FC4F46]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#082032]">
                Dashboard Analítico Configurable
              </h1>
              <span className="text-[10px] bg-[#082032] text-white px-2 py-0.5 rounded font-mono uppercase font-bold">
                {usuarioActual.rolId.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Monitoreo ejecutivo de flujo de expedientes, tiempos de pase, foliación y resoluciones oficiales
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón exclusivo SuperUsuario para Configuración de Logos */}
          {usuarioActual.rolId === 'superadmin' && (
            <button
              onClick={() => setModalLogosOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-amber-400"
              title="Configurar logos institucionales, encabezado y marca de agua del editor"
            >
              <Shield className="w-4 h-4 text-slate-900" />
              <span>Logos & Membrete</span>
            </button>
          )}

          {/* Botón configurar paneles */}
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer ${
              showConfigPanel
                ? 'bg-[#082032] text-white border-[#082032]'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FC4F46]" />
            <span>Personalizar Widgets</span>
          </button>

          {/* Botón Generar Reporte PDF */}
          <button
            onClick={() => setModalReporteOpen(true)}
            className="px-3.5 py-2 bg-[#082032] hover:bg-[#2C394B] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs border border-[#082032]"
            title="Generar e imprimir reporte oficial en PDF con indicadores y tablas de expedientes por estado"
          >
            <Printer className="w-4 h-4 text-[#FC4F46]" />
            <span>Generar Reporte PDF</span>
          </button>

          {/* Exportar métricas */}
          <button
            onClick={handleExportDashboardCSV}
            className="px-3.5 py-2 border border-slate-300 hover:border-[#082032] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* PANEL DE PERSONALIZACIÓN DE WIDGETS (Requisito 6) */}
      {showConfigPanel && (
        <div className="bg-[#082032] text-white p-5 rounded-2xl shadow-lg border border-[#2C394B] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#2C394B] pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FC4F46]" />
              Configurar Visibilidad de Módulos y Widgets
            </h4>
            <span className="text-[11px] text-slate-400">
              Personalice qué tarjetas ver en su panel de control
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.kpis}
                onChange={() => toggleWidget('kpis')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Tarjetas de Indicadores (KPIs)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.graficoEstados}
                onChange={() => toggleWidget('graficoEstados')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Distribución por Estados</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.volumenDeptos}
                onChange={() => toggleWidget('volumenDeptos')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Carga por Departamentos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.alertasDemora}
                onChange={() => toggleWidget('alertasDemora')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Alertas de Demora / Estancados</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.rankingUsuarios}
                onChange={() => toggleWidget('rankingUsuarios')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Rendimiento de Agentes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.balanceResoluciones}
                onChange={() => toggleWidget('balanceResoluciones')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Resoluciones Públicas vs Reservadas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#2C394B]/60 p-2.5 rounded-lg hover:bg-[#2C394B]">
              <input
                type="checkbox"
                checked={widgetsVisibles.tiposTramite}
                onChange={() => toggleWidget('tiposTramite')}
                className="rounded border-slate-500 text-[#FC4F46] focus:ring-[#FC4F46]"
              />
              <span>Tipos de Trámite</span>
            </label>
          </div>
        </div>
      )}

      {/* FILTROS MULTIPARÁMETRO (Requisito 6) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#082032]">
            <Filter className="w-4 h-4 text-[#FC4F46]" />
            <span>Filtros Dinámicos de Datos</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="font-mono text-[#082032]">{totalFiltrados}</strong> de {expedientes.length} expedientes
            </span>
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Restablecer todos los filtros"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar Filtros</span>
            </button>
          </div>
        </div>

        {/* Controles de Filtro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* 1. Rango de Fechas Preset */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Período de Tiempo
            </label>
            <select
              value={periodoPreset}
              onChange={(e) => setPeriodoPreset(e.target.value as any)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#082032] outline-hidden"
            >
              <option value="todos">Todo el Histórico</option>
              <option value="hoy">Hoy</option>
              <option value="7dias">Últimos 7 Días</option>
              <option value="30dias">Últimos 30 Días</option>
              <option value="2026">Ejercicio 2026</option>
              <option value="custom">Rango Personalizado...</option>
            </select>
          </div>

          {/* 2. Departamento */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Dependencia / Repartición
            </label>
            <select
              value={deptoFiltro}
              onChange={(e) => setDeptoFiltro(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#082032] outline-hidden truncate"
            >
              <option value="todos">Todas las Dependencias</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.codigo} - {d.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Estado del Expediente */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Estado de Trámite
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#082032] outline-hidden"
            >
              <option value="todos">Todos los Estados</option>
              <option value="iniciado">Iniciados (En origen)</option>
              <option value="pase">En Pase / Trámite Activo</option>
              <option value="archivado">Archivados en Custodia</option>
            </select>
          </div>

          {/* 4. Alerta de Demora */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Nivel de Demora
            </label>
            <select
              value={demoraFiltro}
              onChange={(e) => setDemoraFiltro(e.target.value as any)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#082032] outline-hidden"
            >
              <option value="todos">Todos los Tiempos</option>
              <option value="al_dia">Al Día (&lt; 3 días)</option>
              <option value="moderada">Demora Moderada (3-7 días)</option>
              <option value="critica">Críticos (&gt; 7 días)</option>
            </select>
          </div>

          {/* 5. Resoluciones asociadas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Filtro Resoluciones
            </label>
            <select
              value={resolucionFiltro}
              onChange={(e) => setResolucionFiltro(e.target.value as any)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#082032] outline-hidden"
            >
              <option value="todas">Todas las Resoluciones</option>
              <option value="publicas">Solo Públicas</option>
              <option value="reservadas">Solo Reservadas</option>
            </select>
          </div>
        </div>

        {/* Rango Personalizado si aplica */}
        {periodoPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600">Intervalo de fechas:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Desde:</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Hasta:</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* WIDGET 1: KPIS PRINCIPALES */}
      {widgetsVisibles.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Expedientes
            </p>
            <p className="text-2xl font-black text-[#082032] font-mono mt-1">
              {totalFiltrados}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Muestra filtrada</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              En Trámite
            </p>
            <p className="text-2xl font-black text-blue-600 font-mono mt-1">
              {enTramite}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {totalFiltrados > 0 ? Math.round((enTramite / totalFiltrados) * 100) : 0}% del volumen
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Archivados
            </p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
              {archivados}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Custodia final</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#082032]">
              Fojas Útiles
            </p>
            <p className="text-2xl font-black text-[#082032] font-mono mt-1">
              {totalFojasFiltradas}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Hojas computadas</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Con Demora &gt; 4d
            </p>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">
              {expedientesEstancados.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Atención requerida</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Resoluciones
            </p>
            <p className="text-2xl font-black text-purple-600 font-mono mt-1">
              {resolucionesFiltradas.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {resolucionesFiltradas.filter((r) => r.esPublica).length} públicas
            </p>
          </div>
        </div>
      )}

      {/* FILA 2: DISTRIBUCIÓN POR ESTADOS Y CARGA POR DEPARTAMENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WIDGET: DISTRIBUCIÓN POR ESTADOS */}
        {widgetsVisibles.graficoEstados && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#082032] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FC4F46]" />
                Distribución de Expedientes por Estado
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {totalFiltrados} registros
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-blue-800">En Pase / Trámite Activo</span>
                  <span className="font-mono text-slate-700">
                    {expedientesFiltrados.filter((e) => e.estado === 'pase').length} (
                    {totalFiltrados > 0
                      ? Math.round(
                          (expedientesFiltrados.filter((e) => e.estado === 'pase').length /
                            totalFiltrados) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalFiltrados > 0
                          ? (expedientesFiltrados.filter((e) => e.estado === 'pase').length /
                              totalFiltrados) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-amber-800">Iniciados en Origen</span>
                  <span className="font-mono text-slate-700">
                    {expedientesFiltrados.filter((e) => e.estado === 'iniciado').length} (
                    {totalFiltrados > 0
                      ? Math.round(
                          (expedientesFiltrados.filter((e) => e.estado === 'iniciado').length /
                            totalFiltrados) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalFiltrados > 0
                          ? (expedientesFiltrados.filter((e) => e.estado === 'iniciado').length /
                              totalFiltrados) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-emerald-800">Archivados Definitivos</span>
                  <span className="font-mono text-slate-700">
                    {archivados} (
                    {totalFiltrados > 0 ? Math.round((archivados / totalFiltrados) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalFiltrados > 0 ? (archivados / totalFiltrados) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET: RESOLUCIONES PÚBLICAS VS RESERVADAS */}
        {widgetsVisibles.balanceResoluciones && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#082032] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#FC4F46]" />
                Balance de Resoluciones y Publicidad
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {resolucionesFiltradas.length} total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-emerald-800 uppercase flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" /> Públicas
                </p>
                <p className="text-3xl font-black text-emerald-700 font-mono mt-2">
                  {resolucionesFiltradas.filter((r) => r.esPublica).length}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1">Transparencia activa</p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-rose-800 uppercase flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-rose-600" /> Reservadas
                </p>
                <p className="text-3xl font-black text-rose-700 font-mono mt-2">
                  {resolucionesFiltradas.filter((r) => !r.esPublica).length}
                </p>
                <p className="text-[10px] text-rose-600 mt-1">Sumarios / Confidencial</p>
              </div>
            </div>

            {/* Categorías principales de resoluciones */}
            <div className="pt-2 text-xs space-y-1.5">
              <p className="text-[11px] font-bold uppercase text-slate-500">
                Top Categorías Emitidas:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['Administrativa', 'Disciplinaria', 'Presupuestaria', 'General'].map((cat) => {
                  const count = resolucionesFiltradas.filter((r) => r.categoria === cat).length;
                  return (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]"
                    >
                      {cat}: <strong>{count}</strong>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILA 3: CARGA POR DEPENDENCIAS Y ALERTAS DE DEMORA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WIDGET: VOLUMEN POR DEPARTAMENTOS */}
        {widgetsVisibles.volumenDeptos && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#082032] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#FC4F46]" />
                Carga Actual por Dependencia
              </h3>
              <span className="text-[11px] text-slate-400">Expedientes en posesión</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {distribucionDeptos.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-800 truncate">{d.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{d.codigo}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#082032]/10 font-mono font-bold text-[#082032]">
                      {d.cantidad} exp.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDGET: EXPEDIENTES CON DEMORA / ESTANCADOS */}
        {widgetsVisibles.alertasDemora && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Expedientes con Alerta de Demora
              </h3>
              <span className="text-[11px] text-amber-700 font-mono font-bold">
                {expedientesEstancados.length} en riesgo
              </span>
            </div>

            {expedientesEstancados.length === 0 ? (
              <div className="p-8 text-center text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="font-bold text-xs">Todos los trámites al día</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  No se registran expedientes activos con demoras superiores a 4 días.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {expedientesEstancados.slice(0, 5).map((exp) => {
                  const dias = Math.floor(
                    (new Date().getTime() - new Date(exp.updatedAt).getTime()) /
                      (1000 * 3600 * 24)
                  );
                  return (
                    <div
                      key={exp.id}
                      onClick={() => onOpenDetalleExpediente?.(exp.id)}
                      className="p-2.5 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#082032]">
                            {exp.claveUnica}
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            {dias} días sin pase
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5 font-serif">
                          {exp.asunto}
                        </p>
                      </div>

                      <button className="text-[11px] font-bold text-[#082032] underline shrink-0">
                        Ver
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WIDGET: RENDIMIENTO DE AGENTES */}
      {widgetsVisibles.rankingUsuarios && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#082032] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FC4F46]" />
              Actividad y Rendimiento de Agentes Operativos
            </h3>
            <span className="text-[11px] text-slate-400">Iniciados + Pases generados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {rankingAgentes.map((agente) => (
              <div
                key={agente.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#082032] truncate">
                    {agente.firstName} {agente.lastName}
                  </p>
                  <span className="text-[10px] font-mono bg-slate-200 px-1.5 rounded uppercase">
                    {agente.rolId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Iniciados: {agente.iniciados}</span>
                  <span>Pases: {agente.pases}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-right">
                  <span className="text-[11px] font-bold text-[#082032]">
                    Total: {agente.total} movimientos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN INSTITUCIONAL DE LOGOS (SUPERUSUARIO) */}
      {modalLogosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setModalLogosOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer z-10"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <ConfiguracionInstitucionalPanel
              onSuccessNotice={() => {
                // Notificación exitosa
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL REPORTE PDF DE INDICADORES Y EXPEDIENTES POR ESTADO */}
      <ReporteIndicadoresPrint
        isOpen={modalReporteOpen}
        onClose={() => setModalReporteOpen(false)}
        expedientes={expedientesFiltrados}
        resoluciones={resolucionesFiltradas}
        filtrosAplicados={{
          periodo:
            periodoPreset === 'todos'
              ? 'Histórico Completo'
              : periodoPreset === 'hoy'
              ? 'Fecha de Hoy'
              : periodoPreset === '7dias'
              ? 'Últimos 7 días'
              : periodoPreset === '30dias'
              ? 'Últimos 30 días'
              : periodoPreset === '2026'
              ? 'Ejercicio 2026'
              : 'Personalizado',
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          departamentoNombre:
            deptoFiltro !== 'todos'
              ? departamentos.find((d) => String(d.id) === deptoFiltro)?.nombre
              : undefined,
          estadoFiltro: estadoFiltro !== 'todos' ? estadoFiltro : undefined,
          tramiteFiltro: tramiteFiltro !== 'todos' ? tramiteFiltro : undefined,
          demoraFiltro: demoraFiltro !== 'todos' ? demoraFiltro : undefined,
        }}
      />
    </div>
  );
};
