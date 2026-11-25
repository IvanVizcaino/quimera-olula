import { FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { fechasIntervalo } from "#/comun/informe_documentos/dominio.ts";
import { formatearNumero } from "@olula/lib/dominio.ts";
import { FormatoHoja, GrupoInformeTareas, ResultadoInformeTareas } from "./diseño.ts";

/** Intervalo -> sus fechas (`codintervalo` y `codintervalorealizacion` de Eneboo). */
export const INTERVALOS_TAREAS: Record<string, [string, string]> = {
    intervalo_prevista: ["fecha_prevista_desde", "fecha_prevista_hasta"],
    intervalo_realizacion: ["fecha_realizacion_desde", "fecha_realizacion_hasta"],
};

/**
 * `gestionIntervalo` del formulario: al elegir un intervalo se rellenan sus fechas (el
 * servidor las vuelve a calcular con la fecha de hoy al lanzar el informe).
 */
export const ajustarInformeTareas = (ficha: FichaInforme, campo: string, hoy: Date = new Date()): FichaInforme => {
    const destino = INTERVALOS_TAREAS[campo];
    if (!destino) return ficha;
    const fechas = fechasIntervalo(String(ficha[campo] ?? ""), hoy);
    if (!fechas) return ficha;
    return { ...ficha, [destino[0]]: fechas[0], [destino[1]]: fechas[1] };
};

/** Tiempo con dos decimales (previsto, real, diferencia y totales). */
export const tiempo = (valor: number): string => formatearNumero(valor, 2);

/** Fecha "AAAA-MM-DD" en dd/mm/aaaa; vacía si no hay. */
export const fechaCorta = (valor: string): string => {
    if (!valor) return "";
    const [a, m, d] = valor.slice(0, 10).split("-");
    return a && m && d ? `${d}/${m}/${a}` : valor;
};

/** Cabecera de un grupo: el centro (con su tipo) o «Sin centro de coste». */
export const tituloGrupo = (grupo: Pick<GrupoInformeTareas, "centroId" | "centro" | "tipoCentroId">): string => {
    if (grupo.centroId === null) return "Sin centro de coste";
    const nombre = grupo.centro ? `${grupo.centroId} · ${grupo.centro}` : grupo.centroId;
    return grupo.tipoCentroId ? `${nombre} (${grupo.tipoCentroId})` : nombre;
};

/** Unidad de los totales: la de las filas si todas tienen la misma; vacía si se mezclan. */
export const unidadComun = (filas: { unidad: string }[]): string => {
    const unidades = new Set(filas.map((f) => f.unidad).filter(Boolean));
    return unidades.size === 1 ? [...unidades][0] : "";
};

/** Línea bajo el título: los criterios y cuántas tareas. */
export const lineaResultado = (resultado: Pick<ResultadoInformeTareas, "subtitulo" | "totalTareas">): string => {
    const n = resultado.totalTareas;
    const tareas = `${formatearNumero(n)} ${n === 1 ? "tarea" : "tareas"}`;
    return resultado.subtitulo ? `${resultado.subtitulo} · ${tareas}` : tareas;
};

/** Nombre del fichero descargado: clave del informe y descripción de la ficha. */
export const nombreFicheroTareas = (
    pestaña: Pick<PestañaInforme, "clave">,
    ficha: Pick<FichaInforme, "descripcion">,
    extension: "pdf" | FormatoHoja
): string => {
    const base = `${pestaña.clave}-${ficha.descripcion || "informe"}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${base}.${extension}`;
};
