import React from 'react';
import { X, Printer, Shield, QrCode, FileText } from 'lucide-react';
import { Expediente } from '../types';
import { useApp } from '../context/AppContext';

interface CaratulaOficialPrintProps {
  expediente: Expediente | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaratulaOficialPrint: React.FC<CaratulaOficialPrintProps> = ({
  expediente,
  isOpen,
  onClose,
}) => {
  const { getDepartamento, getUsuario, calcularTotalFojas, configInstitucional } = useApp();

  if (!isOpen || !expediente) return null;

  const deptoInicio = getDepartamento(expediente.departamentoInicioId);
  const usuarioInicio = getUsuario(expediente.usuarioInicioId);
  const totalFojas = calcularTotalFojas(expediente);

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none relative">
        {/* Barra superior de control (oculta al imprimir) */}
        <div className="px-6 py-3 bg-[#082032] text-white flex items-center justify-between border-b border-[#2C394B] print:hidden">
          <span className="text-xs font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FC4F46]" />
            Vista Previa de Carátula Oficial de Expediente
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#2C394B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Marca de agua institucional */}
        {configInstitucional?.habilitarMarcaDeAgua && configInstitucional?.logoGobiernoUrl && (
          <div
            className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-0"
            style={{
              opacity: configInstitucional.marcaDeAguaOpacidad || 0.08,
              transform: configInstitucional.marcaDeAguaPosicion === 'diagonal' ? 'rotate(-15deg)' : 'none',
            }}
          >
            <img
              src={configInstitucional.logoGobiernoUrl}
              alt="Marca de agua"
              style={{ width: `${configInstitucional.marcaDeAguaEscala || 65}%`, maxHeight: '80%' }}
              className="object-contain filter grayscale"
            />
          </div>
        )}

        {/* Contenido Imprimible de la Carátula */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-serif space-y-6 print:p-8 relative z-10">
          {/* Encabezado Oficial con Logos */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-2">
            <div className="flex items-center justify-center gap-6 mb-2">
              {configInstitucional?.logoGobiernoUrl && (
                <img
                  src={configInstitucional.logoGobiernoUrl}
                  alt="Escudo Gobierno"
                  className="w-14 h-16 object-contain"
                />
              )}
              {configInstitucional?.logoReparticionUrl && (
                <img
                  src={configInstitucional.logoReparticionUrl}
                  alt="Sello Repartición"
                  className="w-12 h-14 object-contain"
                />
              )}
            </div>
            <h1 className="text-xs tracking-[0.25em] uppercase font-bold text-slate-700 font-sans">
              {configInstitucional?.nombreGobierno || 'PROVINCIA DE JUJUY'} • {configInstitucional?.nombreReparticion || 'REPARTICIÓN 2100'}
            </h1>
            <h2 className="text-lg font-black tracking-wider uppercase font-sans text-slate-950">
              SISTEMA DE GESTIÓN DE EXPEDIENTES DIGITALES (SIGED)
            </h2>
            <p className="text-[11px] text-slate-600 italic font-serif">
              {configInstitucional?.subtituloReparticion || 'Ley de Procedimiento Administrativo Electrónico • Validez según Ley Pcial. N° 5886'}
            </p>
          </div>

          {/* Cuadro de Clave Única Prominente */}
          <div className="border-2 border-slate-900 p-4 bg-slate-50/50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold font-sans tracking-wider uppercase text-slate-500 block">
                NÚMERO DE EXPEDIENTE / CLAVE DE IDENTIFICACIÓN
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-950 block">
                {expediente.claveUnica}
              </span>
              <span className="text-[11px] font-sans text-slate-600 mt-1 block">
                Repartición: <strong>{expediente.codigoReparticion}</strong> • Correlativo: <strong>{expediente.numeroExpediente}</strong> • Ejercicio: <strong>{expediente.anio}</strong>
              </span>
            </div>

            <div className="text-center shrink-0 border border-slate-300 p-2 bg-white rounded flex flex-col items-center">
              {/* Código de barras simulado / QR */}
              <div className="flex gap-0.5 h-10 items-end justify-center mb-1">
                {[3, 1, 4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4].map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-900"
                    style={{
                      width: h % 2 === 0 ? '3px' : '1.5px',
                      height: `${h * 7 + 10}px`,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] text-slate-500 block">
                VALIDACIÓN DIGITAL SIGED-2100
              </span>
            </div>
          </div>

          {/* Ficha Carátula de Datos */}
          <div className="grid grid-cols-2 gap-4 border border-slate-400 p-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Dependencia Iniciadora:
              </span>
              <p className="font-bold text-slate-900">
                {deptoInicio?.codigo} - {deptoInicio?.nombre}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Agente Iniciador:
              </span>
              <p className="font-bold text-slate-900">
                {usuarioInicio?.firstName} {usuarioInicio?.lastName} ({usuarioInicio?.username})
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Fecha y Hora de Apertura:
              </span>
              <p className="font-mono text-slate-900">
                {formatDate(expediente.fechaInicio)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Fojas Iniciales / Totales:
              </span>
              <p className="font-mono font-bold text-slate-900">
                {expediente.fojasInicio} iniciales / {totalFojas} fojas acumuladas
              </p>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Trámite de Inicio:
              </span>
              <p className="font-bold text-blue-900">
                {expediente.tramiteInicio}
              </p>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Asunto Oficial:
              </span>
              <p className="text-xs font-serif leading-relaxed text-slate-900 mt-1 italic">
                &quot;{expediente.asunto}&quot;
              </p>
            </div>
          </div>

          {/* Tabla de Movimientos y Pases Foliados */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase font-sans tracking-wider text-slate-800 border-b border-slate-300 pb-1">
              Hoja de Ruta y Constancia de Pases Administrativos
            </h3>

            <table className="w-full text-[11px] font-sans border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-2 py-1 text-center w-8">N°</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Emisor / Origen</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Receptor / Destino</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-24">Fecha Pase</th>
                  <th className="border border-slate-300 px-2 py-1 text-center w-16">Fojas</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Estado / Recepción</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-slate-300 bg-emerald-50/20">
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-bold font-mono">0</td>
                  <td className="border border-slate-300 px-2 py-1.5">Inicio ({deptoInicio?.codigo})</td>
                  <td className="border border-slate-300 px-2 py-1.5">{usuarioInicio?.firstName} {usuarioInicio?.lastName}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{formatDate(expediente.fechaInicio).split(' ')[0]}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold">{expediente.fojasInicio}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-emerald-800 font-semibold">Iniciado</td>
                </tr>

                {(expediente.pases || []).map((p, idx) => {
                  const dEmisor = getDepartamento(p.departamentoEmisorId);
                  const dReceptor = getDepartamento(p.departamentoReceptorId);
                  return (
                    <tr key={p.id} className="border border-slate-300">
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-bold font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 px-2 py-1.5">{dEmisor?.nombre}</td>
                      <td className="border border-slate-300 px-2 py-1.5">{dReceptor?.nombre}</td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{formatDate(p.fechaPase).split(' ')[0]}</td>
                      <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">+{p.fojasPase}</td>
                      <td className="border border-slate-300 px-2 py-1.5 capitalize">{p.estadoPase}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Declaración Jurada (DDJJ) de Autenticidad Documental con Barras Separadoras Institucionales #B71C1C */}
          <div className="pt-4">
            <div className="h-1 bg-[#B71C1C] rounded-full w-full mb-3" />
            <div className="bg-[#F3F4F5] p-3 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-[#082032] uppercase tracking-wide flex items-center justify-between">
                <span>Declaración Jurada (DDJJ) - Fidedignidad Documental</span>
                <span className="text-[10px] font-mono text-[#B71C1C] font-semibold">Art. 28 Dec. Reg. 1759/72</span>
              </h4>
              <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                El funcionario o iniciador que suscribe declara bajo juramento la autenticidad, integridad y validez
                jurídica de la totalidad de las fojas y piezas documentales agregadas al presente actuado oficial.
                Toda adulteración o falsedad quedará sujeta a las penalidades prescritas por el Código Penal de la Nación.
              </p>
            </div>
            <div className="h-1 bg-[#B71C1C] rounded-full w-full mt-3" />
          </div>

          {/* Firma y Sello Digital */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-sans">
            <div className="pt-8 border-t border-slate-400">
              <span className="font-mono text-[10px] text-slate-500 block">
                FIRMA Y SELLO DE MESA GENERAL DE ENTRADAS
              </span>
              <p className="font-bold text-slate-800 mt-1">Carlos Martínez</p>
              <p className="text-[10px] text-slate-500">Jefe Mesa General de Entradas y Salidas</p>
            </div>

            <div className="pt-8 border-t border-slate-400">
              <span className="font-mono text-[10px] text-slate-500 block">
                CERTIFICADO DE AUTENTICIDAD DIGITAL
              </span>
              <p className="font-mono text-[10px] text-slate-600 mt-1">
                Hash SHA-256: 7b91...a4f2 (Válido)
              </p>
              <p className="text-[10px] text-slate-500">Repartición 2100 • Gobierno Digital</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
