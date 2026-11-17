/**
 * Lo que comparten las fichas de los libros de I.V.A. (Eneboo
 * `co_i_facturasemi` y `co_i_facturasrec`): el filtro, las opciones de
 * presentación y las filas del resultado.
 *
 * Las fichas se guardan planas en cada módulo, igual que en el formulario del
 * ERP; estos tipos son los del borde con la API, que los recibe anidados.
 */
import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { aBooleano, conChecks } from "./checks_informe.ts";

export interface FiltroIva {
    todos: boolean;
    /** `i_co__partidas_iva` (double 2,2): número libre, `null` si vacío. */
    porcentaje: number | null;
    conIva: boolean;
}

export interface PresentacionIva {
    mostrarTotalFactura: boolean;
    mostrarNif: boolean;
    mostrarDocumento: boolean;
    mostrarAsiento: boolean;
    numeracionAutomatica: boolean;
    numeroDesde: string;
}

export interface FiltroIvaApi {
    todos: boolean;
    porcentaje: number | null;
    con_iva: boolean;
}

export interface PresentacionIvaApi {
    mostrar_total_factura: boolean;
    mostrar_nif: boolean;
    mostrar_documento: boolean;
    mostrar_asiento: boolean;
    numeracion_automatica: boolean;
    numero_desde: number;
}

export interface FilaLibroIva extends Entidad {
    id: string;
    partidaId: number;
    fechaAsiento: Date;
    asientoNumero: number;
    codigoSerie: string | null;
    numeroFactura: string | null;
    codigoFactura: string | null;
    nombreTercero: string | null;
    cifNif: string | null;
    codigoContrapartida: string | null;
    nombreContrapartida: string | null;
    baseImponible: number;
    cuotaIva: number;
    porcentajeIva: number;
    porcentajeRecargo: number;
    documento: string | null;
}

export interface FilaLibroIvaApi {
    partida_id: number;
    fecha_asiento: string;
    asiento_numero: number;
    codigo_serie: string | null;
    numero_factura: string | null;
    codigo_factura: string | null;
    nombre_tercero: string | null;
    cif_nif: string | null;
    codigo_contrapartida: string | null;
    nombre_contrapartida: string | null;
    base_imponible: number;
    cuota_iva: number;
    porcentaje_iva: number;
    porcentaje_recargo: number;
    documento: string | null;
}

export interface ResultadoLibroIva {
    datos: FilaLibroIva[];
    total: number;
}

export interface ResultadoLibroIvaApi {
    datos: FilaLibroIvaApi[];
    total: number;
}

/** Campos `bool` de `co_i_facturasemi`/`co_i_facturasrec` que se editan
 * como casilla. */
export const CHECKS_LIBRO_IVA = [
    "todos",
    "conIva",
    "mostrarTotalFactura",
    "mostrarNif",
    "mostrarDocumento",
    "mostrarAsiento",
    "numeracionAutomatica",
] as const;

/** Sin «todos los tipos» hay que indicar el porcentaje (el servidor lo
 * exige igual que el formulario de Eneboo). */
export const porcentajeRequerido = (modelo: Modelo): boolean =>
    !aBooleano(modelo.todos);

/** `bufferChanged` de `co_i_facturasemi.qs`/`co_i_facturasrec.qs`: al marcar
 * «todos los tipos» el % de I.V.A. pasa a 0 y se deshabilita; al desmarcar se
 * habilita con lo que tenga. */
export const porcentajeSegunTodos = <T extends Modelo>(
    modelo: T,
    campo: string
): T =>
    campo === "todos" && aBooleano(modelo.todos) && modelo.porcentaje !== 0
        ? { ...modelo, porcentaje: 0 }
        : modelo;

/** Meta común del alta y de la ficha de los dos libros de I.V.A. */
export const metaFormularioLibroIva = <T extends Modelo>(): MetaModelo<T> =>
    conChecks<T>(
        {
            campos: {
                descripcion: { requerido: true },
                ejercicioId: { requerido: true },
                porcentaje: {
                    tipo: "decimal",
                    decimales: 2,
                    requerido: porcentajeRequerido,
                },
            },
        },
        CHECKS_LIBRO_IVA,
        porcentajeSegunTodos
    );

const numeroATexto = (valor: number | null): string =>
    valor === null || valor === undefined ? "" : String(valor);

/** Tolera el texto que pudiera quedar de una ficha antigua o del input. */
const porcentajeAApi = (valor: unknown): number | null => {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
};

const textoANumero = (valor: string): number | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : Number(limpio);
};

export const filtroIvaVacio = (): FiltroIva => ({
    todos: true,
    porcentaje: null,
    conIva: false,
});

export const presentacionIvaVacia = (): PresentacionIva => ({
    mostrarTotalFactura: true,
    mostrarNif: true,
    mostrarDocumento: true,
    mostrarAsiento: true,
    numeracionAutomatica: false,
    numeroDesde: "1",
});

export const filtroDesdeApi = (api: FiltroIvaApi): FiltroIva => ({
    todos: api.todos,
    porcentaje: api.porcentaje ?? null,
    conIva: api.con_iva,
});

export const presentacionDesdeApi = (
    api: PresentacionIvaApi
): PresentacionIva => ({
    mostrarTotalFactura: api.mostrar_total_factura,
    mostrarNif: api.mostrar_nif,
    mostrarDocumento: api.mostrar_documento,
    mostrarAsiento: api.mostrar_asiento,
    numeracionAutomatica: api.numeracion_automatica,
    numeroDesde: numeroATexto(api.numero_desde),
});

/** Con «todos los tipos» marcado el porcentaje viaja a 0, que es lo que
 * deja Eneboo en `i_co__partidas_iva` al marcar el check (el filtro lo
 * ignora). */
export const filtroAApi = (filtro: FiltroIva): FiltroIvaApi => ({
    todos: filtro.todos,
    porcentaje: filtro.todos ? 0 : porcentajeAApi(filtro.porcentaje),
    con_iva: filtro.conIva,
});

export const presentacionAApi = (
    presentacion: PresentacionIva
): PresentacionIvaApi => ({
    mostrar_total_factura: presentacion.mostrarTotalFactura,
    mostrar_nif: presentacion.mostrarNif,
    mostrar_documento: presentacion.mostrarDocumento,
    mostrar_asiento: presentacion.mostrarAsiento,
    numeracion_automatica: presentacion.numeracionAutomatica,
    numero_desde: textoANumero(presentacion.numeroDesde) ?? 1,
});

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

export const filaDesdeApi = (api: FilaLibroIvaApi): FilaLibroIva => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    fechaAsiento: fechaDesdeApi(api.fecha_asiento),
    asientoNumero: api.asiento_numero,
    codigoSerie: api.codigo_serie,
    numeroFactura: api.numero_factura,
    codigoFactura: api.codigo_factura,
    nombreTercero: api.nombre_tercero,
    cifNif: api.cif_nif,
    codigoContrapartida: api.codigo_contrapartida,
    nombreContrapartida: api.nombre_contrapartida,
    baseImponible: api.base_imponible,
    cuotaIva: api.cuota_iva,
    porcentajeIva: api.porcentaje_iva,
    porcentajeRecargo: api.porcentaje_recargo,
    documento: api.documento,
});

export const resultadoLibroIvaDesdeApi = (
    api: ResultadoLibroIvaApi
): ResultadoLibroIva => ({
    datos: api.datos.map(filaDesdeApi),
    total: api.total,
});
