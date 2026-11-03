import React, { useState } from 'react';
import {
  X,
  Archive,
  AlertCircle,
  Box,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { Expediente } from '../types';
import { useApp } from '../context/AppContext';

interface ArchivarExpedienteModalProps {
  expediente: Expediente | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ArchivarExpedienteModal: React.FC<ArchivarExpedienteModalProps> = ({
  expediente,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { archivarExpediente, calcularTotalFojas } = useApp();

  const totalCalculado = expediente ? calcularTotalFojas(expediente) : 0;
  const currentYear = new Date().getFullYear();

  const [nroCaja, setNroCaja] = useState(`CAJA-${currentYear}-A${Math.floor(Math.random() * 20 + 1).toString().padStart(2, '0')}`);
  const [fojasArchivado, setFojasArchivado] = useState<number>(totalCalculado);
  const [observacion, setObservacion] = useState('Trámite finalizado con resolución y ejecución cumplida.');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !expediente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nroCaja.trim()) {
      setErrorMsg('Debe consignar el número de caja física de guarda.');
      return;
    }

    if (!observacion.trim()) {
      setErrorMsg('Debe indicar las observaciones y motivo de pase al archivo.');
      return;
    }

    const res = archivarExpediente(expediente.id, {
      nroCaja: nroCaja.trim(),
      fojasArchivado: Number(fojasArchivado) || totalCalculado,
      observacion: observacion.trim(),
    });

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || 'Error al archivar expediente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2C394B] flex items-center justify-center text-[#FC4F46] shrink-0 shadow-xs">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Archivar Expediente Administrativo
              </h3>
              <p className="text-xs text-slate-300">
                Guarda y custodia definitiva en Archivo General Central
              </p>
            </div>
          </div>

          <button
            id="btn-close-archivar-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resumen del expediente */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Expediente:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {expediente.claveUnica}
              </span>
            </div>
            <p className="text-slate-800 font-medium line-clamp-2">
              {expediente.asunto}
            </p>
          </div>

          {/* Número de Caja Física */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Identificador de Caja Física o Anaquel de Guarda <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Box className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                id="input-nro-caja"
                type="text"
                required
                value={nroCaja}
                onChange={(e) => setNroCaja(e.target.value)}
                placeholder="Ej: CAJA-2026-A15 / SECTOR-3B"
                className="w-full pl-9 pr-3 py-2 bg-white text-xs font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Indica la caja física en la que se conservará el legajo foliado.
            </span>
          </div>

          {/* Fojas al archivar */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Total de Fojas Foliadas al Archivo
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                id="input-fojas-archivado"
                type="number"
                min={1}
                value={fojasArchivado}
                onChange={(e) => setFojasArchivado(parseInt(e.target.value) || totalCalculado)}
                className="w-full pl-9 pr-3 py-2 bg-white text-xs font-mono font-bold border border-slate-300 rounded-lg text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none"
              />
            </div>
          </div>

          {/* Observaciones de Archivo */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Observaciones, Motivo o Dictamen de Cierre <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-observacion-archivo"
              rows={3}
              required
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Indique los motivos de archivo (ej: resolución cumplida, desistimiento, archivo temporal)..."
              className="w-full px-3 py-2 bg-white text-xs border border-slate-300 rounded-lg text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-100 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-archivar"
              type="submit"
              className="px-5 py-2 bg-[#082032] hover:bg-[#2C394B] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-[#FC4F46]" />
              <span>Confirmar Archivo Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
