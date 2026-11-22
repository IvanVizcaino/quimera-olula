import { ConfigEmpresa } from "./diseño.ts";

/** Sin configurar no hay grupo: en el escritorio es obligatorio y no tiene valor por defecto. */
export const configEmpresaPorDefecto: ConfigEmpresa = { grupoIvaNegocioId: "" };

/** G.IVA Negocio es del IVA de NAV: sin el plugin iva_nav, o si la BD no tiene la
 *  columna (facturac_general.codgrupoivaneg), ni se muestra ni es obligatorio. */
export const grupoIvaNegocioVisible = (config: ConfigEmpresa, estadoIvaNav: string): boolean =>
    estadoIvaNav !== "inactivo" && !config.noDisponibles?.includes("grupo_iva_negocio_id");

export const configEmpresaValida = (config: ConfigEmpresa, estadoIvaNav = ""): boolean =>
    !grupoIvaNegocioVisible(config, estadoIvaNav) || !!config.grupoIvaNegocioId;
