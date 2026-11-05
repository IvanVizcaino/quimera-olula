import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoDashboard, EstadoDashboard } from "../../diseño.ts";
import {
  ajustarConfiguracion,
  alternarCompartido,
  añadirComponente,
  aplicarConfiguracion,
  borrar,
  cambiarDisposicion,
  cambiarNombre,
  cancelarConfiguracion,
  cancelarEdicion,
  cargarDashboard,
  cargarDashboardModulo,
  configurarComponente,
  empezarEdicion,
  guardarEdicion,
  quitarComponente,
} from "./pagina.ts";

/**
 * Página de un dashboard. Se ve (VIENDO) y su propietario lo edita (EDITANDO):
 * los cambios de disposición y de componentes van a un borrador que solo se guarda
 * al pulsar Guardar. CONFIGURANDO abre el formulario de un componente. Se abre por
 * id (`id_cambiado`) o, los de módulo y la Inicio, por clave (`clave_cambiada`).
 */
export const getMaquina: () => Maquina<EstadoDashboard, ContextoDashboard> = () => ({
  CARGANDO: {
    id_cambiado: [cargarDashboard],
    clave_cambiada: [cargarDashboardModulo],
  },

  NO_ENCONTRADO: {
    id_cambiado: [cargarDashboard],
    clave_cambiada: [cargarDashboardModulo],
  },

  VIENDO: {
    id_cambiado: [cargarDashboard],
    clave_cambiada: [cargarDashboardModulo],
    edicion_iniciada: [empezarEdicion],
    compartido_alternado: [alternarCompartido],
    borrado_solicitado: "BORRANDO",
  },

  EDITANDO: {
    id_cambiado: [cargarDashboard],
    clave_cambiada: [cargarDashboardModulo],
    nombre_cambiado: [cambiarNombre],
    disposicion_cambiada: [cambiarDisposicion],
    componente_añadido: [añadirComponente],
    componente_configurado: [configurarComponente],
    componente_quitado: [quitarComponente],
    edicion_guardada: [guardarEdicion],
    edicion_cancelada: [cancelarEdicion],
  },

  CONFIGURANDO: {
    configuracion_aplicada: [aplicarConfiguracion],
    configuracion_ajustada: [ajustarConfiguracion],
    configuracion_cancelada: [cancelarConfiguracion],
  },

  BORRANDO: {
    borrado_confirmado: [borrar],
    borrado_cancelado: "VIENDO",
  },
});
