import { ConfigEmpresa } from "./diseño.ts";

/** Sin configurar no hay grupo: en el escritorio es obligatorio y no tiene valor por defecto. */
export const configEmpresaPorDefecto: ConfigEmpresa = { grupoIvaNegocioId: "" };

export const configEmpresaValida = (config: ConfigEmpresa): boolean => !!config.grupoIvaNegocioId;
