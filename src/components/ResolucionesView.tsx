import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Printer,
  Download,
  Filter,
  Shield,
  Building,
  Calendar,
  User,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Resolucion, CategoriaResolucion } from '../types';
import { ResolucionModal } from './ResolucionModal';

const CATEGORIAS_LIST: CategoriaResolucion[] = [
  'Administrativa',
  'Técnica',
  'Disciplinaria',
  'Presupuestaria',
  'Declaración',
  'Regulatoria',
  'General',
];

interface ResolucionesViewProps {
  onOpenDetalleExpediente?: (expedienteId: number) => void;
}

export const ResolucionesView: React.FC<ResolucionesViewProps> = ({
  onOpenDetalleExpediente,
}) => {
  const {
    resoluciones,
    expedientes,
    usuarioActual,
    eliminarResolucion,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [visibilidadFiltro, setVisibilidadFiltro] = useState<'todas' | 'publicas' | 'reservadas'>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [resolucionParaEditar, setResolucionParaEditar] = useState<Resolucion | null>(null);
  const [resolucionParaVer, setResolucionParaVer] = useState<Resolucion | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filtrado de resoluciones
  const resolucionesFiltradas = resoluciones.filter((res) => {
    // Si el usuario no es admin ni superadmin, ocultar reservadas salvo que sea el autor
    if (
      !res.esPublica &&
      usuarioActual.rolId !== 'admin' &&
      usuarioActual.rolId !== 'superadmin' &&
      res.usuarioId !== usuarioActual.id
    ) {
      return false;
    }

    if (categoriaFiltro !== 'todas' && res.categoria !== categoriaFiltro) {
      return false;
    }

    if (visibilidadFiltro === 'publicas' && !res.esPublica) return false;
    if (visibilidadFiltro === 'reservadas' && res.esPublica) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = res.numeroResolucion.toLowerCase().includes(q);
      const matchAsunto = res.asunto.toLowerCase().includes(q);
      const matchFirmante = res.firmante.toLowerCase().includes(q);
      const matchResuelve = res.textoResuelve.toLowerCase().includes(q);
      if (!matchNum && !matchAsunto && !matchFirmante && !matchResuelve) {
        return false;
      }
    }

    return true;
  });

  // Exportar resoluciones filtradas a CSV
  const handleExportCSV = () => {
    const headers = [
      'NumeroResolucion',
      'Anio',
      'FechaEmision',
      'OrganismoEmisor',
      'Firmante',
      'Cargo',
      'Categoria',
      'EsPublica',
      'Asunto',
      'ExpedientesVinculados',
    ];

    const rows = resolucionesFiltradas.map((r) => [
      `"${r.numeroResolucion}"`,
      r.anio,
      `"${r.fechaEmision.split('T')[0]}"`,
      `"${r.organismoEmisor.replace(/"/g, '""')}"`,
      `"${r.firmante.replace(/"/g, '""')}"`,
      `"${r.cargoFirmante.replace(/"/g, '""')}"`,
      `"${r.categoria}"`,
      r.esPublica ? 'Pública' : 'Reservada',
      `"${r.asunto.replace(/"/g, '""')}"`,
      `"${r.expedientesIds
        .map((id) => expedientes.find((e) => e.id === id)?.claveUnica || id)
        .join(', ')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Resoluciones_SIGED_OA_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoriaBadgeStyle = (cat: CategoriaResolucion) => {
    switch (cat) {
      case 'Administrativa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Técnica':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Disciplinaria':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Presupuestaria':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Declaración':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Regulatoria':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'General':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#082032] text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-[#FC4F46]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#082032]">
                Registro y Gestión de Resoluciones
              </h1>
              <p className="text-xs text-slate-500">
                Libro oficial de resoluciones administrativas, categorización y vinculación con expedientes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-300 hover:border-[#082032] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            title="Exportar a planilla Excel / CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setResolucionParaEditar(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Resolución</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Resoluciones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Emitidas
          </p>
          <p className="text-2xl font-black text-[#082032] font-mono mt-1">
            {resoluciones.length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Públicas / Transparentes
          </p>
          <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {resoluciones.filter((r) => r.esPublica).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
            Reservadas / Sumarios
          </p>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">
            {resoluciones.filter((r) => !r.esPublica).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Con Expedientes
          </p>
          <p className="text-2xl font-black text-blue-600 font-mono mt-1">
            {resoluciones.filter((r) => (r.expedientesIds || []).length > 0).length}
          </p>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Input Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por número, asunto o firmante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden bg-white"
            />
          </div>

          {/* Filtro por Categoría */}
          <div>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden bg-white font-medium"
            >
              <option value="todas">Todas las Categorías</option>
              {CATEGORIAS_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Visibilidad */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setVisibilidadFiltro('todas')}
              className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                visibilidadFiltro === 'todas'
                  ? 'bg-white text-[#082032] shadow-2xs'
                  : 'text-slate-600 hover:text-[#082032]'
              }`}
            >
              Todas ({resoluciones.length})
            </button>
            <button
              onClick={() => setVisibilidadFiltro('publicas')}
              className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                visibilidadFiltro === 'publicas'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Públicas
            </button>
            <button
              onClick={() => setVisibilidadFiltro('reservadas')}
              className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                visibilidadFiltro === 'reservadas'
                  ? 'bg-white text-rose-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Reservadas
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Resoluciones */}
      <div className="space-y-3">
        {resolucionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No se encontraron resoluciones</p>
            <p className="text-xs text-slate-400 mt-1">
              Pruebe cambiando los filtros de categoría o el texto de búsqueda.
            </p>
          </div>
        ) : (
          resolucionesFiltradas.map((res) => {
            const expVinculados = (res.expedientesIds || [])
              .map((id) => expedientes.find((e) => e.id === id))
              .filter(Boolean);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow duration-150 space-y-3"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#082032] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {res.numeroResolucion}
                    </span>

                    {/* Badge de Categoría */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoriaBadgeStyle(
                        res.categoria
                      )}`}
                    >
                      {res.categoria}
                    </span>

                    {/* Badge de Publicidad (Requisito 4) */}
                    {res.esPublica ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-700" />
                        <span>Pública</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-rose-700" />
                        <span>Reservada</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(res.fechaEmision).toLocaleDateString('es-AR')}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setResolucionParaVer(res)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#082032] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Ver texto completo e imprimir"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {(usuarioActual.rolId === 'admin' ||
                      usuarioActual.rolId === 'superadmin' ||
                      res.usuarioId === usuarioActual.id) && (
                      <button
                        onClick={() => {
                          setResolucionParaEditar(res);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Editar resolución"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {(usuarioActual.rolId === 'admin' || usuarioActual.rolId === 'superadmin') && (
                      <button
                        onClick={() => setDeleteConfirmId(res.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar resolución"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Asunto y Firmante */}
                <div>
                  <h3 className="font-bold text-sm text-[#082032] leading-snug font-serif">
                    {res.asunto}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {res.organismoEmisor}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {res.firmante} ({res.cargoFirmante})
                    </span>
                  </p>
                </div>

                {/* Expedientes vinculados */}
                {expVinculados.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-[#FC4F46]" />
                      Expedientes Asociados:
                    </span>
                    {expVinculados.map((exp) => (
                      <button
                        key={exp?.id}
                        onClick={() => exp && onOpenDetalleExpediente?.(exp.id)}
                        className="px-2.5 py-0.5 rounded-md bg-[#082032]/10 hover:bg-[#082032] text-[#082032] hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {exp?.claveUnica}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear / Editar Resolución */}
      <ResolucionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResolucionParaEditar(null);
        }}
        resolucionAEditar={resolucionParaEditar}
      />

      {/* Visor / Impresión de Resolución */}
      {resolucionParaVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-150">
            {/* Header Visor */}
            <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-[#FC4F46]" />
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">
                    {resolucionParaVer.numeroResolucion}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {resolucionParaVer.organismoEmisor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setResolucionParaVer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hoja de Resolución con formato oficial */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1 font-serif text-[#082032] bg-white">
              {/* Membrete Jujuy */}
              <div className="border-b-2 border-[#B71C1C] pb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    GOBIERNO DE LA PROVINCIA DE JUJUY
                  </p>
                  <p className="text-base font-black uppercase text-[#082032]">
                    {resolucionParaVer.organismoEmisor}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      resolucionParaVer.esPublica
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {resolucionParaVer.esPublica ? 'PÚBLICA' : 'RESERVADA'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {new Date(resolucionParaVer.fechaEmision).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>

              {/* Título de la Resolución */}
              <div className="text-center py-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-[#082032] font-mono">
                  {resolucionParaVer.numeroResolucion}
                </h2>
                <p className="text-xs font-semibold text-slate-600 mt-1 italic">
                  San Salvador de Jujuy
                </p>
              </div>

              {/* Asunto */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <strong className="text-slate-800">ASUNTO: </strong>
                <span>{resolucionParaVer.asunto}</span>
              </div>

              {/* Visto y Considerando */}
              <div className="text-xs leading-relaxed space-y-2 text-justify">
                <p className="font-bold">VISTO Y CONSIDERANDO:</p>
                <div className="whitespace-pre-line text-slate-800 pl-4 border-l-2 border-slate-300">
                  {resolucionParaVer.considerando}
                </div>
              </div>

              {/* Parte Resolutiva */}
              <div className="text-xs leading-relaxed space-y-2 text-justify pt-2">
                <p className="font-bold uppercase tracking-wider text-[#082032]">
                  POR ELLO, EN USO DE SUS FACULTADES:
                </p>
                <p className="font-black text-sm text-[#082032]">RESUELVE:</p>
                <div className="whitespace-pre-line text-slate-900 font-medium pl-4 border-l-2 border-[#FC4F46]">
                  {resolucionParaVer.textoResuelve}
                </div>
              </div>

              {/* Pie de Firma */}
              <div className="pt-10 flex justify-end">
                <div className="text-center w-64 border-t-2 border-[#082032] pt-2">
                  <p className="font-bold text-xs text-[#082032]">{resolucionParaVer.firmante}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{resolucionParaVer.cargoFirmante}</p>
                  <p className="text-[9px] text-slate-400">Poder Ejecutivo - Provincia de Jujuy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h4 className="font-bold text-slate-900 text-sm">¿Confirmar eliminación de resolución?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción eliminará el registro formal del libro de resoluciones y desvinculará los expedientes asociados.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  eliminarResolucion(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
