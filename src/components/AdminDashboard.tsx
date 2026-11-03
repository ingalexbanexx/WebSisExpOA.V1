import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Clock,
  Archive,
  TrendingUp,
  Plus,
  Edit2,
  CheckCircle2,
  Shield,
  Phone,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Departamento, Usuario, TipoRol } from '../types';
import { ConfiguracionInstitucionalPanel } from './ConfiguracionInstitucionalPanel';

export const AdminDashboard: React.FC = () => {
  const {
    expedientes,
    departamentos,
    usuarios,
    auditoriaLogs,
    configInstitucional,
    agregarDepartamento,
    editarDepartamento,
    agregarUsuario,
    editarUsuario,
    calcularTotalFojas,
    getDepartamento,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'estadisticas' | 'departamentos' | 'usuarios' | 'logos'>('estadisticas');

  // Modales CRUD
  const [modalDeptoOpen, setModalDeptoOpen] = useState(false);
  const [deptoEditing, setDeptoEditing] = useState<Departamento | null>(null);
  const [deptoCodigo, setDeptoCodigo] = useState('');
  const [deptoNombre, setDeptoNombre] = useState('');
  const [deptoJerarquia, setDeptoJerarquia] = useState(3);
  const [deptoResponsable, setDeptoResponsable] = useState('');
  const [deptoTel, setDeptoTel] = useState('Int. 2109');

  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [userEditing, setUserEditing] = useState<Usuario | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userDeptoId, setUserDeptoId] = useState<number>(200);
  const [userRolId, setUserRolId] = useState<TipoRol>('iniciador');

  // Métricas conforme a Roadmap Módulo 7
  const totalExpedientes = expedientes.length;

  const now = new Date();
  const expedientesMes = expedientes.filter((e) => {
    const d = new Date(e.fechaInicio);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const porEstado = {
    iniciado: expedientes.filter((e) => e.estado === 'iniciado').length,
    pase: expedientes.filter((e) => e.estado === 'pase').length,
    archivado: expedientes.filter((e) => e.estado === 'archivado').length,
  };

  const pasesPendientesTotal = expedientes.reduce((acc, exp) => {
    const pend = (exp.pases || []).some((p) => p.estadoPase === 'pendiente' && p.esUltimoPase);
    return pend ? acc + 1 : acc;
  }, 0);

  const totalFojasGlobal = expedientes.reduce((acc, exp) => acc + calcularTotalFojas(exp), 0);

  // Top Departamentos por expedientes iniciados
  const deptosRanking = departamentos
    .map((d) => {
      const count = expedientes.filter((e) => e.departamentoInicioId === d.id).length;
      return { ...d, totalIniciados: count };
    })
    .sort((a, b) => b.totalIniciados - a.totalIniciados);

  // Rendimiento de Usuarios (Iniciados + Pases emitidos)
  const usuariosRanking = usuarios
    .map((u) => {
      const iniciados = expedientes.filter((e) => e.usuarioInicioId === u.id).length;
      const pasesEmitidos = expedientes.reduce((acc, e) => {
        const count = (e.pases || []).filter((p) => p.usuarioEmisorId === u.id).length;
        return acc + count;
      }, 0);
      return {
        ...u,
        iniciados,
        pasesEmitidos,
        totalActividad: iniciados + pasesEmitidos,
      };
    })
    .sort((a, b) => b.totalActividad - a.totalActividad);

  // Handlers para Departamento
  const handleOpenNewDepto = () => {
    setDeptoEditing(null);
    setDeptoCodigo(`DPTO-${(departamentos.length + 1) * 100}`);
    setDeptoNombre('');
    setDeptoJerarquia(3);
    setDeptoResponsable('');
    setDeptoTel('Int. 2109');
    setModalDeptoOpen(true);
  };

  const handleSaveDepto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptoCodigo.trim() || !deptoNombre.trim()) return;

    if (deptoEditing) {
      editarDepartamento(deptoEditing.id, {
        codigo: deptoCodigo.trim(),
        nombre: deptoNombre.trim(),
        jerarquia: Number(deptoJerarquia),
        responsable: deptoResponsable.trim(),
        telefonoInterno: deptoTel.trim(),
      });
    } else {
      agregarDepartamento({
        codigo: deptoCodigo.trim(),
        nombre: deptoNombre.trim(),
        jerarquia: Number(deptoJerarquia),
        activo: true,
        responsable: deptoResponsable.trim(),
        telefonoInterno: deptoTel.trim(),
      });
    }
    setModalDeptoOpen(false);
  };

  // Handlers para Usuario
  const handleOpenNewUser = () => {
    setUserEditing(null);
    setUserName('');
    setUserEmail('');
    setUserFirstName('');
    setUserLastName('');
    setUserDeptoId(departamentos[0]?.id || 200);
    setUserRolId('iniciador');
    setModalUserOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userFirstName.trim()) return;

    if (userEditing) {
      editarUsuario(userEditing.id, {
        username: userName.trim().toLowerCase(),
        email: userEmail.trim(),
        firstName: userFirstName.trim(),
        lastName: userLastName.trim(),
        departamentoId: userDeptoId,
        rolId: userRolId,
      });
    } else {
      agregarUsuario({
        username: userName.trim().toLowerCase(),
        email: userEmail.trim() || `${userName.trim().toLowerCase()}@reparticion2100.gob.ar`,
        firstName: userFirstName.trim(),
        lastName: userLastName.trim(),
        departamentoId: userDeptoId,
        rolId: userRolId,
        telefono: '+54 11 4349-2100',
        esEncargado: false,
        isActive: true,
      });
    }
    setModalUserOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#082032] tracking-tight">
              Panel de Administración y Métricas
            </h1>
            <span className="text-xs bg-[#082032] text-white font-bold px-2.5 py-0.5 rounded-full">
              Control Repartición 2100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervisión operativa, gestión de dependencias y registro de agentes activos.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#F3F4F5] p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'estadisticas'
                ? 'bg-[#082032] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#082032]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('departamentos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'departamentos'
                ? 'bg-[#082032] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#082032]'
            }`}
          >
            Departamentos ({departamentos.length})
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-[#082032] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#082032]'
            }`}
          >
            Usuarios & Roles ({usuarios.length})
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logos'
                ? 'bg-[#B71C1C] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#B71C1C]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Logos & Membrete</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: DASHBOARD DE ESTADÍSTICAS */}
      {activeTab === 'estadisticas' && (
        <div className="space-y-6">
          {/* Tarjetas KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Expedientes</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black font-mono text-slate-900 mt-2">
                {totalExpedientes}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {expedientesMes} iniciados este mes
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Pases Pendientes</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black font-mono text-amber-600 mt-2">
                {pasesPendientesTotal}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Esperando recepción oficial
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Archivados</span>
                <Archive className="w-4 h-4 text-slate-700" />
              </div>
              <p className="text-2xl font-black font-mono text-slate-800 mt-2">
                {porEstado.archivado}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                En cajas de custodia física
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Fojas Registradas</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-2">
                {totalFojasGlobal}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Acumuladas en toda la repartición
              </span>
            </div>
          </div>

          {/* Banner de Acceso a Configuración Institucional */}
          <div className="bg-gradient-to-r from-[#082032] via-[#0e2c44] to-[#1a365d] rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                {configInstitucional.logoGobiernoUrl ? (
                  <img
                    src={configInstitucional.logoGobiernoUrl}
                    alt="Escudo"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Building className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Identidad Institucional & Membrete Oficial
                  </h3>
                  <span className="text-[10px] bg-amber-400 text-[#082032] font-extrabold px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  {configInstitucional.nombreGobierno} • {configInstitucional.nombreReparticion}.
                  Marca de agua: {configInstitucional.habilitarMarcaDeAgua ? 'Habilitada (' + Math.round(configInstitucional.marcaDeAguaOpacidad * 100) + '%)' : 'Desactivada'}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('logos')}
              className="px-4 py-2 bg-white text-[#082032] hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Shield className="w-4 h-4 text-[#B71C1C]" />
              <span>Gestionar Logos y Marca de Agua</span>
            </button>
          </div>

          {/* Gráfico y Distribución por Estado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Distribución por Estado de Trámite
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">En Pase / Tránsito</span>
                    <span className="font-mono text-blue-700">
                      {porEstado.pase} ({Math.round((porEstado.pase / (totalExpedientes || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(porEstado.pase / (totalExpedientes || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Iniciados (En Origen)</span>
                    <span className="font-mono text-emerald-700">
                      {porEstado.iniciado} ({Math.round((porEstado.iniciado / (totalExpedientes || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(porEstado.iniciado / (totalExpedientes || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Archivados Definitivos</span>
                    <span className="font-mono text-amber-800">
                      {porEstado.archivado} ({Math.round((porEstado.archivado / (totalExpedientes || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${(porEstado.archivado / (totalExpedientes || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Total de expedientes en circuito de gestión activa:{' '}
                <strong className="text-slate-800">
                  {porEstado.pase + porEstado.iniciado} actuaciones
                </strong>
              </div>
            </div>

            {/* Top Dependencias con Mayor Volumen */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Flujo Documental por Dependencia (Expedientes Iniciados)
              </h3>

              <div className="space-y-2.5">
                {deptosRanking.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                        {d.codigo.split('-')[1]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{d.nombre}</p>
                        <p className="text-[10px] text-slate-500">{d.responsable || 'Mesa General'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {d.totalIniciados}
                      </span>
                      <span className="text-[10px] text-slate-500 block">iniciados</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de Rendimiento de Usuarios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Rendimiento y Actividad de Agentes
              </span>
              <span className="text-xs text-slate-500">
                Top usuarios según expedientes iniciados y pases emitidos
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Agente</th>
                  <th className="px-4 py-3">Dependencia</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-3 py-3 text-center">Iniciados</th>
                  <th className="px-3 py-3 text-center">Pases Emitidos</th>
                  <th className="px-4 py-3 text-center font-bold">Total Movimientos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosRanking.map((u) => {
                  const d = getDepartamento(u.departamentoId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {u.firstName} {u.lastName} ({u.username})
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {d?.codigo} - {d?.nombre}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {u.rolId}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono">{u.iniciados}</td>
                      <td className="px-3 py-3 text-center font-mono">+{u.pasesEmitidos}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-blue-700">
                        {u.totalActividad}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: GESTIÓN DE DEPARTAMENTOS */}
      {activeTab === 'departamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Estructura orgánica funcional de la Repartición 2100.
            </p>
            <button
              id="btn-admin-nuevo-depto"
              onClick={handleOpenNewDepto}
              className="px-3.5 py-2 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Departamento</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F5] text-[#082032] uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nombre del Departamento</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Teléfono / Interno</th>
                  <th className="px-3 py-3 text-center">Nivel</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departamentos.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F3F4F5]/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{d.codigo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{d.responsable || 'A cargo'}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{d.telefonoInterno || 'Int. 2100'}</td>
                    <td className="px-3 py-3 text-center font-mono font-bold">{d.jerarquia}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setDeptoEditing(d);
                          setDeptoCodigo(d.codigo);
                          setDeptoNombre(d.nombre);
                          setDeptoJerarquia(d.jerarquia);
                          setDeptoResponsable(d.responsable || '');
                          setDeptoTel(d.telefonoInterno || 'Int. 2100');
                          setModalDeptoOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-700 rounded transition-colors"
                        title="Editar departamento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: GESTIÓN DE USUARIOS Y ROLES */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Padrón de agentes facultados para tramitación, pases y despacho administrativo.
            </p>
            <button
              id="btn-admin-nuevo-usuario"
              onClick={handleOpenNewUser}
              className="px-3.5 py-2 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Agente / Usuario</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F5] text-[#082032] uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="px-4 py-3">Usuario / Nombre</th>
                  <th className="px-4 py-3">Correo Institucional</th>
                  <th className="px-4 py-3">Dependencia Asignada</th>
                  <th className="px-4 py-3">Rol Asignado</th>
                  <th className="px-3 py-3 text-center">Encargado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => {
                  const d = getDepartamento(u.departamentoId);
                  return (
                    <tr key={u.id} className="hover:bg-[#F3F4F5]/80 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          {u.firstName} {u.lastName}
                        </p>
                        <span className="font-mono text-[11px] text-slate-500">
                          @{u.username}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-slate-800 whitespace-nowrap">
                        {d?.codigo} - {d?.nombre}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            u.rolId === 'superadmin'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : u.rolId === 'admin'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : u.rolId === 'iniciador'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {u.rolId}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {u.esEncargado ? (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Sí
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setUserEditing(u);
                            setUserName(u.username);
                            setUserEmail(u.email);
                            setUserFirstName(u.firstName);
                            setUserLastName(u.lastName);
                            setUserDeptoId(u.departamentoId);
                            setUserRolId(u.rolId);
                            setModalUserOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 rounded transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 4: CONFIGURACIÓN INSTITUCIONAL DE LOGOS Y MEMBRETE (SuperUsuario) */}
      {activeTab === 'logos' && (
        <ConfiguracionInstitucionalPanel />
      )}

      {/* Modal Alta / Edición Departamento */}
      {modalDeptoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {deptoEditing ? 'Editar Departamento' : 'Nuevo Departamento'}
            </h3>

            <form onSubmit={handleSaveDepto} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código Oficial</label>
                <input
                  type="text"
                  required
                  value={deptoCodigo}
                  onChange={(e) => setDeptoCodigo(e.target.value)}
                  placeholder="DPTO-900"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={deptoNombre}
                  onChange={(e) => setDeptoNombre(e.target.value)}
                  placeholder="Dirección de Planificación Estratégica"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Responsable / Encargado</label>
                <input
                  type="text"
                  value={deptoResponsable}
                  onChange={(e) => setDeptoResponsable(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono Interno</label>
                <input
                  type="text"
                  value={deptoTel}
                  onChange={(e) => setDeptoTel(e.target.value)}
                  placeholder="Int. 2109"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalDeptoOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alta / Edición Usuario */}
      {modalUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {userEditing ? 'Editar Agente' : 'Nuevo Agente en Repartición'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    placeholder="Lucas"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder="Pérez"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de Usuario (Username)</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="lperez"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dependencia Asignada</label>
                <select
                  value={userDeptoId}
                  onChange={(e) => setUserDeptoId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.codigo} - {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rol en el Sistema</label>
                <select
                  value={userRolId}
                  onChange={(e) => setUserRolId(e.target.value as TipoRol)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="pase">Pase (Recepción y Envío)</option>
                  <option value="iniciador">Iniciador (Crear y Archivar)</option>
                  <option value="admin">Administrador (Gestión y Pases)</option>
                  <option value="superadmin">Super Administrador (Total)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalUserOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FC4F46] hover:bg-[#e03e36] text-white rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Guardar Agente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
