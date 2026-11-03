import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Building,
  User,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Paperclip,
  Printer,
  Copy,
  Check,
  Send,
  Download,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Sparkles,
  FileCheck,
  Trash2,
  Link,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { Expediente, TipoAdjunto } from '../types';
import { useApp, AdjuntoInput } from '../context/AppContext';
import { EditorDocumentoModal } from './EditorDocumentoModal';
import { ResolucionModal } from './ResolucionModal';
import { ReporteExpedienteModal } from './ReporteExpedienteModal';

interface DetalleExpedienteModalProps {
  expediente: Expediente | null;
  onClose: () => void;
  onOpenCrearPase: (exp: Expediente) => void;
  onOpenRecepcionarPase: (paseId: number) => void;
  onOpenArchivar: (exp: Expediente) => void;
  onOpenPrintCaratula: (exp: Expediente) => void;
}

export const DetalleExpedienteModal: React.FC<DetalleExpedienteModalProps> = ({
  expediente,
  onClose,
  onOpenCrearPase,
  onOpenRecepcionarPase,
  onOpenArchivar,
  onOpenPrintCaratula,
}) => {
  const {
    usuarioActual,
    getDepartamento,
    getUsuario,
    calcularTotalFojas,
    desarchivarExpediente,
    agregarAdjunto,
    eliminarAdjunto,
    resoluciones,
    vincularResolucionAExpediente,
    desvincularResolucionDeExpediente,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hoja_ruta' | 'adjuntos' | 'resoluciones' | 'caratula'>('hoja_ruta');
  
  // Modales secundarios
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [reporteModalOpen, setReporteModalOpen] = useState(false);
  const [resolucionModalOpen, setResolucionModalOpen] = useState(false);
  const [vincularDropdownOpen, setVincularDropdownOpen] = useState(false);

  // Adjunto manual
  const [showAddAdjunto, setShowAddAdjunto] = useState(false);
  const [adjuntoTipo, setAdjuntoTipo] = useState<TipoAdjunto>('documento');
  const [adjuntoTitulo, setAdjuntoTitulo] = useState('');
  const [adjuntoDesc, setAdjuntoDesc] = useState('');
  const [adjuntoFojas, setAdjuntoFojas] = useState(1);

  // Desarchivar
  const [desarchivarMotivo, setDesarchivarMotivo] = useState('');
  const [showDesarchivarInput, setShowDesarchivarInput] = useState(false);

  if (!expediente) return null;

  const deptoInicio = getDepartamento(expediente.departamentoInicioId);
  const usuarioInicio = getUsuario(expediente.usuarioInicioId);
  const deptoActual = getDepartamento(expediente.departamentoActualId);
  const usuarioActualTitular = getUsuario(expediente.usuarioActualId);
  const totalFojas = calcularTotalFojas(expediente);

  // Resoluciones vinculadas a este expediente
  const resolucionesAsociadas = resoluciones.filter((r) =>
    (expediente.resolucionesIds || []).includes(r.id) ||
    (r.expedientesIds || []).includes(expediente.id)
  );

  // Resoluciones disponibles para vincular (que no estén ya vinculadas)
  const resolucionesDisponibles = resoluciones.filter(
    (r) => !resolucionesAsociadas.some((ra) => ra.id === r.id)
  );

  // Determinar posesión del expediente
  const ultimoPase = expediente.pases?.find((p) => p.esUltimoPase);
  const esPoseedor = ultimoPase
    ? ultimoPase.usuarioReceptorId === usuarioActual.id && ultimoPase.estadoPase === 'recepcionado'
    : expediente.usuarioInicioId === usuarioActual.id && expediente.estado === 'iniciado';

  const tienePasePendienteParaMi =
    ultimoPase &&
    ultimoPase.usuarioReceptorId === usuarioActual.id &&
    ultimoPase.estadoPase === 'pendiente';

  const puedeDesarchivar =
    expediente.estado === 'archivado' &&
    (usuarioActual.rolId === 'admin' || usuarioActual.rolId === 'superadmin');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expediente.claveUnica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAdjunto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjuntoTitulo.trim()) return;

    agregarAdjunto(expediente.id, {
      tipoAdjunto: adjuntoTipo,
      titulo: adjuntoTitulo.trim(),
      descripcion: adjuntoDesc.trim(),
      archivoNombre: `${adjuntoTitulo.replace(/\s+/g, '_')}.pdf`,
      archivoTamano: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      fojas: Math.max(1, Number(adjuntoFojas) || 1),
    });

    setAdjuntoTitulo('');
    setAdjuntoDesc('');
    setAdjuntoFojas(1);
    setShowAddAdjunto(false);
  };

  const handleSaveRedactado = (nuevo: AdjuntoInput) => {
    agregarAdjunto(expediente.id, nuevo);
  };

  const handleDesarchivar = () => {
    if (!desarchivarMotivo.trim()) return;
    desarchivarExpediente(expediente.id, desarchivarMotivo);
    setShowDesarchivarInput(false);
    setDesarchivarMotivo('');
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    const date = new Date(isoStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-white font-mono">
                    {expediente.claveUnica}
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copiar Clave Única"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full font-mono ${
                      expediente.estado === 'archivado'
                        ? 'bg-purple-900/70 text-purple-200 border border-purple-700'
                        : expediente.estado === 'iniciado'
                        ? 'bg-amber-900/70 text-amber-200 border border-amber-700'
                        : 'bg-blue-900/70 text-blue-200 border border-blue-700'
                    }`}
                  >
                    {expediente.estado.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1 max-w-lg font-serif">
                  {expediente.asunto}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReporteModalOpen(true)}
                className="px-3 py-1.5 bg-[#2C394B] hover:bg-[#082032] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
                title="Generar Reporte Completo del Expediente"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#FC4F46]" />
                <span className="hidden sm:inline">Reporte Completo</span>
              </button>

              <button
                onClick={() => onOpenPrintCaratula(expediente)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
                title="Imprimir Carátula Oficial"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader: Pestañas de Navegación del Modal */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('hoja_ruta')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'hoja_ruta'
                    ? 'bg-[#082032] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hoja de Ruta ({(expediente.pases || []).length})
              </button>

              <button
                onClick={() => setActiveTab('adjuntos')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'adjuntos'
                    ? 'bg-[#082032] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Documentos & Adjuntos</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded">
                  {expediente.adjuntos?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('resoluciones')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'resoluciones'
                    ? 'bg-[#082032] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-[#FC4F46]" />
                <span>Resoluciones</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded">
                  {resolucionesAsociadas.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('caratula')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'caratula'
                    ? 'bg-[#082032] text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Carátula & Foliación
              </button>
            </div>

            {/* Total fojas badge y acciones contextuales */}
            <div className="flex items-center gap-2">
              <div className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-[#082032] flex items-center gap-1.5 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-[#FC4F46]" />
                <span>Total: {totalFojas} fojas</span>
              </div>

              {esPoseedor && expediente.estado !== 'archivado' && (
                <>
                  <button
                    onClick={() => onOpenCrearPase(expediente)}
                    className="px-3 py-1 bg-[#FC4F46] hover:bg-[#d93830] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Pase</span>
                  </button>
                  <button
                    onClick={() => onOpenArchivar(expediente)}
                    className="px-3 py-1 bg-[#2C394B] hover:bg-[#082032] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archivar</span>
                  </button>
                </>
              )}

              {tienePasePendienteParaMi && ultimoPase && (
                <button
                  onClick={() => onOpenRecepcionarPase(ultimoPase.id)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Recepcionar Pase</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {/* 1. HOJA DE RUTA */}
            {activeTab === 'hoja_ruta' && (
              <div className="space-y-6">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Evento 0: Inicio */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      0
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Iniciado en {deptoInicio?.nombre}
                        </span>
                        <span className="font-mono text-slate-500">
                          {formatDate(expediente.fechaInicio)}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1">
                        Iniciado por{' '}
                        <strong>
                          {usuarioInicio?.firstName} {usuarioInicio?.lastName}
                        </strong>{' '}
                        con <strong>{expediente.fojasInicio} fojas</strong> bajo el trámite:{' '}
                        <em>{expediente.tramiteInicio}</em>.
                      </p>
                    </div>
                  </div>

                  {/* Pases */}
                  {(expediente.pases || []).map((pase, idx) => {
                    const emisor = getUsuario(pase.usuarioEmisorId);
                    const dptoEmisor = getDepartamento(pase.departamentoEmisorId);
                    const receptor = getUsuario(pase.usuarioReceptorId);
                    const dptoReceptor = getDepartamento(pase.departamentoReceptorId);

                    return (
                      <div key={pase.id} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                            pase.estadoPase === 'pendiente'
                              ? 'bg-amber-500 text-white animate-bounce'
                              : pase.estadoPase === 'rechazado'
                              ? 'bg-rose-600 text-white'
                              : 'bg-[#082032] text-white'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div
                          className={`border p-4 rounded-xl transition-all ${
                            pase.estadoPase === 'pendiente'
                              ? 'bg-amber-50/50 border-amber-200'
                              : pase.estadoPase === 'rechazado'
                              ? 'bg-rose-50/40 border-rose-200'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#082032]">
                                {dptoEmisor?.codigo} ({dptoEmisor?.nombre})
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-bold text-[#FC4F46]">
                                {dptoReceptor?.codigo} ({dptoReceptor?.nombre})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                  pase.estadoPase === 'pendiente'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : pase.estadoPase === 'rechazado'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}
                              >
                                {pase.estadoPase}
                              </span>
                              <span className="font-mono text-slate-500">
                                {formatDate(pase.fechaPase)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 space-y-1.5 text-xs text-slate-700">
                            <p>
                              <strong>Emisor:</strong> {emisor?.firstName} {emisor?.lastName} •{' '}
                              <strong>Destinatario:</strong> {receptor?.firstName} {receptor?.lastName}
                            </p>
                            <p className="bg-white p-2.5 rounded border border-slate-200/80 text-slate-800 italic font-serif">
                              "{pase.observacion}"
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                              <span>Fojas sumadas en este pase: +{pase.fojasPase} fojas</span>
                              {pase.fechaRecepcion && (
                                <span className="text-emerald-700 flex items-center gap-1 font-sans font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Recepcionado: {formatDate(pase.fechaRecepcion)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. DOCUMENTOS Y ADJUNTOS */}
            {activeTab === 'adjuntos' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#082032] uppercase tracking-wider">
                      Documentación y Fojas Incorporadas
                    </h4>
                    <p className="text-xs text-slate-500">
                      Dictámenes, notas, actas, providencias y archivos multimedia integrados
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón Redactar con membrete de Jujuy */}
                    <button
                      onClick={() => setEditorModalOpen(true)}
                      className="px-3 py-1.5 bg-[#082032] hover:bg-[#2C394B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FC4F46]" />
                      <span>Redactar Nota con Membrete</span>
                    </button>

                    <button
                      onClick={() => setShowAddAdjunto(!showAddAdjunto)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adjuntar Archivo</span>
                    </button>
                  </div>
                </div>

                {/* Formulario rápido para subir adjunto */}
                {showAddAdjunto && (
                  <form
                    onSubmit={handleCreateAdjunto}
                    className="bg-slate-50 border border-slate-300 p-4 rounded-xl space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Tipo de Actuación
                        </label>
                        <select
                          value={adjuntoTipo}
                          onChange={(e) => setAdjuntoTipo(e.target.value as TipoAdjunto)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        >
                          <option value="documento">Documento General</option>
                          <option value="dictamen">Dictamen Jurídico</option>
                          <option value="providencia">Providencia</option>
                          <option value="nota">Nota Administrativa</option>
                          <option value="memo">Memorándum</option>
                          <option value="resolucion">Resolución</option>
                          <option value="imagen">Imagen / Fotografía</option>
                          <option value="audio">Audio / Grabación</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">
                          Título del Archivo
                        </label>
                        <input
                          type="text"
                          required
                          value={adjuntoTitulo}
                          onChange={(e) => setAdjuntoTitulo(e.target.value)}
                          placeholder="Ej. Dictamen_Tecnico_Computos.pdf"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Fojas que aporta *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={adjuntoFojas}
                          onChange={(e) => setAdjuntoFojas(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Descripción o Resumen
                      </label>
                      <textarea
                        rows={2}
                        value={adjuntoDesc}
                        onChange={(e) => setAdjuntoDesc(e.target.value)}
                        placeholder="Breve reseña del contenido del anexo..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddAdjunto(false)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#FC4F46] text-white rounded font-bold hover:bg-[#d93830]"
                      >
                        Confirmar e Incorporar ({adjuntoFojas} fojas)
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de adjuntos */}
                {(!expediente.adjuntos || expediente.adjuntos.length === 0) ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                    <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      No hay documentos anexados aún
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Utilice &quot;Redactar Nota con Membrete&quot; o &quot;Adjuntar Archivo&quot; para sumar fojas.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {expediente.adjuntos.map((adj) => {
                      const u = getUsuario(adj.usuarioId);
                      return (
                        <div
                          key={adj.id}
                          className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#082032]/10 text-[#082032] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[#082032] truncate font-serif">
                                  {adj.titulo}
                                </p>
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {adj.tipoAdjunto}
                                </span>
                                {adj.esDocumentoRedactado && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 rounded font-bold">
                                    Membrete Jujuy
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {adj.descripcion || 'Sin descripción adicional'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {adj.archivoTamano} • Incorporado por {u?.firstName} {u?.lastName} el{' '}
                                {formatDate(adj.fechaAdjunto)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono font-bold text-xs rounded border border-slate-300">
                              {adj.fojas || 1} {adj.fojas === 1 ? 'foja' : 'fojas'}
                            </span>

                            {/* Eliminar adjunto (Requisito 3: opción de eliminar con recálculo) */}
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar adjunto "${adj.titulo}"? Se restarán ${adj.fojas || 1} fojas del total del expediente.`)) {
                                  eliminarAdjunto(expediente.id, adj.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar adjunto y descontar fojas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. RESOLUCIONES VINCULADAS (Requisito 4) */}
            {activeTab === 'resoluciones' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#082032] uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#FC4F46]" />
                      Resoluciones Vinculadas a las Actuaciones
                    </h4>
                    <p className="text-xs text-slate-500">
                      Disposiciones formales, actos resolutivos y fallos vinculados a este expediente
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResolucionModalOpen(true)}
                      className="px-3 py-1.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Emitir Resolución</span>
                    </button>

                    {/* Menú vincular existente */}
                    {resolucionesDisponibles.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setVincularDropdownOpen(!vincularDropdownOpen)}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Link className="w-3.5 h-3.5 text-slate-500" />
                          <span>Vincular Existente</span>
                        </button>

                        {vincularDropdownOpen && (
                          <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 space-y-1 text-xs">
                            <p className="font-bold text-slate-600 text-[10px] uppercase px-2 py-1">
                              Seleccione una resolución:
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {resolucionesDisponibles.map((r) => (
                                <button
                                  key={r.id}
                                  onClick={() => {
                                    vincularResolucionAExpediente(r.id, expediente.id);
                                    setVincularDropdownOpen(false);
                                  }}
                                  className="w-full text-left p-2 hover:bg-slate-100 rounded-lg text-slate-800 transition-colors"
                                >
                                  <span className="font-mono font-bold block">{r.numeroResolucion}</span>
                                  <span className="text-[11px] text-slate-500 line-clamp-1">{r.asunto}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de resoluciones vinculadas */}
                {resolucionesAsociadas.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-xs">
                    <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No hay resoluciones vinculadas</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Puede emitir una nueva resolución o vincular una resolución administrativa existente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resolucionesAsociadas.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#082032]">
                              {res.numeroResolucion}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              {res.categoria}
                            </span>
                            {res.esPublica ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Pública
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Reservada
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[11px]">
                              {new Date(res.fechaEmision).toLocaleDateString('es-AR')}
                            </span>
                            <button
                              onClick={() => desvincularResolucionDeExpediente(res.id, expediente.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Desvincular de este expediente"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="font-bold text-[#082032] font-serif">{res.asunto}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                          "{res.textoResuelve}"
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Firmante: {res.firmante} ({res.cargoFirmante}) • {res.organismoEmisor}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. CARÁTULA & FOLIACIÓN */}
            {activeTab === 'caratula' && (
              <div className="space-y-4 text-xs">
                <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4">
                  <div className="flex justify-between items-start border-b border-[#B71C1C] pb-3">
                    <div>
                      <p className="font-bold uppercase text-[10px] text-slate-500 tracking-wider">
                        PROVINCIA DE JUJUY
                      </p>
                      <h4 className="text-sm font-black text-[#082032] uppercase">
                        OFICINA ANTICORRUPCIÓN • REPARTICIÓN 2100
                      </h4>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <p className="text-base text-[#082032]">{expediente.claveUnica}</p>
                      <p className="text-[10px] text-slate-500">Año {expediente.anio}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-500 font-semibold">Extracto / Asunto Caratulado:</p>
                    <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 font-serif leading-relaxed text-sm">
                      {expediente.asunto}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block">Fojas Iniciales</span>
                      <strong className="text-sm font-mono text-[#082032]">{expediente.fojasInicio}</strong>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block">Fojas en Pases</span>
                      <strong className="text-sm font-mono text-[#082032]">
                        {(expediente.pases || []).reduce((s, p) => s + (p.fojasPase || 0), 0)}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block">Fojas de Adjuntos</span>
                      <strong className="text-sm font-mono text-[#082032]">
                        {expediente.adjuntos?.reduce((s, a) => s + (Number(a.fojas) || 1), 0) || 0}
                      </strong>
                    </div>

                    <div className="bg-[#082032] text-white p-3 rounded-lg">
                      <span className="text-[10px] text-slate-300 uppercase block">Total Fojas</span>
                      <strong className="text-base font-mono text-[#FC4F46]">{totalFojas} fojas</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="font-mono text-[11px]">
              Actualizado: {formatDate(expediente.updatedAt)}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal Redactor de Documento Oficial con Membrete */}
      <EditorDocumentoModal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        onSave={handleSaveRedactado}
        claveExpediente={expediente.claveUnica}
      />

      {/* Modal Reporte Completo (PDF, CSV, JSON) */}
      <ReporteExpedienteModal
        expediente={expediente}
        isOpen={reporteModalOpen}
        onClose={() => setReporteModalOpen(false)}
      />

      {/* Modal Crear Resolución para este expediente */}
      <ResolucionModal
        isOpen={resolucionModalOpen}
        onClose={() => setResolucionModalOpen(false)}
        expedientePreseleccionadoId={expediente.id}
      />
    </>
  );
};
