import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { etiquetaLibroFacturasRecibidas } from "../dominio.ts";
import { deleteLibroFacturasRecibidas } from "../infraestructura.ts";

export const BorrarLibroFacturasRecibidas = ({
    publicar,
    informe,
}: {
    informe: LibroFacturasRecibidas;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteLibroFacturasRecibidas(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroFacturasRecibidas"
            abierto={true}
            titulo="Borrar informe"
            mensaje={`¿Confirma borrar ${etiquetaLibroFacturasRecibidas(informe)}? Solo se borra la configuración del informe, no hay datos contables implicados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
