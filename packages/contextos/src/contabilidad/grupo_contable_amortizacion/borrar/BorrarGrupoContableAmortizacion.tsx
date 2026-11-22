import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { GrupoContableAmortizacion } from "../diseño.ts";
import { etiquetaGrupoContableAmortizacion } from "../dominio.ts";
import { deleteGrupoContableAmortizacion } from "../infraestructura.ts";

export const BorrarGrupoContableAmortizacion = ({
    publicar,
    grupo,
}: {
    grupo: GrupoContableAmortizacion;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteGrupoContableAmortizacion(grupo.id);
        publicar("grupo_borrado", grupo);
    }, [publicar, grupo]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarGrupoContableAmortizacion"
            abierto={true}
            titulo="Borrar grupo contable de amortización"
            mensaje={`¿Confirma borrar ${etiquetaGrupoContableAmortizacion(grupo)}? No se puede borrar si tiene amortizaciones.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
