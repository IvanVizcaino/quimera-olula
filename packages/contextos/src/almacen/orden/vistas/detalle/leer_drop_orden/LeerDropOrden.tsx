import { OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { LeerCajasColocacion } from "../leer_cajas_colocacion/LeerCajasColocacion.tsx";
import { iniciarAudioLectura, LeerCajasEntrada } from "../leer_cajas_entrada/LeerCajasEntrada.tsx";
import { LeerLoteCantidadOrden } from "../leer_lote_cantidad/LeerLoteCantidadOrden.tsx";
import { LeerPaletEntrada } from "../leer_palet_entrada/LeerPaletEntrada.tsx";
import { LeerSkuCantidadOrden } from "../leer_sku_cantidad/LeerSkuCantidadOrden.tsx";

// Normaliza cualquier evento de cancelación de sub-modal → "lectura_drop_cancelada"
const normalizarPublicar = (publicar: EmitirEvento): EmitirEvento =>
    (evento, ...args) => {
        if (typeof evento === "string" && evento.endsWith("_cancelada")) {
            return publicar("lectura_drop_cancelada");
        }
        return publicar(evento as never, ...args);
    };

export const LeerDropOrden = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const pub = normalizarPublicar(publicar);

    switch (orden.pasosDrop) {
        case "CAJAS-UBICACION":
            return <LeerCajasColocacion orden={orden} publicar={pub} />;
        case "CAJAS":
            return <LeerCajasEntrada orden={orden} publicar={pub} />;
        case "PALET":
            return <LeerPaletEntrada orden={orden} publicar={pub} />;
        case "SKU-CANTIDAD":
            return <LeerSkuCantidadOrden orden={orden} publicar={pub} />;
        case "LOTE-CANTIDAD":
            return <LeerLoteCantidadOrden orden={orden} publicar={pub} />;
        default:
            // legacy: ENTRADA sin pasosDrop → LeerCajasEntrada
            if (orden.tipo === "ENTRADA") {
                iniciarAudioLectura();
                return <LeerCajasEntrada orden={orden} publicar={pub} />;
            }
            return null;
    }
};
