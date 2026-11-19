import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CodigoBalance } from "../diseño.ts";
import { etiquetaCodigoBalance } from "../dominio.ts";
import { deleteCodigoBalance } from "../infraestructura.ts";

export const BorrarCodigoBalance = ({
    publicar,
    codigoBalance,
}: {
    codigoBalance: CodigoBalance;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteCodigoBalance(codigoBalance.id);
        publicar("codigo_balance_borrado", codigoBalance);
    }, [publicar, codigoBalance]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCodigoBalance"
            abierto={true}
            titulo="Borrar código de balance"
            mensaje={`¿Confirma borrar ${etiquetaCodigoBalance(codigoBalance)}? No se puede borrar si tiene cuentas asignadas.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
