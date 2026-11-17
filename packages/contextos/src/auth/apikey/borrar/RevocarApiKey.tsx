import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ApiKey } from "../diseño.ts";
import { deleteApiKey } from "../infraestructura.ts";

/** Confirma y revoca una clave. Emite "clave_revocada" (con la clave) o "revocacion_cancelada". */
export const RevocarApiKey = ({ clave, publicar }: { clave: ApiKey; publicar: EmitirEvento }) => {
    const revocar_ = useCallback(async () => {
        await deleteApiKey(clave.id);
        publicar("clave_revocada", clave);
    }, [clave, publicar]);

    const cancelar_ = useCallback(() => publicar("revocacion_cancelada"), [publicar]);

    const [revocar, cancelar] = useForm(revocar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="revocarApiKey"
            abierto={true}
            titulo="Revocar clave de API"
            mensaje={`¿Revocar «${clave.nombre}»? Los agentes que la usen dejarán de entrar en Olula.`}
            onCerrar={cancelar}
            onAceptar={revocar}
        />
    );
};
