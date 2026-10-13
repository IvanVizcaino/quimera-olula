import { MetaModelo } from "@olula/lib/dominio.ts";
import { Composicion, LineaComposicion, NuevaComposicion } from "./diseño.ts";

const pad = (n: number) => String(n).padStart(2, "0");

/** Fecha local `YYYY-MM-DD` (Eneboo rellena la fecha/hora actual en el alta). */
export const fechaHoy = (ahora: Date = new Date()): string =>
    `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;

export const horaAhora = (ahora: Date = new Date()): string =>
    `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;

export const metaNuevaComposicion: MetaModelo<NuevaComposicion> = {
    campos: {
        almacenId: { requerido: true },
        articuloId: { requerido: true },
        cantidad: { requerido: true, validacion: (m) => m.cantidad > 0 },
        fecha: { requerido: true },
        hora: { requerido: true },
    },
};

/** `almacenId`: almacén por defecto de la empresa (Eneboo `valorDefectoEmpresa("codalmacen")`). */
export const composicionNuevaVacia = (almacenId = ""): NuevaComposicion => ({
    almacenId,
    articuloId: "",
    cantidad: 1,
    fecha: fechaHoy(),
    hora: horaAhora(),
});

/** Cabecera editable (las líneas se editan aparte, en la tabla). */
export type CabeceraComposicion = Pick<
    Composicion,
    "almacenId" | "cantidad" | "fecha" | "hora"
>;

export const metaCabeceraComposicion: MetaModelo<CabeceraComposicion> = {
    campos: {
        almacenId: { requerido: true },
        cantidad: { requerido: true, validacion: (m) => m.cantidad > 0 },
        fecha: { requerido: true },
        hora: { requerido: true },
    },
};

export const composicionVacia = (): Composicion => ({
    id: "",
    fecha: "",
    hora: "",
    almacenId: "",
    articuloId: "",
    descripcion: "",
    cantidad: 1,
    usuarioId: "",
    lineas: [],
});

export const lineaComposicionVacia = (almacenId: string): LineaComposicion => ({
    id: "",
    articuloId: "",
    cantidad: 1,
    almacenId,
});

const horaCorta = (hora: string): string => hora.slice(0, 5);

/** Compara cabecera y líneas (ignora segundos de la hora). */
export const lineasModificadas = (
    iniciales: LineaComposicion[],
    actuales: LineaComposicion[],
): boolean => {
    if (iniciales.length !== actuales.length) return true;
    return iniciales.some((l, i) => {
        const a = actuales[i];
        return (
            l.id !== a.id ||
            l.articuloId !== a.articuloId ||
            l.cantidad !== a.cantidad ||
            l.almacenId !== a.almacenId
        );
    });
};

/** Solo las líneas con artículo informado se envían (como el filtro de TabComponentes). */
export const lineasValidas = (lineas: LineaComposicion[]): LineaComposicion[] =>
    lineas.filter((l) => l.articuloId.trim() !== "");

/**
 * Cambios de cabecera respecto al original. Cambiar la cantidad NO recalcula las
 * líneas (como Eneboo): solo `regenerar_lineas` o las líneas enviadas las modifican.
 */
export const cambiosCabecera = (
    original: Composicion,
    actual: CabeceraComposicion,
): Partial<CabeceraComposicion> => {
    const cambios: Partial<CabeceraComposicion> = {};
    if (actual.almacenId !== original.almacenId) cambios.almacenId = actual.almacenId;
    if (actual.cantidad !== original.cantidad) cambios.cantidad = actual.cantidad;
    if (actual.fecha !== original.fecha) cambios.fecha = actual.fecha;
    if (horaCorta(actual.hora) !== horaCorta(original.hora)) cambios.hora = actual.hora;
    return cambios;
};

export const etiquetaComposicion = (c: Composicion): string =>
    `${c.id} - ${c.descripcion || c.articuloId}`;
