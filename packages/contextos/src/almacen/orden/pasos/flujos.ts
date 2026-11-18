// Flujos de lectura: combinaciones válidas de pasos de pick y drop que se
// ofrecen al crear una orden o una línea a mano, con la explicación de lo que
// hará el operario.
import { LineaOrdenAlmacen, OrdenAlmacen, TipoOrden } from "../diseño.ts";

export type CampoFlujo = "ubicacionOrigen" | "cajaOrigen" | "paletOrigen" | "ubicacionDestino" | "cajaDestino";
export type UsoCampo = "requerido" | "opcional";

export interface Flujo {
    codigo: string;
    tipo: TipoOrden;
    nombre: string;
    explicacion: string;
    pasosPick: string | null;
    pasosDrop: string | null;
    /** Otros códigos de pick que también corresponden a este flujo. */
    pasosPickAlternativos?: string[];
    /** La línea se crea a partir de un palé (crea las cajas etiqueta). */
    palet?: true;
    campos: Partial<Record<CampoFlujo, UsoCampo>>;
}

export const FLUJOS: Flujo[] = [
    {
        codigo: "TRASPASO_SIN_PICK",
        tipo: "TRASPASO",
        nombre: "Sin pick (directo)",
        explicacion:
            "Un solo paso en destino: lee el SKU o el lote, indica la cantidad y lee la ubicación (queda suelto) " +
            "o la caja donde lo dejas. El material sale suelto de la ubicación origen de la línea.",
        pasosPick: null,
        pasosDrop: "SKU-CANTIDAD",
        campos: { ubicacionOrigen: "requerido", ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "TRASPASO_CAJAS",
        tipo: "TRASPASO",
        nombre: "Cajas completas",
        explicacion:
            "Pick: en origen lee cada caja; se recoge entera. Drop: en destino lee las cajas (una o varias) " +
            "y la ubicación donde quedan; se mueven con su contenido.",
        pasosPick: "CAJAS",
        pasosDrop: "CAJAS-UBICACION",
        campos: { ubicacionOrigen: "opcional", cajaOrigen: "opcional", ubicacionDestino: "requerido" },
    },
    {
        codigo: "TRASPASO_MATERIAL",
        tipo: "TRASPASO",
        nombre: "Material de caja o suelto",
        explicacion:
            "Pick: lee la caja de la que sacas material o, si está suelto, el SKU o lote (se coge lo pendiente, " +
            "hasta el stock suelto). Drop: en destino lee el SKU o lote, la cantidad y la ubicación o caja.",
        pasosPick: "SKU_CAJA",
        pasosDrop: "SKU-CANTIDAD",
        campos: {
            ubicacionOrigen: "requerido", cajaOrigen: "opcional",
            ubicacionDestino: "requerido", cajaDestino: "opcional",
        },
    },
    {
        codigo: "TRASPASO_PALET",
        tipo: "TRASPASO",
        nombre: "Palé → cajas etiqueta",
        explicacion:
            "Se crean las cajas etiqueta del palé para la cantidad. Pick: lee el lote (si el artículo va por " +
            "lotes) o el palé, y después cada caja etiqueta que llenas. Drop: lee las cajas etiqueta y la " +
            "ubicación destino.",
        pasosPick: "LOTE-CAJAS",
        pasosPickAlternativos: ["CAJA-CAJAS"],
        pasosDrop: "CAJAS-UBICACION",
        palet: true,
        campos: { paletOrigen: "requerido", ubicacionDestino: "requerido" },
    },
    {
        codigo: "ENTRADA_SUELTO",
        tipo: "ENTRADA",
        nombre: "Material suelto",
        explicacion:
            "Lee el SKU o el lote, la cantidad y la ubicación (queda suelto) o la caja donde lo dejas.",
        pasosPick: null,
        pasosDrop: "SKU-CANTIDAD",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "ENTRADA_CAJAS",
        tipo: "ENTRADA",
        nombre: "Cajas",
        explicacion:
            "Lee cada caja de destino ya creada; se registra su capacidad. También admite leer un palé entero.",
        pasosPick: null,
        pasosDrop: "CAJAS",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "ENTRADA_PALET",
        tipo: "ENTRADA",
        nombre: "Palé",
        explicacion: "Lee el palé y se registra todo su contenido.",
        pasosPick: null,
        pasosDrop: "PALET",
        campos: { ubicacionDestino: "requerido", cajaDestino: "opcional" },
    },
    {
        codigo: "SALIDA_MATERIAL",
        tipo: "SALIDA",
        nombre: "Material de caja o suelto",
        explicacion:
            "Lee la caja de la que sacas material o el SKU/lote si está suelto; lo leído sale de la ubicación.",
        pasosPick: "SKU_CAJA",
        pasosDrop: null,
        campos: { ubicacionOrigen: "requerido", cajaOrigen: "opcional" },
    },
];

export const flujosDeTipo = (tipo: string): Flujo[] => FLUJOS.filter((f) => f.tipo === tipo);

export const flujoPorCodigo = (codigo: string | null): Flujo | null =>
    FLUJOS.find((f) => f.codigo === codigo) ?? null;

/** Flujo al que corresponden unos pasos de pick y drop, o null si no hay ninguno. */
export const flujoDePasos = (tipo: string, pick: string | null, drop: string | null): Flujo | null =>
    flujosDeTipo(tipo).find(
        (f) =>
            (f.pasosPick === pick || (!!pick && !!f.pasosPickAlternativos?.includes(pick))) &&
            f.pasosDrop === drop
    ) ?? null;

const flujoDeLinea = (linea: LineaOrdenAlmacen, tipo: string) =>
    flujoDePasos(tipo, linea.pasosPick, linea.pasosDrop);

/**
 * Flujo con el que se preselecciona una línea nueva: el de la cabecera; si la
 * cabecera no tiene (líneas con pasos distintos), el de la última línea; si
 * tampoco, el primero del tipo de orden.
 */
export const flujoPorDefecto = (orden: OrdenAlmacen): Flujo | null => {
    const deCabecera = orden.pasosPick || orden.pasosDrop
        ? flujoDePasos(orden.tipo, orden.pasosPick, orden.pasosDrop)
        : null;
    const ultima = orden.lineas[orden.lineas.length - 1];
    return deCabecera ?? (ultima ? flujoDeLinea(ultima, orden.tipo) : null) ?? flujosDeTipo(orden.tipo)[0] ?? null;
};

export interface DatosLineaFlujo {
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
}

const NOMBRE_CAMPO: Record<CampoFlujo, string> = {
    ubicacionOrigen: "ubicación origen",
    cajaOrigen: "caja origen",
    paletOrigen: "palé origen",
    ubicacionDestino: "ubicación destino",
    cajaDestino: "caja destino",
};

/** Campos requeridos por el flujo que faltan en la línea. */
export const camposPendientes = (flujo: Flujo, linea: DatosLineaFlujo): string[] => {
    const valor: Record<CampoFlujo, string | null> = {
        ubicacionOrigen: linea.idUbicacionOrigen,
        cajaOrigen: linea.idCajaOrigen,
        paletOrigen: linea.idCajaOrigen,
        ubicacionDestino: linea.idUbicacionDestino,
        cajaDestino: null,
    };
    return (Object.entries(flujo.campos) as [CampoFlujo, UsoCampo][])
        .filter(([campo, uso]) => uso === "requerido" && !valor[campo])
        .map(([campo]) => NOMBRE_CAMPO[campo]);
};
