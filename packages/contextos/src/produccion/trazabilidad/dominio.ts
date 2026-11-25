import { formatearCantidad } from "../orden/dominio.ts";
import {
    ConsumoLote,
    EnlaceArbol,
    FilaArbol,
    LoteTrazado,
    MovimientoLote,
    Trazabilidad,
} from "./diseño.ts";

const TIPOS: Record<string, string> = {
    albaran_compra: "Albarán de compra",
    factura_compra: "Factura de compra",
    albaran_venta: "Albarán de venta",
    factura_venta: "Factura de venta",
    produccion: "Producción",
    transferencia: "Transferencia",
    otro: "Otro",
};

/** «Albarán de compra», «Producción»... */
export const textoTipoMovimientoLote = (tipo: string): string => TIPOS[tipo] ?? tipo;

/** Cantidad con su signo en formato español: "+1.250,5", "−20", "0". */
export const cantidadConSigno = (cantidad: number): string => {
    if (!cantidad) return "0";
    const valor = formatearCantidad(Math.abs(cantidad));
    return cantidad > 0 ? `+${valor}` : `−${valor}`;
};

/**
 * El documento del movimiento: el código del albarán o la factura; en producción, la orden (y el
 * lote producido si es un consumo); en una transferencia, su id; si no, el concepto.
 */
export const textoDocumentoMovimiento = (m: MovimientoLote): string => {
    if (m.codigo) return m.codigo;
    if (m.tipo === "produccion") {
        const orden = m.ordenId ? `Orden ${m.ordenId}` : "";
        const producido = !m.entrada && m.loteProducidoId ? `para el lote ${m.loteProducidoId}` : "";
        return [orden, producido].filter(Boolean).join(" ") || m.concepto;
    }
    if (m.tipo === "transferencia" && m.documentoId) return `Transferencia ${m.documentoId}`;
    return m.concepto || m.documentoId;
};

/** El tercero del movimiento: "código - nombre", el nombre o el código. */
export const textoTercero = (m: Pick<MovimientoLote, "terceroId" | "tercero">): string =>
    m.tercero && m.terceroId ? `${m.terceroId} - ${m.tercero}` : m.tercero || m.terceroId;

/** "referencia - descripción" o la referencia. */
export const textoArticuloTrazado = (l: { articuloId: string; articulo: string }): string =>
    l.articulo ? `${l.articuloId} - ${l.articulo}` : l.articuloId;

const sinRepetir = (valores: string[]): string[] => [...new Set(valores.filter(Boolean))];

/** Los consumos que unen un lote con un hijo, sumados. */
export const enlaceDeConsumos = (consumos: ConsumoLote[]): EnlaceArbol => ({
    cantidad: consumos.reduce((total, c) => total + c.cantidad, 0),
    tareas: sinRepetir(consumos.map((c) => c.tarea || c.tareaId)),
    ordenes: sinRepetir(consumos.map((c) => c.ordenId)),
    fecha: consumos.map((c) => c.fecha).filter(Boolean).sort()[0] ?? "",
});

/** Agrupa conservando el orden de la primera aparición. */
const agrupar = <T,>(lista: T[], clave: (t: T) => string): [string, T[]][] => {
    const grupos = new Map<string, T[]>();
    for (const elemento of lista) {
        const k = clave(elemento);
        grupos.set(k, [...(grupos.get(k) ?? []), elemento]);
    }
    return [...grupos.entries()];
};

/**
 * El árbol de la trazabilidad como lista indentada, en profundidad desde el lote consultado.
 * Hacia atrás los hijos de un lote son los lotes que consumió (`consumos[].loteId`; los
 * componentes sin lote van como hojas); hacia delante, los lotes que se fabricaron con él
 * (`consumos[].loteProducidoId`). Varios consumos del mismo lote (tramos) se suman en una fila.
 * Un lote que ya ha salido se marca `repetido` y no se vuelve a abrir.
 */
export const filasArbol = (trazabilidad: Trazabilidad): FilaArbol[] => {
    const atras = trazabilidad.sentido === "atras";
    const porId = new Map(trazabilidad.lotes.map((l) => [l.loteId, l]));
    const vistos = new Set<string>();
    const filas: FilaArbol[] = [];

    const visitar = (loteId: string, profundidad: number, enlace: EnlaceArbol | null, ruta: string) => {
        const lote = porId.get(loteId) ?? null;
        const repetido = vistos.has(loteId);
        filas.push({ clave: `${ruta}/${loteId}`, profundidad, loteId, lote, sinLote: null, enlace, repetido });
        if (repetido || !lote) return;
        vistos.add(loteId);

        const conLote = lote.consumos.filter((c) => (atras ? c.loteId : c.loteProducidoId));
        for (const [hijo, consumos] of agrupar(conLote, (c) => (atras ? c.loteId : c.loteProducidoId))) {
            visitar(hijo, profundidad + 1, enlaceDeConsumos(consumos), `${ruta}/${loteId}`);
        }
        if (!atras) return;
        const sinLote = lote.consumos.filter((c) => !c.loteId);
        for (const [articuloId, consumos] of agrupar(sinLote, (c) => c.articuloId)) {
            filas.push({
                clave: `${ruta}/${loteId}/~${articuloId}`,
                profundidad: profundidad + 1,
                loteId: "",
                lote: null,
                sinLote: { articuloId, articulo: consumos[0].articulo },
                enlace: enlaceDeConsumos(consumos),
                repetido: false,
            });
        }
    };

    visitar(trazabilidad.loteId, 0, null, "");
    return filas;
};

/** Lotes del recorrido sin contar el consultado. */
export const lotesRelacionados = (trazabilidad: Trazabilidad): LoteTrazado[] =>
    trazabilidad.lotes.filter((l) => l.loteId !== trazabilidad.loteId);

/** Texto del enlace con el padre: "consumo 12,5 en Tejer, Acabar". */
export const textoEnlace = (enlace: EnlaceArbol): string =>
    `consumo ${formatearCantidad(enlace.cantidad)}${enlace.tareas.length ? ` en ${enlace.tareas.join(", ")}` : ""}`;

/** Mensaje de un error al leer la trazabilidad: si el lote no existe (404), se dice; si no, `porDefecto`. */
export const textoErrorLectura = (error: unknown, porDefecto: string): string =>
    (error as { estado?: number } | null)?.estado === 404 ? "El lote no existe." : porDefecto;
