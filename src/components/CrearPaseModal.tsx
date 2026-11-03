import React, { useState } from 'react';
import {
  X,
  Send,
  Building,
  User,
  AlertCircle,
  ArrowRight,
  Layers,
  FileCheck,
  Paperclip,
} from 'lucide-react';
import { Expediente } from '../types';
import { useApp, AdjuntoInput } from '../context/AppContext';
import { AdjuntosZone } from './AdjuntosZone';

interface CrearPaseModalProps {
  expediente: Expediente | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CrearPaseModal: React.FC<CrearPaseModalProps> = ({
  expediente,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    usuarioActual,
    departamentos,
    usuarios,
    crearPase,
    calcularTotalFojas,
    getDepartamento,
  } = useApp();

  const [deptoReceptorId, setDeptoReceptorId] = useState<number>(() => {
    // Default to a different department than current
    const other = departamentos.find((d) => d.id !== usuarioActual.departamentoId);
    return other ? other.id : 200;
  });

  const [usuarioReceptorId, setUsuarioReceptorId] = useState<number>(1);
  const [observacion, setObservacion] = useState('');
  const [fojasPase, setFojasPase] = useState(0);
  const [adjuntosPase, setAdjuntosPase] = useState<AdjuntoInput[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !expediente) return null;

  // Filtrar usuarios del departamento seleccionado
  const usuariosDestino = usuarios.filter(
    (u) => u.departamentoId === deptoReceptorId && u.isActive
  );

  // Asegurarse de que usuarioReceptorId sea válido para el nuevo depto
  const currentSelectedUserExists = usuariosDestino.some((u) => u.id === usuarioReceptorId);
  if (!currentSelectedUserExists && usuariosDestino.length > 0) {
    setUsuarioReceptorId(usuariosDestino[0].id);
  }

  const fojasActuales = calcularTotalFojas(expediente);
  const fojasAdjuntos = adjuntosPase.reduce(
    (sum, a) => sum + (Number(a.fojas) || 1),
    0
  );
  const totalFojasPaseSumadas = (Number(fojasPase) || 0) + fojasAdjuntos;
  const fojasFinales = fojasActuales + totalFojasPaseSumadas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!observacion.trim()) {
      setErrorMsg('Debe consignar el motivo u observación oficial del pase.');
      return;
    }

    if (!usuarioReceptorId) {
      setErrorMsg('Debe seleccionar el agente receptor del pase.');
      return;
    }

    const res = crearPase(expediente.id, {
      deptoReceptorId,
      usuarioReceptorId,
      observacion: observacion.trim(),
      fojasPase: Math.max(0, Number(fojasPase) || 0),
      adjuntos: adjuntosPase,
    });

    if (res.success) {
      setAdjuntosPase([]);
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Error al confeccionar el pase.');
    }
  };

  const deptoOrigen = getDepartamento(usuarioActual.departamentoId);
  const deptoDestino = getDepartamento(deptoReceptorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Emitir Pase de Expediente
              </h3>
              <p className="text-xs text-slate-300">
                Clave:{' '}
                <span className="font-mono text-white font-bold">
                  {expediente.claveUnica}
                </span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-crear-pase-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del Trámite en Tránsito */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Asunto:</span>
            <span className="font-serif text-slate-800 line-clamp-1 max-w-md">
              {expediente.asunto}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#082032]" />
            <span className="text-slate-600 font-medium">Fojas actuales:</span>
            <strong className="font-mono text-[#082032] font-bold">
              {fojasActuales}
            </strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Diagrama de Ruta: De -> A */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            {/* Origen */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Dependencia Emisora (Actual)
              </span>
              <p className="font-bold text-[#082032] flex items-center gap-1.5 font-serif">
                <Building className="w-3.5 h-3.5 text-[#082032]" />
                {deptoOrigen?.nombre}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                <User className="w-3 h-3" />
                {usuarioActual.firstName} {usuarioActual.lastName} ({usuarioActual.username})
              </p>
            </div>

            {/* Destino */}
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                Dependencia Destino (Receptora) *
              </span>
              <div className="space-y-2">
                <select
                  id="select-depto-receptor"
                  value={deptoReceptorId}
                  onChange={(e) => setDeptoReceptorId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 font-semibold focus:border-[#082032] outline-hidden text-xs"
                >
                  {departamentos
                    .filter((d) => d.id !== usuarioActual.departamentoId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.codigo} - {d.nombre}
                      </option>
                    ))}
                </select>

                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Agente Receptor Asignado *
                  </span>
                  <select
                    id="select-usuario-receptor"
                    value={usuarioReceptorId}
                    onChange={(e) => setUsuarioReceptorId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 focus:border-[#082032] outline-hidden text-xs font-medium"
                  >
                    {usuariosDestino.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.username} - {u.rolId.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Observación Oficial de Pase */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              Motivo u Observación del Pase <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-observacion-pase"
              rows={3}
              required
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Especifique el motivo de la elevación, dictamen requerido, intervención solicitada o pase a archivo..."
              className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 font-serif leading-relaxed focus:border-[#082032] focus:ring-2 focus:ring-[#082032]/20 outline-hidden"
            />
          </div>

          {/* Cómputo de Fojas del Pase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                Fojas Físicas Extra Agregadas
              </label>
              <input
                id="input-fojas-pase"
                type="number"
                min={0}
                max={9999}
                value={fojasPase}
                onChange={(e) => setFojasPase(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white text-xs font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:border-[#082032] focus:ring-2 focus:ring-[#082032]/20 outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Fojas manuales agregadas al expediente en esta instancia.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Fojas Resultantes del Expediente
              </span>
              <p className="text-xl font-black font-mono text-[#082032] mt-0.5">
                {fojasFinales} fojas
              </p>
              <span className="text-[10px] text-slate-500">
                {fojasActuales} anteriores + {totalFojasPaseSumadas} sumadas en este pase
              </span>
            </div>
          </div>

          {/* ZONA DE ADJUNTOS Y REDACTOR EN EL PASE (Requisitos 2 y 3) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <AdjuntosZone
              adjuntos={adjuntosPase}
              onChange={setAdjuntosPase}
              claveExpediente={expediente.claveUnica}
              label="Adjuntar Documentación de Pase o Redactar Providencia Oficial con Membrete"
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
            id="btn-submit-crear-pase"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Emitir Pase Oficial ({fojasFinales} fojas finales)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
