import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Banco, Sucursal } from "../diseño.ts";
import { etiquetaSucursal } from "../dominio.ts";
import { deleteSucursal } from "../infraestructura.ts";

export const BorrarSucursalBanco = ({
    banco,
    sucursal,
    publicar,
}: {
    banco: Banco;
    sucursal: Sucursal;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteSucursal(banco.id, sucursal.id);
        publicar("sucursal_borrada", sucursal.id);
    }, [banco.id, sucursal.id, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_de_sucursal_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarSucursalBanco"
            abierto={true}
            titulo="Borrar sucursal"
            mensaje={`¿Confirma borrar la sucursal ${etiquetaSucursal(sucursal)}? No se puede borrar si alguna cuenta bancaria la usa.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
