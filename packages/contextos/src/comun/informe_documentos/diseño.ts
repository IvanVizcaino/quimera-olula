import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";
import { UiProps } from "@olula/lib/useModelo.ts";
import { ComponentType } from "react";

/**
 * Informes de documentos (fichas `i_*` de Eneboo: `i_presupuestoscli`,
 * `i_pedidoscli`… y las de compras). Cada pestaña de la pantalla de informes
 * es una `PestañaInforme`: dónde está su API, qué criterios tiene y cómo se
 * pintan. El resto (maestro, ficha con Criterios/Resultado, cálculo y PDF) es
 * común.
 *
 * Los criterios se guardan en el modelo con el nombre de la API (snake_case):
 * son dinámicos por pestaña y así no hay que mapear campo a campo.
 */

export type TipoCampoInforme =
    | "texto"
    | "fecha"
    | "casilla"
    | "opciones"
    | "decimal"
    | "entero"
    /** Un control propio de la pestaña (p. ej. el selector de cliente). */
    | "propio";

export type OpcionCampoInforme = {
    valor: string;
    descripcion: string;
    [dato: string]: unknown;
};

export type PropsControlInforme = UiProps & { label: string };

export interface CampoInforme {
    /** Nombre del criterio en la API. */
    id: string;
    label: string;
    tipo: TipoCampoInforme;
    opciones?: OpcionCampoInforme[];
    /** Para `tipo: "propio"`. */
    Control?: ComponentType<PropsControlInforme>;
    /** Se edita solo si se cumple (p. ej. importes con «Filtrar por importe»). */
    activo?: (ficha: FichaInforme) => boolean;
}

export type ValorCriterio = string | boolean;

export type FichaInforme = Entidad & {
    id: string;
    descripcion: string;
    [criterio: string]: ValorCriterio;
};

/** `resumen_lineas`: «Resumen por líneas» de los pedidos de proveedor. */
export type ModoInforme = "detalle" | "resumen" | "resumen_lineas";

/** Un botón «Calcular …» de la pestaña Resultado. */
export interface ModoCalculo {
    modo: ModoInforme;
    etiqueta: string;
}

export interface PestañaInforme {
    /** Clave de la pestaña en la API (`/ventas/informe/<clave>`). */
    clave: string;
    titulo: string;
    /** Base de la API de la pestaña, p. ej. `/ventas/informe/presupuestos`. */
    url: string;
    /** Regla con la que se ve la pestaña. */
    regla: string;
    /** Criterios por filas, como en el formulario de Eneboo. */
    filas: CampoInforme[][];
    /** Valores con los que arranca el alta (los `<default>` del `.mtd`). */
    inicial: Record<string, ValorCriterio>;
    /** Reglas del formulario al cambiar un campo (`bufferChanged`). */
    ajustar?: (ficha: FichaInforme, campo: string) => FichaInforme;
    /** Botones de cálculo; por defecto «Calcular detalle» y «Calcular resumen». */
    modos?: ModoCalculo[];
}

export type TipoColumnaResultado =
    | "texto"
    | "fecha"
    | "moneda"
    | "cantidad"
    | "entero";

export interface ColumnaResultado {
    id: string;
    cabecera: string;
    tipo: TipoColumnaResultado;
}

export type ValorCelda = string | number | null;

export interface FilaResultado {
    tipo: "documento" | "total";
    celdas: ValorCelda[];
    lineas: ValorCelda[][];
}

export interface ResultadoInforme {
    modo: ModoInforme;
    titulo: string;
    columnas: ColumnaResultado[];
    columnasLineas: ColumnaResultado[];
    filas: FilaResultado[];
    totalDocumentos: number;
}

export type GetFichasInforme = (
    pestaña: PestañaInforme,
    criteria: Criteria
) => RespuestaLista<FichaInforme>;
