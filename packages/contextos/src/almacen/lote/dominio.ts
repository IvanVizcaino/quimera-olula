import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { Lote } from "./diseño.ts";

export const ESTADOS_LOTE = [
    { valor: "PTE", descripcion: "Pendiente" },
    { valor: "TERMINADO", descripcion: "Terminado" },
];

/** Píldora del estado del lote: pendiente de recibir o terminado. */
export const etiquetaEstadoLote = (estado: string | null | undefined): EstadoEtiqueta =>
    estado === "TERMINADO"
        ? { texto: "Terminado", tono: "completado" }
        : estado === "PTE"
            ? { texto: "Pendiente", tono: "pendiente" }
            : { texto: estado || "—", tono: "borrador" };

/** Cantidad en formato español (hasta 3 decimales); vacía si no hay. */
export const formatearCantidad = (valor: number | string | null | undefined): string => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(valor);
    if (Number.isNaN(numero)) return String(valor);
    return numero.toLocaleString("es-ES", { maximumFractionDigits: 3 });
};

/** Fecha de la API ("AAAA-MM-DD") en dd/mm/aaaa, sin pasar por `Date` (sin desfases de zona). */
export const fechaDdMmAaaa = (fecha: string | null | undefined): string => {
    if (!fecha) return "";
    const [a, m, d] = fecha.slice(0, 10).split("-");
    return a && m && d ? `${d}/${m}/${a}` : fecha;
};

export const loteVacio = (): Lote => ({
    id: "", sku: "", articulo: "", caducidad: "", enAlmacen: 0, produccion: null,
});

/** "Código · artículo". */
export const tituloLote = (lote: Lote): string =>
    lote.articulo ? `${lote.id} · ${lote.articulo}` : lote.id;

/** Texto del artículo: "referencia - descripción". */
export const textoArticulo = (lote: Pick<Lote, "sku" | "articulo">): string =>
    lote.articulo ? `${lote.sku} - ${lote.articulo}` : lote.sku;

/** Mensaje tras «Revisar lote» o «Revisar todos». */
export const mensajeRevisados = (revisados: number): string =>
    revisados === 1 ? "Se ha revisado 1 lote." : `Se han revisado ${formatearCantidad(revisados)} lotes.`;
