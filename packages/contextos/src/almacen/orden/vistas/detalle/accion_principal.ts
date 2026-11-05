import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";

export type AccionPrincipalData = {
    label: string;
    instruccion: string;
    onClick: () => void;
};

type Handlers = {
    emitirPickSolicitado: () => void;
    emitirDropSolicitado: () => void;
    emitirColocacionSolicitada: () => void;
};

export const INSTRUCCIONES_DROP: Record<string, string> = {
    "CAJAS-UBICACION": "lee la caja y la ubicación de destino",
    "SKU_LOTE-CANTIDAD": "lee el SKU, lote y cantidad",
    "SKU-UBICACION": "lee el SKU y la ubicación de destino",
    "CAJA-CAJAS": "lee la caja origen y la nueva caja",
    "LOTE-CANTIDAD": "lee el lote y la cantidad",
    "PALET": "lee el palet",
    "CAJAS": "lee la caja",
};

export const INSTRUCCIONES_PICK: Record<string, string> = {
    "LOTE-CAJAS": "lee el lote de la subcaja y la nueva caja",
    "CAJA-CAJAS": "lee la caja origen y la nueva caja",
    "CAJAS": "lee la caja",
};

const isPickCompleta = (linea: LineaOrdenAlmacen, pasosPickCabecera: string | null): boolean => {
    const pick = pasosPickCabecera ?? linea.pasosPick;
    return !pick || (linea.cantidadPick ?? 0) >= linea.cantidadPrevista;
};

const isDropCompleta = (linea: LineaOrdenAlmacen): boolean =>
    (linea.cantidadReal ?? 0) >= linea.cantidadPrevista;

const agruparPorUbicacion = (
    lineas: LineaOrdenAlmacen[],
    getUbi: (l: LineaOrdenAlmacen) => string | null,
): Array<{ ubiId: string | null; lineas: LineaOrdenAlmacen[] }> => {
    const ordenUbis: Array<string | null> = [];
    const mapa = new Map<string | null, LineaOrdenAlmacen[]>();

    for (const linea of lineas) {
        const ubiId = getUbi(linea);
        if (!mapa.has(ubiId)) {
            ordenUbis.push(ubiId);
            mapa.set(ubiId, []);
        }
        mapa.get(ubiId)!.push(linea);
    }

    return ordenUbis.map((ubiId) => ({ ubiId, lineas: mapa.get(ubiId)! }));
};

const getAccionPick = (
    orden: OrdenAlmacen,
    lineasOrdenadas: LineaOrdenAlmacen[],
    emitirPickSolicitado: () => void,
): AccionPrincipalData | null => {
    const grupos = agruparPorUbicacion(lineasOrdenadas, (l) => l.idUbicacionOrigen);
    const grupoActual = grupos.find((g) =>
        g.lineas.some((l) => !isPickCompleta(l, orden.pasosPick))
    );
    if (!grupoActual) return null;

    const pasos = orden.pasosPick ?? grupoActual.lineas[0]?.pasosPick ?? null;
    const instruccionPasos = pasos ? (INSTRUCCIONES_PICK[pasos] ?? pasos) : "lee las líneas";
    const algunaLeida = grupoActual.lineas.some((l) => (l.cantidadPick ?? 0) > 0);
    const ubicacion = grupoActual.lineas[0]?.ubicacionOrigen ?? "ubicación desconocida";

    const instruccion = algunaLeida
        ? `${instruccionPasos} en ${ubicacion}`
        : `Ve a la ubicación ${ubicacion} y ${instruccionPasos}`;

    return { label: "Leer pick", instruccion, onClick: emitirPickSolicitado };
};

const getAccionDrop = (
    orden: OrdenAlmacen,
    lineasOrdenadas: LineaOrdenAlmacen[],
    handlers: Handlers,
): AccionPrincipalData | null => {
    const grupos = agruparPorUbicacion(lineasOrdenadas, (l) => l.idUbicacionDestino);
    const grupoActual = grupos.find((g) => g.lineas.some((l) => !isDropCompleta(l)));
    if (!grupoActual) return null;

    const pasos = orden.pasosDrop ?? grupoActual.lineas[0]?.pasosDrop ?? null;
    const instruccionPasos = pasos ? (INSTRUCCIONES_DROP[pasos] ?? pasos) : "lee las líneas";
    const algunaLeida = grupoActual.lineas.some((l) => (l.cantidadReal ?? 0) > 0);

    let instruccion: string;
    if (grupoActual.ubiId === null) {
        instruccion = `Ve a la ubicación de drop y ${instruccionPasos}`;
    } else {
        const ubicacion = grupoActual.lineas[0]?.ubicacionDestino ?? grupoActual.ubiId;
        instruccion = algunaLeida
            ? instruccionPasos
            : `Ve a la ubicación ${ubicacion} y ${instruccionPasos}`;
    }

    return {
        label: "Leer drop",
        instruccion,
        onClick: handlers.emitirDropSolicitado,
    };
};

export function calcularAccionPrincipal(
    orden: OrdenAlmacen,
    handlers: Handlers,
): AccionPrincipalData | null {
    if (orden.lineas.length === 0) return null;

    if (orden.estado === "TERMINADA" && orden.tipo === "ENTRADA") {
        return {
            label: "Colocar",
            instruccion: "Recepción terminada, usa el botón Colocar para crear la orden de colocación",
            onClick: handlers.emitirColocacionSolicitada,
        };
    }

    if (orden.estado !== "PENDIENTE") return null;

    const lineasOrdenadas = [...orden.lineas].sort((a, b) => a.id.localeCompare(b.id));

    type Fase = 'PICK' | 'DROP';
    let faseActual: Fase;

    if (orden.tipo === "ENTRADA") {
        faseActual = 'DROP';
    } else if (orden.tipo === "SALIDA") {
        faseActual = 'PICK';
    } else {
        // TRASPASO
        const tienePick =
            orden.pasosPick !== null || lineasOrdenadas.some((l) => l.pasosPick !== null);
        if (!tienePick) {
            faseActual = 'DROP';
        } else {
            const todasPickCompletas = lineasOrdenadas.every((l) =>
                isPickCompleta(l, orden.pasosPick)
            );
            faseActual = todasPickCompletas ? 'DROP' : 'PICK';
        }
    }

    if (faseActual === 'PICK') {
        return getAccionPick(orden, lineasOrdenadas, handlers.emitirPickSolicitado);
    }

    return getAccionDrop(orden, lineasOrdenadas, handlers);
}
