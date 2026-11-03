import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Building,
  User,
  AlertTriangle,
  ArrowDownLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface RecepcionarPaseModalProps {
  paseId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecepcionarPaseModal: React.FC<RecepcionarPaseModalProps> = ({
  paseId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    expedientes,
    recepcionarPase,
    rechazarPase,
    getDepartamento,
    getUsuario,
    usuarioActual,
  } = useApp();

  const [observacion, setObservacion] = useState('Recepcionado de conformidad.');
  const [isRejecting, setIsRejecting] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !paseId) return null;

  // Encontrar el pase y su expediente
  let targetPase;
  let targetExpediente;

  for (const exp of expedientes) {
    const p = (exp.pases || []).find((pase) => pase.id === paseId);
    if (p) {
      targetPase = p;
      targetExpediente = exp;
      break;
    }
  }

  if (!targetPase || !targetExpediente) return null;

  const emisor = getUsuario(targetPase.usuarioEmisorId);
  const deptoEmisor = getDepartamento(targetPase.departamentoEmisorId);
  const deptoReceptor = getDepartamento(targetPase.departamentoReceptorId);

  const handleConfirmRecepcion = (e: React.FormEvent) => {
    e.preventDefault();
    const res = recepcionarPase(paseId, observacion);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Error al recepcionar pase.');
    }
  };

  const handleConfirmRechazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoRechazo.trim()) {
      setErrorMsg('Debe especificar el motivo del rechazo.');
      return;
    }

    const res = rechazarPase(paseId, motivoRechazo);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Error al rechazar pase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                {isRejecting ? 'Rechazar Pase de Actuaciones' : 'Recepcionar Pase Oficial'}
              </h3>
              <p className="text-xs text-slate-300">
                Expediente: <span className="font-mono text-white font-bold">{targetExpediente.claveUnica}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-recepcionar-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del Pase entrante */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 text-[11px]">
              <span>Procedencia:</span>
              <span className="font-mono font-bold text-slate-800">
                {new Date(targetPase.fechaPase).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <p className="font-bold text-slate-900">
              {deptoEmisor?.nombre} ({deptoEmisor?.codigo})
            </p>
            <p className="text-slate-600">
              Remitido por: {emisor?.firstName} {emisor?.lastName}
            </p>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Motivo del Pase:
              </span>
              <p className="italic text-slate-800 bg-white p-2 rounded border border-slate-200 mt-1">
                &quot;{targetPase.observacion}&quot;
              </p>
            </div>

            <div className="flex justify-between items-center pt-1 font-mono text-[11px] text-slate-600">
              <span>Fojas agregadas en este pase:</span>
              <span className="font-bold text-blue-700">+{targetPase.fojasPase} fojas</span>
            </div>
          </div>

          {!isRejecting ? (
            <form onSubmit={handleConfirmRecepcion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nota u Observación de Recepción
                </label>
                <textarea
                  id="input-observacion-recepcion"
                  rows={2}
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej: Recepcionado de conformidad para tramitación..."
                  className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  ¿Rechazar este pase?
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-confirm-recepcion"
                    type="submit"
                    className="px-4 py-2 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aceptar y Recepcionar</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmRechazo} className="space-y-4">
              <div className="p-3 bg-red-50 border-l-4 border-[#B71C1C] rounded-r-xl text-xs text-slate-900">
                <p className="font-bold text-[#B71C1C]">Rechazo de Actuaciones</p>
                <p className="text-[11px] mt-0.5 text-slate-600">
                  El expediente regresará al departamento emisor ({deptoEmisor?.nombre}) con constancia del motivo de devolución.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Motivo Fundado de Rechazo o Devolución <span className="text-[#B71C1C]">*</span>
                </label>
                <textarea
                  id="input-motivo-rechazo"
                  rows={3}
                  required
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Explique las faltas documentales, error de destino o inconsistencias..."
                  className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:border-[#B71C1C] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Volver a Recepción
                </button>
                <button
                  id="btn-confirm-rechazo"
                  type="submit"
                  className="px-4 py-1.5 bg-[#B71C1C] hover:bg-[#961717] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirmar Rechazo</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
