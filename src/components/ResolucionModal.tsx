import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  Building,
  User,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Link,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Resolucion, CategoriaResolucion } from '../types';

interface ResolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolucionAEditar?: Resolucion | null;
  expedientePreseleccionadoId?: number;
  onSuccess?: (res: Resolucion) => void;
}

const CATEGORIAS: CategoriaResolucion[] = [
  'Administrativa',
  'Técnica',
  'Disciplinaria',
  'Presupuestaria',
  'Declaración',
  'Regulatoria',
  'General',
];

export const ResolucionModal: React.FC<ResolucionModalProps> = ({
  isOpen,
  onClose,
  resolucionAEditar,
  expedientePreseleccionadoId,
  onSuccess,
}) => {
  const {
    usuarioActual,
    expedientes,
    agregarResolucion,
    editarResolucion,
  } = useApp();

  const currentYear = new Date().getFullYear();

  const [numeroResolucion, setNumeroResolucion] = useState('');
  const [anio, setAnio] = useState(currentYear);
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [organismoEmisor, setOrganismoEmisor] = useState('Oficina Anticorrupción - Dirección General');
  const [firmante, setFirmante] = useState(`${usuarioActual.firstName} ${usuarioActual.lastName}`);
  const [cargoFirmante, setCargoFirmante] = useState('Titular de Despacho y Fiscal Anticorrupción');
  const [categoria, setCategoria] = useState<CategoriaResolucion>('Administrativa');
  const [esPublica, setEsPublica] = useState(true);
  const [asunto, setAsunto] = useState('');
  const [considerando, setConsiderando] = useState('');
  const [textoResuelve, setTextoResuelve] = useState('');
  const [expedientesSeleccionados, setExpedientesSeleccionados] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar estado cuando se abre o cambia la resolución a editar
  useEffect(() => {
    if (resolucionAEditar) {
      setNumeroResolucion(resolucionAEditar.numeroResolucion);
      setAnio(resolucionAEditar.anio);
      setFechaEmision(resolucionAEditar.fechaEmision.split('T')[0]);
      setOrganismoEmisor(resolucionAEditar.organismoEmisor);
      setFirmante(resolucionAEditar.firmante);
      setCargoFirmante(resolucionAEditar.cargoFirmante);
      setCategoria(resolucionAEditar.categoria);
      setEsPublica(resolucionAEditar.esPublica);
      setAsunto(resolucionAEditar.asunto);
      setConsiderando(resolucionAEditar.considerando);
      setTextoResuelve(resolucionAEditar.textoResuelve);
      setExpedientesSeleccionados(resolucionAEditar.expedientesIds || []);
    } else {
      // Nueva resolución: sugerir número
      const randNum = Math.floor(10 + Math.random() * 90);
      setNumeroResolucion(`RES-${currentYear}-${String(randNum).padStart(3, '0')}-OA`);
      setAnio(currentYear);
      setFechaEmision(new Date().toISOString().split('T')[0]);
      setOrganismoEmisor('Oficina Anticorrupción - Poder Ejecutivo Jujuy');
      setFirmante(`${usuarioActual.firstName} ${usuarioActual.lastName}`);
      setCargoFirmante(
        usuarioActual.rolId === 'superadmin'
          ? 'Fiscal General Anticorrupción'
          : 'Director de Despacho y Resoluciones'
      );
      setCategoria('Administrativa');
      setEsPublica(true);
      setAsunto('');
      setConsiderando(
        'VISTO las actuaciones y dictámenes obrantes en autos, y;\nCONSIDERANDO:\nQue se han reunido los extremos legales exigidos por la normativa vigente provincial...'
      );
      setTextoResuelve(
        'ARTÍCULO 1°.- DISPÓNESE la aprobación formal de lo actuado de conformidad a las prescripciones legales aplicables.\nARTÍCULO 2°.- COMUNÍQUESE, regístrese en el Libro de Resoluciones y archívese copia formal.'
      );
      setExpedientesSeleccionados(
        expedientePreseleccionadoId ? [expedientePreseleccionadoId] : []
      );
    }
    setErrorMsg('');
  }, [resolucionAEditar, expedientePreseleccionadoId, isOpen, usuarioActual, currentYear]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!numeroResolucion.trim()) {
      setErrorMsg('Debe especificar el número de la resolución.');
      return;
    }

    if (!asunto.trim()) {
      setErrorMsg('El asunto u objeto de la resolución es obligatorio.');
      return;
    }

    if (!textoResuelve.trim()) {
      setErrorMsg('Debe redactar la parte resolutiva (Artículos resolutivos).');
      return;
    }

    const payload = {
      numeroResolucion: numeroResolucion.trim(),
      anio: Number(anio) || currentYear,
      fechaEmision: new Date(fechaEmision).toISOString(),
      organismoEmisor: organismoEmisor.trim(),
      firmante: firmante.trim(),
      cargoFirmante: cargoFirmante.trim(),
      categoria,
      esPublica,
      asunto: asunto.trim(),
      considerando: considerando.trim(),
      textoResuelve: textoResuelve.trim(),
      expedientesIds: expedientesSeleccionados,
      archivoNombre: `Resolucion_${numeroResolucion.replace(/[\s/-]+/g, '_')}.pdf`,
      archivoTamano: '1.2 MB',
    };

    if (resolucionAEditar) {
      const res = editarResolucion(resolucionAEditar.id, payload);
      if (res.success) {
        if (onSuccess) onSuccess({ ...resolucionAEditar, ...payload, updatedAt: new Date().toISOString() });
        onClose();
      } else {
        setErrorMsg(res.error || 'Error al actualizar resolución.');
      }
    } else {
      const res = agregarResolucion(payload);
      if (res.success && res.resolucion) {
        if (onSuccess) onSuccess(res.resolucion);
        onClose();
      } else {
        setErrorMsg(res.error || 'Error al crear resolución.');
      }
    }
  };

  const toggleExpediente = (id: number) => {
    if (expedientesSeleccionados.includes(id)) {
      setExpedientesSeleccionados((prev) => prev.filter((expId) => expId !== id));
    } else {
      setExpedientesSeleccionados((prev) => [...prev, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                {resolucionAEditar ? 'Editar Resolución Oficial' : 'Emitir Nueva Resolución Administrativa'}
              </h3>
              <p className="text-xs text-slate-300">
                Registro formal, categorización y vinculación con expedientes de trámite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2C394B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fila 1: Número, Año, Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Número de Resolución *
              </label>
              <input
                type="text"
                required
                value={numeroResolucion}
                onChange={(e) => setNumeroResolucion(e.target.value)}
                placeholder="Ej. RES-2026-045-OA"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Año / Ejercicio
              </label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-mono focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Fecha de Emisión
              </label>
              <input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>
          </div>

          {/* Fila 2: Categoría y VISIBILIDAD PÚBLICA vs RESERVADA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Categoría Jurídica / Administrativa *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaResolucion)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* CONTROL DE PUBLICIDAD / RESERVA (Requisito 4) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Régimen de Publicidad y Acceso *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEsPublica(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    esPublica
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Pública / Transparente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEsPublica(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    !esPublica
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-1 ring-rose-400'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <EyeOff className="w-4 h-4 text-rose-600" />
                  <span>Reservada / No Pública</span>
                </button>
              </div>
            </div>
          </div>

          {!esPublica && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Actuación con Reserva Legal:</strong> Esta resolución solo será visible para personal facultado, letrados sumariantes y la Dirección General, quedando excluida de la consulta pública general.
              </div>
            </div>
          )}

          {/* Fila 3: Organismo Emisor, Firmante y Cargo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Organismo Emisor
              </label>
              <input
                type="text"
                value={organismoEmisor}
                onChange={(e) => setOrganismoEmisor(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Autoridad Firmante
              </label>
              <input
                type="text"
                value={firmante}
                onChange={(e) => setFirmante(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Cargo Oficial
              </label>
              <input
                type="text"
                value={cargoFirmante}
                onChange={(e) => setCargoFirmante(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Asunto / Objeto de la Resolución *
            </label>
            <textarea
              required
              rows={2}
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Aprobación del Pliego de Bases y Condiciones Particulares para la Licitación Pública..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-serif focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Visto y Considerando */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Visto y Considerando (Fundamentos de Hecho y Derecho)
            </label>
            <textarea
              rows={4}
              value={considerando}
              onChange={(e) => setConsiderando(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-serif leading-relaxed focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Parte Resolutiva */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Parte Resolutiva / Fallo * (Artículos 1°, 2°, etc.)
            </label>
            <textarea
              required
              rows={4}
              value={textoResuelve}
              onChange={(e) => setTextoResuelve(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-serif leading-relaxed focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
            />
          </div>

          {/* Vinculación con Expedientes del Sistema (Requisito 4) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-[#FC4F46]" />
                <span>Expedientes Vinculados a esta Resolución</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {expedientesSeleccionados.length} seleccionados
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50 text-xs">
              {expedientes.map((exp) => {
                const isSelected = expedientesSeleccionados.includes(exp.id);
                return (
                  <label
                    key={exp.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#082032]/10 border border-[#082032]/30 font-semibold text-[#082032]'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleExpediente(exp.id)}
                        className="rounded border-slate-300 text-[#082032] focus:ring-[#082032]"
                      />
                      <span className="font-mono text-xs font-bold text-[#082032]">
                        {exp.claveUnica}
                      </span>
                      <span className="text-[11px] text-slate-600 truncate font-serif">
                        {exp.asunto}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200">
                      {exp.estado}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{resolucionAEditar ? 'Guardar Cambios' : 'Registrar Resolución'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
