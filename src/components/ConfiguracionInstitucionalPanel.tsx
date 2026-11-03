import React, { useState, useRef } from 'react';
import {
  Shield,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  Building,
  FileText,
  AlertCircle,
  Sparkles,
  Printer,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_LOGO_GOBIERNO_SVG, DEFAULT_LOGO_REPARTICION_SVG } from '../data/defaultLogos';

interface ConfiguracionInstitucionalPanelProps {
  onSuccessNotice?: (msg: string) => void;
}

export const ConfiguracionInstitucionalPanel: React.FC<ConfiguracionInstitucionalPanelProps> = ({
  onSuccessNotice,
}) => {
  const {
    configInstitucional,
    actualizarConfigInstitucional,
    restablecerConfigInstitucional,
    usuarioActual,
  } = useApp();

  const [formState, setFormState] = useState({ ...configInstitucional });
  const [mensajeGuardado, setMensajeGuardado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const fileInputGobiernoRef = useRef<HTMLInputElement>(null);
  const fileInputReparticionRef = useRef<HTMLInputElement>(null);

  // Procesamiento de subida de archivo a Base64 Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'gobierno' | 'reparticion'
  ) => {
    setErrorCarga(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!file.type.startsWith('image/')) {
      setErrorCarga('El archivo seleccionado debe ser una imagen válida (PNG, JPG, SVG o WebP).');
      return;
    }

    // Validación de tamaño (máx 3MB para mantener fluidez en almacenamiento local)
    if (file.size > 3 * 1024 * 1024) {
      setErrorCarga('La imagen supera los 3MB. Se recomienda optimizarla antes de subirla.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (tipo === 'gobierno') {
          setFormState((prev) => ({ ...prev, logoGobiernoUrl: result }));
        } else {
          setFormState((prev) => ({ ...prev, logoReparticionUrl: result }));
        }
      }
    };
    reader.onerror = () => {
      setErrorCarga('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarConfigInstitucional(formState);
    setMensajeGuardado(true);
    if (onSuccessNotice) {
      onSuccessNotice('Configuración institucional de logos y membrete guardada con éxito.');
    }
    setTimeout(() => {
      setMensajeGuardado(false);
    }, 4000);
  };

  const handleRestablecer = () => {
    if (
      window.confirm(
        '¿Desea restablecer los logos y parámetros del membrete oficial a los valores predeterminados del Gobierno de Jujuy y la Oficina Anticorrupción?'
      )
    ) {
      restablecerConfigInstitucional();
      setFormState({
        ...configInstitucional,
        logoGobiernoUrl: DEFAULT_LOGO_GOBIERNO_SVG,
        logoReparticionUrl: DEFAULT_LOGO_REPARTICION_SVG,
        nombreGobierno: 'GOBIERNO DE LA PROVINCIA DE JUJUY',
        lemaGobierno: 'Poder Ejecutivo • Secretaría de Gestión Pública',
        nombreReparticion: 'OFICINA ANTICORRUPCIÓN',
        subtituloReparticion: 'Repartición Oficial 2100 • Órgano Constitucional de Control',
        mostrarLogoGobiernoEncabezado: true,
        mostrarLogoReparticionEncabezado: true,
        habilitarMarcaDeAgua: true,
        marcaDeAguaTipo: 'gobierno',
        marcaDeAguaOpacidad: 0.08,
        marcaDeAguaEscala: 65,
        marcaDeAguaPosicion: 'centro',
      });
      setMensajeGuardado(true);
      setTimeout(() => setMensajeGuardado(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Encabezado del Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#082032] text-amber-400 flex items-center justify-center shadow-sm shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-[#082032] tracking-tight">
                Configuración Institucional de Logos y Membretes
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-700" />
                Exclusivo SuperUsuario
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Administre los emblemas oficiales, logos vectoriales y marcas de agua aplicados al
              encabezado y fondo de las plantillas del editor de documentos y providencias de la
              Repartición 2100.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Restablece los logos al escudo oficial de Jujuy y sello de la Oficina Anticorrupción"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Oficiales</span>
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="px-4 py-2 text-xs font-bold text-white bg-[#082032] hover:bg-[#0c314d] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>

      {/* Alerta de Éxito / Error */}
      {mensajeGuardado && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-medium animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Los logos institucionales y parámetros de marca de agua se han actualizado y sincronizado
            correctamente con el editor de documentos.
          </span>
        </div>
      )}

      {errorCarga && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorCarga}</span>
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-8">
        {/* SECCIÓN 1: CARGA DE LOGOS INSTITUCIONALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LOGO GOBIERNO (PROVINCIA DE JUJUY) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center font-bold text-xs border border-sky-200">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#082032]">
                      Logo / Escudo del Gobierno Provincial
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Provincia de Jujuy • Poder Ejecutivo
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.mostrarLogoGobiernoEncabezado}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        mostrarLogoGobiernoEncabezado: e.target.checked,
                      }))
                    }
                    className="rounded text-[#082032] focus:ring-[#082032]"
                  />
                  <span className="font-medium text-[11px]">En Encabezado</span>
                </label>
              </div>

              {/* Vista Previa y Botón de Subida */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <div className="w-28 h-28 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative shadow-inner overflow-hidden group">
                  {formState.logoGobiernoUrl ? (
                    <img
                      src={formState.logoGobiernoUrl}
                      alt="Escudo de Jujuy"
                      className="max-w-full max-h-full object-contain filter drop-shadow-xs"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold backdrop-blur-xs">
                    Vista previa
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <p className="text-xs font-semibold text-slate-800">
                    Cargar Emblema Provincial
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Archivos SVG vectoriales recomendados para máxima nitidez en impresión, o PNG/JPG
                    con fondo transparente.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      ref={fileInputGobiernoRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'gobierno')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputGobiernoRef.current?.click()}
                      className="px-3 py-1.5 bg-[#082032] hover:bg-[#0c314d] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          logoGobiernoUrl: DEFAULT_LOGO_GOBIERNO_SVG,
                        }))
                      }
                      className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Restablecer Escudo Jujuy
                    </button>
                  </div>
                </div>
              </div>

              {/* Textos del Membrete */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Texto Principal de Gobierno
                  </label>
                  <input
                    type="text"
                    value={formState.nombreGobierno}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, nombreGobierno: e.target.value }))
                    }
                    placeholder="GOBIERNO DE LA PROVINCIA DE JUJUY"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-serif focus:ring-1 focus:ring-[#082032] outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Lema Institucional / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formState.lemaGobierno || ''}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, lemaGobierno: e.target.value }))
                    }
                    placeholder="Poder Ejecutivo • Secretaría de Gestión Pública"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 italic focus:ring-1 focus:ring-[#082032] outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LOGO REPARTICIÓN (OFICINA ANTICORRUPCIÓN) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-800 flex items-center justify-center font-bold text-xs border border-red-200">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#082032]">
                      Logo de la Repartición Actuante
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Oficina Anticorrupción • Repartición 2100
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.mostrarLogoReparticionEncabezado}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        mostrarLogoReparticionEncabezado: e.target.checked,
                      }))
                    }
                    className="rounded text-[#082032] focus:ring-[#082032]"
                  />
                  <span className="font-medium text-[11px]">En Encabezado</span>
                </label>
              </div>

              {/* Vista Previa y Botón de Subida */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <div className="w-28 h-28 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative shadow-inner overflow-hidden group">
                  {formState.logoReparticionUrl ? (
                    <img
                      src={formState.logoReparticionUrl}
                      alt="Logo Oficina Anticorrupción"
                      className="max-w-full max-h-full object-contain filter drop-shadow-xs"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold backdrop-blur-xs">
                    Vista previa
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <p className="text-xs font-semibold text-slate-800">
                    Cargar Sello de Repartición
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Distintivo oficial de la Oficina Anticorrupción de Jujuy o dependencia emisora.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      ref={fileInputReparticionRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'reparticion')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputReparticionRef.current?.click()}
                      className="px-3 py-1.5 bg-[#082032] hover:bg-[#0c314d] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          logoReparticionUrl: DEFAULT_LOGO_REPARTICION_SVG,
                        }))
                      }
                      className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Restablecer Sello OA
                    </button>
                  </div>
                </div>
              </div>

              {/* Textos de la Repartición */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Denominación de la Repartición
                  </label>
                  <input
                    type="text"
                    value={formState.nombreReparticion}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, nombreReparticion: e.target.value }))
                    }
                    placeholder="OFICINA ANTICORRUPCIÓN"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-serif focus:ring-1 focus:ring-[#082032] outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Subtítulo / Código Operativo
                  </label>
                  <input
                    type="text"
                    value={formState.subtituloReparticion || ''}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, subtituloReparticion: e.target.value }))
                    }
                    placeholder="Repartición Oficial 2100 • Órgano Constitucional de Control"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 italic focus:ring-1 focus:ring-[#082032] outline-hidden bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: AJUSTES DE MARCA DE AGUA (WATERMARK) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                <SlidersHorizontal className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#082032]">
                  Configuración de Marca de Agua de Seguridad
                </h3>
                <p className="text-xs text-slate-500">
                  Protege los documentos oficiales contra copias no autorizadas mediante filigrana
                  semitransparente.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl cursor-pointer transition-colors border border-slate-300">
              <input
                type="checkbox"
                checked={formState.habilitarMarcaDeAgua}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, habilitarMarcaDeAgua: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[#082032] focus:ring-[#082032]"
              />
              <span className="text-xs font-bold text-[#082032]">
                {formState.habilitarMarcaDeAgua
                  ? 'Marca de Agua Activada'
                  : 'Marca de Agua Desactivada'}
              </span>
            </label>
          </div>

          {formState.habilitarMarcaDeAgua && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Opción 1: Logotipo a emplear */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Emblema para la Marca de Agua
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'gobierno', label: 'Escudo Provincial de Jujuy' },
                    { id: 'reparticion', label: 'Sello Oficina Anticorrupción' },
                    { id: 'ambos', label: 'Bicéfalo (Ambos Emblemas)' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        formState.marcaDeAguaTipo === opt.id
                          ? 'border-[#082032] bg-slate-50 font-bold text-[#082032]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="marcaDeAguaTipo"
                        checked={formState.marcaDeAguaTipo === opt.id}
                        onChange={() =>
                          setFormState((prev) => ({
                            ...prev,
                            marcaDeAguaTipo: opt.id as 'gobierno' | 'reparticion' | 'ambos',
                          }))
                        }
                        className="text-[#082032] focus:ring-[#082032]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Opción 2: Nivel de Opacidad */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Nivel de Opacidad (Filigrana)
                  </label>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-[#082032] px-2 py-0.5 rounded border border-slate-300">
                    {Math.round(formState.marcaDeAguaOpacidad * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.03"
                  max="0.25"
                  step="0.01"
                  value={formState.marcaDeAguaOpacidad}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      marcaDeAguaOpacidad: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-[#082032] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>3% (Muy tenue)</span>
                  <span className="font-bold text-emerald-700">8% (Recomendado)</span>
                  <span>25% (Marcada)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-tight">
                  Una opacidad moderada (entre 6% y 10%) garantiza la legibilidad del texto redactado
                  al imprimir o visualizar en pantalla.
                </p>
              </div>

              {/* Opción 3: Escala y Posición */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Tamaño / Escala Relativa
                  </label>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-[#082032] px-2 py-0.5 rounded border border-slate-300">
                    {formState.marcaDeAguaEscala}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={formState.marcaDeAguaEscala}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      marcaDeAguaEscala: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-[#082032] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 mb-3">
                  <span>40% (Compacta)</span>
                  <span>65% (Equilibrada)</span>
                  <span>95% (Pleno pliego)</span>
                </div>

                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Orientación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, marcaDeAguaPosicion: 'centro' }))
                    }
                    className={`py-1.5 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                      formState.marcaDeAguaPosicion === 'centro'
                        ? 'bg-[#082032] text-white border-[#082032]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Centrada Recta
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, marcaDeAguaPosicion: 'diagonal' }))
                    }
                    className={`py-1.5 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                      formState.marcaDeAguaPosicion === 'diagonal'
                        ? 'bg-[#082032] text-white border-[#082032]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Diagonal (-15°)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 3: VISTA PREVIA EN VIVO DE DOCUMENTO OFICIAL A4 */}
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#082032]" />
              <h3 className="text-sm font-bold text-[#082032]">
                Vista Previa en Vivo: Hoja A4 con Membrete y Marca de Agua
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              Actualización instantánea
            </span>
          </div>

          {/* SIMULADOR DE HOJA A4 OFICIAL */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-12 font-serif text-[#082032] relative overflow-hidden min-h-[520px]">
            {/* MARCA DE AGUA DINÁMICA DE SEGURIDAD */}
            {formState.habilitarMarcaDeAgua && (
              <div
                className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0"
                style={{
                  opacity: formState.marcaDeAguaOpacidad,
                  transform:
                    formState.marcaDeAguaPosicion === 'diagonal'
                      ? 'rotate(-15deg)'
                      : 'none',
                }}
              >
                {formState.marcaDeAguaTipo === 'gobierno' && formState.logoGobiernoUrl && (
                  <img
                    src={formState.logoGobiernoUrl}
                    alt="Marca de agua de Gobierno"
                    style={{ width: `${formState.marcaDeAguaEscala}%`, maxHeight: '80%' }}
                    className="object-contain filter grayscale"
                  />
                )}
                {formState.marcaDeAguaTipo === 'reparticion' && formState.logoReparticionUrl && (
                  <img
                    src={formState.logoReparticionUrl}
                    alt="Marca de agua de Repartición"
                    style={{ width: `${formState.marcaDeAguaEscala}%`, maxHeight: '80%' }}
                    className="object-contain filter grayscale"
                  />
                )}
                {formState.marcaDeAguaTipo === 'ambos' && (
                  <div className="flex items-center justify-center gap-8" style={{ width: `${formState.marcaDeAguaEscala}%` }}>
                    {formState.logoGobiernoUrl && (
                      <img
                        src={formState.logoGobiernoUrl}
                        alt="Escudo"
                        className="w-1/2 object-contain filter grayscale"
                      />
                    )}
                    {formState.logoReparticionUrl && (
                      <img
                        src={formState.logoReparticionUrl}
                        alt="Sello"
                        className="w-1/2 object-contain filter grayscale"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO DEL DOCUMENTO OFICIAL */}
            <div className="relative z-10 space-y-6">
              {/* ENCABEZADO INSTITUCIONAL CON LOGOS ACTIVOS */}
              <div className="border-b-2 border-[#B71C1C] pb-4 flex items-center justify-between gap-4">
                {/* Logo Gobierno + Textos */}
                <div className="flex items-center gap-3">
                  {formState.mostrarLogoGobiernoEncabezado && formState.logoGobiernoUrl && (
                    <img
                      src={formState.logoGobiernoUrl}
                      alt="Gobierno"
                      className="w-14 h-16 object-contain shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="text-xs font-black tracking-wider uppercase text-slate-800 font-serif">
                      {formState.nombreGobierno}
                    </h4>
                    <p className="text-sm font-black uppercase text-[#082032] font-serif">
                      {formState.nombreReparticion}
                    </p>
                    <p className="text-[11px] text-slate-600 italic">
                      {formState.subtituloReparticion || 'Mesa General de Entradas, Salidas y Archivo'}
                    </p>
                  </div>
                </div>

                {/* Logo Repartición a la derecha o Tipo de Documento */}
                <div className="flex flex-col items-end shrink-0">
                  {formState.mostrarLogoReparticionEncabezado && formState.logoReparticionUrl && (
                    <img
                      src={formState.logoReparticionUrl}
                      alt="Oficina Anticorrupción"
                      className="w-12 h-14 object-contain mb-1"
                    />
                  )}
                  <span className="text-[9px] font-bold uppercase bg-[#082032] text-white px-2 py-0.5 rounded tracking-wider">
                    PROVIDENCIA DE TRÁMITE
                  </span>
                  <span className="text-[10px] text-slate-500 font-serif mt-1">
                    San Salvador de Jujuy, {new Date().toLocaleDateString('es-AR')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#FC4F46]">
                    Expte. N° 2100-0012-2026
                  </span>
                </div>
              </div>

              {/* CUERPO DEL TEXTO SIMULADO */}
              <div className="text-xs leading-relaxed space-y-3 text-slate-800">
                <p className="font-bold">
                  VISTO: La actuación administrativa de referencia iniciada ante esta Oficina Anticorrupción; y
                </p>
                <p>
                  <strong>CONSIDERANDO:</strong> Que habiéndose cumplimentado con las verificaciones preliminares
                  previstas por la normativa de transparencia y control administrativo, corresponde dar curso formal a
                  las fojas incorporadas en el expediente.
                </p>
                <p>
                  Por ello, en uso de las atribuciones conferidas por la Ley Provincial N° 5886 y decretos
                  reglamentarios:
                </p>
                <p className="pl-4 border-l-2 border-slate-300 italic text-slate-700">
                  1. Téngase por recibida la documentación de rigor.<br />
                  2. Remítase a la Dirección de Asuntos Jurídicos y Dictámenes para dictaminar.<br />
                  3. Fíjese constancia de fojas útiles agregadas a las actuaciones.
                </p>
              </div>

              {/* PIE DE FIRMA DIGITALIZADA */}
              <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#082032]">Certificación Digital SIGED Jujuy</p>
                  <p className="font-mono">HASH: OA-2026-F54A-VAL</p>
                </div>
                <div className="text-center border-t border-[#082032] pt-1 px-4">
                  <p className="font-bold text-xs text-[#082032]">
                    {usuarioActual.firstName} {usuarioActual.lastName}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    {usuarioActual.esEncargado ? 'Encargado de Despacho' : 'Agente Administrativo'}
                  </p>
                </div>
              </div>

              {/* Pie de página oficial legal */}
              <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 font-sans">
                {formState.textoPiePagina ||
                  'Documento Oficial Digitalizado • Sistema SIGED • Validez Jurídica según Ley Pcial. N° 5886'}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE ACCIONES */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Restablecer Valores
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#082032] hover:bg-[#0c314d] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Guardar y Aplicar al Editor de Documentos</span>
          </button>
        </div>
      </form>
    </div>
  );
};
