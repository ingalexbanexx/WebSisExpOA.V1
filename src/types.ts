export type TipoRol = 'pase' | 'iniciador' | 'admin' | 'superadmin';

export interface Rol {
  id: number;
  nombre: TipoRol;
  descripcion: string;
  permisos: {
    puedeIniciar: boolean;
    puedePasear: boolean;
    puedeRecepcionar: boolean;
    puedeArchivar: boolean;
    puedeDesarchivar: boolean;
    puedeAdministrar: boolean;
    puedeVerAuditoria: boolean;
    puedeExportar: boolean;
  };
}

export interface Departamento {
  id: number;
  codigo: string; // e.g. "DPTO-100", "DPTO-200"
  nombre: string;
  jerarquia: number; // 1 to 5
  activo: boolean;
  telefonoInterno?: string;
  responsable?: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  departamentoId: number;
  rolId: TipoRol;
  telefono: string;
  esEncargado: boolean;
  isActive: boolean;
  avatarUrl?: string;
}

export type EstadoExpediente = 'iniciado' | 'pase' | 'archivado' | 'agregado';

export type EstadoPase = 'pendiente' | 'recepcionado' | 'rechazado';

export interface ExpedientePase {
  id: number;
  expedienteId: number;
  usuarioEmisorId: number;
  departamentoEmisorId: number;
  fechaPase: string; // ISO String
  usuarioReceptorId: number;
  departamentoReceptorId: number;
  observacion: string;
  fojasPase: number;
  estadoPase: EstadoPase;
  fechaRecepcion?: string;
  observacionRecepcion?: string;
  esUltimoPase: boolean;
}

export interface ExpedienteArchivado {
  id: number;
  expedienteId: number;
  nroCaja: string;
  fechaArchivado: string;
  fojasArchivado: number;
  observacion: string;
  usuarioArchivoId: number;
}

export type TipoAdjunto =
  | 'documento'
  | 'nota'
  | 'memo'
  | 'resolucion'
  | 'dictamen'
  | 'providencia'
  | 'imagen'
  | 'audio'
  | 'video'
  | 'otro';

export interface MembreteConfig {
  reparticion: string;
  dependencia: string;
  provincia: string;
  lugarYFecha: string;
  autoridadFirmante: string;
  cargo: string;
  numeroReferencia?: string;
}

export interface InstitucionalConfig {
  logoGobiernoUrl: string;
  logoReparticionUrl: string;
  nombreGobierno: string;
  lemaGobierno?: string;
  nombreReparticion: string;
  subtituloReparticion?: string;
  codigoReparticion?: string;
  mostrarLogoGobiernoEncabezado: boolean;
  mostrarLogoReparticionEncabezado: boolean;
  habilitarMarcaDeAgua: boolean;
  marcaDeAguaTipo: 'gobierno' | 'reparticion' | 'ambos';
  marcaDeAguaOpacidad: number;
  marcaDeAguaEscala: number;
  marcaDeAguaPosicion: 'centro' | 'diagonal';
  textoPiePagina?: string;
}

export interface Adjunto {
  id: number;
  expedienteId: number;
  tipoAdjunto: TipoAdjunto;
  titulo: string;
  descripcion: string;
  archivoNombre: string;
  archivoTamano: string;
  fechaAdjunto: string;
  usuarioId: number;
  urlContenido?: string;
  fojas?: number; // Cantidad de fojas que aporta este archivo
  esDocumentoRedactado?: boolean;
  contenidoHtml?: string;
  membrete?: MembreteConfig;
  esMultimedia?: boolean;
  formato?: string;
}

export type CategoriaResolucion =
  | 'Administrativa'
  | 'Técnica'
  | 'Disciplinaria'
  | 'Presupuestaria'
  | 'Declaración'
  | 'Regulatoria'
  | 'General';

export interface Resolucion {
  id: number;
  numeroResolucion: string; // Ej: "RES-2026-045-OA"
  anio: number;
  fechaEmision: string; // ISO string
  organismoEmisor: string;
  firmante: string;
  cargoFirmante: string;
  categoria: CategoriaResolucion;
  esPublica: boolean; // true = Pública, false = Reservada / No pública
  asunto: string;
  considerando: string;
  textoResuelve: string;
  expedientesIds: number[]; // IDs de expedientes vinculados
  archivoNombre?: string;
  archivoTamano?: string;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expediente {
  id: number;
  codigoReparticion: string; // '2100'
  numeroExpediente: number; // 1, 2, 3...
  anio: number; // e.g. 2026
  claveUnica: string; // e.g. "2100-1-2026"
  departamentoInicioId: number;
  usuarioInicioId: number;
  fechaInicio: string; // ISO string
  asunto: string;
  tramiteInicio: string;
  fojasInicio: number;
  estado: EstadoExpediente;
  createdAt: string;
  updatedAt: string;
  // Campos calculados y relaciones
  pases: ExpedientePase[];
  archivado?: ExpedienteArchivado;
  adjuntos: Adjunto[];
  departamentoActualId: number;
  usuarioActualId?: number;
  resolucionesIds?: number[];
}

export type AccionAuditoria =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASE'
  | 'RECEPCION'
  | 'RECHAZO'
  | 'ARCHIVO'
  | 'DESARCHIVO'
  | 'RESOLUCION_CREATE'
  | 'RESOLUCION_UPDATE'
  | 'RESOLUCION_DELETE'
  | 'RESOLUCION_VINCULAR';

export interface AuditoriaLog {
  id: number;
  tablaAfectada: string;
  registroId: number | string;
  accion: AccionAuditoria;
  usuarioId: number;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  ipAddress: string;
  timestamp: string;
}

export interface FiltrosBusqueda {
  codigoReparticion?: string;
  numeroExpediente?: string;
  anio?: string;
  claveUnica?: string;
  asunto?: string;
  tramite?: string;
  departamentoId?: string;
  usuarioId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

