import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  FilePlus2,
  Trash2,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';
import { AdjuntoInput } from '../context/AppContext';
import { TipoAdjunto } from '../types';
import { EditorDocumentoModal } from './EditorDocumentoModal';

interface AdjuntosZoneProps {
  adjuntos: AdjuntoInput[];
  onChange: (adjuntos: AdjuntoInput[]) => void;
  claveExpediente?: string;
  label?: string;
  readOnly?: boolean;
}

export const AdjuntosZone: React.FC<AdjuntosZoneProps> = ({
  adjuntos,
  onChange,
  claveExpediente,
  label = 'Adjuntar Archivos y Documentación Respaldatoria',
  readOnly = false,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calcular total de fojas acumuladas por estos adjuntos
  const totalFojasAdjuntos = adjuntos.reduce(
    (sum, a) => sum + (Number(a.fojas) || 1),
    0
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files) as File[];
    const nuevos: AdjuntoInput[] = filesArray.map((file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isPdf = ext === 'pdf' || ext === 'doc' || ext === 'docx';
      const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
      const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);

      let tipo: TipoAdjunto = 'documento';
      let esMulti = false;
      let fojasIniciales = 1;

      if (isImg) {
        tipo = 'imagen';
        esMulti = true;
        fojasIniciales = 1; // individual / multimedia cuenta como 1 foja
      } else if (isAudio) {
        tipo = 'audio';
        esMulti = true;
        fojasIniciales = 1;
      } else if (isVideo) {
        tipo = 'video';
        esMulti = true;
        fojasIniciales = 1;
      } else if (isPdf) {
        tipo = 'documento';
        // Documentos: estimar o sugerir cantidad de hojas según tamaño o 2-4 fojas base
        fojasIniciales = file.size > 2000000 ? 5 : file.size > 500000 ? 3 : 1;
      }

      return {
        tipoAdjunto: tipo,
        titulo: file.name.replace(/\.[^/.]+$/, ''),
        descripcion: `Archivo adjunto (${ext.toUpperCase()}) - ${fojasIniciales} fojas`,
        archivoNombre: file.name,
        archivoTamano: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fojas: fojasIniciales,
        esMultimedia: esMulti,
        formato: file.type || ext,
      };
    });

    onChange([...adjuntos, ...nuevos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateFojas = (index: number, delta: number) => {
    const updated = adjuntos.map((item, i) => {
      if (i === index) {
        const cur = Number(item.fojas) || 1;
        const next = Math.max(1, cur + delta);
        return { ...item, fojas: next };
      }
      return item;
    });
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = adjuntos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddRedactado = (nuevo: AdjuntoInput) => {
    onChange([...adjuntos, nuevo]);
  };

  const getIconForType = (tipo: TipoAdjunto) => {
    switch (tipo) {
      case 'imagen':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'audio':
        return <Music className="w-4 h-4 text-purple-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-sky-600" />;
      case 'dictamen':
      case 'providencia':
      case 'resolucion':
        return <FilePlus2 className="w-4 h-4 text-[#FC4F46]" />;
      default:
        return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-[#FC4F46]" />
          <span>{label}</span>
        </label>

        {/* Resumen de fojas aportadas */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#082032]" />
            <span>
              {adjuntos.length} {adjuntos.length === 1 ? 'archivo' : 'archivos'} •{' '}
              <strong className="text-[#082032]">{totalFojasAdjuntos} fojas útiles</strong>
            </span>
          </span>
        </div>
      </div>

      {/* Botones de Acción: Adjuntar y Redactar */}
      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Subir archivo desde disco */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white border-2 border-dashed border-slate-300 hover:border-[#082032] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer group"
          >
            <Upload className="w-4 h-4 text-slate-500 group-hover:text-[#082032] group-hover:scale-110 transition-transform" />
            <span>Adjuntar Documento o Multimedia</span>
          </button>

          {/* Redactar documento oficial con membrete de Jujuy */}
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#082032] hover:bg-[#2C394B] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FC4F46]" />
            <span>Redactar Documento Oficial con Membrete</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp3,.wav,.mp4"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Regla explicativa sobre el cómputo de fojas */}
      <div className="p-2.5 bg-slate-100/80 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#082032] shrink-0 mt-0.5" />
        <p>
          <strong>Criterio de Foliación:</strong> Los documentos multipágina (PDF/Docs) se computan según la cantidad de hojas físicas ingresadas. Los archivos individuales o multimedia (fotos, audios) se computan como 1 foja por unidad. Puede ajustar manualmente las fojas con los controles (+/-).
        </p>
      </div>

      {/* Lista de archivos adjuntos */}
      {adjuntos.length > 0 && (
        <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white shadow-2xs max-h-60 overflow-y-auto">
          {adjuntos.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getIconForType(item.tipoAdjunto)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#082032] truncate font-serif">
                      {item.titulo}
                    </p>
                    {item.esDocumentoRedactado && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-mono uppercase font-bold shrink-0">
                        Membrete Jujuy
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {item.archivoNombre} • {item.archivoTamano}
                  </p>
                </div>
              </div>

              {/* Ajuste de Fojas y Eliminar */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Contador de fojas del archivo */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleUpdateFojas(idx, -1)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                      disabled={Number(item.fojas) <= 1}
                      title="Restar foja"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                  <span className="px-2 font-mono font-bold text-xs text-[#082032]">
                    {item.fojas} {item.fojas === 1 ? 'foja' : 'fojas'}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleUpdateFojas(idx, 1)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                      title="Sumar foja"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Botón eliminar */}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Quitar archivo y restar sus fojas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <EditorDocumentoModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleAddRedactado}
        claveExpediente={claveExpediente}
      />
    </div>
  );
};
