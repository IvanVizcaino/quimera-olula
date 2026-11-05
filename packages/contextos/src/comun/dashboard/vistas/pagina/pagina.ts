import { compactar } from "@olula/componentes/rejilla/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import {
  ComponenteDashboard,
  ContextoDashboard,
  Dashboard,
  EstadoDashboard,
  TipoComponente,
} from "../../diseño.ts";
import { dashboardPorDefecto, nuevoComponente, sustituirComponente } from "../../dominio.ts";
import {
  borrarDashboard,
  cambiarDashboard,
  crearDashboard,
  getDashboard,
  getDashboards,
  getRecursos,
} from "../../infraestructura.ts";
import { DASHBOARDS_POR_DEFECTO } from "../../por_defecto.ts";

type ProcesarPagina = ProcesarContexto<EstadoDashboard, ContextoDashboard>;

export const contextoDashboardInicial: ContextoDashboard = {
  estado: "CARGANDO",
  dashboard: null,
  nombre: "",
  borrador: [],
  configurando: null,
};

const conDashboard = (ctx: ContextoDashboard, dashboard: Dashboard): ContextoDashboard => ({
  ...ctx,
  dashboard,
  nombre: dashboard.nombre,
  borrador: dashboard.componentes,
  configurando: null,
});

export const cargarDashboard: ProcesarPagina = async (ctx, payload) => {
  const { id, editar } = payload as { id: string; editar?: boolean };
  try {
    const dashboard = await getDashboard(id);
    return {
      ...conDashboard(ctx, dashboard),
      estado: editar && dashboard.esPropio ? "EDITANDO" : "VIENDO",
    };
  } catch {
    return { ...contextoDashboardInicial, estado: "NO_ENCONTRADO" };
  }
};

/** El de código, con solo los componentes que el usuario puede ver. */
const porDefecto = async (clave: string): Promise<Dashboard | null> => {
  const definicion = DASHBOARDS_POR_DEFECTO[clave];
  if (!definicion) return null;
  const recursos = await getRecursos();
  return dashboardPorDefecto(clave, definicion, recursos.map((r) => r.id));
};

/** Dashboard de módulo o la Inicio: la versión del usuario si la tiene; si no, el de por defecto. */
export const cargarDashboardModulo: ProcesarPagina = async (ctx, payload) => {
  const { clave, editar } = payload as { clave: string; editar?: boolean };
  try {
    const propio = (await getDashboards()).find((d) => d.esPropio && d.clave === clave);
    const dashboard = propio ? await getDashboard(propio.id) : await porDefecto(clave);
    if (!dashboard) return { ...contextoDashboardInicial, estado: "NO_ENCONTRADO" };
    return { ...conDashboard(ctx, dashboard), estado: editar ? "EDITANDO" : "VIENDO" };
  } catch {
    // Sin servidor de dashboards, al menos el de por defecto (de solo lectura).
    const dashboard = await porDefecto(clave);
    return dashboard
      ? { ...conDashboard(ctx, { ...dashboard, esPropio: false }), estado: "VIENDO" }
      : { ...contextoDashboardInicial, estado: "NO_ENCONTRADO" };
  }
};

export const empezarEdicion: ProcesarPagina = async (ctx) =>
  ctx.dashboard ? { ...conDashboard(ctx, ctx.dashboard), estado: "EDITANDO" } : ctx;

export const cancelarEdicion: ProcesarPagina = async (ctx) =>
  ctx.dashboard ? { ...conDashboard(ctx, ctx.dashboard), estado: "VIENDO" } : ctx;

export const cambiarNombre: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  nombre: payload as string,
});

export const cambiarDisposicion: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  borrador: payload as ComponenteDashboard[],
});

export const añadirComponente: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  estado: "CONFIGURANDO",
  configurando: nuevoComponente(payload as TipoComponente, ctx.borrador),
});

export const configurarComponente: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  estado: "CONFIGURANDO",
  configurando: ctx.borrador.find((c) => c.id === payload) ?? null,
});

/** Si el componente cambió de tamaño, los demás se recolocan sin solaparse. */
export const aplicarConfiguracion: ProcesarPagina = async (ctx, payload) => {
  const componente = payload as ComponenteDashboard;
  const lista = sustituirComponente(ctx.borrador, componente);
  return {
    ...ctx,
    estado: "EDITANDO",
    borrador: compactar(compactar(lista, componente.id)),
    configurando: null,
  };
};

/** De la propuesta de la IA al formulario completo, para retocarla. */
export const ajustarConfiguracion: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  configurando: payload as ComponenteDashboard,
});

export const cancelarConfiguracion: ProcesarPagina = async (ctx) => ({
  ...ctx,
  estado: "EDITANDO",
  configurando: null,
});

/** Al quitar uno, los de debajo suben a ocupar su hueco. */
export const quitarComponente: ProcesarPagina = async (ctx, payload) => ({
  ...ctx,
  borrador: compactar(ctx.borrador.filter((c) => c.id !== payload)),
});

/** Guarda nombre y componentes y recarga (el servidor devuelve también los ocultos). */
export const guardarEdicion: ProcesarPagina = async (ctx) => {
  const { dashboard } = ctx;
  if (!dashboard) return ctx;
  const nombre = ctx.nombre.trim() || dashboard.nombre;
  // El de por defecto aún no existe en el servidor: guardar crea la versión del usuario.
  const id = dashboard.id
    ? (await cambiarDashboard(dashboard.id, { nombre, componentes: ctx.borrador }), dashboard.id)
    : await crearDashboard({ nombre, clave: dashboard.clave, componentes: ctx.borrador });
  return { ...conDashboard(ctx, await getDashboard(id)), estado: "VIENDO" };
};

export const alternarCompartido: ProcesarPagina = async (ctx) => {
  if (!ctx.dashboard) return ctx;
  const compartido = !ctx.dashboard.compartido;
  await cambiarDashboard(ctx.dashboard.id, { compartido });
  return { ...ctx, dashboard: { ...ctx.dashboard, compartido } };
};

/**
 * Borra el dashboard. Si era la versión del usuario de uno de módulo, «restaurar por
 * defecto»: vuelve a verse el de código. Si no, se avisa para salir de la página.
 */
export const borrar: ProcesarPagina = async (ctx) => {
  const { dashboard } = ctx;
  if (!dashboard) return ctx;
  if (dashboard.id) await borrarDashboard(dashboard.id);
  const restaurado = dashboard.clave ? await porDefecto(dashboard.clave) : null;
  if (restaurado) return { ...conDashboard(ctx, restaurado), estado: "VIENDO" };
  return [{ ...ctx, estado: "VIENDO" }, [["dashboard_borrado"]]];
};
