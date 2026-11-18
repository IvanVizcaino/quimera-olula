import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { AlcanceRegeneracion } from "../diseño.ts";
import { AVISO_REGENERACION } from "../dominio.ts";
import { postRegenerarCodigosBalance } from "../infraestructura.ts";

/** Botones «Cod. Balance», «Cuentas CB» y «Cuentas CBBA» del maestro de Eneboo. */
export const RegenerarCodigosBalance = ({
    alcance,
    publicar,
}: {
    alcance: AlcanceRegeneracion;
    publicar: EmitirEvento;
}) => {
    const regenerar_ = useCallback(async () => {
        await postRegenerarCodigosBalance(alcance);
        publicar("codigos_balance_regenerados", alcance);
    }, [alcance, publicar]);

    const cancelar_ = useCallback(() => publicar("regeneracion_cancelada"), [publicar]);

    const [regenerar, cancelar] = useForm(regenerar_, cancelar_);

    const aviso = AVISO_REGENERACION[alcance];

    return (
        <QModalConfirmacion
            nombre="regenerarCodigosBalance"
            abierto={true}
            titulo={aviso.titulo}
            mensaje={aviso.mensaje}
            onCerrar={cancelar}
            onAceptar={regenerar}
        />
    );
};
