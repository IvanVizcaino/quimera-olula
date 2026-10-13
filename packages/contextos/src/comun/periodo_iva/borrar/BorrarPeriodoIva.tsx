import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { PeriodoIva } from "../diseño.ts";
import { deletePeriodoIva } from "../infraestructura.ts";

export const BorrarPeriodoIva = ({
    publicar,
    activo = false,
    periodo,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    periodo: PeriodoIva;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (periodo.id) {
            await intentar(() => deletePeriodoIva(periodo.id));
        }
        publicar("periodo_borrado");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarPeriodoIva"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar este periodo de IVA?"
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
