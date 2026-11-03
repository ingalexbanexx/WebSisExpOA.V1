import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Check,
  Building,
  User,
  Calendar,
  Sparkles,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  ShieldCheck,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdjuntoInput } from '../context/AppContext';
import { MembreteConfig, TipoAdjunto } from '../types';

interface EditorDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjunto: AdjuntoInput) => void;
  tituloSugerido?: string;
  tipoSugerido?: TipoAdjunto;
  claveExpediente?: string;
}

const TIPOS_DOCUMENTO: { id: TipoAdjunto; label: string; desc: string }[] = [
  { id: 'providencia', label: 'Providencia Resolutiva / Pase', desc: 'Acto de mero trámite o remisión formal de actuaciones' },
  { id: 'dictamen', label: 'Dictamen Jurídico / Técnico', desc: 'Opinión fundada y análisis normativo de la asesoría' },
  { id: 'nota', label: 'Nota Oficial de Elevación', desc: 'Comunicación interdepartamental o externa formal' },
  { id: 'memo', label: 'Memorándum Interno', desc: 'Instrucción o solicitud operativa directa' },
  { id: 'resolucion', label: 'Proyecto de Resolución', desc: 'Disposición decisoria de autoridad competente' },
  { id: 'documento', label: 'Informe Administrativo Circunstanciado', desc: 'Detalle de actuaciones, inspecciones o antecedentes' },
];

export const EditorDocumentoModal: React.FC<EditorDocumentoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tituloSugerido = 'Providencia Oficial de Trámite',
  tipoSugerido = 'providencia',
  claveExpediente,
}) => {
  const { usuarioActual, departamentos, configInstitucional } = useApp();
  const depto = departamentos.find((d) => d.id === usuarioActual.departamentoId);

  const [tipoDoc, setTipoDoc] = useState<TipoAdjunto>(tipoSugerido);
  const [titulo, setTitulo] = useState(tituloSugerido);
  const [numeroRef, setNumeroRef] = useState(`ACTA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  
  // Membrete institucional configurable (inicializado con la configuración del superusuario)
  const [provincia, setProvincia] = useState(
    configInstitucional.nombreGobierno || 'PROVINCIA DE JUJUY - REPÚBLICA ARGENTINA'
  );
  const [reparticion, setReparticion] = useState(
    configInstitucional.nombreReparticion || 'OFICINA ANTICORRUPCIÓN - PODER EJECUTIVO'
  );
  const [dependencia, setDependencia] = useState(
    depto?.nombre || configInstitucional.subtituloReparticion || 'Mesa General de Entradas'
  );
  const [lugarYFecha, setLugarYFecha] = useState(
    `San Salvador de Jujuy, ${new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`
  );
  const [autoridadFirmante, setAutoridadFirmante] = useState(
    `${usuarioActual.firstName} ${usuarioActual.lastName}`
  );
  const [cargoFirmante, setCargoFirmante] = useState(
    usuarioActual.esEncargado ? 'Encargado de Despacho y Gestión' : 'Agente Administrativo Registrante'
  );

  // Editor content
  const [cuerpoTexto, setCuerpoTexto] = useState(
    `VISTO las presentes actuaciones administrativas tramitadas bajo el expediente ${
      claveExpediente ? 'N° ' + claveExpediente : 'de referencia'
    }, y;\n\nCONSIDERANDO:\nQue se han cumplimentado las etapas procedimentales correspondientes y se han recabado los informes técnicos pertinentes.\nQue resulta necesario dar continuidad a la tramitación de estilo para la intervención de los organismos competentes.\n\nPOR ELLO:\n1. Tómese debida razón y elévese a la dependencia correspondiente.\n2. Incorpórense las presentes fojas a los antecedentes del trámite oficial.\n3. Notifíquese a las partes interesadas conforme a derecho.`
  );

  // Fojas estimadas (editable)
  const [fojasCalculadas, setFojasCalculadas] = useState(1);

  if (!isOpen) return null;

  // Calculo automático sugerido de fojas según extensión
  const caractersTotales = cuerpoTexto.length;
  const fojasSugeridas = Math.max(1, Math.ceil(caractersTotales / 1200));

  const handleInsertTemplate = (templateType: string) => {
    if (templateType === 'pase') {
      setCuerpoTexto(
        `SAN SALVADOR DE JUJUY, ${new Date().toLocaleDateString('es-AR')}.\n\nAtento al estado de las presentes actuaciones y de conformidad a lo solicitado precedentemente, pase a la Dirección correspondiente para su conocimiento, informe técnico y prosecución de la tramitación de estilo.\n\nSe eleva con debida constancia de fojas útiles.`
      );
    } else if (templateType === 'dictamen') {
      setCuerpoTexto(
        `DICTAMEN JURÍDICO N° ${Math.floor(10 + Math.random() * 90)}/${new Date().getFullYear()}\n\nSEÑOR DIRECTOR:\nVienen las presentes actuaciones a dictamen de esta Asesoría Legal con motivo de analizar la procedencia del trámite de referencia.\n\nI. ANTECEDENTES:\nDe las constancias obrantes en autos surge que...\n\nII. ANÁLISIS JURÍDICO:\nConforme lo dispuesto por la Ley de Procedimiento Administrativo de la Provincia de Jujuy...\n\nIII. CONCLUSIÓN:\nEsta Asesoría Legal no encuentra objeciones que formular a la continuidad del trámite propuesto.`
      );
    } else if (templateType === 'nota') {
      setCuerpoTexto(
        `AL SEÑOR TITULAR DE DESPACHO:\n\nMe dirijo a Usted en el marco de las actuaciones caratuladas ut-supra, a efectos de remitir para su consideración y suscripción la documentación formal adjunta.\n\nSin otro particular, saludo a Usted con mi consideración más distinguida.`
      );
    }
  };

  const handleSave = () => {
    if (!titulo.trim()) return;

    const membrete: MembreteConfig = {
      provincia,
      reparticion,
      dependencia,
      lugarYFecha,
      autoridadFirmante,
      cargo: cargoFirmante,
      numeroReferencia: numeroRef,
    };

    const adjunto: AdjuntoInput = {
      tipoAdjunto: tipoDoc,
      titulo: titulo.trim(),
      descripcion: `Documento oficial redactado en editor institucional (${numeroRef})`,
      archivoNombre: `${titulo.replace(/[\s/\\:]+/g, '_')}.pdf`,
      archivoTamano: `${(cuerpoTexto.length / 800 + 0.2).toFixed(1)} KB`,
      fojas: Number(fojasCalculadas) || fojasSugeridas,
      esDocumentoRedactado: true,
      contenidoHtml: cuerpoTexto,
      membrete,
      formato: 'application/pdf-oficial',
    };

    onSave(adjunto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FC4F46] flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Redactor de Documento Oficial con Membrete
                </h3>
                <span className="text-[10px] bg-[#2C394B] text-slate-300 px-2 py-0.5 rounded font-mono uppercase">
                  Plantilla Jujuy
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Confección de providencias, dictámenes y notas oficiales con membrete e incorporación correlativa de fojas
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* Fila de controles rápidos y tipo de documento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Tipo de Acto / Documento
              </label>
              <select
                value={tipoDoc}
                onChange={(e) => {
                  const val = e.target.value as TipoAdjunto;
                  setTipoDoc(val);
                  const found = TIPOS_DOCUMENTO.find((t) => t.id === val);
                  if (found) setTitulo(found.label);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Título / Asunto del Documento
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Providencia Resolutiva de Pase"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                N° de Referencia / Identificador
              </label>
              <input
                type="text"
                value={numeroRef}
                onChange={(e) => setNumeroRef(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 font-mono font-semibold focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden"
              />
            </div>
          </div>

          {/* Plantillas rápidas */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FC4F46]" /> Cargar Modelo Rápido:
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate('pase')}
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-[#082032] hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Providencia de Pase
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('dictamen')}
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-[#082032] hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Dictamen Jurídico
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('nota')}
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:border-[#082032] hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Nota de Elevación
            </button>
          </div>

          {/* HOJA DE DOCUMENTO OFICIAL (A4 Style Preview & Editing) */}
          <div className="relative bg-white rounded-xl border-2 border-slate-300 shadow-md p-6 sm:p-10 font-serif text-[#082032] overflow-hidden">
            {/* MARCA DE AGUA INSTITUCIONAL DE SEGURIDAD (Configurada en el Dashboard de SuperUsuario) */}
            {configInstitucional.habilitarMarcaDeAgua && (
              <div
                className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0"
                style={{
                  opacity: configInstitucional.marcaDeAguaOpacidad,
                  transform:
                    configInstitucional.marcaDeAguaPosicion === 'diagonal'
                      ? 'rotate(-15deg)'
                      : 'none',
                }}
              >
                {configInstitucional.marcaDeAguaTipo === 'gobierno' && configInstitucional.logoGobiernoUrl && (
                  <img
                    src={configInstitucional.logoGobiernoUrl}
                    alt="Marca de agua institucional Gobierno"
                    style={{ width: `${configInstitucional.marcaDeAguaEscala}%`, maxHeight: '80%' }}
                    className="object-contain filter grayscale"
                  />
                )}
                {configInstitucional.marcaDeAguaTipo === 'reparticion' && configInstitucional.logoReparticionUrl && (
                  <img
                    src={configInstitucional.logoReparticionUrl}
                    alt="Marca de agua institucional Repartición"
                    style={{ width: `${configInstitucional.marcaDeAguaEscala}%`, maxHeight: '80%' }}
                    className="object-contain filter grayscale"
                  />
                )}
                {configInstitucional.marcaDeAguaTipo === 'ambos' && (
                  <div
                    className="flex items-center justify-center gap-8"
                    style={{ width: `${configInstitucional.marcaDeAguaEscala}%` }}
                  >
                    {configInstitucional.logoGobiernoUrl && (
                      <img
                        src={configInstitucional.logoGobiernoUrl}
                        alt="Escudo Gobierno"
                        className="w-1/2 object-contain filter grayscale"
                      />
                    )}
                    {configInstitucional.logoReparticionUrl && (
                      <img
                        src={configInstitucional.logoReparticionUrl}
                        alt="Sello Repartición"
                        className="w-1/2 object-contain filter grayscale"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO DEL DOCUMENTO OFICIAL */}
            <div className="relative z-10">
              {/* MEMBRETE INSTITUCIONAL OFICIAL CON LOGOS ACTIVOS */}
              <div className="border-b-2 border-[#B71C1C] pb-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Escudo Provincia de Jujuy / Logo Gobierno */}
                  <div className="flex items-center gap-3">
                    {configInstitucional.mostrarLogoGobiernoEncabezado && configInstitucional.logoGobiernoUrl && (
                      <div className="w-14 h-16 bg-white/80 rounded-sm p-1 flex items-center justify-center text-center shrink-0">
                        <img
                          src={configInstitucional.logoGobiernoUrl}
                          alt="Escudo Provincial de Jujuy"
                          className="max-w-full max-h-full object-contain filter drop-shadow-2xs"
                        />
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden w-full font-serif"
                        title="Haga clic para editar encabezado"
                      />
                      <input
                        type="text"
                        value={reparticion}
                        onChange={(e) => setReparticion(e.target.value)}
                        className="text-sm font-black uppercase text-[#082032] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden w-full font-serif"
                        title="Haga clic para editar repartición"
                      />
                      <input
                        type="text"
                        value={dependencia}
                        onChange={(e) => setDependencia(e.target.value)}
                        className="text-xs text-slate-600 italic bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden w-full"
                        title="Dependencia actuante"
                      />
                    </div>
                  </div>

                  {/* Sello de Repartición a la derecha + Tipo de Documento y Fecha */}
                  <div className="text-right shrink-0 flex flex-col items-end">
                    {configInstitucional.mostrarLogoReparticionEncabezado && configInstitucional.logoReparticionUrl && (
                      <img
                        src={configInstitucional.logoReparticionUrl}
                        alt="Sello Oficina Anticorrupción"
                        className="w-11 h-13 object-contain mb-1.5"
                      />
                    )}
                    <div className="inline-block bg-[#082032] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded tracking-wider">
                      {tipoDoc.toUpperCase()}
                    </div>
                    <div className="mt-2 text-xs font-medium text-slate-600">
                      <input
                        type="text"
                        value={lugarYFecha}
                        onChange={(e) => setLugarYFecha(e.target.value)}
                        className="text-right text-xs text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden w-56 font-serif"
                      />
                    </div>
                    {claveExpediente && (
                      <p className="text-[11px] font-mono font-bold text-[#FC4F46] mt-0.5">
                        Expte. {claveExpediente}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* BARRA DE HERRAMIENTAS DE TEXTO */}
              <div className="bg-slate-100/90 backdrop-blur-xs rounded-lg p-2 mb-3 flex flex-wrap items-center gap-1.5 border border-slate-300 text-xs text-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Formato:</span>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n\n**TEXTO DESTACADO**')}
                className="p-1 hover:bg-slate-200 rounded font-bold cursor-pointer"
                title="Negrita"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n*Texto en cursiva*')}
                className="p-1 hover:bg-slate-200 rounded italic cursor-pointer"
                title="Cursiva"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n\n<u>Texto subrayado</u>')}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Subrayado"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n• Elemento de lista')}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Viñeta"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n1. Primer punto resolutivo')}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Lista numerada"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCuerpoTexto((prev) => prev + '\n\n> "Cita o transcripción de ley/decreto vigente..."\n')}
                className="p-1 hover:bg-slate-200 rounded cursor-pointer"
                title="Cita de normativa"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-300">|</span>
              <div className="ml-auto text-[11px] text-slate-500 flex items-center gap-2">
                <span>Caracteres: <strong className="font-mono">{cuerpoTexto.length}</strong></span>
                <span>Fojas estimadas: <strong className="font-mono text-[#082032]">{fojasSugeridas}</strong></span>
              </div>
            </div>

            {/* ÁREA DE TEXTO ENRIQUECIDO */}
            <div className="relative">
              <textarea
                value={cuerpoTexto}
                onChange={(e) => {
                  setCuerpoTexto(e.target.value);
                  setFojasCalculadas(Math.max(1, Math.ceil(e.target.value.length / 1200)));
                }}
                rows={12}
                className="w-full p-4 border border-slate-300 rounded-lg text-sm leading-relaxed text-[#082032] font-serif focus:ring-2 focus:ring-[#082032] focus:border-transparent outline-hidden bg-white shadow-inner resize-y"
                placeholder="Escriba aquí los considerandos, fundamentación o providencia oficial..."
              />
            </div>

            {/* PIE DE FIRMA INSTITUCIONAL DIGITALIZADA */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                <div className="w-10 h-10 bg-white border border-slate-300 rounded flex items-center justify-center text-[#082032] shadow-xs">
                  <QrCode className="w-7 h-7 text-[#082032]" />
                </div>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-[#082032] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Firma Digital Validada
                  </p>
                  <p>ID Hash: <span className="font-mono">JUJ-{numeroRef}-SIGED</span></p>
                  <p>Registro Electrónico Oficial OA Jujuy</p>
                </div>
              </div>

              {/* Bloque de firma */}
              <div className="text-center w-64 border-t-2 border-[#082032] pt-2">
                <input
                  type="text"
                  value={autoridadFirmante}
                  onChange={(e) => setAutoridadFirmante(e.target.value)}
                  className="w-full text-center text-xs font-bold text-[#082032] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden font-serif"
                />
                <input
                  type="text"
                  value={cargoFirmante}
                  onChange={(e) => setCargoFirmante(e.target.value)}
                  className="w-full text-center text-[10px] text-slate-500 uppercase tracking-wider bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#082032] outline-hidden font-serif mt-0.5"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  Repartición 2100 • Gobierno de Jujuy
                </span>
              </div>
            </div>

            {/* Pie de página institucional oficial */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400 font-sans tracking-tight">
              {configInstitucional.textoPiePagina ||
                'Documento Oficial Digitalizado • Sistema SIGED • Validez Jurídica según Ley Pcial. N° 5886'}
            </div>
          </div>
        </div>

          {/* Configuración de Fojas a incorporar */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  Cómputo de Fojas a Sumar en el Expediente
                </p>
                <p className="text-amber-700">
                  Este documento redactado agregará formalmente fojas a la numeración correlativa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-900">Cantidad de Fojas:</span>
              <input
                type="number"
                min="1"
                max="999"
                value={fojasCalculadas}
                onChange={(e) => setFojasCalculadas(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 px-2.5 py-1.5 text-center text-sm font-mono font-bold bg-white border border-amber-300 rounded-lg text-[#082032]"
              />
              <span className="text-[11px] text-amber-800">fojas útiles</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#FC4F46] hover:bg-[#d93830] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Incorporar Documento al Expediente ({fojasCalculadas} fojas)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
