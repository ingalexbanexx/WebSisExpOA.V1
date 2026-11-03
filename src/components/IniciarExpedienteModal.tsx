import React, { useState } from 'react';
import {
  X,
  FilePlus,
  Building,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useApp, AdjuntoInput } from '../context/AppContext';
import { AdjuntosZone } from './AdjuntosZone';

interface IniciarExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claveUnica: string) => void;
}

const TRAMITES_FRECUENTES = [
  'Licitación y Compras Públicas',
  'Contratación de Servicios y Suministros',
  'Concurso y Promoción de Personal',
  'Reclamo Administrativo Individual',
  'Convenio Interinstitucional',
  'Dictamen y Asesoramiento Legal',
  'Rendición de Cuentas y Caja Chica',
  'Mantenimiento e Infraestructura Edilicia',
];

export const IniciarExpedienteModal: React.FC<IniciarExpedienteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { usuarioActual, departamentos, expedientes, iniciarExpediente, roles } =
    useApp();

  const [asunto, setAsunto] = useState('');
  const [tramiteInicio, setTramiteInicio] = useState(TRAMITES_FRECUENTES[0]);
  const [fojasInicio, setFojasInicio] = useState(1);
  const [adjuntos, setAdjuntos] = useState<AdjuntoInput[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const depto = departamentos.find((d) => d.id === usuarioActual.departamentoId);
  const rol = roles[usuarioActual.rolId];

  // Previsualizar próximo número correlativo
  const expedientesAnio = expedientes.filter(
    (e) => e.anio === currentYear && e.codigoReparticion === '2100'
  );
  const proximoNumero =
    expedientesAnio.reduce((max, e) => (e.numeroExpediente > max ? e.numeroExpediente : max), 0) + 1;
  const clavePrevisualizada = `2100-${proximoNumero}-${currentYear}`;

  const fojasAdjuntos = adjuntos.reduce(
    (sum, a) => sum + (Number(a.fojas) || 1),
    0
  );
  const fojasTotalesNacimiento = fojasInicio + fojasAdjuntos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!asunto.trim()) {
      setErrorMsg('El asunto es un campo obligatorio para la carátula oficial.');
      return;
    }

    if (fojasInicio < 1) {
      setErrorMsg('El expediente debe iniciarse con un mínimo de 1 foja.');
      return;
    }

    const res = iniciarExpediente({
      asunto: asunto.trim(),
      tramiteInicio: tramiteInicio.trim(),
      fojasInicio: Number(fojasInicio),
      adjuntos,
    });

    if (res.success && res.claveUnica) {
      onSuccess(res.claveUnica);
      setAdjuntos([]);
      onClose();
    } else {
      setErrorMsg(res.error || 'Error al iniciar expediente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Iniciar Nuevo Expediente Administrativo
              </h3>
              <p className="text-xs text-slate-300">
                Apertura formal bajo ordenanza de tramitación electrónica OA Jujuy
              </p>
            </div>
          </div>

          <button
            id="btn-close-iniciar-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clave Única Preview Banner */}
        <div className="bg-[#082032]/5 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#082032]">
            <Sparkles className="w-4 h-4 text-[#FC4F46]" />
            <span>
              Clave Única a Generar:{' '}
              <strong className="font-mono text-sm text-[#082032] font-bold">
                {clavePrevisualizada}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">
            Repartición 2100 • Ejercicio {currentYear}
          </span>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Información del Iniciador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Departamento de Origen
              </span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5 font-serif">
                <Building className="w-3.5 h-3.5 text-[#082032]" />
                {depto?.nombre}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">
                {depto?.codigo} • {depto?.telefonoInterno}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Agente Iniciador
              </span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5 font-serif">
                <User className="w-3.5 h-3.5 text-[#082032]" />
                {usuarioActual.firstName} {usuarioActual.lastName}
              </p>
              <span className="text-[10px] text-slate-500">
                Rol: <strong className="uppercase">{usuarioActual.rolId}</strong>
              </span>
            </div>
          </div>

          {/* Trámite de Inicio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Tipo de Trámite o Procedimiento <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-tramite-inicio"
              value={tramiteInicio}
              onChange={(e) => setTramiteInicio(e.target.value)}
              className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold focus:border-[#082032] focus:ring-2 focus:ring-[#082032]/20 outline-hidden"
            >
              {TRAMITES_FRECUENTES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Asunto Oficial o Extracto Sintético <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-asunto-inicio"
              rows={3}
              required
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Describa de forma precisa el objeto de la actuación administrativa, contratantes o causales del trámite..."
              className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-serif leading-relaxed focus:border-[#082032] focus:ring-2 focus:ring-[#082032]/20 outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Este texto conformará la carátula permanente del expediente.
            </p>
          </div>

          {/* Fojas Iniciales y Cómputo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Fojas Iniciales Base <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-fojas-inicio"
                type="number"
                min={1}
                max={9999}
                value={fojasInicio}
                onChange={(e) => setFojasInicio(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white text-xs font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:border-[#082032] focus:ring-2 focus:ring-[#082032]/20 outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Fojas del instrumento matriz de apertura.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Total Fojas de Apertura
              </span>
              <p className="text-xl font-black font-mono text-[#082032] mt-0.5">
                {fojasTotalesNacimiento} fojas
              </p>
              <span className="text-[10px] text-slate-500">
                {fojasInicio} base + {fojasAdjuntos} de adjuntos
              </span>
            </div>
          </div>

          {/* ZONA DE ADJUNTOS Y REDACTOR DE DOCUMENTOS OFICIALES (Requisitos 2 y 3) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <AdjuntosZone
              adjuntos={adjuntos}
              onChange={setAdjuntos}
              claveExpediente={clavePrevisualizada}
              label="Adjuntar Documentos, Multimedia o Redactar Documento Oficial"
            />
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="btn-submit-iniciar-expediente"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Iniciar Expediente Oficial ({fojasTotalesNacimiento} fojas)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
