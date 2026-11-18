import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { Pedido } from "../../diseño.ts";
import { TEXTO_CAMBIOS_EN_PREPARACION, useOrdenesAlmacenDePedido } from "./ordenes_almacen.ts";

const ESTADOS: Record<string, string> = {
    PENDIENTE: "pendiente",
    EN_CURSO: "en curso",
    PREPARADA: "preparada",
};

/** Aviso de que el pedido ya se está preparando en almacén. */
export const AvisoPreparacionAlmacen = ({ pedido }: { pedido: Pedido }) => {
    const ordenes = useOrdenesAlmacenDePedido(pedido.id, pedido);
    if (ordenes.length === 0) return null;

    const lista = ordenes.map((o) => `${o.id} (${ESTADOS[o.estado] ?? o.estado})`).join(", ");
    return (
        <QAviso variante="advertencia">
            Pedido en preparación en almacén: {lista}. {TEXTO_CAMBIOS_EN_PREPARACION}
        </QAviso>
    );
};
