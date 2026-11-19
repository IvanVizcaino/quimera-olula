import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { FormModelo, MetaModelo } from "@olula/lib/dominio.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ComponentType, ReactNode } from "react";

export type UiProps = FormModelo["uiProps"];

/** Props del formulario de un maestro: en el alta `entidad` no viene. */
export interface PropsCampos<T> {
    uiProps: UiProps;
    entidad?: T;
    /** El campo Código, cuando el formulario lo coloca (`codigoEnCampos`). */
    codigo?: ReactNode;
}

/**
 * Configuración de un maestro de Fiscalidad (código + campos de un .mtd de
 * Eneboo con su .ui). La pantalla, el estado y las llamadas son comunes.
 */
export interface ConfigMaestroFiscal<T extends Entidad & Modelo, N extends Modelo> {
    titulo: string;
    /** "serie", "impuesto"... para los textos de los botones y errores. */
    nombre: string;
    url: string;
    regla: string;
    metaTabla: MetaTabla<T>;
    metaFiltro: MetaFiltro;
    desdeApi: (api: Record<string, unknown>) => T;
    vacio: () => T;
    nuevoVacio: () => N;
    metaEntidad: MetaModelo<T>;
    metaNuevo: MetaModelo<N>;
    nuevoAApi: (nuevo: N) => Record<string, unknown>;
    /** Solo los campos cambiados, con los nombres de la API. */
    cambiosAApi: (previo: T, actual: T) => Record<string, unknown>;
    Campos: ComponentType<PropsCampos<T>>;
    CamposNuevo?: ComponentType<{ uiProps: UiProps; codigo?: ReactNode }>;
    /** El formulario pone el Código donde quiere (p. ej. en la fila de la
     * descripción) en vez de en una fila propia al principio. */
    codigoEnCampos?: boolean;
    /** Texto del aviso al borrar (p. ej. «no se puede borrar si está en uso»). */
    avisoBorrado?: string;
    /** Si el servidor responde 409 al guardar, pregunta esto y repite con
     * `confirmacion.campo: true` (impuestos.qs::comprobarSubcuentaIVA). */
    confirmacion?: { campo: string; pregunta: string };
}

export type EstadoMaestroFiscal = "INICIAL" | "CREANDO";

export type ContextoMaestroFiscal<T extends Entidad> = {
    estado: EstadoMaestroFiscal;
    entidades: ListaActivaEntidades<T>;
};
