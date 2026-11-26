import { FiltroListadoTrabajadores, FormatoHoja, GrupoSeccion } from "./diseño.ts";

export const filtroListadoVacio = (): FiltroListadoTrabajadores => ({ desde: "", hasta: "", seccionId: "" });

/** «Desde» no puede ir después de «hasta» (los códigos se comparan como texto, como el servidor). */
export const motivoFiltroNoValido = (filtro: FiltroListadoTrabajadores): string | null => {
    const desde = filtro.desde.trim();
    const hasta = filtro.hasta.trim();
    return desde && hasta && desde > hasta ? "El trabajador «desde» no puede ir después del trabajador «hasta»" : null;
};

/** Parámetros de la consulta: solo los filtros con valor (y el formato de la hoja). */
export const queryListadoTrabajadores = (filtro: FiltroListadoTrabajadores, formato?: FormatoHoja): string => {
    const params = new URLSearchParams();
    if (filtro.desde.trim()) params.set("desde", filtro.desde.trim());
    if (filtro.hasta.trim()) params.set("hasta", filtro.hasta.trim());
    if (filtro.seccionId.trim()) params.set("seccion_id", filtro.seccionId.trim());
    if (formato) params.set("formato", formato);
    const q = params.toString();
    return q ? `?${q}` : "";
};

/** Cabecera de una sección: código y descripción, o «Sin sección». */
export const tituloSeccion = (grupo: Pick<GrupoSeccion, "seccionId" | "seccion">): string =>
    grupo.seccionId === null
        ? "Sin sección"
        : grupo.seccion
            ? `${grupo.seccionId} · ${grupo.seccion}`
            : grupo.seccionId;

/** «1 trabajador» / «n trabajadores». */
export const textoTotal = (n: number): string => `${n} ${n === 1 ? "trabajador" : "trabajadores"}`;

/** Nombre del fichero descargado (el que da el servidor). */
export const nombreFicheroTrabajadores = (extension: "pdf" | FormatoHoja): string => `trabajadores.${extension}`;
