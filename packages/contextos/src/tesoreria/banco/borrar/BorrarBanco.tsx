import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Banco } from "../diseño.ts";
import { etiquetaBanco } from "../dominio.ts";
import { deleteBanco } from "../infraestructura.ts";

export const BorrarBanco = ({ publicar, banco }: { banco: Banco; publicar: EmitirEvento }) => {
    const borrar_ = useCallback(async () => {
        await deleteBanco(banco.id);
        publicar("banco_borrado", banco);
    }, [publicar, banco]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarBanco"
            abierto={true}
            titulo="Borrar banco"
            mensaje={`¿Confirma borrar ${etiquetaBanco(banco)} y sus sucursales? No se puede borrar si hay cuentas bancarias de la entidad.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
