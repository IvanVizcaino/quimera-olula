import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Divisa } from "../diseño.ts";
import { etiquetaDivisa } from "../dominio.ts";
import { deleteDivisa } from "../infraestructura.ts";

export const BorrarDivisa = ({ publicar, divisa }: { divisa: Divisa; publicar: EmitirEvento }) => {
    const borrar_ = useCallback(async () => {
        await deleteDivisa(divisa.id);
        publicar("divisa_borrado", divisa);
    }, [publicar, divisa]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarDivisa"
            abierto={true}
            titulo="Borrar divisa"
            mensaje={`¿Confirma borrar ${etiquetaDivisa(divisa)}? No se puede borrar si la usan clientes, proveedores, documentos, tarifas o la contabilidad.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
