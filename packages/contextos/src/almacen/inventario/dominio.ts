import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    Inventario,
    LineaInventario,
    NuevaLineaInventario,
    NuevoInventario,
} from "./diseño.ts";

export const metaNuevoInventario: MetaModelo<NuevoInventario> = {
    campos: {
        id: { requerido: true, minimo: 1 },
        almacenId: { requerido: true },
        fecha: { requerido: true },
        observaciones: { requerido: false },
    },
};

export const metaNuevaLineaInventario: MetaModelo<NuevaLineaInventario> = {
    campos: {
        referencia: { requerido: true },
        cantidadFin: { requerido: true },
        codlote: { requerido: false },
    },
};

export const inventarioVacio = (): Inventario => ({
    id: "",
    almacenId: "",
    fecha: new Date(),
    hora: null,
    observaciones: "",
    cerrado: false,
});

export const nuevoInventarioVacio = (): NuevoInventario => ({
    id: "",
    almacenId: "",
    fecha: new Date(),
    observaciones: "",
});

export const nuevaLineaInventarioVacia = (): NuevaLineaInventario => ({
    referencia: "",
    cantidadFin: 0,
    codlote: "",
});

/** Diferencia recuento − stock al crear la línea (cantidad ini). */
export const diferenciaLineaInventario = (linea: LineaInventario): number =>
    linea.cantidadFin - linea.cantidadIni;

/** Inventario abierto: se pueden añadir líneas, CSV, regularizar, etc. */
export const inventarioEditable = (inv: Pick<Inventario, "cerrado">): boolean => !inv.cerrado;

export const etiquetaInventario = (inv: Inventario | { id: string; almacenId: string }): string =>
    `${inv.id} (${inv.almacenId})`;
