import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Provincia } from "../diseño.ts";
import { etiquetaProvincia } from "../dominio.ts";
import { deleteProvincia } from "../infraestructura.ts";

export const BorrarProvincia = ({ publicar, provincia }: { provincia: Provincia; publicar: EmitirEvento }) => {
    const borrar_ = useCallback(async () => {
        await deleteProvincia(provincia.id);
        publicar("provincia_borrado", provincia);
    }, [publicar, provincia]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarProvincia"
            abierto={true}
            titulo="Borrar provincia"
            mensaje={`¿Confirma borrar ${etiquetaProvincia(provincia)}? No se puede borrar si la usan direcciones de clientes.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
