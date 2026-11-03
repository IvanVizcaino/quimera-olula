import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { LeerPickSubcajaPalet } from "../leer_pick/LeerPickSubcajaPalet.tsx";
import { LeerPickLoteCaja } from "../leer_pick/LeerPickLoteCaja.tsx";
import { LeerPickSkuCaja } from "../leer_pick/LeerPickSkuCaja.tsx";

const esPendiente = (l: LineaOrdenAlmacen): boolean =>
    (l.cantidadPick ?? l.cantidadReal ?? 0) < l.cantidadPrevista;

// Usa pasosPick del orden si está definido.
// Si no, usa el pasosPick de la primera línea pendiente (órdenes con pasos por línea).
const resolverPasosPick = (orden: OrdenAlmacen): string | null => {
    if (orden.pasosPick) return orden.pasosPick;
    return orden.lineas.find(esPendiente)?.pasosPick ?? null;
};

export const LeerPickOrden = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    switch (resolverPasosPick(orden)) {
        case "LOTE-CAJAS":
            return <LeerPickSubcajaPalet orden={orden} publicar={publicar} />;
        case "LOTE_CAJA":
            return <LeerPickLoteCaja orden={orden} publicar={publicar} />;
        case "SKU_CAJA":
            return <LeerPickSkuCaja orden={orden} publicar={publicar} />;
        default:
            return null;
    }
};
