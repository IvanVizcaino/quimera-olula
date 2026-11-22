import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PrecioArticulo } from "../diseño.ts";
import { descripcionPrecioArticulo, textoTramo } from "../dominio.ts";
import { deletePrecioArticulo } from "../infraestructura.ts";

export const BorrarPrecioArticulo = ({
    precio,
    publicar,
}: {
    precio: PrecioArticulo;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deletePrecioArticulo(precio.id);
        publicar("precio_borrado", precio.id);
    }, [precio, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarPrecioArticulo"
            abierto={true}
            titulo="Borrar precio por artículo"
            mensaje={`¿Seguro que quiere borrar el precio de ${descripcionPrecioArticulo(precio)} (cantidad: ${textoTramo(precio).toLowerCase()})?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
