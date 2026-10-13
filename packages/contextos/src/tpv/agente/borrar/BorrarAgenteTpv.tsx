import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { AgenteTpv } from "../diseño.ts";
import { deleteAgenteTpv } from "../infraestructura.ts";

export const BorrarAgenteTpv = ({
    publicar,
    activo = false,
    agente,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    agente: AgenteTpv;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (agente.id) {
            await intentar(() => deleteAgenteTpv(agente.id));
        }
        publicar("agente_borrado");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarAgenteTpv"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar este agente TPV?"
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
