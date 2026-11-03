import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Departamento,
  Rol,
  Usuario,
  Expediente,
  ExpedientePase,
  AuditoriaLog,
  TipoAdjunto,
  TipoRol,
  Resolucion,
  Adjunto,
  MembreteConfig,
  InstitucionalConfig,
} from '../types';
import {
  DEPARTAMENTOS_INICIALES,
  ROLES_DEFINICION,
  USUARIOS_INICIALES,
  EXPEDIENTES_INICIALES,
  AUDITORIA_INICIAL,
  RESOLUCIONES_INICIALES,
} from '../data/initialData';
import { DEFAULT_CONFIG_INSTITUCIONAL } from '../data/defaultLogos';

export interface AdjuntoInput {
  tipoAdjunto: TipoAdjunto;
  titulo: string;
  descripcion: string;
  archivoNombre: string;
  archivoTamano: string;
  fojas?: number;
  esDocumentoRedactado?: boolean;
  contenidoHtml?: string;
  membrete?: MembreteConfig;
  esMultimedia?: boolean;
  formato?: string;
}

interface AppContextType {
  departamentos: Departamento[];
  usuarios: Usuario[];
  usuarioActual: Usuario;
  roles: Record<string, Rol>;
  expedientes: Expediente[];
  resoluciones: Resolucion[];
  auditoriaLogs: AuditoriaLog[];
  configInstitucional: InstitucionalConfig;
  actualizarConfigInstitucional: (config: Partial<InstitucionalConfig>) => void;
  restablecerConfigInstitucional: () => void;
  switchUsuario: (usuarioId: number) => void;
  iniciarExpediente: (data: {
    asunto: string;
    tramiteInicio: string;
    fojasInicio: number;
    adjuntos?: AdjuntoInput[];
  }) => { success: boolean; claveUnica?: string; error?: string };
  crearPase: (
    expedienteId: number,
    data: {
      deptoReceptorId: number;
      usuarioReceptorId: number;
      observacion: string;
      fojasPase: number;
      adjuntos?: AdjuntoInput[];
    }
  ) => { success: boolean; error?: string };
  recepcionarPase: (
    paseId: number,
    observacionRecepcion: string
  ) => { success: boolean; error?: string };
  rechazarPase: (
    paseId: number,
    motivoRechazo: string
  ) => { success: boolean; error?: string };
  archivarExpediente: (
    expedienteId: number,
    data: {
      nroCaja: string;
      observacion: string;
      fojasArchivado?: number;
    }
  ) => { success: boolean; error?: string };
  desarchivarExpediente: (
    expedienteId: number,
    motivo: string
  ) => { success: boolean; error?: string };
  agregarAdjunto: (
    expedienteId: number,
    data: AdjuntoInput
  ) => { success: boolean; error?: string };
  eliminarAdjunto: (
    expedienteId: number,
    adjuntoId: number
  ) => { success: boolean; error?: string };
  agregarResolucion: (data: Omit<Resolucion, 'id' | 'createdAt' | 'updatedAt' | 'usuarioId'>) => {
    success: boolean;
    resolucion?: Resolucion;
    error?: string;
  };
  editarResolucion: (
    id: number,
    data: Partial<Resolucion>
  ) => { success: boolean; error?: string };
  eliminarResolucion: (id: number) => { success: boolean; error?: string };
  vincularResolucionAExpediente: (
    resolucionId: number,
    expedienteId: number
  ) => { success: boolean; error?: string };
  desvincularResolucionDeExpediente: (
    resolucionId: number,
    expedienteId: number
  ) => { success: boolean; error?: string };
  agregarDepartamento: (data: Omit<Departamento, 'id'>) => void;
  editarDepartamento: (id: number, data: Partial<Departamento>) => void;
  agregarUsuario: (data: Omit<Usuario, 'id'>) => void;
  editarUsuario: (id: number, data: Partial<Usuario>) => void;
  restablecerDatos: () => void;
  calcularTotalFojas: (expediente: Expediente) => number;
  getDepartamento: (id?: number) => Departamento | undefined;
  getUsuario: (id?: number) => Usuario | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_DEPTS = 'siged_departamentos_v1';
const STORAGE_KEY_USERS = 'siged_usuarios_v1';
const STORAGE_KEY_CURRENT_USER = 'siged_current_user_v1';
const STORAGE_KEY_EXPEDIENTES = 'siged_expedientes_v1';
const STORAGE_KEY_RESOLUCIONES = 'siged_resoluciones_v1';
const STORAGE_KEY_AUDITORIA = 'siged_auditoria_v1';
const STORAGE_KEY_CONFIG_INSTITUCIONAL = 'siged_config_institucional_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEPTS);
    return saved ? JSON.parse(saved) : DEPARTAMENTOS_INICIALES;
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    return saved ? JSON.parse(saved) : USUARIOS_INICIALES;
  });

  const [usuarioActual, setUsuarioActual] = useState<Usuario>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (savedId) {
      const found = USUARIOS_INICIALES.find((u) => u.id === Number(savedId));
      if (found) return found;
    }
    return USUARIOS_INICIALES[0]; // Carlos Martínez por defecto
  });

  const [expedientes, setExpedientes] = useState<Expediente[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXPEDIENTES);
    return saved ? JSON.parse(saved) : EXPEDIENTES_INICIALES;
  });

  const [resoluciones, setResoluciones] = useState<Resolucion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RESOLUCIONES);
    return saved ? JSON.parse(saved) : RESOLUCIONES_INICIALES;
  });

  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUDITORIA);
    return saved ? JSON.parse(saved) : AUDITORIA_INICIAL;
  });

  const [configInstitucional, setConfigInstitucional] = useState<InstitucionalConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG_INSTITUCIONAL);
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG_INSTITUCIONAL, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG_INSTITUCIONAL;
      }
    }
    return DEFAULT_CONFIG_INSTITUCIONAL;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departamentos));
  }, [departamentos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, String(usuarioActual.id));
  }, [usuarioActual]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPEDIENTES, JSON.stringify(expedientes));
  }, [expedientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RESOLUCIONES, JSON.stringify(resoluciones));
  }, [resoluciones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDITORIA, JSON.stringify(auditoriaLogs));
  }, [auditoriaLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG_INSTITUCIONAL, JSON.stringify(configInstitucional));
  }, [configInstitucional]);

  const registrarAuditoria = (
    tablaAfectada: string,
    registroId: number | string,
    accion: AuditoriaLog['accion'],
    datosNuevos?: Record<string, unknown> | null,
    datosAnteriores?: Record<string, unknown> | null
  ) => {
    const nuevoLog: AuditoriaLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      tablaAfectada,
      registroId,
      accion,
      usuarioId: usuarioActual.id,
      datosNuevos: datosNuevos || null,
      datosAnteriores: datosAnteriores || null,
      ipAddress: '192.168.10.15',
      timestamp: new Date().toISOString(),
    };
    setAuditoriaLogs((prev) => [nuevoLog, ...prev]);
  };

  const getDepartamento = (id?: number) => departamentos.find((d) => d.id === id);
  const getUsuario = (id?: number) => usuarios.find((u) => u.id === id);

  const calcularTotalFojas = (expediente: Expediente): number => {
    const fojasPases = (expediente.pases || []).reduce(
      (sum, p) => sum + (Number(p.fojasPase) || 0),
      0
    );
    const fojasAdjuntos = (expediente.adjuntos || []).reduce(
      (sum, a) => sum + (Number(a.fojas) || 1),
      0
    );
    return (Number(expediente.fojasInicio) || 1) + fojasPases + fojasAdjuntos;
  };

  const switchUsuario = (usuarioId: number) => {
    const target = usuarios.find((u) => u.id === usuarioId);
    if (target) {
      registrarAuditoria(
        '/auth/login',
        target.id,
        'LOGIN',
        { usuario: target.username, rol: target.rolId }
      );
      setUsuarioActual(target);
    }
  };

  const iniciarExpediente = (data: {
    asunto: string;
    tramiteInicio: string;
    fojasInicio: number;
    adjuntos?: AdjuntoInput[];
  }) => {
    // Validar permisos
    const rol = ROLES_DEFINICION[usuarioActual.rolId];
    if (!rol?.permisos.puedeIniciar) {
      return {
        success: false,
        error: 'Su rol (' + usuarioActual.rolId + ') no posee permisos para iniciar expedientes.',
      };
    }

    const currentYear = new Date().getFullYear();
    const codigoReparticion = '2100';

    // Generar correlativo anual
    const expedientesAnio = expedientes.filter(
      (e) => e.anio === currentYear && e.codigoReparticion === codigoReparticion
    );
    const maxNumero = expedientesAnio.reduce(
      (max, e) => (e.numeroExpediente > max ? e.numeroExpediente : max),
      0
    );
    const nuevoNumero = maxNumero + 1;
    const claveUnica = `${codigoReparticion}-${nuevoNumero}-${currentYear}`;

    const now = new Date().toISOString();
    const expedienteId = Date.now();

    const adjuntosIniciales: Adjunto[] = (data.adjuntos || []).map((adj, idx) => ({
      id: Date.now() + idx,
      expedienteId,
      tipoAdjunto: adj.tipoAdjunto,
      titulo: adj.titulo.trim(),
      descripcion: adj.descripcion.trim(),
      archivoNombre: adj.archivoNombre.trim(),
      archivoTamano: adj.archivoTamano || '1.0 MB',
      fechaAdjunto: now,
      usuarioId: usuarioActual.id,
      fojas: Math.max(1, Number(adj.fojas) || 1),
      esDocumentoRedactado: adj.esDocumentoRedactado,
      contenidoHtml: adj.contenidoHtml,
      membrete: adj.membrete,
      esMultimedia: adj.esMultimedia,
      formato: adj.formato,
    }));

    const nuevoExpediente: Expediente = {
      id: expedienteId,
      codigoReparticion,
      numeroExpediente: nuevoNumero,
      anio: currentYear,
      claveUnica,
      departamentoInicioId: usuarioActual.departamentoId,
      usuarioInicioId: usuarioActual.id,
      fechaInicio: now,
      asunto: data.asunto.trim(),
      tramiteInicio: data.tramiteInicio.trim(),
      fojasInicio: Math.max(1, Number(data.fojasInicio) || 1),
      estado: 'iniciado',
      createdAt: now,
      updatedAt: now,
      departamentoActualId: usuarioActual.departamentoId,
      usuarioActualId: usuarioActual.id,
      pases: [],
      adjuntos: adjuntosIniciales,
      resolucionesIds: [],
    };

    setExpedientes((prev) => [nuevoExpediente, ...prev]);

    registrarAuditoria(
      '/expedientes/iniciar',
      claveUnica,
      'CREATE',
      {
        claveUnica,
        asunto: data.asunto,
        fojasInicio: data.fojasInicio,
        adjuntosAgregados: adjuntosIniciales.length,
        departamentoInicio: getDepartamento(usuarioActual.departamentoId)?.nombre,
        iniciadoPor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
      }
    );

    return { success: true, claveUnica };
  };

  const crearPase = (
    expedienteId: number,
    data: {
      deptoReceptorId: number;
      usuarioReceptorId: number;
      observacion: string;
      fojasPase: number;
      adjuntos?: AdjuntoInput[];
    }
  ) => {
    const expediente = expedientes.find((e) => e.id === expedienteId);
    if (!expediente) return { success: false, error: 'Expediente no encontrado.' };

    if (expediente.estado === 'archivado') {
      return { success: false, error: 'No se puede pasear un expediente archivado.' };
    }

    // Comprobar posesión
    const ultimoPase = expediente.pases.find((p) => p.esUltimoPase);
    const poseeExpediente = ultimoPase
      ? ultimoPase.usuarioReceptorId === usuarioActual.id &&
        ultimoPase.estadoPase === 'recepcionado'
      : expediente.usuarioInicioId === usuarioActual.id &&
        expediente.estado === 'iniciado';

    const esAdminOEncargado =
      usuarioActual.rolId === 'admin' ||
      usuarioActual.rolId === 'superadmin' ||
      usuarioActual.esEncargado;

    if (!poseeExpediente && !esAdminOEncargado) {
      return {
        success: false,
        error:
          'Solo el usuario que posee y recepcionó el expediente, su encargado o un administrador puede pasearlo.',
      };
    }

    const now = new Date().toISOString();

    const nuevosAdjuntos: Adjunto[] = (data.adjuntos || []).map((adj, idx) => ({
      id: Date.now() + idx,
      expedienteId,
      tipoAdjunto: adj.tipoAdjunto,
      titulo: adj.titulo.trim(),
      descripcion: adj.descripcion.trim(),
      archivoNombre: adj.archivoNombre.trim(),
      archivoTamano: adj.archivoTamano || '1.0 MB',
      fechaAdjunto: now,
      usuarioId: usuarioActual.id,
      fojas: Math.max(1, Number(adj.fojas) || 1),
      esDocumentoRedactado: adj.esDocumentoRedactado,
      contenidoHtml: adj.contenidoHtml,
      membrete: adj.membrete,
      esMultimedia: adj.esMultimedia,
      formato: adj.formato,
    }));

    const nuevoPase: ExpedientePase = {
      id: Date.now(),
      expedienteId,
      usuarioEmisorId: usuarioActual.id,
      departamentoEmisorId: usuarioActual.departamentoId,
      fechaPase: now,
      usuarioReceptorId: data.usuarioReceptorId,
      departamentoReceptorId: data.deptoReceptorId,
      observacion: data.observacion.trim(),
      fojasPase: Math.max(0, Number(data.fojasPase) || 0),
      estadoPase: 'pendiente',
      esUltimoPase: true,
    };

    setExpedientes((prev) =>
      prev.map((exp) => {
        if (exp.id !== expedienteId) return exp;

        const updatedPases = (exp.pases || []).map((p) => ({
          ...p,
          esUltimoPase: false,
        }));

        return {
          ...exp,
          estado: 'pase',
          departamentoActualId: data.deptoReceptorId,
          usuarioActualId: data.usuarioReceptorId,
          updatedAt: now,
          pases: [...updatedPases, nuevoPase],
          adjuntos: [...(exp.adjuntos || []), ...nuevosAdjuntos],
        };
      })
    );

    registrarAuditoria(
      '/expedientes/pase',
      expediente.claveUnica,
      'PASE',
      {
        expediente: expediente.claveUnica,
        emisor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
        deptoEmisor: getDepartamento(usuarioActual.departamentoId)?.nombre,
        receptor: getUsuario(data.usuarioReceptorId)?.username,
        deptoReceptor: getDepartamento(data.deptoReceptorId)?.nombre,
        fojasAgregadas: data.fojasPase,
        adjuntosAgregados: nuevosAdjuntos.length,
        observacion: data.observacion,
      }
    );

    return { success: true };
  };

  const recepcionarPase = (paseId: number, observacionRecepcion: string) => {
    let expedienteClave = '';
    const now = new Date().toISOString();

    setExpedientes((prev) =>
      prev.map((exp) => {
        const paseIndex = (exp.pases || []).findIndex((p) => p.id === paseId);
        if (paseIndex === -1) return exp;

        expedienteClave = exp.claveUnica;
        const updatedPases = [...exp.pases];
        updatedPases[paseIndex] = {
          ...updatedPases[paseIndex],
          estadoPase: 'recepcionado',
          fechaRecepcion: now,
          observacionRecepcion: observacionRecepcion.trim() || 'Recepcionado conforme.',
        };

        return {
          ...exp,
          departamentoActualId: updatedPases[paseIndex].departamentoReceptorId,
          usuarioActualId: updatedPases[paseIndex].usuarioReceptorId,
          updatedAt: now,
          pases: updatedPases,
        };
      })
    );

    registrarAuditoria(
      '/expedientes/recepcionar',
      expedienteClave || paseId,
      'RECEPCION',
      {
        paseId,
        recepcionadoPor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
        fechaRecepcion: now,
        observacion: observacionRecepcion,
      }
    );

    return { success: true };
  };

  const rechazarPase = (paseId: number, motivoRechazo: string) => {
    let expedienteClave = '';
    const now = new Date().toISOString();

    setExpedientes((prev) =>
      prev.map((exp) => {
        const paseIndex = (exp.pases || []).findIndex((p) => p.id === paseId);
        if (paseIndex === -1) return exp;

        expedienteClave = exp.claveUnica;
        const targetPase = exp.pases[paseIndex];
        const updatedPases = [...exp.pases];

        updatedPases[paseIndex] = {
          ...targetPase,
          estadoPase: 'rechazado',
          observacionRecepcion: `RECHAZADO: ${motivoRechazo.trim()}`,
          fechaRecepcion: now,
          esUltimoPase: false,
        };

        // Devuelve el expediente al emisor
        return {
          ...exp,
          departamentoActualId: targetPase.departamentoEmisorId,
          usuarioActualId: targetPase.usuarioEmisorId,
          updatedAt: now,
          pases: updatedPases,
        };
      })
    );

    registrarAuditoria(
      '/expedientes/rechazar',
      expedienteClave || paseId,
      'RECHAZO',
      {
        paseId,
        rechazadoPor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
        motivo: motivoRechazo,
      }
    );

    return { success: true };
  };

  const archivarExpediente = (
    expedienteId: number,
    data: {
      nroCaja: string;
      observacion: string;
      fojasArchivado?: number;
    }
  ) => {
    const expediente = expedientes.find((e) => e.id === expedienteId);
    if (!expediente) return { success: false, error: 'Expediente no encontrado.' };

    const rol = ROLES_DEFINICION[usuarioActual.rolId];
    if (!rol?.permisos.puedeArchivar) {
      return { success: false, error: 'No tiene permisos para archivar expedientes.' };
    }

    const totalFojas = data.fojasArchivado || calcularTotalFojas(expediente);
    const now = new Date().toISOString();

    setExpedientes((prev) =>
      prev.map((exp) => {
        if (exp.id !== expedienteId) return exp;

        return {
          ...exp,
          estado: 'archivado',
          departamentoActualId: 800, // Archivo General Central
          usuarioActualId: usuarioActual.id,
          updatedAt: now,
          archivado: {
            id: Date.now(),
            expedienteId,
            nroCaja: data.nroCaja.trim(),
            fechaArchivado: now,
            fojasArchivado: totalFojas,
            observacion: data.observacion.trim(),
            usuarioArchivoId: usuarioActual.id,
          },
        };
      })
    );

    registrarAuditoria(
      '/expedientes/archivar',
      expediente.claveUnica,
      'ARCHIVO',
      {
        expediente: expediente.claveUnica,
        nroCaja: data.nroCaja,
        fojas: totalFojas,
        observacion: data.observacion,
        usuarioArchivo: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
      }
    );

    return { success: true };
  };

  const desarchivarExpediente = (expedienteId: number, motivo: string) => {
    const expediente = expedientes.find((e) => e.id === expedienteId);
    if (!expediente) return { success: false, error: 'Expediente no encontrado.' };

    const rol = ROLES_DEFINICION[usuarioActual.rolId];
    if (!rol?.permisos.puedeDesarchivar) {
      return {
        success: false,
        error: 'Solo administradores pueden reactivar o desarchivar expedientes.',
      };
    }

    const now = new Date().toISOString();

    setExpedientes((prev) =>
      prev.map((exp) => {
        if (exp.id !== expedienteId) return exp;

        return {
          ...exp,
          estado: 'pase',
          updatedAt: now,
          departamentoActualId: usuarioActual.departamentoId,
          usuarioActualId: usuarioActual.id,
          archivado: undefined,
        };
      })
    );

    registrarAuditoria(
      '/expedientes/desarchivar',
      expediente.claveUnica,
      'DESARCHIVO',
      {
        expediente: expediente.claveUnica,
        motivo,
        desarchivadoPor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
      }
    );

    return { success: true };
  };

  const agregarAdjunto = (
    expedienteId: number,
    data: AdjuntoInput
  ) => {
    const expediente = expedientes.find((e) => e.id === expedienteId);
    if (!expediente) return { success: false, error: 'Expediente no encontrado.' };

    const now = new Date().toISOString();
    const fojasCount = Math.max(1, Number(data.fojas) || (data.esMultimedia ? 1 : 1));

    const nuevoAdjunto: Adjunto = {
      id: Date.now(),
      expedienteId,
      tipoAdjunto: data.tipoAdjunto,
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      archivoNombre: data.archivoNombre.trim(),
      archivoTamano: data.archivoTamano || '1.2 MB',
      fechaAdjunto: now,
      usuarioId: usuarioActual.id,
      fojas: fojasCount,
      esDocumentoRedactado: data.esDocumentoRedactado,
      contenidoHtml: data.contenidoHtml,
      membrete: data.membrete,
      esMultimedia: data.esMultimedia,
      formato: data.formato,
    };

    setExpedientes((prev) =>
      prev.map((exp) => {
        if (exp.id !== expedienteId) return exp;
        return {
          ...exp,
          adjuntos: [nuevoAdjunto, ...(exp.adjuntos || [])],
          updatedAt: now,
        };
      })
    );

    registrarAuditoria(
      '/expedientes/adjuntos',
      expediente.claveUnica,
      'UPDATE',
      {
        expediente: expediente.claveUnica,
        adjunto: data.titulo,
        tipo: data.tipoAdjunto,
        fojas: fojasCount,
        esDocumentoRedactado: !!data.esDocumentoRedactado,
        subidoPor: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
      }
    );

    return { success: true };
  };

  const eliminarAdjunto = (expedienteId: number, adjuntoId: number) => {
    const expediente = expedientes.find((e) => e.id === expedienteId);
    if (!expediente) return { success: false, error: 'Expediente no encontrado.' };

    const adjuntoAEliminar = (expediente.adjuntos || []).find((a) => a.id === adjuntoId);
    if (!adjuntoAEliminar) return { success: false, error: 'Adjunto no encontrado.' };

    setExpedientes((prev) =>
      prev.map((exp) => {
        if (exp.id !== expedienteId) return exp;
        return {
          ...exp,
          adjuntos: (exp.adjuntos || []).filter((a) => a.id !== adjuntoId),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    registrarAuditoria(
      '/expedientes/adjuntos/eliminar',
      expediente.claveUnica,
      'DELETE',
      {
        expediente: expediente.claveUnica,
        adjuntoEliminado: adjuntoAEliminar.titulo,
        fojasRestadas: adjuntoAEliminar.fojas,
        usuario: `${usuarioActual.firstName} ${usuarioActual.lastName}`,
      }
    );

    return { success: true };
  };

  // Resoluciones CRUD
  const agregarResolucion = (
    data: Omit<Resolucion, 'id' | 'createdAt' | 'updatedAt' | 'usuarioId'>
  ) => {
    const now = new Date().toISOString();
    const nuevaId = Date.now();
    const nueva: Resolucion = {
      ...data,
      id: nuevaId,
      usuarioId: usuarioActual.id,
      createdAt: now,
      updatedAt: now,
    };

    setResoluciones((prev) => [nueva, ...prev]);

    // Si tiene expedientes vinculados, registrar en cada expediente
    if (data.expedientesIds && data.expedientesIds.length > 0) {
      setExpedientes((prev) =>
        prev.map((exp) => {
          if (data.expedientesIds.includes(exp.id)) {
            const currentRes = exp.resolucionesIds || [];
            if (!currentRes.includes(nuevaId)) {
              return {
                ...exp,
                resolucionesIds: [...currentRes, nuevaId],
                updatedAt: now,
              };
            }
          }
          return exp;
        })
      );
    }

    registrarAuditoria(
      '/resoluciones/nueva',
      data.numeroResolucion,
      'RESOLUCION_CREATE',
      {
        numero: data.numeroResolucion,
        categoria: data.categoria,
        esPublica: data.esPublica,
        asunto: data.asunto,
        expedientesVinculados: data.expedientesIds,
        firmante: data.firmante,
      }
    );

    return { success: true, resolucion: nueva };
  };

  const editarResolucion = (id: number, data: Partial<Resolucion>) => {
    const target = resoluciones.find((r) => r.id === id);
    if (!target) return { success: false, error: 'Resolución no encontrada.' };

    const now = new Date().toISOString();
    const updated = { ...target, ...data, updatedAt: now };

    setResoluciones((prev) => prev.map((r) => (r.id === id ? updated : r)));

    // Si cambiaron expedientesIds vinculados
    if (data.expedientesIds) {
      setExpedientes((prev) =>
        prev.map((exp) => {
          const isLinked = data.expedientesIds!.includes(exp.id);
          const currentRes = exp.resolucionesIds || [];
          if (isLinked && !currentRes.includes(id)) {
            return { ...exp, resolucionesIds: [...currentRes, id], updatedAt: now };
          }
          if (!isLinked && currentRes.includes(id)) {
            return {
              ...exp,
              resolucionesIds: currentRes.filter((rId) => rId !== id),
              updatedAt: now,
            };
          }
          return exp;
        })
      );
    }

    registrarAuditoria(
      '/resoluciones/editar',
      target.numeroResolucion,
      'RESOLUCION_UPDATE',
      data as Record<string, unknown>
    );

    return { success: true };
  };

  const eliminarResolucion = (id: number) => {
    const target = resoluciones.find((r) => r.id === id);
    if (!target) return { success: false, error: 'Resolución no encontrada.' };

    setResoluciones((prev) => prev.filter((r) => r.id !== id));

    // Quitar de los expedientes
    setExpedientes((prev) =>
      prev.map((exp) => ({
        ...exp,
        resolucionesIds: (exp.resolucionesIds || []).filter((rId) => rId !== id),
      }))
    );

    registrarAuditoria(
      '/resoluciones/eliminar',
      target.numeroResolucion,
      'RESOLUCION_DELETE',
      {
        numero: target.numeroResolucion,
        asunto: target.asunto,
      }
    );

    return { success: true };
  };

  const vincularResolucionAExpediente = (resolucionId: number, expedienteId: number) => {
    const res = resoluciones.find((r) => r.id === resolucionId);
    const exp = expedientes.find((e) => e.id === expedienteId);
    if (!res || !exp) return { success: false, error: 'Resolución o Expediente no encontrado.' };

    const now = new Date().toISOString();

    // Actualizar resolucion
    setResoluciones((prev) =>
      prev.map((r) => {
        if (r.id === resolucionId && !r.expedientesIds.includes(expedienteId)) {
          return { ...r, expedientesIds: [...r.expedientesIds, expedienteId], updatedAt: now };
        }
        return r;
      })
    );

    // Actualizar expediente
    setExpedientes((prev) =>
      prev.map((e) => {
        if (e.id === expedienteId) {
          const current = e.resolucionesIds || [];
          if (!current.includes(resolucionId)) {
            return { ...e, resolucionesIds: [...current, resolucionId], updatedAt: now };
          }
        }
        return e;
      })
    );

    registrarAuditoria(
      '/resoluciones/vincular',
      res.numeroResolucion,
      'RESOLUCION_VINCULAR',
      {
        resolucion: res.numeroResolucion,
        expediente: exp.claveUnica,
      }
    );

    return { success: true };
  };

  const desvincularResolucionDeExpediente = (resolucionId: number, expedienteId: number) => {
    const res = resoluciones.find((r) => r.id === resolucionId);
    const exp = expedientes.find((e) => e.id === expedienteId);
    if (!res || !exp) return { success: false, error: 'Resolución o Expediente no encontrado.' };

    const now = new Date().toISOString();

    setResoluciones((prev) =>
      prev.map((r) => {
        if (r.id === resolucionId) {
          return {
            ...r,
            expedientesIds: r.expedientesIds.filter((id) => id !== expedienteId),
            updatedAt: now,
          };
        }
        return r;
      })
    );

    setExpedientes((prev) =>
      prev.map((e) => {
        if (e.id === expedienteId) {
          return {
            ...e,
            resolucionesIds: (e.resolucionesIds || []).filter((id) => id !== resolucionId),
            updatedAt: now,
          };
        }
        return e;
      })
    );

    return { success: true };
  };

  const agregarDepartamento = (data: Omit<Departamento, 'id'>) => {
    const nuevoId = 100 + departamentos.length * 100;
    const nuevo: Departamento = {
      ...data,
      id: nuevoId,
    };
    setDepartamentos((prev) => [...prev, nuevo]);
    registrarAuditoria('/admin/departamentos', nuevoId, 'CREATE', nuevo as unknown as Record<string, unknown>);
  };

  const editarDepartamento = (id: number, data: Partial<Departamento>) => {
    setDepartamentos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
    registrarAuditoria('/admin/departamentos', id, 'UPDATE', data as Record<string, unknown>);
  };

  const agregarUsuario = (data: Omit<Usuario, 'id'>) => {
    const nuevoId = Math.max(...usuarios.map((u) => u.id), 0) + 1;
    const nuevo: Usuario = {
      ...data,
      id: nuevoId,
    };
    setUsuarios((prev) => [...prev, nuevo]);
    registrarAuditoria('/admin/usuarios', nuevoId, 'CREATE', nuevo as unknown as Record<string, unknown>);
  };

  const editarUsuario = (id: number, data: Partial<Usuario>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    registrarAuditoria('/admin/usuarios', id, 'UPDATE', data as Record<string, unknown>);
  };

  const actualizarConfigInstitucional = (nuevaConfig: Partial<InstitucionalConfig>) => {
    setConfigInstitucional((prev) => {
      const updated = { ...prev, ...nuevaConfig };
      registrarAuditoria(
        '/config/institucional',
        'LOGOS_Y_MEMBRETE',
        'UPDATE',
        { ...nuevaConfig },
        { ...prev }
      );
      return updated;
    });
  };

  const restablecerConfigInstitucional = () => {
    setConfigInstitucional(DEFAULT_CONFIG_INSTITUCIONAL);
    registrarAuditoria(
      '/config/institucional',
      'LOGOS_Y_MEMBRETE',
      'UPDATE',
      { accion: 'RESTABLECER_VALORES_OFICIALES' }
    );
  };

  const restablecerDatos = () => {
    localStorage.removeItem(STORAGE_KEY_DEPTS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    localStorage.removeItem(STORAGE_KEY_EXPEDIENTES);
    localStorage.removeItem(STORAGE_KEY_RESOLUCIONES);
    localStorage.removeItem(STORAGE_KEY_AUDITORIA);
    localStorage.removeItem(STORAGE_KEY_CONFIG_INSTITUCIONAL);

    setDepartamentos(DEPARTAMENTOS_INICIALES);
    setUsuarios(USUARIOS_INICIALES);
    setUsuarioActual(USUARIOS_INICIALES[0]);
    setExpedientes(EXPEDIENTES_INICIALES);
    setResoluciones(RESOLUCIONES_INICIALES);
    setAuditoriaLogs(AUDITORIA_INICIAL);
    setConfigInstitucional(DEFAULT_CONFIG_INSTITUCIONAL);
  };

  return (
    <AppContext.Provider
      value={{
        departamentos,
        usuarios,
        usuarioActual,
        roles: ROLES_DEFINICION,
        expedientes,
        resoluciones,
        auditoriaLogs,
        configInstitucional,
        actualizarConfigInstitucional,
        restablecerConfigInstitucional,
        switchUsuario,
        iniciarExpediente,
        crearPase,
        recepcionarPase,
        rechazarPase,
        archivarExpediente,
        desarchivarExpediente,
        agregarAdjunto,
        eliminarAdjunto,
        agregarResolucion,
        editarResolucion,
        eliminarResolucion,
        vincularResolucionAExpediente,
        desvincularResolucionDeExpediente,
        agregarDepartamento,
        editarDepartamento,
        agregarUsuario,
        editarUsuario,
        restablecerDatos,
        calcularTotalFojas,
        getDepartamento,
        getUsuario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
  return context;
};
