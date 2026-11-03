import React from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Building,
  Calendar,
  User,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Paperclip,
  QrCode,
  FileSpreadsheet,
  FileCode2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expediente } from '../types';

interface ReporteExpedienteModalProps {
  expediente: Expediente | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReporteExpedienteModal: React.FC<ReporteExpedienteModalProps> = ({
  expediente,
  isOpen,
  onClose,
}) => {
  const { getDepartamento, getUsuario, calcularTotalFojas, resoluciones } = useApp();

  if (!isOpen || !expediente) return null;

  const deptoInicio = getDepartamento(expediente.departamentoInicioId);
  const usuarioInicio = getUsuario(expediente.usuarioInicioId);
  const deptoActual = getDepartamento(expediente.departamentoActualId);
  const totalFojas = calcularTotalFojas(expediente);

  // Resoluciones vinculadas
  const resolucionesAsociadas = resoluciones.filter((r) =>
    (expediente.resolucionesIds || []).includes(r.id) ||
    (r.expedientesIds || []).includes(expediente.id)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataToExport = {
      sistema: 'SIGED - Oficina Anticorrupción - Gobierno de Jujuy',
      fechaExportacion: new Date().toISOString(),
      expediente: {
        ...expediente,
        totalFojasCalculadas: totalFojas,
        departamentoInicioNombre: deptoInicio?.nombre,
        iniciadoPorNombre: `${usuarioInicio?.firstName} ${usuarioInicio?.lastName}`,
        departamentoActualNombre: deptoActual?.nombre,
        resolucionesAsociadas: resolucionesAsociadas.map((r) => ({
          numero: r.numeroResolucion,
          categoria: r.categoria,
          esPublica: r.esPublica,
          asunto: r.asunto,
          fecha: r.fechaEmision,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${expediente.claveUnica}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'ClaveUnica',
      'Asunto',
      'Tramite',
      'FechaInicio',
      'Iniciador',
      'DeptoInicio',
      'DeptoActual',
      'Estado',
      'FojasInicio',
      'FojasTotales',
      'TotalPases',
      'TotalAdjuntos',
    ];

    const values = [
      `"${expediente.claveUnica}"`,
      `"${expediente.asunto.replace(/"/g, '""')}"`,
      `"${expediente.tramiteInicio}"`,
      `"${expediente.fechaInicio.split('T')[0]}"`,
      `"${usuarioInicio?.firstName} ${usuarioInicio?.lastName}"`,
      `"${deptoInicio?.nombre}"`,
      `"${deptoActual?.nombre}"`,
      expediente.estado,
      expediente.fojasInicio,
      totalFojas,
      (expediente.pases || []).length,
      (expediente.adjuntos || []).length,
    ];

    const csvContent =
      '\uFEFF' + [headers.join(';'), values.join(';')].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Expediente_${expediente.claveUnica}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-150">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                Reporte Oficial de Expediente • {expediente.claveUnica}
              </h3>
              <p className="text-xs text-slate-300">
                Informe integral de trazabilidad, foliación, pases y resoluciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-slate-300 hover:bg-[#2C394B] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar en Hoja de Cálculo (CSV/Excel)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 border border-slate-300 hover:bg-[#2C394B] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar en formato JSON Estructurado"
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Reporte Formateado (Listo para imprimir) */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 font-serif text-[#082032] bg-white">
          {/* Membrete Oficial Jujuy */}
          <div className="border-b-2 border-[#B71C1C] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 border border-slate-300 bg-amber-50/50 rounded-sm p-1 flex flex-col items-center justify-center text-center">
                <span className="text-[7px] font-black uppercase text-slate-800">JUJUY</span>
                <span className="text-[6px] text-slate-500">PROVINCIA</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  GOBIERNO DE LA PROVINCIA DE JUJUY
                </p>
                <p className="text-sm font-black uppercase text-[#082032]">
                  OFICINA ANTICORRUPCIÓN • REPARTICIÓN 2100
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Sistema de Gestión de Expedientes Digitales (SIGED OA)
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-mono font-bold text-slate-700">
                FECHA DE EMISIÓN
              </p>
              <p className="text-xs font-mono text-[#082032]">
                {new Date().toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 mt-1 inline-block">
                ESTADO: {expediente.estado.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Cuadro de Identificación del Expediente */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  CLAVE ÚNICA REGISTRAL
                </span>
                <p className="text-xl font-black font-mono text-[#082032]">
                  {expediente.claveUnica}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Fojas Inicio</span>
                  <span className="font-bold text-[#082032]">{expediente.fojasInicio} fojas</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Fojas Acumuladas</span>
                  <span className="font-bold text-[#FC4F46] text-sm">{totalFojas} fojas</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold">Asunto Formal:</span>
                <p className="font-bold text-[#082032] mt-0.5">{expediente.asunto}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Tipo de Trámite:</span>
                <p className="font-bold text-[#082032] mt-0.5">{expediente.tramiteInicio}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Iniciado por:</span>
                <p className="text-slate-800 mt-0.5">
                  {usuarioInicio?.firstName} {usuarioInicio?.lastName} ({deptoInicio?.nombre})
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Dependencia Actual:</span>
                <p className="text-slate-800 mt-0.5 font-bold">{deptoActual?.nombre}</p>
              </div>
            </div>
          </div>

          {/* Trazabilidad: Historial Completo de Pases */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#082032] border-b border-[#082032] pb-1 flex items-center justify-between">
              <span>Hoja de Ruta y Pases Administrativos</span>
              <span className="font-mono text-slate-500 font-normal">
                {(expediente.pases || []).length} pases realizados
              </span>
            </h4>

            {(!expediente.pases || expediente.pases.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                El expediente no registra pases aún; permanece en la dependencia de inicio.
              </p>
            ) : (
              <div className="space-y-2">
                {expediente.pases.map((pase, idx) => {
                  const emisor = getUsuario(pase.usuarioEmisorId);
                  const deptoEm = getDepartamento(pase.departamentoEmisorId);
                  const receptor = getUsuario(pase.usuarioReceptorId);
                  const deptoRec = getDepartamento(pase.departamentoReceptorId);

                  return (
                    <div
                      key={pase.id}
                      className="p-3 bg-white border border-slate-300 rounded-lg text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#082032]">
                          Pase N° {idx + 1} • {new Date(pase.fechaPase).toLocaleDateString('es-AR')}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                            pase.estadoPase === 'recepcionado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pase.estadoPase === 'pendiente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pase.estadoPase}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700">
                        <span className="font-semibold">{deptoEm?.codigo} ({emisor?.firstName} {emisor?.lastName})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{deptoRec?.codigo} ({receptor?.firstName} {receptor?.lastName})</span>
                      </div>

                      <p className="text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                        "{pase.observacion}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                        <span>Fojas agregadas en este pase: <strong>+{pase.fojasPase} fojas</strong></span>
                        {pase.fechaRecepcion && (
                          <span>Recepcionado: {new Date(pase.fechaRecepcion).toLocaleDateString('es-AR')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Documentos y Archivos Foliados */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#082032] border-b border-[#082032] pb-1 flex items-center justify-between">
              <span>Documentos y Fojas Incorporadas ({expediente.adjuntos?.length || 0})</span>
              <span className="font-mono text-slate-500 font-normal">
                {expediente.adjuntos?.reduce((s, a) => s + (Number(a.fojas) || 1), 0) || 0} fojas adjuntas
              </span>
            </h4>

            {(!expediente.adjuntos || expediente.adjuntos.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No se han incorporado archivos adicionales.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {expediente.adjuntos.map((adj) => (
                  <div
                    key={adj.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-[#082032] truncate">{adj.titulo}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{adj.archivoNombre}</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-[#082032] shrink-0">
                      {adj.fojas || 1} {adj.fojas === 1 ? 'foja' : 'fojas'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resoluciones Vinculadas */}
          {resolucionesAsociadas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#082032] border-b border-[#082032] pb-1">
                Resoluciones Vinculadas ({resolucionesAsociadas.length})
              </h4>
              <div className="space-y-2">
                {resolucionesAsociadas.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-[#082032]">
                      <span>{res.numeroResolucion} • {res.categoria}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-purple-300">
                        {res.esPublica ? 'PÚBLICA' : 'RESERVADA'}
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold">{res.asunto}</p>
                    <p className="text-[11px] text-slate-500">Firmante: {res.firmante} ({res.cargoFirmante})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sello de Seguridad y Validación Oficial */}
          <div className="pt-8 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-slate-400 rounded flex items-center justify-center">
                <QrCode className="w-9 h-9 text-[#082032]" />
              </div>
              <div className="text-[11px] text-slate-600">
                <p className="font-bold text-[#082032] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Documento Auténtico Certificado
                </p>
                <p className="font-mono text-[10px]">CÓDIGO: {expediente.claveUnica}-{Date.now()}</p>
                <p className="text-[10px]">Constancia emitida por SIGED OA Jujuy</p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-500 font-mono">
              <p>Fojas Totales Registradas: <strong className="text-[#082032]">{totalFojas}</strong></p>
              <p>Poder Ejecutivo • Provincia de Jujuy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
